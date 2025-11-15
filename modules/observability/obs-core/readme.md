# Observability Core Stack

Core telemetry collection infrastructure: Alloy + Prometheus + Loki

## Directory Structure

```
observability/obs-core/
├── docker-compose.yml
├── .env
├── alloy-config.alloy
├── prometheus/
│   └── prometheus.yml
└── loki/
    └── loki-config.yml
```

## Prerequisites

1. **Docker daemon metrics** (optional but recommended for container metrics):
   - Edit `/etc/docker/daemon.json` (Linux) or Docker Desktop settings (Windows):
   ```json
   {
     "metrics-addr": "0.0.0.0:9323",
     "experimental": true
   }
   ```
   - Restart Docker daemon

2. **Service labels** for auto-discovery:
   - Add to services you want Prometheus to scrape:
   ```yaml
   labels:
     prometheus.io/scrape: "true"
     prometheus.io/port: "8080"
     prometheus.io/path: "/metrics"
   ```

## Deployment

1. **Create directory structure**:
   ```bash
   mkdir -p observability/obs-core/prometheus
   mkdir -p observability/obs-core/loki
   cd observability/obs-core
   ```

2. **Create configuration files**:
   - Copy `docker-compose.yml` to the root
   - Copy `alloy-config.alloy` to the root
   - Copy `prometheus.yml` to `prometheus/` directory
   - Copy `loki-config.yml` to `loki/` directory
   - Copy `.env.example` to `.env` and edit with your hostname

3. **Deploy stack**:
   ```bash
   docker compose up -d
   ```

4. **Verify deployment**:
   ```bash
   # Check all services are healthy
   docker compose ps
   
   # All should show "Up" and "healthy" status
   ```

5. **Verify log collection**:
   ```bash
   # Check what containers are being monitored
   curl http://localhost:3120/loki/api/v1/label/container/values
   
   # Query recent logs from a container (e.g., alloy)
   curl -G http://localhost:3120/loki/api/v1/query_range \
     --data-urlencode 'query={container="alloy"}' \
     --data-urlencode 'limit=10'
   ```

6. **Verify metrics collection**:
   ```bash
   # Check Prometheus targets (should show prometheus, loki, alloy as UP)
   curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
   
   # Check basic metrics are being collected
   curl -G http://localhost:9090/api/v1/query \
     --data-urlencode 'query=up'
   ```

7. **Check Alloy is collecting from Docker**:
   ```bash
   # View available labels
   curl http://localhost:3120/loki/api/v1/labels
   
   # Should show: compose_project, compose_service, container, service_name, stream
   ```

## Service Endpoints (Internal)

- **Prometheus**: `http://prometheus:9090` (on obs-net)
- **Loki**: `http://loki:3100` (on obs-net)
- **Alloy UI**: `http://alloy:12345` (on obs-net)

These services are only accessible within the `obs-net` Docker network. External access will be configured via Grafana in Phase 2.

**For Phase 1 testing only**, the following ports are temporarily exposed on localhost:
- Prometheus: `http://localhost:9090` (remove after Phase 2)
- Loki: `http://localhost:3120` (mapped from 3100, remove after Phase 2)
- Alloy: `http://localhost:12345` (remove after Phase 2)

## What Gets Collected

### Logs (via Alloy → Loki)
- All Docker container stdout/stderr logs
- Automatically labeled with:
  - `container` - container name
  - `stream` - stdout/stderr
  - `compose_project` - Docker Compose project name
  - `compose_service` - Docker Compose service name

### Metrics (via Alloy → Prometheus)
- **Alloy self-metrics** - collection pipeline health (configured in prometheus.yml)
- **Prometheus self-metrics** - TSDB health (configured in prometheus.yml)
- **Loki metrics** - log ingestion stats (configured in prometheus.yml)
- **Docker daemon metrics** - container CPU/memory/network (if Docker metrics enabled)
- **Service metrics** - any external service with `prometheus.io/scrape: "true"` label

## Data Retention

- **Prometheus**: 180 days (configured in compose command)
- **Loki**: 90 days (configured in loki-config.yml)

## Troubleshooting

### Alloy not collecting logs
```bash
# Check Alloy can access Docker socket
docker compose exec alloy ls -la /var/run/docker.sock

# Check Alloy configuration and logs
docker compose logs alloy | grep -i error
```

### No metrics in Prometheus
```bash
# Check Prometheus targets status
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.health != "up")'

# Verify remote write is enabled
docker compose logs prometheus | grep "remote-write"
```

### Loki not receiving logs
```bash
# Check Loki health
curl http://localhost:3120/ready

# Check ingestion rate
curl http://localhost:3120/metrics | grep loki_ingester_streams_created_total
```

### Port conflicts
If you see "port is already allocated" errors:
```bash
# Check what's using the port
sudo lsof -i :PORT_NUMBER

# Either stop the conflicting service or change the port mapping in docker-compose.yml
# Example: Change "3100:3100" to "3120:3100" if port 3100 is in use
```

## Next Steps

- **Phase 2**: Deploy Grafana and connect data sources
- **Phase 3**: Configure Cloudflare tunnel for external Grafana access
- **Phase 4**: Integrate AI Proxy metrics collection
- **Phase 5**: Configure alerts and n8n webhooks

## Related Documentation

- ADR-0006: Observability Stack Architecture
- ADR-0007: Centralized Telemetry Flow
# ADR-0007: Observability Stack — Centralized Telemetry and Action Flow

**Date:** 2025-11-10  
**Status:** Approved  
**Deciders:** Owner  
**Supersedes:** None  
**Relates to:** ADR-0006 (Observability Core), ADR-0008 (Grafana → n8n Automations)

---

## Context
Multiple self-hosted services (n8n, Open WebUI, Ollama, Diun, etc.) generate logs and metrics.  
We need a unified observability pipeline that ingests both logs and metrics, visualizes them in **Grafana**, and drives automated actions through **n8n** — all with full traceability and separation of duties.

---

## Decision
Adopt a centralized observability flow using **Grafana Alloy** for collection, **Prometheus** for metrics, **Loki** for logs, and **Grafana** as the unified visualization and alerting layer.

### Telemetry Data Flow
```
All sources (n8n, Proxy, Ollama, Open WebUI, Diun, etc.)
        ↓
     Grafana Alloy (collects logs + metrics)
        ↓
     ├──→ Loki (log store & query layer)
     └──→ Prometheus (metrics TSDB & scrape engine)
        ↓
     Grafana (visualization, alert management)
```

### Actionable Flow
Actionable events may originate from **logs** or **metrics**.

```
Grafana alert (Loki pattern or Prometheus threshold)
        ↓
     Webhook trigger → n8n
        ↓
     n8n performs actions (corrective or maintenance workflows)
```

This ensures:
- **Traceability** — every automation stems from a logged event.  
- **Observability-first architecture** — logs precede actions.  
- **Auditability** — all system changes trace back to recorded log entries.

---

## Consequences
- All services must expose Prometheus metrics and log to stdout/stderr in structured form.  
- Grafana Alloy replaces Promtail as the unified collector for both logs and metrics.  
- Grafana serves as the single decision layer for alerting and action logic.  
- n8n executes actions only on verified alert events from Grafana (log- or metric-driven).  

---

## Notes
Follow-up design for **Grafana → n8n** integration and workflow definitions will be covered in **ADR-0008**.
Future extension may include trace correlation (Tempo) once adopted in the observability core.

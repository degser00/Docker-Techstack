# Ports Overview

This document tracks all exposed and internal ports used across the tech stack for consistency, security review, and Cloudflare Zero Trust configuration.

| Service | Purpose | Container Port | Host Port | Exposure | Notes |
|----------|----------|----------------|------------|-----------|--------|
| **n8n** | Workflow automation UI | 5678 | 5678 | ✅ Cloudflare tunnel (`cloudflared-n8n`) | Primary UI access |
| **n8n Webhooks** | Workflow triggers | 5678 | 5678 | ✅ Cloudflare tunnel (`cloudflared-hooks`) | Path `/webhook/*` |
| **PostgreSQL (n8n)** | Database backend | 5432 | – | 🔒 Internal network | Used by n8n; not exposed |
| **Redis (n8n)** | Caching / queue | 6379 | – | 🔒 Internal only | Used by n8n; not exposed |
| **Ollama** | Local LLM API | 11434 | – | 🔒 Internal network | Accessible via Open WebUI |
| **Open WebUI** | LLM front-end | 3000 | 3000 | ✅ Cloudflare Tunnel (`cloudflared-llm`) | User-facing interface for Ollama; exposed via Zero Trust |
| **Playwright** | Browser automation/testing | 3000 | 3100 | 🔒 Local Only | Used for test runs and internal validation only |
| **Cloudflared (n8n)** | Tunnel client | – | – | n/a | Handles secure ingress |
| **Cloudflared (LLM)** | Tunnel client | – | – | n/a | Handles secure ingress |
| **Cloudflared (Hooks)** | Tunnel client | – | – | n/a | Handles webhook ingress |
| **Cloudflared (Default)** | Legacy / unused tunnel | – | – | n/a | To be cleaned up |
| **n8n ↔ Ollama Proxy** | LLM request/response logging | (TBD) | (TBD) | 🔒 Internal Network | Intercepts and logs all n8n ↔ Ollama/Open WebUI traffic to PostgreSQL |

---
### Exposure Legend

| Symbol | Label | Meaning |
|:-------|:------|:--------|
| ✅ **Cloudflare Tunnel** | Exposed securely to the internet via Cloudflare Zero Trust | Public ingress with authentication, no direct host access |
| 🔒 **Internal Network** | Accessible only to containers within specific shared Docker networks | Used for inter-service communication (e.g. n8n ↔ PostgreSQL ↔ Observability) |
| 🔒 **Internal Only** | Isolated inside a single Docker Compose project | No cross-network or host access |
| 🔒 **Local Only** | Bound to localhost on the host machine (e.g. `127.0.0.1:PORT`) | Reachable from the host but not externally accessible |
| 🌐 **Public (Unsafe)** | Directly exposed via host IP without Cloudflare | Should be avoided unless temporary or protected by firewall |


### Notes

- Internal ports (Postgres, Redis) are on private Docker networks only.  
- External access always goes through **Cloudflare Zero Trust tunnels**.  
- Update this table whenever adding or changing service ports.

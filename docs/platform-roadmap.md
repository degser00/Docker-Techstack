# Platform Roadmap

This document outlines the long-term evolution of the entire self-hosted platform, including third-party dependencies, identity, hosting strategy, modules, and access model.

## 1. Third-Party Services (kept)

- **VPN** — general web browsing privacy
- **Password Manager** — secure credential storage
- **Email DNS settings** point to an external email provider  
  (currently ImprovMX for forwarding, later possibly MXRoute for full inbox hosting)

## 2. Self-Hosted Services
### 1. Current
- **n8n** — automation
- **OpenWebUI** — LLM interface
- **Ollama** — model runtime

### 2. Future Planned
- **Ghost** — public website/blog
- **Observability stack** — Grafana, Loki, Prometheus, alerting, update-check automations
- **Identity (Authentik)** — SSO provider for private modules

### 3. Future Considerations
- **Immich** — photo/video library
- **Nextcloud AIO** — personal cloud + file storage
- **Obsidian (self-hosted plugins, remote vault)** — knowledge management
- **Mealie** — recipe + meal planning


## 3. Access Model
### Private (VPN-only)
- Immich
- Nextcloud
- n8n
- OpenWebUI
- Observability
- Reporting

### Public (Cloudflared)
- Ghost website
- Public n8n webhooks

## 4. Roadmap Stages
### Stage 0 — Current
Everything via Cloudflared.

### Stage 1 — VPN Separation
Private services over Tailscale, public stays on Cloudflared.

### Stage 2 — Full Self-Hosting of Identity + Mesh Network
Move from Tailscale → Headscale.
Move from Google OIDC → Authentik.

### Stage 3 — Module Hardening & Integration
Per-module improvements (see docs/modules/*)

## 5. What This Achieves
- Private stack fully isolated
- Public entrypoints protected by Cloudflare
- Professional email with no server maintenance
- Clean separation between public vs private access
- Expandable platform for modules, automations, AI, and observability

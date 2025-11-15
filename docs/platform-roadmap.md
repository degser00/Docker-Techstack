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

## 5. DMZ Evolution Roadmap

This section describes the staged introduction of a DMZ node and the transition from Tailscale to a fully self-hosted Headscale mesh. This ensures clean separation between public and private services, minimal blast radius, and a fully self-hosted zero-trust network.

### **0. Current — Minimal DMZ**
- Deploy dedicated DMZ box on an isolated network (e.g., Guest WiFi / VLAN).  
- Run **Ghost** on the DMZ as the only public-facing application.  
- No internal connectivity and no access to Core systems.  
- Cloudflared Tunnel provides the public entrypoint.

### **1. Next — Tailscale Integration**
- Install **Tailscale** on both DMZ and Core nodes.  
- Move all **public n8n webhooks** from the Core server to the DMZ.  
- DMZ forwards webhooks → Core via the private Tailscale mesh.  
- Apply **strict Tailscale ACLs** so the DMZ can only reach specific Core ports.  
- Core services (n8n, Observability, Authentik, etc.) remain fully private.

### **2. Later — Headscale Migration (Self-Hosted Mesh)**
- Replace the Tailscale control plane with a self-hosted **Headscale** instance.  
- All nodes continue using the official Tailscale client, but authenticate against Headscale instead of Tailscale’s cloud.  
- Headscale automatically manages:
  - **WireGuard key generation**
  - **Secure key distribution**
  - **Automatic key rotation**
  - **Device identity and ACL policy**
- No manual WireGuard configuration or key rotation is required.
- Establish Headscale as the authoritative mesh coordinator (recommended on an Infra VM or lightweight node, *not* the DMZ).
- DMZ ↔ Core communications remain encrypted, authenticated, and isolated.

### **Outcome**
- Public apps isolated on the DMZ node.  
- Private apps protected behind zero-trust mesh.  
- No dependency on Tailscale’s cloud.  
- Minimal blast radius if DMZ is ever compromised.  
- Future-proof foundation for identity (Authentik), observability, AI, and private services.

## 6. What This Achieves
- Private stack fully isolated
- Public entrypoints protected by Cloudflare
- Professional email with no server maintenance
- Clean separation between public vs private access
- Expandable platform for modules, automations, AI, and observability

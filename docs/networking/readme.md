# Networking Documentation

This directory contains all documents related to the network design,
topology, and long-term evolution of the platform.\
Its goal is to define *how* public and private services communicate and
*which* trust boundaries exist.

The networking layer enables: - Secure DMZ separation\
- Zero-trust access for private services\
- Self-hosted identity and mesh networking\
- Cloudflare ingress for public endpoints\
- Isolation between DMZ, Core, and Infra nodes

------------------------------------------------------------------------

## 📘 Documents in This Folder

### **1. [`roadmap.md`](./roadmap.md)**

Long-term evolution of networking: - Cloudflared everywhere → private
Tailscale mesh\
- Tailscale SaaS → Headscale self-hosted\
- Google OIDC → Authentik SSO\
- Transition from simple ingress → full zero-trust model

This is the **direction** of the networking architecture.

------------------------------------------------------------------------

### **2. `network-topology.md` (./network-topology.md)**

This file will describe the *current and target* network graph,
including: - Trust zones (DMZ, Core, Infra, Public)\
- Node-to-node communication paths\
- Allowed traffic vs. forbidden traffic\
- Cloudflared → DMZ flow\
- DMZ → Core Tailscale/Headscale tunnel\
- Identity plane (Authentik ↔ nodes)\
- ACL rules and firewall boundaries

This is the **blueprint** of how nodes talk to each other.

------------------------------------------------------------------------

## 🔗 Cross-References

-   **Platform-wide roadmap:**\
    [`../platform-roadmap.md`](../platform-roadmap.md)\
    This document explains the larger evolution of modules, identity,
    hosting, and architecture.\
    Networking is one subsystem of that roadmap.

-   **Architecture overview:**\
    (`architecture.md`, if present)\
    High-level system description of modules and responsibilities.

------------------------------------------------------------------------

## 📡 Current Network Architecture (Diagram)

                              ┌────────────────────────────┐
                              │        Internet (Public)    │
                              └──────────────┬─────────────┘
                                             │
                                     Cloudflared Tunnel
                                             │
                               ┌─────────────▼─────────────┐
                               │        DMZ Node            │
                               │ (Ghost + Proxy + Tailscale)│
                               └─────────────┬─────────────┘
                                             │
                                  Encrypted Mesh (Tailscale)
                                             │
                ┌────────────────────────────┴──────────────────────────┐
                │                                                       │
    ┌──────────────────────┐                              ┌─────────────────────────┐
    │      Core Node        │                              │       Infra Node        │
    │ (n8n, Ollama, AI,     │                              │  Headscale + Authentik  │
    │ Observability, DBs)   │                              │   DNS, Backups (opt.)    │
    └──────────────────────┘                              └─────────────────────────┘

------------------------------------------------------------------------

## 🧩 Philosophy

The networking design follows three principles:

### **1. Public services live in the DMZ**

Ghost + webhook ingress stay outside the trusted network.

### **2. All private services stay behind a zero-trust mesh**

n8n, AI, Observability, Databases, dashboards --- never exposed
publicly.

### **3. Control plane must never touch the DMZ**

Headscale and Authentik run in a private Infra or Core node.

------------------------------------------------------------------------

## 🛠 Contributing

If adding new networking components (DNS, firewall configs, tunnels,
RDP/VNC access, observability exporters), create a dedicated `.md` file
in this directory and link to it here.

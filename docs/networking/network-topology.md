# Network Topology

This document defines the current and target network topology for the
platform. It describes trust zones, communication paths, and
allowed/blocked flows between DMZ, Core, Infra nodes, and public
services.

------------------------------------------------------------------------

## Trust Zones

### **1. Public Zone**

-   Internet traffic
-   Cloudflare tunnel endpoints
-   No direct access to private services

### **2. DMZ Zone**

-   Hosts public-facing services (Ghost, webhook ingress)
-   Runs Cloudflared + Reverse Proxy + Tailscale client
-   No LAN access, no access to storage
-   Only communicates with Core Node through zero‑trust mesh

### **3. Core Zone**

-   Hosts private services (n8n, AI, Observability, DBs)
-   Accessible only via mesh network (Tailscale / Headscale)
-   No public ingress

### **4. Infra Zone**

-   Hosts control-plane services:
    -   Headscale (self-hosted mesh controller)
    -   Authentik (identity provider)
    -   Optional: DNS, backups scheduler, log forwarders
-   Must never be exposed to the internet

------------------------------------------------------------------------

## Node Responsibilities

### **DMZ Node**

-   Public ingress via Cloudflared
-   Ghost website
-   n8n Webhook endpoint (forwarded to Core)
-   Reverse proxy (Caddy/Traefik)
-   Tailscale/Headscale client
-   No LAN access aside from mesh

### **Core Node (N5 Pro)**

-   n8n (private)
-   AI stack (Ollama + OpenWebUI)
-   Observability (Grafana, Loki, Prometheus)
-   Databases
-   Tailscale/Headscale client

### **Infra Node**

-   Headscale (control plane)
-   Authentik (identity)
-   Optional: DNS, backups, infrastructure utilities
-   Minimal CPU/RAM usage

------------------------------------------------------------------------

## Topology Diagram

                                 ┌────────────────────────────┐
                                 │        Internet (Public)    │
                                 └──────────────┬─────────────┘
                                                │
                                        Cloudflared Tunnel
                                                │
                                  ┌─────────────▼─────────────┐
                                  │        DMZ Node            │
                                  │ (Ghost + Proxy + Mesh)     │
                                  └─────────────┬─────────────┘
                                                │
                                  Zero‑Trust Encrypted Mesh
                               (Tailscale → Headscale Client)
                                                │
                     ┌──────────────────────────┴─────────────────────────┐
                     │                                                    │
         ┌──────────────────────┐                           ┌──────────────────────────┐
         │      Core Node        │                           │        Infra Node        │
         │ Private Apps & AI     │                           │ Headscale + Authentik    │
         │ Tailscale/Headscale   │                           │ Optional Infra Services   │
         └──────────────────────┘                           └──────────────────────────┘

------------------------------------------------------------------------
``` mermaid
flowchart TD

    subgraph Public["🌐 Public Internet"]
    end

    Public -->|Cloudflared Tunnel| DMZ

    subgraph DMZ["🛡️ DMZ Node (Public Zone)"]
        direction TB
        C1["Ghost (Public Website)"]
        C2["Cloudflared Tunnel"]
        C3["Reverse Proxy (Caddy/Traefik)"]
        C4["Tailscale / Headscale Client"]
    end

    DMZ -->|Zero-Trust Mesh (WireGuard)| Core

    subgraph Core["🔒 Core Node (Private Zone)"]
        direction TB
        N1["n8n (Private)"]
        N2["Ollama + OpenWebUI (AI)"]
        N3["Observability (Grafana/Loki/Prometheus)"]
        N4["Databases"]
        N5["Tailscale / Headscale Client"]
    end

    Core -->|Identity & Control| Infra

    subgraph Infra["⚙️ Infra Node (Control Plane)"]
        direction TB
        I1["Headscale (Mesh Controller)"]
        I2["Authentik (Identity Provider)"]
        I3["Optional Infra: DNS, Backups, Logs"]
    end
```
------------------------------------------------------------------------

## Communication Matrix

### **DMZ → Core**

  Destination   Port            Purpose                        Allowed
  ------------- --------------- ------------------------------ ---------
  Core          `443`           reverse proxy → private APIs   ✔
  Core          `5678`          n8n webhook backend            ✔
  Core          DB ports        (*any*)                        ✖
  Core          Observability   (*any*)                        ✖
  LAN storage   (*any*)         ✖                              

### **Core → DMZ**

  Destination   Port                   Purpose                    Allowed
  ------------- ---------------------- -------------------------- ---------
  DMZ           `80/443`               health checks (optional)   ✔
  DMZ           internal admin ports   ✖                          

### **Infra → Core/DMZ**

  Destination                    Purpose                 Allowed
  ------------------------------ ----------------------- ---------
  Headscale → all clients        Mesh coordination       ✔
  Authentik → Core               Identity                ✔
  Authentik → DMZ                Token validation only   ✔
  DMZ/Core → Infra admin ports   ✖ unless required       

------------------------------------------------------------------------

## Network Rules Summary

### **DMZ**

-   No LAN access
-   No NAS access
-   No DB access
-   Only mesh traffic allowed to Core
-   Public ingress isolated

### **Core**

-   Private-only applications
-   No public exposure
-   Mesh-only access permitted

### **Infra**

-   Never in DMZ
-   Only accessible via mesh
-   Runs the identity & mesh control-plane

------------------------------------------------------------------------

## Target Architecture (Stage 2+)

-   Cloudflare remains for public ingress (Ghost, webhooks)
-   DMZ forwards to Core through Headscale mesh
-   Core runs all private services behind strict ACLs
-   Infra node manages identity + mesh
-   Full segmentation with zero-trust design

------------------------------------------------------------------------

This topology formalizes the separation required for high security, low
blast radius, and self-hosted control over identity and networking.

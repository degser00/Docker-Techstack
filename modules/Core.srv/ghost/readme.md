# Ghost Module

This module provides the public website and membership system using a
secure Core + DMZ architecture. It supports full Ghost functionality
including paid memberships, email newsletters, and dynamic content,
while preserving strict security boundaries.

------------------------------------------------------------------------

## Overview

Ghost runs as **two coordinated instances**:

### 1. Core Ghost (Trusted)

-   Full backend with admin panel
-   Authoring, drafts, publishing
-   Members (free + paid)
-   Stripe integration + webhook handling
-   Magic link authentication
-   Newsletter sending
-   Backups (DB + images)
-   Internal-only

### 2. DMZ Ghost (Untrusted)

-   Public-facing replica
-   Serves posts + assets
-   Forwards signup/login/payment requests to Core
-   Validates JWT tokens to show premium content
-   Stateless and disposable
-   No secrets, no webhooks, no admin

------------------------------------------------------------------------

## Architecture Diagram

``` mermaid
graph TD

    subgraph Internet
        UserBrowser[User Browser]
        Stripe[Stripe]
        EmailProvider[Email Provider]
    end

    subgraph DMZ["DMZ Server"]
        DMZGhost[Ghost - Public Frontend]
        ReverseProxy[NGINX / Caddy / Cloudflared]
    end

    subgraph Core["Core Server"]
        CoreGhost[Ghost - Backend & Members]
        CoreDB[(Ghost DB)]
        CoreStorage[(Content Storage)]
        SyncJob[One-way Sync Pipeline]
    end

    UserBrowser -->|HTTPS| ReverseProxy
    ReverseProxy --> DMZGhost

    DMZGhost -->|Private API (VPN)| CoreGhost

    CoreGhost --> CoreDB
    CoreGhost --> CoreStorage
    CoreGhost --> SyncJob
    SyncJob -->|Content Only| DMZGhost

    CoreGhost -->|API| Stripe
    Stripe -->|Webhooks (signed)| CoreGhost
    CoreGhost -->|SMTP/API| EmailProvider
```

------------------------------------------------------------------------

## Data Flows

### Signup / Login

-   DMZ displays forms
-   DMZ → Core: signup/login request (via VPN)
-   Core sends magic link (email)
-   DMZ validates session via Core and receives JWT
-   DMZ uses JWT to control premium access

### Paid Membership

-   DMZ → Core: request Stripe checkout
-   Core → Stripe: create session
-   Stripe → Core: webhook (payment success)
-   DMZ uses updated JWT to show premium content

### Publishing

-   Content created in Core
-   One-way sync to DMZ
-   DMZ never sends data upstream

------------------------------------------------------------------------

## Security Model

-   No public access to Core
-   DMZ is untrusted, ephemeral
-   Stripe webhooks delivered **only to Core**
-   Only outbound sync Core → DMZ
-   DMZ holds no secrets or sensitive data
-   All authentication and payments through Core

------------------------------------------------------------------------

## Future Work

-   CI/CD deploy pipeline for DMZ sync
-   Harden Core networking (allowlists, firewall rules)
-   Automated content sync triggers
-   Optional multi-region DMZ replicas

------------------------------------------------------------------------

# Ghost Component Architecture (Core + DMZ)

## 1. Purpose

This document describes the architecture for deploying Ghost across a
Core server (trusted) and a DMZ server (untrusted).

## 2. Architecture Diagram (End-to-End)

``` mermaid
graph TD

    subgraph Internet
        UserBrowser[User Browser]
        Stripe[Stripe]
        EmailProvider[Email Provider (SMTP/Mailgun)]
    end

    subgraph DMZ["DMZ Server (Untrusted Zone)"]
        DMZGhost[Ghost - Public Frontend (Replica)]
        ReverseProxy[NGINX / Caddy / Cloudflared]
    end

    subgraph Core["Core Server (Trusted Zone)"]
        CoreGhost[Ghost - Backend Authoring & Members]
        CoreDB[(Ghost DB)]
        CoreStorage[(Images / Files)]
        SyncJob[One-way Deploy/Sync Pipeline]
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

## 3. Sequence Diagram -- Signup

``` mermaid
sequenceDiagram
    participant U as User Browser
    participant D as DMZ Ghost (Public)
    participant C as Core Ghost (Backend)
    participant E as Email Provider

    U->>D: Open /signup page
    D-->>U: Render signup form

    U->>D: Submit email
    D->>C: POST /members/signup
    C->>C: Create member record
    C->>E: Send magic link
    E-->>U: Deliver email

    U->>D: Open magic link
    D->>C: Validate token
    C-->>D: Session/JWT
    D-->>U: Set session
```

## 4. Sequence Diagram -- Paid Subscription

``` mermaid
sequenceDiagram
    participant U as User Browser
    participant D as DMZ Ghost
    participant C as Core Ghost
    participant S as Stripe

    U->>D: Click Upgrade
    D->>C: Request checkout session
    C->>S: Create checkout session
    S-->>C: Return URL
    C-->>D: Send URL
    D-->>U: Redirect to Stripe

    U->>S: Complete payment
    S->>C: Webhook: payment_succeeded
    C->>C: Update member tier
```

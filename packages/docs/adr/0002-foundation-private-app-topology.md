# ADR 0002: Foundation / Private App Topology

## Status

Accepted

## Context

We need the public repository to stay clean, but we also want future private apps such as `bokmoo-app` to reuse the base instead of forking architecture every time.

## Decision

We will use separate repositories:

- `mobile-foundation` for the public native base
- one private repo per real product app, such as `bokmoo-app`

The public repo is the upstream reusable layer. Private app repos are consumers that add:

- business modules
- real contracts
- branding and product assets
- environment configuration
- vendor integrations

## Consequences

- the public repo stays safe to open-source
- product repos stay thin and focused
- shared improvements can be pushed into one place first, then adopted downstream

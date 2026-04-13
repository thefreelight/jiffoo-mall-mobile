# Storefront Client Contract

Status: Draft  
Last updated: 2026-04-12

This document defines how the public mobile foundation aligns with the storefront contract owned by the core commerce repository.

## Source Of Truth

The mobile foundation is not the owner of storefront commerce semantics.

Source of truth for storefront contracts lives in `Jiffoo`:

- `docs/theme-client-platform-contract.md`
- `docs/theme-client-api-catalog.json`
- `docs/theme-client-adapter-registry.json`
- `docs/theme-client-compatibility-matrix.md`
- `docs/theme-client-official-theme-support.md`
- `docs/theme-client-first-wave-rollout.md`

This repository owns the mobile runtime, capability surface, and downstream mobile composition model. It must not silently fork:

- catalog semantics
- cart semantics
- order semantics
- payment semantics
- auth semantics

## Role Of The Mobile Foundation

The mobile foundation should provide:

- app shell structure
- navigation
- design system primitives
- storage and secure token handling
- networking and offline helpers
- observability hooks
- capability documentation for downstream native apps

The mobile foundation should not define private replacements for the core storefront contract.

## Theme Alignment Rules

### A theme switch may change

- visual tokens
- presentation adapters
- layout composition
- renderer selection
- active storefront extensions

### A theme switch must not change

- the meaning of product APIs
- the meaning of cart APIs
- the meaning of order APIs
- the meaning of payment APIs
- the meaning of auth APIs

If a mobile app needs a new storefront behavior, the contract change should start in core and then be consumed here.

## Supported Theme Modes

The target support model for mobile storefront clients is:

- `embedded`
- `pack`
- `theme-app`
- `native-adapter`

Interpretation:

- `embedded`
  - mobile maps a known renderer or theme slug to a local native adapter
- `pack`
  - mobile consumes presentation metadata from the core theme pack contract
- `theme-app`
  - mobile wraps an executable theme app through an explicit shell strategy
- `native-adapter`
  - mobile provides a first-class native presentation adapter for a known theme

## Mobile Client Profile

Reference profile:

- `packages/docs/architecture/storefront-client-profile.json`

This profile is intentionally lightweight. It describes:

- client family
- supported theme modes
- supported storefront extensions
- required capabilities
- minimum core version

It does not duplicate real API schemas or DTOs. The core repository remains responsible for those.

## Current Preview Implementation

The current public mobile hosts expose a preview-only basic storefront slice so maintainers and downstream teams can see the contract boundary in action before private business modules are added.

Current behavior:

- the public hosts can now probe `/api/store/context` and `/api/themes/active` from a local core runtime
- `builtin-default` resolves to the first in-host native adapter preview path
- the public hosts can render a read-only catalog reference slice from `/api/products` and `/api/products/:id`
- the public hosts can render category discovery and search from `/api/products/categories` and `/api/products` search filters
- the public hosts can exercise `/api/cart`, `/api/cart/items`, and `/api/cart/items/:itemId` with an explicit access-token bridge and preview fallback
- the public hosts can discover `/api/payments/available-methods` and create order drafts from the current cart using the public order contract, again with explicit fallback
- `quiet-curator` and `stellar-midnight` stay in `planned` status and currently fall back explicitly
- `limited`, `experimental`, and `unsupported` themes must show a declared fallback instead of failing silently
- production clients must still resolve store and active theme through `/api/store/context` and `/api/themes/active`

The preview host is intentionally conservative. It proves adapter selection and fallback behavior without claiming broader theme support than the core inventory has actually granted.

## Downstream Rule

Downstream private mobile apps should:

1. consume the stable storefront contract from core
2. reuse the mobile foundation capability model
3. add product-specific adapters in the private repo
4. upstream generic client-contract improvements instead of carrying long-lived forks

## Compatibility Expectation

Before claiming official support for a theme in mobile:

- the theme must have a declared adapter strategy
- required mobile capabilities must be documented
- compatibility smoke checks against the reference core deployment must pass
- any unsupported extension behavior must be called out explicitly

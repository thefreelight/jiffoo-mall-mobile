# SPEC 0001: Mobile Foundation Public Native Base

## Status

Accepted

## Summary

`mobile-foundation` is the public base layer for native mobile development.

It exists to provide a reusable Android and iOS foundation that can be consumed by future private application repositories without exposing business logic, production contracts, or customer configuration.

## Goals

- Provide a public Android-native and iOS-native application shell.
- Standardize repository shape for future private consumer apps.
- Centralize public design tokens, public assets, templates, and architecture guidance.
- Define stable capability areas shared across native apps:
  - app shell
  - navigation
  - design system
  - networking abstractions
  - storage abstractions
  - permissions wrappers
  - observability contracts
  - debug tooling
- Make the foundation safe to version and sync into private product repos.

## Non-Goals

- Shipping a complete end-user product in this repository.
- Hosting real business features.
- Hosting real API contracts or production DTOs.
- Hosting production secrets, vendor binaries, or customer assets.
- Solving all downstream app customization inside the public repo.

## Users

- Platform maintainers maintaining the reusable mobile base.
- Product app teams bootstrapping new private native apps.
- Open-source contributors improving the non-business foundation.

## Repository Contract

The repository must keep this top-level structure stable:

```text
apps/
  android/
  ios/
packages/
  design-tokens/
  assets/
  testkit/
  templates/
  docs/
tools/
  codegen/
  ci/
  lint/
  release/
```

## Module Contract

### Android

- `app/` is the public host shell only.
- `core/runtime` owns startup and dependency boundaries.
- `core/navigation` owns route contracts.
- `core/designsystem` owns token-driven UI primitives.
- `core/networking` owns transport abstractions only.
- `core/storage` owns generic persistence wrappers.
- `core/permissions` owns system-level permission helpers.
- `core/observability` owns logging and analytics contracts.
- `core/debug` owns diagnostics and developer tooling.
- `demo/` owns gallery and mock flows only.

### iOS

- `App/` is the public host shell only.
- `Packages/AppShell` owns app coordination.
- `Packages/Navigation` owns route abstractions.
- `Packages/DesignSystem` owns token-driven components.
- `Packages/Networking` owns transport abstractions only.
- `Packages/Storage` owns persistence wrappers.
- `Packages/Permissions` owns system permission helpers.
- `Packages/Observability` owns logging and analytics contracts.
- `Packages/DebugTools` owns diagnostics and developer tooling.

## Public / Private Split

Allowed in this repository:

- generic shells
- demo screens
- fake data and previews
- public design tokens
- reusable UI foundations
- generic platform wrappers
- templates, docs, and tooling

Disallowed in this repository:

- real domain models
- production endpoints
- payment, order, catalog, account, or similar feature modules
- tenant configuration
- signing materials and secrets
- private analytics schemas

## Consumer Model

Private product repositories should consume this repository as an upstream foundation, not copy it once and drift forever.

The initial recommended sync model is:

- short term: `git subtree`
- long term: package and artifact distribution for Android and iOS modules

## Success Criteria

- A new private native app can start from this repository shape without redefining the base architecture.
- Public and private boundaries remain enforceable in code review.
- Shared platform updates can be propagated into product apps without manual cherry-picking across many files.
- The repo remains useful even without product-specific code.

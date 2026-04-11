# Mobile Foundation

`mobile-foundation` is a public native mobile monorepo scaffold.

It is intentionally limited to:

- Android and iOS app shells
- shared design tokens and public assets
- reusable foundation modules such as navigation, storage, networking, permissions, observability, and debug tooling
- templates, test support, CI helpers, and architecture docs

It does not contain:

- business features
- real API contracts
- customer configuration
- signing files, secrets, or vendor credentials
- production analytics events or private SDK integrations

## Why Native

This repository follows the native split discussed earlier:

- Android: Kotlin-first foundation
- iOS: Swift-first foundation

The goal is to keep the open-source repo clean and reusable, while real product apps live in a private monorepo that consumes or mirrors this foundation.

## Repository Shape

```text
mobile-foundation/
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

## Public / Private Boundary

Keep these here:

- app shells and demo surfaces
- public UI tokens and base components
- abstract networking, storage, and logging contracts
- developer tooling, templates, fixtures, and docs

Keep these out:

- checkout, orders, account, catalog, or any real feature modules
- real OpenAPI schemas and production DTOs
- environment values and feature flags
- customer assets and production copy
- push certificates, signing keys, and vendor binaries

## Android

The Android side is organized as an app shell plus `core/*` capability modules.

- [apps/android/README.md](/Users/jordan/Projects/jiffoo-mall-mobile/apps/android/README.md)
- Local output: [app-debug.apk](/Users/jordan/Projects/jiffoo-mall-mobile/apps/android/app/build/outputs/apk/debug/app-debug.apk)

## iOS

The iOS side uses a lightweight app host folder plus local Swift Packages for reusable capabilities.

- [apps/ios/README.md](/Users/jordan/Projects/jiffoo-mall-mobile/apps/ios/README.md)

## Shared Packages

- [packages/design-tokens/tokens.json](/Users/jordan/Projects/jiffoo-mall-mobile/packages/design-tokens/tokens.json)
- [packages/docs/README.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/README.md)
- [packages/docs/architecture/README.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/README.md)
- [packages/docs/adr/0001-public-private-boundary.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/adr/0001-public-private-boundary.md)
- [packages/docs/spec/0001-mobile-foundation-spec.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/spec/0001-mobile-foundation-spec.md)
- [packages/docs/prd/0001-mobile-foundation-prd.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/prd/0001-mobile-foundation-prd.md)
- [packages/docs/execution/0001-native-foundation-rollout.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/execution/0001-native-foundation-rollout.md)
- [CHANGELOG.md](/Users/jordan/Projects/jiffoo-mall-mobile/CHANGELOG.md)

## Next Steps

1. Expand the Android and iOS demo surfaces into a more complete public gallery.
2. Lift more capability code out of the shell and into real reusable modules.
3. Start versioning and tagging the foundation before the first downstream private app consumes it.

# Module Stability Matrix

This matrix turns the release-model principles into a concrete capability contract.

## Current Rule

- `stable`: consumers may rely on semantic-versioning compatibility expectations
- `experimental`: consumers may adopt, but API and packaging can still evolve
- `internal`: no compatibility promise; not part of the supported consumer contract

## Current Matrix

| Capability | Android path | iOS path | Current tier | Target tier | Distribution target |
|---|---|---|---|---|---|
| App shell | `apps/android/app` | `apps/ios/App` | `internal` | `internal` | none |
| Design system | `apps/android/core/designsystem` | `apps/ios/Packages/DesignSystem` | `experimental` | `stable` | Android artifact + Swift Package |
| Navigation | `apps/android/core/navigation` | `apps/ios/Packages/Navigation` | `experimental` | `stable` | Android artifact + Swift Package |
| Permissions | `apps/android/core/permissions` | `apps/ios/Packages/Permissions` | `experimental` | `stable` | Android artifact + Swift Package |
| Storage | `apps/android/core/storage` | `apps/ios/Packages/Storage` | `experimental` | `stable` | Android artifact + Swift Package |
| Observability | `apps/android/core/observability` | `apps/ios/Packages/Observability` | `experimental` | `stable` | Android artifact + Swift Package |
| Debug tools | `apps/android/core/debug` | `apps/ios/Packages/DebugTools` | `experimental` | `stable` | Android artifact + Swift Package |
| Networking | `apps/android/core/networking` | `apps/ios/Packages/Networking` | `experimental` | `experimental` | Android artifact + Swift Package |
| Design tokens | `packages/design-tokens` | `packages/design-tokens` | `stable` | `stable` | source-of-truth |
| Demo gallery | host demo UI | host demo UI | `internal` | `internal` | none |

## Candidate Stable Surface

The first stable consumer-facing surface should most likely come from:

- `design-tokens`
- `DesignSystem`
- `Navigation`
- `Permissions`
- `Storage`
- `Observability`
- `DebugTools`

These are only candidates until packaging, compatibility checks, and migration policy are all in place.

## Deprecation Rule

For any `stable` capability:

1. add a deprecation notice first
2. document the replacement in the changelog and migration notes
3. remove only in a major release

For `experimental` capabilities:

- still document meaningful changes
- avoid surprise churn where possible
- reserve the right to evolve faster than stable surfaces

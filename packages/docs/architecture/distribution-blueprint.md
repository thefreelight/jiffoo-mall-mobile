# Distribution Blueprint

This document translates the release model into concrete release units for Android and iOS consumers.

## Goal

Make `mobile-foundation` consumable as a versioned platform product without asking downstream apps to depend on raw repository layout.

## Release Unit Principles

- release units should map to stable or near-stable capabilities
- host apps and demo pages are not release units
- Android and iOS names should stay symmetric wherever possible
- release units should be coarse enough to be understandable, but narrow enough to evolve safely

## Android Target Distribution

Target registry:

- preferred long-term target: Maven Central
- acceptable transitional target: GitHub Packages for early validation

Target group id:

- `io.github.thefreelight.mobilefoundation`

Candidate Android artifacts:

| Capability | Artifact ID | Current readiness |
|---|---|---|
| Design system | `design-system-android` | candidate stable |
| Navigation | `navigation-android` | candidate stable |
| Permissions | `permissions-android` | candidate stable |
| Storage | `storage-android` | candidate stable |
| Observability | `observability-android` | candidate stable |
| Debug tools | `debug-tools-android` | candidate stable |
| Networking | `networking-android` | experimental |
| Design tokens | `design-tokens` | stable source-of-truth, not an Android runtime library |

Not for distribution:

- `apps/android/app`
- demo host UI
- preview-only or internal helper code

## iOS Target Distribution

Target registry:

- Swift Package Manager via git tags on the source repository

Recommended package products:

| Capability | Swift product | Current readiness |
|---|---|---|
| Design system | `DesignSystem` | candidate stable |
| Navigation | `Navigation` | candidate stable |
| Permissions | `Permissions` | candidate stable |
| Storage | `Storage` | candidate stable |
| Observability | `Observability` | candidate stable |
| Debug tools | `DebugTools` | candidate stable |
| Networking | `Networking` | experimental |

Not for distribution:

- `AppShell` as a stable cross-app API until host composition rules are more mature
- `apps/ios/App`
- demo and preview-only code

## First Public Baseline

The first tagged baseline should favor a small but reliable surface.

Recommended baseline scope:

- `design-tokens`
- `DesignSystem`
- `Navigation`
- `Permissions`
- `Storage`

Recommended hold-back scope:

- `Networking`
- `Observability`
- `DebugTools`
- any host app surface

These hold-backs are still useful in-source, but should stabilize more before being advertised as broadly consumable release units.

## Versioning Shape

All release units should follow the same semantic version tag at the repository level for the initial phase.

That means:

- one repository tag
- one release note set
- one migration guide per tagged release when needed

Later, if the platform grows enough, independent version streams can be reconsidered.

## Consumer Examples

### Android

```kotlin
dependencies {
  implementation("io.github.thefreelight.mobilefoundation:design-system-android:1.0.0")
  implementation("io.github.thefreelight.mobilefoundation:navigation-android:1.0.0")
}
```

### iOS

```swift
.package(url: "https://github.com/thefreelight/jiffoo-mall-mobile.git", from: "1.0.0")
```

Then depend on:

- `DesignSystem`
- `Navigation`
- `Permissions`
- `Storage`

## Release Readiness Checklist

Before a release unit is advertised as stable:

- public API is cataloged
- tier is `stable`
- migration path exists for any replaced API
- Android and iOS host validation passes
- consumer smoke checks pass

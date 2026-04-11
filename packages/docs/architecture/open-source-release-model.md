# Open-Source Release Model

This document defines how `mobile-foundation` should be maintained and consumed as a public mobile platform layer.

## Core Principle

The repository is the source-of-truth monorepo for maintainers.

Consumers should not depend on the repository layout itself as if it were the public API.

Instead, the supported public surface should be:

- versioned Android artifacts
- versioned Swift Package products
- documented stability tiers
- release notes and migration guides

## Consumer Views

### Maintainer view

Maintainers work in the monorepo because it contains:

- source code
- demo hosts
- test fixtures
- CI rules
- release tooling
- architecture docs

### Consumer view

Consumers should see a smaller contract:

- stable package names
- semantic versions
- migration notes
- sample usage

## Distribution Strategy

### Early stage

Until all public modules are ready for package distribution:

- private consumer apps may use `git subtree`
- the subtree path should be treated as vendored upstream code

### Mature stage

As modules stabilize:

- Android modules should be published as versioned artifacts
- iOS modules should be exposed as versioned Swift Package products
- consumer apps should upgrade by version, not by copying source folders

## Stability Tiers

Every public capability must be assigned one of three tiers:

- `stable`
  - semantic versioning applies
  - breaking changes require a major release
  - deprecations should come before removals
- `experimental`
  - API may evolve faster
  - migration notes are still required
  - consumers adopt with caution
- `internal`
  - no compatibility promise
  - may exist in the repo for implementation and demo support only

## Public API Boundary

Stable public API should stay narrow.

Examples of candidate stable surfaces:

- `DesignSystem`
- `Navigation`
- `Storage`
- `Permissions`
- `Observability`
- `DebugTools`

Examples that should not be treated as stable public API:

- demo screen layout
- internal helper functions
- repository folder names beyond the documented package layout
- preview-only code

## Versioning Policy

Use semantic versioning:

- `MAJOR`
  - breaking API changes
  - removals after deprecation
- `MINOR`
  - backward-compatible additions
  - new capabilities and extension points
- `PATCH`
  - fixes that should be safe to adopt quickly

## Upgrade Policy

The release chain must include:

- changelog entry
- release notes
- migration notes when behavior or API changes
- deprecation period before removal for stable APIs

## Compatibility Lab

Before a release is considered safe:

- Android demo host must build
- iOS demo hosts must build
- sample consumer integration must build against the candidate release
- upgrade-from-previous-version smoke checks should pass for stable modules

## Definition Of “Seamless Upgrade”

This repository should optimize for predictable upgrades, not magical zero-effort upgrades.

In practice:

- patch releases should usually require no code change
- minor releases should usually require no code change, or only opt-in adoption
- major releases may require migration steps, but those steps must be documented

# Execution Plan 0001: Native Foundation Rollout

## Objective

Turn the repository into a stable, documented, public native foundation that can feed future private application repos.

## Current State

- The repository has been reset away from the previous Expo / React Native product implementation.
- A public native repo shape now exists for Android and iOS.
- iOS has a generated Xcode host project and package-level smoke coverage.
- Android now has a pinned runnable host build with a minimal public Compose demo surface.

## Milestones

### Phase 1: Foundation reset

Deliverables:

- public repo boundary defined
- Android and iOS folder structure established
- initial docs and ADRs created
- changelog started

Exit criteria:

- repo explains what it is
- repo explains what it is not

### Phase 2: Runnable public hosts

Deliverables:

- pin Android Gradle, Kotlin, and Compose versions
- make Android host app runnable
- keep iOS host app buildable
- add screenshot-backed demo verification

Exit criteria:

- both platforms have a minimal public demo host

### Phase 3: Platform capabilities

Deliverables:

- token-driven design system primitives
- navigation contracts
- networking, storage, permissions, observability, and debug baselines
- testkit and template upgrades

Exit criteria:

- downstream private apps can consume core capabilities rather than redefine them

### Phase 4: Downstream consumption model

Deliverables:

- documented `git subtree` workflow for private consumers
- example private app topology, such as `bokmoo-app`
- versioning and release notes discipline

Exit criteria:

- downstream update path is documented and testable

### Phase 5: Open-source release model

Deliverables:

- define `stable / experimental / internal` module tiers
- document semantic versioning and deprecation policy
- define Android artifact and iOS package distribution targets
- add compatibility lab checks for consumer upgrade confidence

Exit criteria:

- the foundation can be treated as a versioned platform product, not just a source repo

## Delivery Checklist

- [x] Finish Android runnable host instead of template-only Gradle files
- [x] Finish iOS runnable host and local package layout
- [x] Add Android and iOS demo gallery surfaces
- [x] Add downstream integration guide
- [ ] Tag the first foundation baseline release
- [x] Define stability tiers for public modules
- [ ] Add compatibility lab checks for downstream consumers
- [x] Define Android artifact and iOS package distribution plan

## Risks And Watchouts

- Do not reintroduce business modules into the public repo.
- Do not let Android and iOS capability maps drift apart.
- Do not rely on undocumented manual sync steps for downstream apps.
- Keep generated or local-only files out of commits unless they are part of the intended source of truth.

## Mapping To Linear

The Linear rollout should track at least these workstreams:

- runnable public hosts
- shared capability hardening
- downstream sync strategy
- docs and contribution guardrails
- release engineering and compatibility validation

## Current Linear Mapping

- Project: `Mobile Foundation`
- `JIF-113`: Make Android public host runnable
- `JIF-114`: Expand public demo gallery on both platforms
- `JIF-115`: Harden foundation capability modules
- `JIF-116`: Document downstream private-app consumption workflow
- `JIF-117`: Prepare the first foundation baseline release
- `JIF-124`: Define stability tiers and public API surface
- `JIF-125`: Design Android artifact and iOS package distribution
- `JIF-126`: Add compatibility lab and upgrade smoke checks

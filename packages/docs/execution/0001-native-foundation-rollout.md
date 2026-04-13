# Execution Plan 0001: Native Foundation Rollout

## Objective

Turn the repository into a stable, documented, public native foundation that can feed future private application repos.

## Current State

- The repository has been reset away from the previous Expo / React Native product implementation.
- A public native repo shape now exists for Android and iOS.
- iOS has a generated Xcode host project and package-level smoke coverage.
- Android now has a pinned runnable host build with a minimal public Compose demo surface.
- Android `core/*` capabilities now exist as real Gradle library modules, and iOS gallery screens read from package-level contracts instead of host-only placeholder data.
- The first planned baseline release is now documented as `v0.0.1`, and release-readiness checks pass locally.
- Both public hosts now expose a preview-only storefront basic version that proves `builtin-default` adapter selection and explicit fallback for not-yet-supported themes.
- Both public hosts can now probe a local core storefront runtime and surface live store/theme resolution before falling back to preview data.
- Both public hosts now include a read-only catalog and product-detail reference slice backed by live core data when available.
- Both public hosts now include category discovery and search on top of the same read-only catalog reference path.
- Both public hosts now include a minimal cart reference flow that can talk to authenticated core cart endpoints when a token is provided and otherwise falls back to preview state.
- Both public hosts now include a minimal checkout-entry flow with payment method discovery and order-draft creation.

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

Status:

- initial capability contracts are now reflected in code on both platforms

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

### Phase 6: Storefront reference slice

Deliverables:

- preview-only `builtin-default` storefront adapter path on Android and iOS
- local core contract probe for `/api/store/context` and `/api/themes/active`
- read-only `/api/products` and `/api/products/:id` reference flow
- read-only `/api/products/categories` and search-filtered `/api/products` reference flow
- minimal `/api/cart` read plus `/api/cart/items` add/remove reference flow with explicit auth-token bridge
- `/api/payments/available-methods` discovery plus public `/api/orders` draft creation reference flow
- explicit fallback UX for `planned`, `limited`, `experimental`, and `unsupported` themes
- contract-aligned explanation of how `/api/store/context` and `/api/themes/active` feed real runtime resolution

Exit criteria:

- both public hosts can demonstrate theme adapter selection without inventing client-private commerce semantics
- unsupported or not-yet-shipped themes never fail silently

## Delivery Checklist

- [x] Finish Android runnable host instead of template-only Gradle files
- [x] Finish iOS runnable host and local package layout
- [x] Add Android and iOS demo gallery surfaces
- [x] Add downstream integration guide
- [x] Prepare the first foundation baseline release
- [ ] Tag the first foundation baseline release
- [x] Define stability tiers for public modules
- [x] Add compatibility lab checks for downstream consumers
- [x] Define Android artifact and iOS package distribution plan
- [x] Add a basic storefront reference slice with explicit theme fallback behavior
- [x] Add live core contract probing to the public storefront reference hosts
- [x] Add a read-only catalog and product-detail reference slice
- [x] Add category discovery and search to the read-only storefront reference flow
- [x] Add a minimal cart reference flow with auth-token bridge and preview fallback
- [x] Add a minimal checkout-entry reference flow with payment method discovery and order-draft creation

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
- storefront adapter selection and fallback behavior

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
- `JIF-130`: Ship baseline storefront adapter preview and fallback
- `JIF-131`: Wire live core storefront contract probe into public hosts
- `JIF-132`: Add read-only catalog reference flow to public hosts
- `JIF-133`: Add category discovery and search to public hosts
- `JIF-139`: Add cart reference flow to public hosts
- `JIF-140`: Add checkout-entry reference flow to public hosts

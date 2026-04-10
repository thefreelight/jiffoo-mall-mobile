# PRD 0001: Mobile Foundation

## Problem

We need a reusable mobile base that lets us launch multiple private native apps without rebuilding the same shell, platform wrappers, design tokens, debug tooling, and documentation from scratch every time.

The previous repository shape mixed app implementation concerns with product-specific concerns. That made it harder to:

- open-source the reusable portion safely
- keep business code private
- start new apps quickly
- propagate shared improvements cleanly

## Product Vision

`mobile-foundation` should behave like a maintained mobile platform layer, not a throwaway one-time scaffold.

It should make new apps feel like:

- choose a brand shell
- bring in private business modules
- connect private contracts and configuration
- ship on top of a stable native base

## Product Principles

- Native first: Kotlin for Android and Swift for iOS.
- Foundation only: public code must remain business-agnostic.
- Demoable: public code should still be runnable and inspectable.
- Upstreamable: downstream private apps must be able to inherit changes in a controlled way.
- Symmetric: Android and iOS should expose the same capability map even with different implementations.

## Target Outcomes

- Reduce setup time for the next private app repository.
- Standardize public module boundaries across Android and iOS.
- Capture architecture decisions in docs so they are not re-litigated every sprint.
- Enable downstream apps such as `bokmoo-app` to consume the foundation through a repeatable sync model.

## In Scope

- native app shells
- reusable capability modules
- shared design tokens and public assets
- debug and demo surfaces
- architecture docs, ADRs, specs, and release notes
- templates and CI guardrails

## Out of Scope

- real product features
- production contracts
- backend integration details
- customer environments
- private vendor integrations

## User Stories

- As a platform maintainer, I want a public native base that I can improve without risking product leakage.
- As a product app owner, I want to create a private app repo that inherits a stable mobile foundation.
- As a new contributor, I want docs that explain what belongs in the public repo and what does not.

## Success Metrics

- A new private app repo can be initialized against this foundation in less than one working day.
- Platform updates can be adopted by a downstream app with a documented process.
- No business feature folders or production contracts land in the public repo.
- The repository remains buildable or previewable on at least one local host surface.

## Risks

- The repo becomes too thin and loses practical value.
- The repo becomes too broad and leaks private product details.
- Syncing downstream apps becomes manual and error-prone if no update path is defined.

## Mitigations

- Keep demos and debug tools inside the foundation.
- Freeze repo boundaries in ADRs and CI checks.
- Use a defined upstream sync model instead of copy-paste.

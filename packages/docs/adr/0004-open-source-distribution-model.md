# ADR 0004: Open-Source Distribution Model

## Status

Accepted

## Context

`mobile-foundation` is public and intended for reuse by downstream private apps and potentially other adopters.

If consumers depend directly on the repo layout, every internal refactor becomes a breaking change.

We need a release model that supports:

- public source transparency
- maintainable internal evolution
- predictable downstream upgrades

## Decision

The monorepo remains the maintainer source-of-truth, but the supported consumer contract will evolve toward versioned package distribution.

The intended end state is:

- Android consumers adopt published artifacts
- iOS consumers adopt Swift Package products
- release notes and migration guides define the upgrade path

During the transition period, downstream private apps may use `git subtree`.

## Consequences

- we must distinguish source layout from supported public API
- release engineering becomes part of the product, not an afterthought
- consumer documentation must describe both current and target adoption paths

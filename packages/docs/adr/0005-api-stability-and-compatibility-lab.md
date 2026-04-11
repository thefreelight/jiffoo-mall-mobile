# ADR 0005: API Stability Tiers And Compatibility Lab

## Status

Accepted

## Context

An open-source foundation cannot promise seamless upgrades unless it makes clear:

- which APIs are stable
- which APIs are experimental
- how compatibility is verified before release

Without those rules, consumers will either fear upgrades or break unexpectedly.

## Decision

We adopt three stability tiers:

- `stable`
- `experimental`
- `internal`

We also adopt a compatibility lab requirement for release candidates:

- Android host build must pass
- iOS host builds must pass
- consumer integration smoke checks must pass
- migration notes must be present for any stable API change with downstream impact

## Consequences

- public surface areas must be intentionally small
- CI will eventually need compatibility verification, not just repo-local builds
- release quality is measured by downstream upgrade confidence, not only by local compilation

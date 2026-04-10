# ADR 0003: Upstream Sync Strategy For Private Apps

## Status

Accepted

## Context

If downstream private apps simply copy the public foundation once, they will drift and become expensive to update.

We need a realistic sync path for early-stage product repos, while leaving room to evolve into package-based distribution later.

## Decision

Adopt this sync model:

- short term: downstream private apps consume `mobile-foundation` via `git subtree`
- medium term: stabilize public modules and version them explicitly
- long term: publish platform artifacts:
  - Android modules via package/artifact distribution
  - iOS modules via Swift Package products

## Rationale

- `git subtree` is easier to operate than `git submodule` for small teams
- it keeps the consumer repo self-contained
- it allows gradual migration toward stronger package boundaries

## Consequences

- we must document subtree pull/push workflows clearly
- public modules must remain coherent enough to version
- downstream apps should avoid modifying vendored foundation code in-place unless there is a clear sync policy

# ADR 0006: Distribution Units And Naming

## Status

Accepted

## Context

We need a concrete mapping between repository capabilities and published consumer-facing release units.

Without explicit naming and boundaries:

- consumers will guess at what is supported
- release notes will be ambiguous
- future artifact publication will drift between Android and iOS

## Decision

We define a first distribution blueprint with symmetric capability naming across Android and iOS.

Initial target examples:

- Android artifacts under `io.github.thefreelight.mobilefoundation`
- Swift Package products with capability-matched names such as `DesignSystem`, `Navigation`, and `Permissions`

We also explicitly exclude host apps and demo surfaces from the distribution contract.

## Consequences

- release engineering now has a concrete target boundary
- downstream docs can reference exact package names instead of general ideas
- future publishing work can be validated against a stable naming plan

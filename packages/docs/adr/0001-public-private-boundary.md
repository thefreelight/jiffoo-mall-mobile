# ADR 0001: Public / Private Boundary

## Status

Accepted

## Context

The repository is public, but the product built on top of it is not.

We want a reusable native mobile foundation without leaking business logic, customer details, or operational secrets into the open-source codebase.

## Decision

This repository may contain:

- native app shells
- demo surfaces
- design tokens
- reusable base components
- generic networking, storage, permission, logging, and debug abstractions
- documentation and tooling

This repository may not contain:

- business feature modules
- real API schemas or production DTOs
- production analytics taxonomies
- private vendor binaries or credentials
- environment-specific configuration for customer deployments

## Consequences

- private apps will need a separate monorepo or integration layer
- public abstractions must stay generic
- demos must use fake data and mock flows

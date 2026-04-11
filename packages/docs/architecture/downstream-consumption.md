# Downstream Consumption Guide

This guide explains how a private app repository, such as `bokmoo-app`, should consume `mobile-foundation`.

## Recommended Topology

```text
mobile-foundation/   # public upstream
bokmoo-app/          # private product repo
```

`bokmoo-app` should keep product-specific code private and consume the public base instead of copying it once and letting it drift.

## Recommended Early-Stage Strategy

Use `git subtree` first.

Why:

- simple to operate
- keeps the private repo self-contained
- good for small teams
- does not require every contributor to manage submodules

## Example Shape In A Private App Repo

```text
bokmoo-app/
  vendor/
    mobile-foundation/
  apps/
    android/
    ios/
  business/
    features/
    contracts/
    config/
```

## Suggested Workflow

### Initial import

```bash
git remote add foundation <public-foundation-repo>
git subtree add --prefix vendor/mobile-foundation foundation main --squash
```

### Pull upstream updates later

```bash
git fetch foundation
git subtree pull --prefix vendor/mobile-foundation foundation main --squash
```

## Rules For Private Consumers

- Do not put product code back into `vendor/mobile-foundation`.
- Prefer adapter layers in the private repo over editing vendored files directly.
- If a change is generic and reusable, upstream it to `mobile-foundation` first.
- Keep product contracts, config, and assets outside the vendored foundation path.

## Long-Term Evolution

As the foundation stabilizes:

- publish Android foundation modules as versioned artifacts
- expose iOS foundation packages as stable Swift Package products
- reduce subtree usage where stronger package boundaries exist

## Consumer Safety Rules

Downstream consumers should not assume every folder in the monorepo is a stable API.

They should adopt only the documented stable modules and follow release notes when upgrading.

The long-term contract is:

- semantic versions
- stability tiers
- migration guidance
- compatibility-tested releases

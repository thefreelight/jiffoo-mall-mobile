# Jiffoo Mall Mobile Rules

## Storefront Client Contract Source Of Truth

When developing official storefront support in this repository, read these core files first:

- `/Users/jordan/Projects/Jiffoo/docs/theme-client-platform-contract.md`
- `/Users/jordan/Projects/Jiffoo/docs/theme-client-api-catalog.json`
- `/Users/jordan/Projects/Jiffoo/docs/theme-client-adapter-registry.json`
- `/Users/jordan/Projects/Jiffoo/docs/theme-client-compatibility-matrix.md`
- `/Users/jordan/Projects/Jiffoo/docs/theme-client-official-theme-support.md`
- `/Users/jordan/Projects/Jiffoo/docs/theme-client-first-wave-rollout.md`

Then read the mobile-local files:

- `/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/storefront-client-contract.md`
- `/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/storefront-client-profile.json`

## Hard Rules

- Theme switches may change presentation, renderer selection, and adapter selection only.
- Theme switches must not change catalog, cart, order, payment, or auth semantics.
- The mobile client must resolve store and active theme from `/api/store/context` and `/api/themes/active`.
- Do not add client-private commerce endpoints. If a new storefront contract is needed, propose it in core first.
- For `limited`, `experimental`, or `unsupported` themes, define an explicit fallback. Never fail silently.
- Treat `builtin-default` as the first official target. `quiet-curator` and `stellar-midnight` stay first-wave targets until implementation and verification upgrade their support state.
- Keep the mobile profile, storefront contract docs, adapter selection logic, and verification scripts aligned.

## Required Verification

- Run `bash tools/ci/check-storefront-client-contract.sh` for this repository.
- If you changed shared contract assumptions or official support metadata, also run `node /Users/jordan/Projects/Jiffoo/scripts/verify-theme-client-contracts.mjs --strict-cross-repo`.

## Database Safety

- Stop immediately if any database drift is detected.

# Architecture Notes

This repository follows a strict open-source boundary:

- foundation only
- no product features
- no real contracts
- no secrets

Each platform should expose the same capability map, even if implementations differ:

- app shell
- navigation
- design system
- networking
- storage
- permissions
- observability
- debug tools

## Source Documents

- Spec: [packages/docs/spec/0001-mobile-foundation-spec.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/spec/0001-mobile-foundation-spec.md)
- PRD: [packages/docs/prd/0001-mobile-foundation-prd.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/prd/0001-mobile-foundation-prd.md)
- Execution plan: [packages/docs/execution/0001-native-foundation-rollout.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/execution/0001-native-foundation-rollout.md)
- Downstream guide: [packages/docs/architecture/downstream-consumption.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/downstream-consumption.md)
- Release model: [packages/docs/architecture/open-source-release-model.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/open-source-release-model.md)
- Distribution blueprint: [packages/docs/architecture/distribution-blueprint.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/distribution-blueprint.md)
- Stability matrix: [packages/docs/architecture/module-stability-matrix.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/module-stability-matrix.md)
- Public API catalog: [packages/docs/architecture/public-api-catalog.json](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/public-api-catalog.json)
- ADRs: [packages/docs/adr/0001-public-private-boundary.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/adr/0001-public-private-boundary.md), [packages/docs/adr/0002-foundation-private-app-topology.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/adr/0002-foundation-private-app-topology.md), [packages/docs/adr/0003-upstream-sync-strategy.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/adr/0003-upstream-sync-strategy.md), [packages/docs/adr/0004-open-source-distribution-model.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/adr/0004-open-source-distribution-model.md), [packages/docs/adr/0005-api-stability-and-compatibility-lab.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/adr/0005-api-stability-and-compatibility-lab.md), [packages/docs/adr/0006-distribution-units-and-naming.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/adr/0006-distribution-units-and-naming.md)

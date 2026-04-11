# Contributing

Before opening a pull request, check that your changes keep the repo inside its public boundary.

Good contributions:

- improve the shell
- improve shared abstractions
- improve tokens and component demos
- improve docs, tooling, or tests
- improve stable or experimental modules without widening the public API accidentally

Bad contributions:

- add a real business flow
- add private API details
- add customer assets or credentials

Before changing a consumer-facing capability, check:

- [packages/docs/architecture/public-api-catalog.json](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/public-api-catalog.json)
- [packages/docs/architecture/module-stability-matrix.md](/Users/jordan/Projects/jiffoo-mall-mobile/packages/docs/architecture/module-stability-matrix.md)

If the capability is `stable`, breaking changes must go through deprecation and migration guidance first.

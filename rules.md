# Mobile Repository Rules

## Development Repo Role

- This repository is the private development repo for the mobile product.
- GitHub private repo is the primary development upstream:
  - `thefreelight/jiffoo-mall-mobile-private`
- GitLab private repo is the required mirror/push target:
  - `lafdru/jiffoo-mall-mobile-private`

## OSS Sync Boundary

- Public `jiffoo-mall-mobile` repos are later open-source sync outputs.
- Do not treat the public mobile repo as the default day-to-day authoring target.
- Keep development and release work in the private repo first, then sync outward when the OSS subset is ready.

## Product Boundary

- This repo owns:
  - Expo / React Native shell behavior
  - mobile-native adapters
  - device integration and packaging
- Shared contracts still come from the Jiffoo core/runtime ecosystem.
- Official theme/plugin authoring does not move here just because mobile consumes those extensions.

## Cross-Repo Workflow

- The main conversation may still start in `jiffoo-mall-core`.
- If the task targets mobile host behavior or native adapters, the implementation belongs here.
- Runtime/Marketplace/control-plane changes still belong in `jiffoo-mall-core`.
- Official theme/plugin source changes still belong in `jiffoo-extensions-official`.

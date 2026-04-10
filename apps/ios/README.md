# iOS Foundation

This directory holds the public iOS-native foundation scaffold.

## Intent

- keep the host app surface under `App/`
- keep reusable capabilities as local Swift Packages under `Packages/`
- keep `Config/` limited to public build configuration templates

## Package Boundaries

- `AppShell`: host app coordination and shared root composition
- `Navigation`: route abstractions
- `DesignSystem`: tokens and public base components
- `Networking`: generic client and transport abstractions
- `Storage`: persistence wrappers
- `Permissions`: system permission helpers
- `Observability`: logging and analytics contracts
- `DebugTools`: diagnostics and development-only tools

This public repo deliberately excludes real product features, production schemas, and private integrations.

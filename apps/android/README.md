# Android Foundation

This directory holds the public Android-native foundation scaffold.

## Intent

- keep a tiny host app shell under `app/`
- keep reusable capabilities under `core/`
- reserve `demo/` for previews, sample flows, and component gallery screens

## Core Modules

- `core/runtime`: app startup, environment wiring, and dependency boundaries
- `core/navigation`: route contracts and host navigation abstractions
- `core/designsystem`: theme tokens and shared UI primitives
- `core/networking`: transport contracts, client wrappers, and error mapping
- `core/storage`: key-value storage and lightweight persistence abstractions
- `core/permissions`: wrappers around camera, notification, location, and other system permissions
- `core/observability`: logging, metrics, and analytics interfaces
- `core/debug`: developer-only switches, inspectors, and diagnostics

## Build Files

The Android host now ships with a runnable Gradle setup for the public demo shell.

## Local Run

```bash
cd apps/android
./gradlew assembleDebug
./gradlew installDebug
```

If you do not have a connected device or emulator, the project can still be verified with `assembleDebug`.

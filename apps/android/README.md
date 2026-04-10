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

The Gradle files are checked in as templates:

- `settings.gradle.kts.template`
- `build.gradle.kts.template`
- `app/build.gradle.kts.template`

This keeps the public scaffold version-agnostic until you choose exact Android Gradle Plugin, Kotlin, and Compose versions for your host app.

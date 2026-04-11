package com.example.mobilefoundation.core.navigation

enum class NavigationRoute(
    val title: String,
    val path: String,
    val summary: String,
    val pills: List<String>,
) {
    DesignSystem(
        title = "Design System",
        path = "design-system",
        summary = "Colors, typography, spacing, and components shared across future private apps.",
        pills = listOf("tokens", "theme", "components"),
    ),
    Navigation(
        title = "Navigation",
        path = "navigation",
        summary = "Shell-level route contracts that keep the public repo generic.",
        pills = listOf("routes", "shell", "handoff"),
    ),
    Permissions(
        title = "Permissions",
        path = "permissions",
        summary = "Reusable wrappers around camera, notifications, and location permissions.",
        pills = listOf("camera", "notifications", "location"),
    ),
    Storage(
        title = "Storage",
        path = "storage",
        summary = "Generic persistence and cache primitives for downstream apps.",
        pills = listOf("prefs", "cache", "hydration"),
    ),
    Networking(
        title = "Networking",
        path = "networking",
        summary = "Abstract request contracts and transport boundaries that stay product-agnostic.",
        pills = listOf("request", "auth hook", "mock"),
    ),
    Observability(
        title = "Observability",
        path = "observability",
        summary = "Logging and signal contracts that product apps can plug real vendors into.",
        pills = listOf("logs", "signals", "breadcrumbs"),
    ),
    Debug(
        title = "Debug Tools",
        path = "debug",
        summary = "Diagnostics, fake data hooks, and environment switches for platform teams.",
        pills = listOf("logs", "flags", "mock data"),
    ),
}

package com.example.mobilefoundation.core.runtime

data class FoundationEnvironment(
    val name: String,
    val supportsMockData: Boolean,
)

data class StoreContextContract(
    val storeId: String,
    val storeName: String,
    val defaultLocale: String,
    val supportedLocales: List<String>,
)

data class ActiveThemeContract(
    val slug: String,
)

data class ThemeSupportEntry(
    val slug: String,
    val officialStatus: String,
    val rendererMode: String,
    val notes: String,
)

data class ThemeAdapterResolution(
    val requestedThemeSlug: String,
    val effectiveThemeSlug: String,
    val adapterId: String,
    val officialStatus: String,
    val usesFallback: Boolean,
    val fallbackReason: String?,
)

object StorefrontClientProfile {
    const val id = "reference-mobile"
    val supportedThemeModes = listOf("embedded", "pack", "theme-app", "native-adapter")
    val capabilities = listOf(
        "auth",
        "catalog",
        "cart",
        "checkout",
        "orders",
        "payments",
        "deep-link",
        "auth-session-bridge",
        "offline-cache",
        "push-notifications",
    )
    const val minimumCoreVersion = "0.0.1"
}

object StorefrontPreviewData {
    val context = StoreContextContract(
        storeId = "1",
        storeName = "Jiffoo Store",
        defaultLocale = "en",
        supportedLocales = listOf("en", "zh-Hant"),
    )

    val officialThemes = listOf(
        ThemeSupportEntry(
            slug = "builtin-default",
            officialStatus = "planned",
            rendererMode = "native-adapter",
            notes = "Baseline OSS-safe storefront theme and the first adapter target.",
        ),
        ThemeSupportEntry(
            slug = "quiet-curator",
            officialStatus = "planned",
            rendererMode = "pack-native-adapter",
            notes = "First-wave theme-pack target with lower coupling risk.",
        ),
        ThemeSupportEntry(
            slug = "stellar-midnight",
            officialStatus = "planned",
            rendererMode = "pack-native-adapter",
            notes = "First-wave SaaS storefront target.",
        ),
        ThemeSupportEntry(
            slug = "esim-mall",
            officialStatus = "limited",
            rendererMode = "adapter-required",
            notes = "Theme-local API client means fallback is required today.",
        ),
        ThemeSupportEntry(
            slug = "modelsfind",
            officialStatus = "unsupported",
            rendererMode = "adapter-required",
            notes = "Custom endpoint coupling means no official mobile support path yet.",
        ),
    )

    val basicFlows = listOf(
        "home",
        "catalog",
        "product-detail",
        "cart",
        "checkout",
        "orders",
        "profile",
    )

    fun resolveTheme(requestedThemeSlug: String): ThemeAdapterResolution {
        val match = officialThemes.firstOrNull { it.slug == requestedThemeSlug }

        if (requestedThemeSlug == "builtin-default") {
            return ThemeAdapterResolution(
                requestedThemeSlug = requestedThemeSlug,
                effectiveThemeSlug = "builtin-default",
                adapterId = "builtin-default-native-adapter-preview",
                officialStatus = match?.officialStatus ?: "planned",
                usesFallback = false,
                fallbackReason = null,
            )
        }

        val status = match?.officialStatus ?: "unsupported"
        val reason = when (status) {
            "planned" -> "Official adapter is planned but not shipped yet, so the host falls back to builtin-default."
            "limited" -> "Current theme support is limited, so the host must fall back to builtin-default."
            "experimental" -> "Experimental themes require explicit shell strategy, so the host falls back to builtin-default."
            else -> "This theme is unsupported in the official mobile client, so the host falls back to builtin-default."
        }

        return ThemeAdapterResolution(
            requestedThemeSlug = requestedThemeSlug,
            effectiveThemeSlug = "builtin-default",
            adapterId = "builtin-default-native-adapter-preview",
            officialStatus = status,
            usesFallback = true,
            fallbackReason = reason,
        )
    }
}

object FoundationRuntime {
    val defaultEnvironment = FoundationEnvironment(
        name = "Public Demo",
        supportsMockData = true,
    )
}

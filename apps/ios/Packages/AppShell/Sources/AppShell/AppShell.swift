public enum AppShell {
    public static let title = "Mobile Foundation"
    public static let description = "Public native shell and reusable capabilities for open-source mobile foundations."
    public static let environmentName = "Public Demo"
}

public struct StoreContextContract: Hashable, Sendable {
    public let storeId: String
    public let storeName: String
    public let defaultLocale: String
    public let supportedLocales: [String]

    public init(storeId: String, storeName: String, defaultLocale: String, supportedLocales: [String]) {
        self.storeId = storeId
        self.storeName = storeName
        self.defaultLocale = defaultLocale
        self.supportedLocales = supportedLocales
    }
}

public struct ActiveThemeContract: Hashable, Sendable {
    public let slug: String

    public init(slug: String) {
        self.slug = slug
    }
}

public struct ThemeSupportEntry: Hashable, Sendable {
    public let slug: String
    public let officialStatus: String
    public let rendererMode: String
    public let notes: String

    public init(slug: String, officialStatus: String, rendererMode: String, notes: String) {
        self.slug = slug
        self.officialStatus = officialStatus
        self.rendererMode = rendererMode
        self.notes = notes
    }
}

public struct ThemeAdapterResolution: Hashable, Sendable {
    public let requestedThemeSlug: String
    public let effectiveThemeSlug: String
    public let adapterId: String
    public let officialStatus: String
    public let usesFallback: Bool
    public let fallbackReason: String?

    public init(
        requestedThemeSlug: String,
        effectiveThemeSlug: String,
        adapterId: String,
        officialStatus: String,
        usesFallback: Bool,
        fallbackReason: String?
    ) {
        self.requestedThemeSlug = requestedThemeSlug
        self.effectiveThemeSlug = effectiveThemeSlug
        self.adapterId = adapterId
        self.officialStatus = officialStatus
        self.usesFallback = usesFallback
        self.fallbackReason = fallbackReason
    }
}

public enum StorefrontClientProfile {
    public static let id = "reference-mobile"
    public static let supportedThemeModes = ["embedded", "pack", "theme-app", "native-adapter"]
    public static let capabilities = [
        "auth",
        "catalog",
        "cart",
        "checkout",
        "orders",
        "payments",
        "deep-link",
        "auth-session-bridge",
        "offline-cache",
        "push-notifications"
    ]
    public static let minimumCoreVersion = "0.0.1"
}

public enum StorefrontPreviewData {
    public static let context = StoreContextContract(
        storeId: "1",
        storeName: "Jiffoo Store",
        defaultLocale: "en",
        supportedLocales: ["en", "zh-Hant"]
    )

    public static let officialThemes: [ThemeSupportEntry] = [
        ThemeSupportEntry(
            slug: "builtin-default",
            officialStatus: "planned",
            rendererMode: "native-adapter",
            notes: "Baseline OSS-safe storefront theme and the first adapter target."
        ),
        ThemeSupportEntry(
            slug: "quiet-curator",
            officialStatus: "planned",
            rendererMode: "pack-native-adapter",
            notes: "First-wave theme-pack target with lower coupling risk."
        ),
        ThemeSupportEntry(
            slug: "stellar-midnight",
            officialStatus: "planned",
            rendererMode: "pack-native-adapter",
            notes: "First-wave SaaS storefront target."
        ),
        ThemeSupportEntry(
            slug: "esim-mall",
            officialStatus: "limited",
            rendererMode: "adapter-required",
            notes: "Theme-local API client means fallback is required today."
        ),
        ThemeSupportEntry(
            slug: "modelsfind",
            officialStatus: "unsupported",
            rendererMode: "adapter-required",
            notes: "Custom endpoint coupling means no official mobile support path yet."
        )
    ]

    public static let basicFlows = [
        "home",
        "catalog",
        "categories",
        "search",
        "product-detail",
        "cart",
        "checkout",
        "orders",
        "profile"
    ]

    public static func resolveTheme(_ requestedThemeSlug: String) -> ThemeAdapterResolution {
        let match = officialThemes.first(where: { $0.slug == requestedThemeSlug })

        if requestedThemeSlug == "builtin-default" {
            return ThemeAdapterResolution(
                requestedThemeSlug: requestedThemeSlug,
                effectiveThemeSlug: "builtin-default",
                adapterId: "builtin-default-native-adapter-preview",
                officialStatus: match?.officialStatus ?? "planned",
                usesFallback: false,
                fallbackReason: nil
            )
        }

        let status = match?.officialStatus ?? "unsupported"
        let reason: String
        switch status {
        case "planned":
            reason = "Official adapter is planned but not shipped yet, so the host falls back to builtin-default."
        case "limited":
            reason = "Current theme support is limited, so the host must fall back to builtin-default."
        case "experimental":
            reason = "Experimental themes require explicit shell strategy, so the host falls back to builtin-default."
        default:
            reason = "This theme is unsupported in the official mobile client, so the host falls back to builtin-default."
        }

        return ThemeAdapterResolution(
            requestedThemeSlug: requestedThemeSlug,
            effectiveThemeSlug: "builtin-default",
            adapterId: "builtin-default-native-adapter-preview",
            officialStatus: status,
            usesFallback: true,
            fallbackReason: reason
        )
    }
}

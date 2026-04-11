public enum NavigationRoute: String, CaseIterable, Hashable {
    case designSystem = "design-system"
    case navigation = "navigation"
    case permissions = "permissions"
    case storage = "storage"
    case debug = "debug"

    public var title: String {
        switch self {
        case .designSystem: return "Design System"
        case .navigation: return "Navigation"
        case .permissions: return "Permissions"
        case .storage: return "Storage"
        case .debug: return "Debug Tools"
        }
    }

    public var summary: String {
        switch self {
        case .designSystem:
            return "Colors, typography, spacing, and components shared across future private apps."
        case .navigation:
            return "Shell-level routes and contracts that keep the public repo generic."
        case .permissions:
            return "Reusable wrappers around camera, notifications, and location permissions."
        case .storage:
            return "Generic persistence and cache primitives for downstream apps to build on."
        case .debug:
            return "Diagnostics, fake data hooks, and environment switches for platform work."
        }
    }

    public var pills: [String] {
        switch self {
        case .designSystem:
            return ["tokens", "theme", "components"]
        case .navigation:
            return ["routes", "shell", "handoff"]
        case .permissions:
            return ["camera", "notifications", "location"]
        case .storage:
            return ["prefs", "cache", "hydration"]
        case .debug:
            return ["logs", "flags", "mock data"]
        }
    }
}

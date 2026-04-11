public protocol Logger {
    func log(_ message: String)
}

public struct LogSignal: Sendable, Hashable {
    public let name: String
    public let detail: String

    public init(name: String, detail: String) {
        self.name = name
        self.detail = detail
    }
}

public enum ObservabilityPreview {
    public static let signals: [LogSignal] = [
        LogSignal(name: "structured logs", detail: "Generic application events for debugging and support"),
        LogSignal(name: "breadcrumbs", detail: "Useful context before failures or recoveries"),
        LogSignal(name: "analytics adapter", detail: "Abstract hook for downstream product analytics")
    ]
}

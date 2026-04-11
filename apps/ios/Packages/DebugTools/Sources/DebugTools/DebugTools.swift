public struct DebugTool: Sendable, Hashable {
    public let title: String
    public let detail: String

    public init(title: String, detail: String) {
        self.title = title
        self.detail = detail
    }
}

public enum DebugPanel {
    public static let title = "Debug"
    public static let tools: [DebugTool] = [
        DebugTool(title: "Mock data mode", detail: "Enabled for demo"),
        DebugTool(title: "Verbose logging", detail: "Available in debug builds"),
        DebugTool(title: "Environment switcher", detail: "Public shell only")
    ]
}

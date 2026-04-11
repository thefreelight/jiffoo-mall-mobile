public struct RequestDescriptor: Sendable, Hashable {
    public let path: String
    public let method: String
    public let requiresAuth: Bool

    public init(path: String, method: String = "GET", requiresAuth: Bool = true) {
        self.path = path
        self.method = method
        self.requiresAuth = requiresAuth
    }
}

public enum NetworkingPreview {
    public static let descriptors: [RequestDescriptor] = [
        RequestDescriptor(path: "/v1/foundation/health", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/v1/debug/events", method: "POST", requiresAuth: true)
    ]
}

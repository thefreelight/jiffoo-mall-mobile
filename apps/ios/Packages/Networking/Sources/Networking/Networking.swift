public struct RequestDescriptor: Sendable {
    public let path: String

    public init(path: String) {
        self.path = path
    }
}

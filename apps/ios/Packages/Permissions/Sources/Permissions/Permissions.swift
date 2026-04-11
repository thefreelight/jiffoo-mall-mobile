public enum PermissionKind: String, CaseIterable {
    case camera
    case notifications
    case location

    public var detail: String {
        switch self {
        case .camera: return "Not requested yet"
        case .notifications: return "Wrapper available"
        case .location: return "Explain before asking"
        }
    }
}

public protocol KeyValueStore {
    func string(forKey key: String) -> String?
}

public enum StoragePreview {
    public static let namespaces: [String] = [
        "preferences",
        "secure-token-store",
        "offline-cache"
    ]
}

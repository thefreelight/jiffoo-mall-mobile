public protocol KeyValueStore {
    func string(forKey key: String) -> String?
}

package com.example.mobilefoundation.core.storage

interface KeyValueStore {
    fun string(forKey: String): String?
}

object StoragePreview {
    val namespaces = listOf("preferences", "secure-token-store", "offline-cache")
}

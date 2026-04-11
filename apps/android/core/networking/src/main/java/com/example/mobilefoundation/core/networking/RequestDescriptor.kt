package com.example.mobilefoundation.core.networking

data class RequestDescriptor(
    val path: String,
    val method: String = "GET",
    val requiresAuth: Boolean = true,
)

object NetworkingPreview {
    val descriptors = listOf(
        RequestDescriptor(path = "/v1/foundation/health", method = "GET", requiresAuth = false),
        RequestDescriptor(path = "/v1/debug/events", method = "POST", requiresAuth = true),
    )
}

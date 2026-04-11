package com.example.mobilefoundation.core.networking

data class RequestDescriptor(
    val path: String,
    val method: String = "GET",
    val requiresAuth: Boolean = true,
)

object NetworkingPreview {
    val descriptors = listOf(
        RequestDescriptor(path = "/api/store/context", method = "GET", requiresAuth = false),
        RequestDescriptor(path = "/api/themes/active", method = "GET", requiresAuth = false),
        RequestDescriptor(path = "/api/products?page=1&limit=20", method = "GET", requiresAuth = false),
        RequestDescriptor(path = "/api/products/categories?page=1&limit=20", method = "GET", requiresAuth = false),
        RequestDescriptor(path = "/api/products?search=watch&page=1&limit=10", method = "GET", requiresAuth = false),
        RequestDescriptor(path = "/api/products/:id", method = "GET", requiresAuth = false),
        RequestDescriptor(path = "/api/cart", method = "GET", requiresAuth = true),
        RequestDescriptor(path = "/api/orders", method = "GET", requiresAuth = true),
    )
}

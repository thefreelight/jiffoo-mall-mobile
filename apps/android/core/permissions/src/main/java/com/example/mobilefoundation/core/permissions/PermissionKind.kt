package com.example.mobilefoundation.core.permissions

enum class PermissionKind(
    val label: String,
    val detail: String,
) {
    Camera("camera", "Not requested yet"),
    Notifications("notifications", "Wrapper available"),
    Location("location", "Explain before asking"),
}

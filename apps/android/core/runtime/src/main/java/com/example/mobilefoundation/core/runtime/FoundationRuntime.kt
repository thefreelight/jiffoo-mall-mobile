package com.example.mobilefoundation.core.runtime

data class FoundationEnvironment(
    val name: String,
    val supportsMockData: Boolean,
)

object FoundationRuntime {
    val defaultEnvironment = FoundationEnvironment(
        name = "Public Demo",
        supportsMockData = true,
    )
}

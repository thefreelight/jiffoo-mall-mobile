package com.example.mobilefoundation.core.observability

fun interface Logger {
    fun log(message: String)
}

data class LogSignal(
    val name: String,
    val detail: String,
)

object ObservabilityPreview {
    val signals = listOf(
        LogSignal("structured logs", "Generic application events for debugging and support"),
        LogSignal("breadcrumbs", "Useful context before failures or recoveries"),
        LogSignal("analytics adapter", "Abstract hook for downstream product analytics"),
    )
}

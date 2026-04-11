package com.example.mobilefoundation.core.debug

data class DebugTool(
    val title: String,
    val detail: String,
)

object DebugPanel {
    const val title = "Debug"

    val tools = listOf(
        DebugTool("Mock data mode", "Enabled for demo"),
        DebugTool("Verbose logging", "Available in debug builds"),
        DebugTool("Environment switcher", "Public shell only"),
    )
}

package com.example.mobilefoundation.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.Dataset
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Security
import com.example.mobilefoundation.ui.theme.FoundationTheme

private enum class DemoDestination(
    val title: String,
    val summary: String,
    val icon: ImageVector,
    val accent: Color,
    val pills: List<String>,
) {
    DesignSystem(
        title = "Design System",
        summary = "Colors, radius, typography, and component behavior that every downstream app can inherit.",
        icon = Icons.Default.Palette,
        accent = Color(0xFF1F7A63),
        pills = listOf("tokens", "theme", "components"),
    ),
    Navigation(
        title = "Navigation",
        summary = "Route contracts and shell-level flow boundaries that keep the foundation generic.",
        icon = Icons.Default.Route,
        accent = Color(0xFFE58E26),
        pills = listOf("routes", "shell", "handoff"),
    ),
    Permissions(
        title = "Permissions",
        summary = "Reusable wrappers around system capabilities such as camera, notifications, and location.",
        icon = Icons.Default.Security,
        accent = Color(0xFF28356E),
        pills = listOf("camera", "notifications", "location"),
    ),
    Storage(
        title = "Storage",
        summary = "Shared persistence primitives for cache, preferences, and local state hydration.",
        icon = Icons.Default.Dataset,
        accent = Color(0xFF6F4E9C),
        pills = listOf("prefs", "cache", "hydration"),
    ),
    Debug(
        title = "Debug Tools",
        summary = "Diagnostics, fake data, environment switches, and visibility tools for platform teams.",
        icon = Icons.Default.BugReport,
        accent = Color(0xFF8A2D3B),
        pills = listOf("logs", "flags", "mock data"),
    ),
}

@Composable
fun FoundationApp() {
    var selectedDemo by remember { mutableStateOf<DemoDestination?>(null) }

    FoundationTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Scaffold(
                topBar = {
                    FoundationTopBar(
                        selectedDemo = selectedDemo,
                        onBack = { selectedDemo = null },
                    )
                },
            ) { innerPadding ->
                if (selectedDemo == null) {
                    FoundationHome(contentPadding = innerPadding, onOpenDemo = { selectedDemo = it })
                } else {
                    DemoDetailScreen(
                        contentPadding = innerPadding,
                        destination = checkNotNull(selectedDemo),
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FoundationTopBar(
    selectedDemo: DemoDestination?,
    onBack: () -> Unit,
) {
    TopAppBar(
        title = {
            Text(
                text = selectedDemo?.title ?: "Mobile Foundation",
                fontWeight = FontWeight.SemiBold,
            )
        },
        navigationIcon = {
            if (selectedDemo != null) {
                Box(
                    modifier = Modifier
                        .padding(start = 8.dp)
                        .clip(MaterialTheme.shapes.large)
                        .clickable(onClick = onBack)
                        .padding(8.dp),
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                    )
                }
            }
        },
    )
}

@Composable
private fun FoundationHome(
    contentPadding: PaddingValues,
    onOpenDemo: (DemoDestination) -> Unit,
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(contentPadding)
            .padding(horizontal = 20.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            Text(
                text = "Mobile Foundation",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                ),
                color = MaterialTheme.colorScheme.onBackground,
            )
        }

        item {
            Text(
                text = "Foundation means the reusable mobile base layer: app shell, tokens, wrappers, and tooling that future private apps build on top of.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )
        }

        item {
            ExplanationCard()
        }

        items(DemoDestination.entries.toList()) { destination ->
            DemoCard(
                destination = destination,
                onClick = { onOpenDemo(destination) },
            )
        }

        item {
            Text(
                text = "Open any card to inspect what belongs in the public repo before private product apps such as Bokmoo add business modules on top.",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.55f),
            )
        }
    }
}

@Composable
private fun ExplanationCard() {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.72f)),
        shape = MaterialTheme.shapes.extraLarge,
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                text = "How To Use This",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = "This is not a shopping app screen. It is a demo gallery for the public foundation layer.",
                style = MaterialTheme.typography.bodyLarge,
            )
            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))
            Text(
                text = "Click a capability card below to preview what the foundation owns and what should stay out of private business code.",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            )
        }
    }
}

@Composable
private fun DemoCard(
    destination: DemoDestination,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = destination.accent),
        shape = MaterialTheme.shapes.extraLarge,
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(Color.Black.copy(alpha = 0.15f), shape = MaterialTheme.shapes.large),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = destination.icon,
                        contentDescription = destination.title,
                        tint = Color.White,
                        modifier = Modifier.size(22.dp),
                    )
                }

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = destination.title,
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = destination.summary,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color.White.copy(alpha = 0.88f),
                    )
                }
            }

            PillRow(labels = destination.pills, dark = true)

            Text(
                text = "Open demo",
                style = MaterialTheme.typography.labelLarge,
                color = Color.White,
            )
        }
    }
}

@Composable
private fun DemoDetailScreen(
    contentPadding: PaddingValues,
    destination: DemoDestination,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(contentPadding)
            .padding(horizontal = 20.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        Text(
            text = destination.summary,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.74f),
        )

        CapabilityShowcase(
            title = "What The Foundation Owns",
            accent = destination.accent,
            items = detailOwnedItems(destination),
        )

        CapabilityShowcase(
            title = "What Private Product Apps Add",
            accent = Color.Black.copy(alpha = 0.74f),
            items = detailPrivateItems(destination),
        )

        when (destination) {
            DemoDestination.DesignSystem -> TokenShowcase()
            DemoDestination.Navigation -> RouteShowcase()
            DemoDestination.Permissions -> PermissionShowcase()
            DemoDestination.Storage -> StorageShowcase()
            DemoDestination.Debug -> DebugShowcase()
        }
    }
}

@Composable
private fun CapabilityShowcase(
    title: String,
    accent: Color,
    items: List<String>,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(accent, shape = MaterialTheme.shapes.extraLarge)
            .padding(16.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
            )
            items.forEach { item ->
                Pill(label = item, dark = true)
            }
        }
    }
}

@Composable
private fun TokenShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Token Snapshot", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        SwatchRow("Surface", Color(0xFFFAF7F0))
        SwatchRow("Primary", Color(0xFF1F7A63))
        SwatchRow("Accent", Color(0xFFE58E26))
        Text(
            text = "These values come from the public token source and should stay brand-neutral enough to reuse across private apps.",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.66f),
        )
    }
}

@Composable
private fun RouteShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Route Contracts", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        PillRow(labels = listOf("demo/list", "demo/detail", "debug/home"), dark = false)
        Text(
            text = "The foundation can define shell-level route contracts. Bokmoo or any private app should plug real feature flows into those contracts rather than hard-code business routes here.",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.66f),
        )
    }
}

@Composable
private fun PermissionShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Permission States", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        PermissionRow("Camera", "Not requested yet", Color(0xFF1F7A63))
        PermissionRow("Notifications", "Wrapper available", Color(0xFFE58E26))
        PermissionRow("Location", "Explain before asking", Color(0xFF28356E))
    }
}

@Composable
private fun StorageShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Storage Layers", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        PillRow(labels = listOf("preferences", "secure token store", "offline cache"), dark = false)
        Text(
            text = "The public repo owns generic storage primitives. Private apps own real keys, domain models, and retention policy.",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.66f),
        )
    }
}

@Composable
private fun DebugShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Debug Surface", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        DebugFlag("Mock data mode", "Enabled for demo")
        DebugFlag("Verbose logging", "Available in debug builds")
        DebugFlag("Environment switcher", "Public shell only")
    }
}

@Composable
private fun SwatchRow(
    label: String,
    swatch: Color,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .background(swatch, shape = MaterialTheme.shapes.medium),
        )
        Text(text = label, style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
private fun PermissionRow(
    label: String,
    status: String,
    tint: Color,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(tint, shape = MaterialTheme.shapes.small),
        )
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(text = label, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
            Text(text = status, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.64f))
        }
    }
}

@Composable
private fun DebugFlag(
    label: String,
    detail: String,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.7f)),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(text = label, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
            Text(text = detail, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.64f))
        }
    }
}

@Composable
private fun PillRow(
    labels: List<String>,
    dark: Boolean,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        labels.forEach { label ->
            Pill(label = label, dark = dark)
        }
    }
}

@Composable
private fun Pill(
    label: String,
    dark: Boolean,
) {
    val background = if (dark) Color.Black.copy(alpha = 0.18f) else MaterialTheme.colorScheme.surfaceVariant
    val textColor = if (dark) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
    AssistChip(
        onClick = {},
        label = { Text(label) },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = background,
            labelColor = textColor,
        ),
    )
}

private fun detailOwnedItems(destination: DemoDestination): List<String> = when (destination) {
    DemoDestination.DesignSystem -> listOf("shared colors", "radius scale", "typography tokens", "base components")
    DemoDestination.Navigation -> listOf("route names", "shell entrypoints", "demo flow scaffolding")
    DemoDestination.Permissions -> listOf("request wrappers", "educational copy patterns", "result normalization")
    DemoDestination.Storage -> listOf("key-value adapters", "cache boundaries", "generic persistence APIs")
    DemoDestination.Debug -> listOf("debug menu", "fake data hooks", "verbose diagnostics")
}

private fun detailPrivateItems(destination: DemoDestination): List<String> = when (destination) {
    DemoDestination.DesignSystem -> listOf("Bokmoo brand styling", "marketing art", "campaign visuals")
    DemoDestination.Navigation -> listOf("checkout flow", "account flow", "private deep links")
    DemoDestination.Permissions -> listOf("business prompts", "feature-specific timing", "conversion copy")
    DemoDestination.Storage -> listOf("real models", "sensitive schemas", "retention policy")
    DemoDestination.Debug -> listOf("tenant-only flags", "private APIs", "ops credentials")
}

@Preview(showBackground = true, backgroundColor = 0xFFFAF7F0, showSystemUi = true, widthDp = 390, heightDp = 844)
@Composable
private fun FoundationGalleryPreview() {
    FoundationApp()
}

@Preview(showBackground = true, backgroundColor = 0xFFFAF7F0, widthDp = 390, heightDp = 844)
@Composable
private fun FoundationDetailPreview() {
    FoundationTheme {
        DemoDetailScreen(
            contentPadding = PaddingValues(),
            destination = DemoDestination.DesignSystem,
        )
    }
}

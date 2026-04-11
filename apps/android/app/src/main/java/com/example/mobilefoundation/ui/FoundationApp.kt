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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.Dataset
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Route
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.example.mobilefoundation.core.debug.DebugPanel
import com.example.mobilefoundation.core.designsystem.DesignToken
import com.example.mobilefoundation.core.designsystem.FoundationTheme
import com.example.mobilefoundation.core.navigation.NavigationRoute
import com.example.mobilefoundation.core.networking.NetworkingPreview
import com.example.mobilefoundation.core.networking.RequestDescriptor
import com.example.mobilefoundation.core.networking.StorefrontContractClient
import com.example.mobilefoundation.core.networking.StorefrontContractSnapshot
import com.example.mobilefoundation.core.observability.LogSignal
import com.example.mobilefoundation.core.observability.ObservabilityPreview
import com.example.mobilefoundation.core.permissions.PermissionKind
import com.example.mobilefoundation.core.runtime.FoundationRuntime
import com.example.mobilefoundation.core.runtime.StorefrontClientProfile
import com.example.mobilefoundation.core.runtime.StorefrontPreviewData
import com.example.mobilefoundation.core.runtime.ThemeAdapterResolution
import com.example.mobilefoundation.core.storage.StoragePreview
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun FoundationApp() {
    var selectedRoute by remember { mutableStateOf<NavigationRoute?>(null) }
    var previewThemeSlug by remember { mutableStateOf("builtin-default") }
    var apiBaseUrl by remember { mutableStateOf(StorefrontContractClient.defaultDevBaseUrl) }
    var appliedApiBaseUrl by remember { mutableStateOf(StorefrontContractClient.defaultDevBaseUrl) }
    var liveSnapshot by remember { mutableStateOf<StorefrontContractSnapshot?>(null) }
    var liveProbeError by remember { mutableStateOf<String?>(null) }
    var isProbing by remember { mutableStateOf(true) }

    val previewResolution = remember(previewThemeSlug) {
        StorefrontPreviewData.resolveTheme(previewThemeSlug)
    }
    val liveResolution = remember(liveSnapshot?.activeThemeSlug) {
        liveSnapshot?.let { StorefrontPreviewData.resolveTheme(it.activeThemeSlug) }
    }

    LaunchedEffect(appliedApiBaseUrl) {
        isProbing = true
        liveSnapshot = null
        liveProbeError = null

        runCatching {
            withContext(Dispatchers.IO) {
                StorefrontContractClient.fetch(appliedApiBaseUrl)
            }
        }.onSuccess { snapshot ->
            liveSnapshot = snapshot
        }.onFailure { error ->
            liveProbeError = error.message ?: "Unable to resolve storefront contract."
        }

        isProbing = false
    }

    FoundationTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Scaffold(
                topBar = {
                    FoundationTopBar(
                        selectedRoute = selectedRoute,
                        onBack = { selectedRoute = null },
                    )
                },
            ) { innerPadding ->
                if (selectedRoute == null) {
                    FoundationHome(
                        contentPadding = innerPadding,
                        onOpenRoute = { selectedRoute = it },
                        apiBaseUrl = apiBaseUrl,
                        onApiBaseUrlChange = { apiBaseUrl = it },
                        onResolveCore = { appliedApiBaseUrl = apiBaseUrl },
                        liveSnapshot = liveSnapshot,
                        liveProbeError = liveProbeError,
                        isProbing = isProbing,
                        previewThemeSlug = previewThemeSlug,
                        onPreviewThemeSelected = { previewThemeSlug = it },
                        previewResolution = previewResolution,
                        liveResolution = liveResolution,
                    )
                } else {
                    DemoDetailScreen(
                        contentPadding = innerPadding,
                        route = checkNotNull(selectedRoute),
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FoundationTopBar(
    selectedRoute: NavigationRoute?,
    onBack: () -> Unit,
) {
    TopAppBar(
        title = {
            Text(
                text = selectedRoute?.title ?: "Mobile Foundation",
                fontWeight = FontWeight.SemiBold,
            )
        },
        navigationIcon = {
            if (selectedRoute != null) {
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
    onOpenRoute: (NavigationRoute) -> Unit,
    apiBaseUrl: String,
    onApiBaseUrlChange: (String) -> Unit,
    onResolveCore: () -> Unit,
    liveSnapshot: StorefrontContractSnapshot?,
    liveProbeError: String?,
    isProbing: Boolean,
    previewThemeSlug: String,
    onPreviewThemeSelected: (String) -> Unit,
    previewResolution: ThemeAdapterResolution,
    liveResolution: ThemeAdapterResolution?,
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
            StorefrontBasicVersionCard(
                apiBaseUrl = apiBaseUrl,
                onApiBaseUrlChange = onApiBaseUrlChange,
                onResolveCore = onResolveCore,
                liveSnapshot = liveSnapshot,
                liveProbeError = liveProbeError,
                isProbing = isProbing,
                previewThemeSlug = previewThemeSlug,
                onPreviewThemeSelected = onPreviewThemeSelected,
                previewResolution = previewResolution,
                liveResolution = liveResolution,
            )
        }

        item {
            ExplanationCard()
        }

        items(NavigationRoute.entries.toList()) { route ->
            DemoCard(
                route = route,
                onClick = { onOpenRoute(route) },
            )
        }

        item {
            Text(
                text = "Environment: ${FoundationRuntime.defaultEnvironment.name}. Open any card to inspect what belongs in the public repo before Bokmoo or any other private app adds business modules on top.",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.55f),
            )
        }
    }
}

@Composable
private fun StorefrontBasicVersionCard(
    apiBaseUrl: String,
    onApiBaseUrlChange: (String) -> Unit,
    onResolveCore: () -> Unit,
    liveSnapshot: StorefrontContractSnapshot?,
    liveProbeError: String?,
    isProbing: Boolean,
    previewThemeSlug: String,
    onPreviewThemeSelected: (String) -> Unit,
    previewResolution: ThemeAdapterResolution,
    liveResolution: ThemeAdapterResolution?,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.78f)),
        shape = MaterialTheme.shapes.extraLarge,
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = "Storefront Basic Version",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )

            Text(
                text = "This first mobile reference flow targets `builtin-default` and uses explicit fallback for non-baseline themes. Core commerce semantics stay the same either way.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )

            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

            Text(
                text = "The real storefront runtime must resolve store and active theme from /api/store/context + /api/themes/active. This public host can probe those endpoints directly when your local Jiffoo core server is running.",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
            )

            Text(
                text = "Live core contract probe",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
            )

            OutlinedTextField(
                value = apiBaseUrl,
                onValueChange = onApiBaseUrlChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                label = { Text("Core API base URL") },
                supportingText = {
                    Text("Android emulator default is 10.0.2.2:3001. Change this if your core server runs somewhere else.")
                },
            )

            Button(onClick = onResolveCore) {
                Text("Resolve from core")
            }

            when {
                isProbing -> {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        Text(
                            text = "Probing /api/store/context and /api/themes/active...",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
                        )
                    }
                }

                liveSnapshot != null -> {
                    PillRow(
                        labels = listOf(
                            "source: live core contract",
                            "store: ${liveSnapshot.storeName}",
                            "locale: ${liveSnapshot.defaultLocale}",
                            "active: ${liveSnapshot.activeThemeSlug}",
                            "adapter: ${liveResolution?.adapterId ?: "n/a"}",
                        ),
                        dark = false,
                    )

                    if (liveResolution?.usesFallback == true) {
                        FallbackNotice(liveResolution)
                    }
                }

                else -> {
                    StatusNotice(
                        title = "Live probe unavailable",
                        message = liveProbeError ?: "Core contract probe is unavailable, so the host stays on preview contract data.",
                        accent = Color(0xFFF5DDDA),
                    )
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

            Text(
                text = "Support matrix preview",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
            )

            PillRow(
                labels = StorefrontPreviewData.officialThemes.map { it.slug },
                dark = false,
                selectedLabel = previewThemeSlug,
                onSelect = onPreviewThemeSelected,
            )

            PillRow(
                labels = listOf(
                    "preview: $previewThemeSlug",
                    "effective: ${previewResolution.effectiveThemeSlug}",
                    "official status: ${previewResolution.officialStatus}",
                ),
                dark = false,
            )

            if (previewResolution.usesFallback) {
                FallbackNotice(previewResolution)
            }

            Text(
                text = "Basic storefront flows",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
            )

            PillRow(
                labels = StorefrontPreviewData.basicFlows,
                dark = false,
            )

            Text(
                text = "Supported theme modes: ${StorefrontClientProfile.supportedThemeModes.joinToString()}",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
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
private fun FallbackNotice(resolution: ThemeAdapterResolution) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF6E6C6)),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = "Fallback active",
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = resolution.fallbackReason ?: "Theme fallback is active.",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )
        }
    }
}

@Composable
private fun StatusNotice(
    title: String,
    message: String,
    accent: Color,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = accent),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = message,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )
        }
    }
}

@Composable
private fun DemoCard(
    route: NavigationRoute,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = routeAccent(route)),
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
                        imageVector = routeIcon(route),
                        contentDescription = route.title,
                        tint = Color.White,
                        modifier = Modifier.size(22.dp),
                    )
                }

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = route.title,
                        style = MaterialTheme.typography.titleMedium,
                        color = Color.White,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = route.summary,
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color.White.copy(alpha = 0.88f),
                    )
                }
            }

            PillRow(labels = route.pills, dark = true)

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
    route: NavigationRoute,
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
            text = route.summary,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.74f),
        )

        CapabilityShowcase(
            title = "What The Foundation Owns",
            accent = routeAccent(route),
            items = detailOwnedItems(route),
        )

        CapabilityShowcase(
            title = "What Private Product Apps Add",
            accent = Color.Black.copy(alpha = 0.74f),
            items = detailPrivateItems(route),
        )

        when (route) {
            NavigationRoute.DesignSystem -> TokenShowcase()
            NavigationRoute.Navigation -> RouteShowcase()
            NavigationRoute.Permissions -> PermissionShowcase()
            NavigationRoute.Storage -> StorageShowcase()
            NavigationRoute.Networking -> NetworkingShowcase()
            NavigationRoute.Observability -> ObservabilityShowcase()
            NavigationRoute.Debug -> DebugShowcase()
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
        DesignToken.swatches.forEach { swatch ->
            SwatchRow(swatch.label, swatch.color)
        }
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
        PillRow(labels = NavigationRoute.entries.take(4).map { it.path }, dark = false)
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
        PermissionKind.entries.forEach { permission ->
            PermissionRow(
                label = permission.label,
                status = permission.detail,
                tint = routeAccent(NavigationRoute.Permissions),
            )
        }
    }
}

@Composable
private fun StorageShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Storage Layers", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        PillRow(labels = StoragePreview.namespaces, dark = false)
        Text(
            text = "The public repo owns generic storage primitives. Private apps own real keys, domain models, and retention policy.",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.66f),
        )
    }
}

@Composable
private fun NetworkingShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Request Contracts", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        NetworkingPreview.descriptors.forEach { descriptor ->
            RequestCard(descriptor)
        }
    }
}

@Composable
private fun ObservabilityShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Signal Contracts", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        ObservabilityPreview.signals.forEach { signal ->
            SignalCard(signal)
        }
    }
}

@Composable
private fun DebugShowcase() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Debug Surface", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        DebugPanel.tools.forEach { tool ->
            DebugFlag(tool.title, tool.detail)
        }
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
private fun RequestCard(descriptor: RequestDescriptor) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.7f)),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                text = "${descriptor.method} ${descriptor.path}",
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = if (descriptor.requiresAuth) "requires downstream auth adapter" else "safe for public demo flows",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.64f),
            )
        }
    }
}

@Composable
private fun SignalCard(signal: LogSignal) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.7f)),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(text = signal.name, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
            Text(text = signal.detail, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.64f))
        }
    }
}

@Composable
private fun PillRow(
    labels: List<String>,
    dark: Boolean,
    selectedLabel: String? = null,
    onSelect: ((String) -> Unit)? = null,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        labels.forEach { label ->
            Pill(
                label = label,
                dark = dark,
                selected = selectedLabel == label,
                onClick = { onSelect?.invoke(label) },
            )
        }
    }
}

@Composable
private fun Pill(
    label: String,
    dark: Boolean,
    selected: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    val background = when {
        selected -> routeAccent(NavigationRoute.DesignSystem).copy(alpha = if (dark) 0.9f else 0.2f)
        dark -> Color.Black.copy(alpha = 0.18f)
        else -> MaterialTheme.colorScheme.surfaceVariant
    }
    val textColor = if (dark || selected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
    AssistChip(
        onClick = { onClick?.invoke() },
        label = { Text(label) },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = background,
            labelColor = textColor,
        ),
    )
}

private fun detailOwnedItems(route: NavigationRoute): List<String> = when (route) {
    NavigationRoute.DesignSystem -> listOf("shared colors", "radius scale", "typography tokens", "base components")
    NavigationRoute.Navigation -> listOf("route names", "shell entrypoints", "demo flow scaffolding")
    NavigationRoute.Permissions -> listOf("request wrappers", "educational copy patterns", "result normalization")
    NavigationRoute.Storage -> listOf("key-value adapters", "cache boundaries", "generic persistence APIs")
    NavigationRoute.Networking -> listOf("request descriptors", "auth hooks", "mock transport boundaries")
    NavigationRoute.Observability -> listOf("logger contract", "signal naming", "breadcrumbs")
    NavigationRoute.Debug -> listOf("debug menu", "fake data hooks", "verbose diagnostics")
}

private fun detailPrivateItems(route: NavigationRoute): List<String> = when (route) {
    NavigationRoute.DesignSystem -> listOf("Bokmoo brand styling", "marketing art", "campaign visuals")
    NavigationRoute.Navigation -> listOf("checkout flow", "account flow", "private deep links")
    NavigationRoute.Permissions -> listOf("business prompts", "feature-specific timing", "conversion copy")
    NavigationRoute.Storage -> listOf("real models", "sensitive schemas", "retention policy")
    NavigationRoute.Networking -> listOf("tenant auth adapters", "plugin-specific transport", "domain error mapping")
    NavigationRoute.Observability -> listOf("vendor config", "private event schema", "ops dashboards")
    NavigationRoute.Debug -> listOf("tenant-only flags", "private APIs", "ops credentials")
}

private fun routeIcon(route: NavigationRoute): ImageVector = when (route) {
    NavigationRoute.DesignSystem -> Icons.Default.Palette
    NavigationRoute.Navigation -> Icons.Default.Route
    NavigationRoute.Permissions -> Icons.Default.Security
    NavigationRoute.Storage -> Icons.Default.Dataset
    NavigationRoute.Networking -> Icons.Default.Language
    NavigationRoute.Observability -> Icons.Default.BugReport
    NavigationRoute.Debug -> Icons.Default.BugReport
}

private fun routeAccent(route: NavigationRoute): Color = when (route) {
    NavigationRoute.DesignSystem -> DesignToken.primary
    NavigationRoute.Navigation -> DesignToken.accent
    NavigationRoute.Permissions -> DesignToken.tertiary
    NavigationRoute.Storage -> Color(0xFF6F4E9C)
    NavigationRoute.Networking -> Color(0xFF23608D)
    NavigationRoute.Observability -> Color(0xFF6A3B1A)
    NavigationRoute.Debug -> Color(0xFF8A2D3B)
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
            route = NavigationRoute.DesignSystem,
        )
    }
}

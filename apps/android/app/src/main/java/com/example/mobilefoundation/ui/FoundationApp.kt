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
import androidx.compose.runtime.rememberCoroutineScope
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
import com.example.mobilefoundation.core.networking.StorefrontCatalogPreviewData
import com.example.mobilefoundation.core.networking.StorefrontCartPreviewData
import com.example.mobilefoundation.core.networking.StorefrontCartItem
import com.example.mobilefoundation.core.networking.StorefrontCartSnapshot
import com.example.mobilefoundation.core.networking.StorefrontCategory
import com.example.mobilefoundation.core.networking.StorefrontContractClient
import com.example.mobilefoundation.core.networking.StorefrontContractSnapshot
import com.example.mobilefoundation.core.networking.StorefrontProductDetail
import com.example.mobilefoundation.core.networking.StorefrontProductListItem
import com.example.mobilefoundation.core.networking.StorefrontPaymentMethod
import com.example.mobilefoundation.core.observability.LogSignal
import com.example.mobilefoundation.core.networking.StorefrontCheckoutPreviewData
import com.example.mobilefoundation.core.networking.StorefrontOrderSummary
import com.example.mobilefoundation.core.observability.ObservabilityPreview
import com.example.mobilefoundation.core.permissions.PermissionKind
import com.example.mobilefoundation.core.runtime.FoundationRuntime
import com.example.mobilefoundation.core.runtime.StorefrontClientProfile
import com.example.mobilefoundation.core.runtime.StorefrontPreviewData
import com.example.mobilefoundation.core.runtime.ThemeAdapterResolution
import com.example.mobilefoundation.core.storage.StoragePreview
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
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
    var liveProducts by remember { mutableStateOf<List<StorefrontProductListItem>>(emptyList()) }
    var liveProductsError by remember { mutableStateOf<String?>(null) }
    var isLoadingProducts by remember { mutableStateOf(false) }
    var liveCategories by remember { mutableStateOf<List<StorefrontCategory>>(emptyList()) }
    var liveCategoriesError by remember { mutableStateOf<String?>(null) }
    var isLoadingCategories by remember { mutableStateOf(false) }
    var selectedCategorySlug by remember { mutableStateOf("all") }
    var searchQuery by remember { mutableStateOf("") }
    var appliedSearchQuery by remember { mutableStateOf("") }
    var cartAccessToken by remember { mutableStateOf("") }
    var appliedCartAccessToken by remember { mutableStateOf("") }
    var liveCart by remember { mutableStateOf<StorefrontCartSnapshot?>(null) }
    var liveCartError by remember { mutableStateOf<String?>(null) }
    var isLoadingCart by remember { mutableStateOf(false) }
    var previewCart by remember { mutableStateOf(StorefrontCartPreviewData.emptyCart()) }
    var isMutatingCart by remember { mutableStateOf(false) }
    var livePaymentMethods by remember { mutableStateOf<List<StorefrontPaymentMethod>>(emptyList()) }
    var livePaymentMethodsError by remember { mutableStateOf<String?>(null) }
    var isLoadingPaymentMethods by remember { mutableStateOf(false) }
    var selectedPaymentMethodSlug by remember { mutableStateOf(StorefrontCheckoutPreviewData.paymentMethods.first().pluginSlug) }
    var liveOrderSummary by remember { mutableStateOf<StorefrontOrderSummary?>(null) }
    var previewOrderSummary by remember { mutableStateOf<StorefrontOrderSummary?>(null) }
    var checkoutError by remember { mutableStateOf<String?>(null) }
    var isCreatingOrder by remember { mutableStateOf(false) }
    var selectedProductId by remember { mutableStateOf(StorefrontCatalogPreviewData.products.first().id) }
    var liveProductDetail by remember { mutableStateOf<StorefrontProductDetail?>(null) }
    var liveProductDetailError by remember { mutableStateOf<String?>(null) }
    var isLoadingProductDetail by remember { mutableStateOf(false) }

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

    LaunchedEffect(liveSnapshot?.baseUrl) {
        liveCategories = emptyList()
        liveCategoriesError = null
        liveProducts = emptyList()
        liveProductsError = null
        liveProductDetail = null
        liveProductDetailError = null

        val snapshot = liveSnapshot ?: return@LaunchedEffect
        isLoadingCategories = true

        runCatching {
            withContext(Dispatchers.IO) {
                StorefrontContractClient.fetchCategories(snapshot.baseUrl)
            }
        }.onSuccess { categories ->
            liveCategories = categories
        }.onFailure { error ->
            liveCategoriesError = error.message ?: "Unable to load categories from core."
            selectedCategorySlug = "all"
        }

        isLoadingCategories = false
    }

    LaunchedEffect(liveSnapshot?.baseUrl, selectedCategorySlug, appliedSearchQuery) {
        liveProducts = emptyList()
        liveProductsError = null
        liveProductDetail = null
        liveProductDetailError = null

        val snapshot = liveSnapshot ?: return@LaunchedEffect
        isLoadingProducts = true

        runCatching {
            withContext(Dispatchers.IO) {
                StorefrontContractClient.fetchProducts(
                    baseUrl = snapshot.baseUrl,
                    categorySlug = selectedCategorySlug,
                    searchQuery = appliedSearchQuery,
                )
            }
        }.onSuccess { products ->
            liveProducts = products
            selectedProductId = products.firstOrNull()?.id ?: StorefrontCatalogPreviewData.products.first().id
        }.onFailure { error ->
            liveProductsError = error.message ?: "Unable to load products from core."
            selectedProductId = StorefrontCatalogPreviewData.products.first().id
        }

        isLoadingProducts = false
    }

    LaunchedEffect(selectedCategorySlug, appliedSearchQuery, liveProducts, liveSnapshot?.baseUrl) {
        val effectiveProducts = if (liveProducts.isNotEmpty()) {
            liveProducts
        } else {
            StorefrontCatalogPreviewData.filterProducts(selectedCategorySlug, appliedSearchQuery)
        }

        if (effectiveProducts.none { it.id == selectedProductId }) {
            selectedProductId = effectiveProducts.firstOrNull()?.id ?: ""
        }
    }

    LaunchedEffect(selectedProductId, liveSnapshot?.baseUrl, liveProducts.isNotEmpty()) {
        liveProductDetail = null
        liveProductDetailError = null

        val snapshot = liveSnapshot
        if (snapshot == null || liveProducts.isEmpty()) {
            return@LaunchedEffect
        }

        isLoadingProductDetail = true

        runCatching {
            withContext(Dispatchers.IO) {
                StorefrontContractClient.fetchProductDetail(snapshot.baseUrl, selectedProductId)
            }
        }.onSuccess { detail ->
            liveProductDetail = detail
        }.onFailure { error ->
            liveProductDetailError = error.message ?: "Unable to load product detail from core."
        }

        isLoadingProductDetail = false
    }

    LaunchedEffect(liveSnapshot?.baseUrl, appliedCartAccessToken) {
        liveCart = null
        liveCartError = null

        val snapshot = liveSnapshot ?: return@LaunchedEffect
        if (appliedCartAccessToken.isBlank()) {
            liveCartError = "Cart requires a shop access token, so the host is using preview cart data."
            return@LaunchedEffect
        }

        isLoadingCart = true

        runCatching {
            withContext(Dispatchers.IO) {
                StorefrontContractClient.fetchCart(snapshot.baseUrl, appliedCartAccessToken)
            }
        }.onSuccess { cart ->
            liveCart = cart
        }.onFailure { error ->
            liveCartError = (error.message ?: "Unable to load cart from core.") + " Using preview cart instead."
        }

        isLoadingCart = false
    }

    LaunchedEffect(liveSnapshot?.baseUrl) {
        livePaymentMethods = emptyList()
        livePaymentMethodsError = null

        val snapshot = liveSnapshot ?: return@LaunchedEffect
        isLoadingPaymentMethods = true

        runCatching {
            withContext(Dispatchers.IO) {
                StorefrontContractClient.fetchPaymentMethods(snapshot.baseUrl)
            }
        }.onSuccess { methods ->
            livePaymentMethods = methods
            val firstSlug = methods.firstOrNull()?.pluginSlug
            if (firstSlug != null) {
                selectedPaymentMethodSlug = firstSlug
            }
        }.onFailure { error ->
            livePaymentMethodsError = error.message ?: "Unable to load payment methods from core."
        }

        isLoadingPaymentMethods = false
    }

    val scope = rememberCoroutineScope()

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
                        liveProducts = liveProducts,
                        liveProductsError = liveProductsError,
                        isLoadingProducts = isLoadingProducts,
                        liveCategories = liveCategories,
                        liveCategoriesError = liveCategoriesError,
                        isLoadingCategories = isLoadingCategories,
                        selectedCategorySlug = selectedCategorySlug,
                        onCategorySelected = { selectedCategorySlug = it },
                        searchQuery = searchQuery,
                        onSearchQueryChange = { searchQuery = it },
                        onApplySearch = { appliedSearchQuery = searchQuery.trim() },
                        onClearSearch = {
                            searchQuery = ""
                            appliedSearchQuery = ""
                        },
                        appliedSearchQuery = appliedSearchQuery,
                        selectedProductId = selectedProductId,
                        onProductSelected = { selectedProductId = it },
                        liveProductDetail = liveProductDetail,
                        liveProductDetailError = liveProductDetailError,
                        isLoadingProductDetail = isLoadingProductDetail,
                        cartAccessToken = cartAccessToken,
                        onCartAccessTokenChange = { cartAccessToken = it },
                        onApplyCartAccessToken = { appliedCartAccessToken = cartAccessToken.trim() },
                        onClearCartAccessToken = {
                            cartAccessToken = ""
                            appliedCartAccessToken = ""
                        },
                        liveCart = liveCart,
                        liveCartError = liveCartError,
                        isLoadingCart = isLoadingCart,
                        previewCart = previewCart,
                        isMutatingCart = isMutatingCart,
                        onAddSelectedProductToCart = {
                            val product = liveProductDetail ?: StorefrontCatalogPreviewData.detailFor(selectedProductId)
                            if (product == null) return@FoundationHome

                            scope.launch {
                                isMutatingCart = true
                                val canUseLiveCart = liveSnapshot != null && appliedCartAccessToken.isNotBlank() && liveCartError == null
                                if (canUseLiveCart) {
                                    runCatching {
                                        withContext(Dispatchers.IO) {
                                            StorefrontContractClient.addToCart(
                                                baseUrl = checkNotNull(liveSnapshot).baseUrl,
                                                bearerToken = appliedCartAccessToken,
                                                productId = product.id,
                                                variantId = product.variants.firstOrNull()?.id ?: "${product.id}-default",
                                            )
                                        }
                                    }.onSuccess { cart ->
                                        liveCart = cart
                                    }.onFailure { error ->
                                        liveCart = null
                                        liveCartError = (error.message ?: "Unable to add to live cart.") + " Using preview cart instead."
                                        previewCart = StorefrontCartPreviewData.addProduct(previewCart, product)
                                    }
                                } else {
                                    previewCart = StorefrontCartPreviewData.addProduct(previewCart, product)
                                }
                                previewOrderSummary = null
                                liveOrderSummary = null
                                checkoutError = null
                                isMutatingCart = false
                            }
                        },
                        onRemoveCartItem = { itemId ->
                            scope.launch {
                                isMutatingCart = true
                                val canUseLiveCart = liveSnapshot != null && appliedCartAccessToken.isNotBlank() && liveCart != null
                                if (canUseLiveCart) {
                                    runCatching {
                                        withContext(Dispatchers.IO) {
                                            StorefrontContractClient.removeFromCart(
                                                baseUrl = checkNotNull(liveSnapshot).baseUrl,
                                                bearerToken = appliedCartAccessToken,
                                                itemId = itemId,
                                            )
                                        }
                                    }.onSuccess { cart ->
                                        liveCart = cart
                                    }.onFailure { error ->
                                        liveCart = null
                                        liveCartError = (error.message ?: "Unable to remove from live cart.") + " Using preview cart instead."
                                        previewCart = StorefrontCartPreviewData.removeItem(previewCart, itemId)
                                    }
                                } else {
                                    previewCart = StorefrontCartPreviewData.removeItem(previewCart, itemId)
                                }
                                previewOrderSummary = null
                                liveOrderSummary = null
                                checkoutError = null
                                isMutatingCart = false
                            }
                        },
                        livePaymentMethods = livePaymentMethods,
                        livePaymentMethodsError = livePaymentMethodsError,
                        isLoadingPaymentMethods = isLoadingPaymentMethods,
                        selectedPaymentMethodSlug = selectedPaymentMethodSlug,
                        onPaymentMethodSelected = { selectedPaymentMethodSlug = it },
                        liveOrderSummary = liveOrderSummary,
                        previewOrderSummary = previewOrderSummary,
                        checkoutError = checkoutError,
                        isCreatingOrder = isCreatingOrder,
                        onCreateOrder = {
                            scope.launch {
                                isCreatingOrder = true
                                checkoutError = null
                                val effectiveCart = liveCart ?: previewCart
                                val canUseLiveOrder = liveSnapshot != null && appliedCartAccessToken.isNotBlank() && liveCart != null
                                if (canUseLiveOrder) {
                                    runCatching {
                                        withContext(Dispatchers.IO) {
                                            StorefrontContractClient.createOrder(
                                                baseUrl = checkNotNull(liveSnapshot).baseUrl,
                                                bearerToken = appliedCartAccessToken,
                                                cart = effectiveCart,
                                            )
                                        }
                                    }.onSuccess { order ->
                                        liveOrderSummary = order
                                        previewOrderSummary = null
                                    }.onFailure { error ->
                                        liveOrderSummary = null
                                        previewOrderSummary = StorefrontCheckoutPreviewData.createOrderPreview(effectiveCart)
                                        checkoutError = (error.message ?: "Unable to create live order.") + " Using preview order summary instead."
                                    }
                                } else {
                                    previewOrderSummary = StorefrontCheckoutPreviewData.createOrderPreview(effectiveCart)
                                    liveOrderSummary = null
                                    if (appliedCartAccessToken.isBlank()) {
                                        checkoutError = "Checkout create-order requires a shop access token, so the host is using preview order summary."
                                    }
                                }
                                isCreatingOrder = false
                            }
                        },
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
    liveProducts: List<StorefrontProductListItem>,
    liveProductsError: String?,
    isLoadingProducts: Boolean,
    liveCategories: List<StorefrontCategory>,
    liveCategoriesError: String?,
    isLoadingCategories: Boolean,
    selectedCategorySlug: String,
    onCategorySelected: (String) -> Unit,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onApplySearch: () -> Unit,
    onClearSearch: () -> Unit,
    appliedSearchQuery: String,
    selectedProductId: String,
    onProductSelected: (String) -> Unit,
    liveProductDetail: StorefrontProductDetail?,
    liveProductDetailError: String?,
    isLoadingProductDetail: Boolean,
    cartAccessToken: String,
    onCartAccessTokenChange: (String) -> Unit,
    onApplyCartAccessToken: () -> Unit,
    onClearCartAccessToken: () -> Unit,
    liveCart: StorefrontCartSnapshot?,
    liveCartError: String?,
    isLoadingCart: Boolean,
    previewCart: StorefrontCartSnapshot,
    isMutatingCart: Boolean,
    onAddSelectedProductToCart: () -> Unit,
    onRemoveCartItem: (String) -> Unit,
    livePaymentMethods: List<StorefrontPaymentMethod>,
    livePaymentMethodsError: String?,
    isLoadingPaymentMethods: Boolean,
    selectedPaymentMethodSlug: String,
    onPaymentMethodSelected: (String) -> Unit,
    liveOrderSummary: StorefrontOrderSummary?,
    previewOrderSummary: StorefrontOrderSummary?,
    checkoutError: String?,
    isCreatingOrder: Boolean,
    onCreateOrder: () -> Unit,
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
                liveProducts = liveProducts,
                liveProductsError = liveProductsError,
                isLoadingProducts = isLoadingProducts,
                liveCategories = liveCategories,
                liveCategoriesError = liveCategoriesError,
                isLoadingCategories = isLoadingCategories,
                selectedCategorySlug = selectedCategorySlug,
                onCategorySelected = onCategorySelected,
                searchQuery = searchQuery,
                onSearchQueryChange = onSearchQueryChange,
                onApplySearch = onApplySearch,
                onClearSearch = onClearSearch,
                appliedSearchQuery = appliedSearchQuery,
                selectedProductId = selectedProductId,
                onProductSelected = onProductSelected,
                liveProductDetail = liveProductDetail,
                liveProductDetailError = liveProductDetailError,
                isLoadingProductDetail = isLoadingProductDetail,
                cartAccessToken = cartAccessToken,
                onCartAccessTokenChange = onCartAccessTokenChange,
                onApplyCartAccessToken = onApplyCartAccessToken,
                onClearCartAccessToken = onClearCartAccessToken,
                liveCart = liveCart,
                liveCartError = liveCartError,
                isLoadingCart = isLoadingCart,
                previewCart = previewCart,
                isMutatingCart = isMutatingCart,
                onAddSelectedProductToCart = onAddSelectedProductToCart,
                onRemoveCartItem = onRemoveCartItem,
                livePaymentMethods = livePaymentMethods,
                livePaymentMethodsError = livePaymentMethodsError,
                isLoadingPaymentMethods = isLoadingPaymentMethods,
                selectedPaymentMethodSlug = selectedPaymentMethodSlug,
                onPaymentMethodSelected = onPaymentMethodSelected,
                liveOrderSummary = liveOrderSummary,
                previewOrderSummary = previewOrderSummary,
                checkoutError = checkoutError,
                isCreatingOrder = isCreatingOrder,
                onCreateOrder = onCreateOrder,
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
    liveProducts: List<StorefrontProductListItem>,
    liveProductsError: String?,
    isLoadingProducts: Boolean,
    liveCategories: List<StorefrontCategory>,
    liveCategoriesError: String?,
    isLoadingCategories: Boolean,
    selectedCategorySlug: String,
    onCategorySelected: (String) -> Unit,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onApplySearch: () -> Unit,
    onClearSearch: () -> Unit,
    appliedSearchQuery: String,
    selectedProductId: String,
    onProductSelected: (String) -> Unit,
    liveProductDetail: StorefrontProductDetail?,
    liveProductDetailError: String?,
    isLoadingProductDetail: Boolean,
    cartAccessToken: String,
    onCartAccessTokenChange: (String) -> Unit,
    onApplyCartAccessToken: () -> Unit,
    onClearCartAccessToken: () -> Unit,
    liveCart: StorefrontCartSnapshot?,
    liveCartError: String?,
    isLoadingCart: Boolean,
    previewCart: StorefrontCartSnapshot,
    isMutatingCart: Boolean,
    onAddSelectedProductToCart: () -> Unit,
    onRemoveCartItem: (String) -> Unit,
    livePaymentMethods: List<StorefrontPaymentMethod>,
    livePaymentMethodsError: String?,
    isLoadingPaymentMethods: Boolean,
    selectedPaymentMethodSlug: String,
    onPaymentMethodSelected: (String) -> Unit,
    liveOrderSummary: StorefrontOrderSummary?,
    previewOrderSummary: StorefrontOrderSummary?,
    checkoutError: String?,
    isCreatingOrder: Boolean,
    onCreateOrder: () -> Unit,
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

            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

            CatalogReferenceSection(
                liveProducts = liveProducts,
                liveProductsError = liveProductsError,
                isLoadingProducts = isLoadingProducts,
                liveCategories = liveCategories,
                liveCategoriesError = liveCategoriesError,
                isLoadingCategories = isLoadingCategories,
                selectedCategorySlug = selectedCategorySlug,
                onCategorySelected = onCategorySelected,
                searchQuery = searchQuery,
                onSearchQueryChange = onSearchQueryChange,
                onApplySearch = onApplySearch,
                onClearSearch = onClearSearch,
                appliedSearchQuery = appliedSearchQuery,
                selectedProductId = selectedProductId,
                onProductSelected = onProductSelected,
                liveProductDetail = liveProductDetail,
                liveProductDetailError = liveProductDetailError,
                isLoadingProductDetail = isLoadingProductDetail,
            )

            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

            CartReferenceSection(
                cartAccessToken = cartAccessToken,
                onCartAccessTokenChange = onCartAccessTokenChange,
                onApplyCartAccessToken = onApplyCartAccessToken,
                onClearCartAccessToken = onClearCartAccessToken,
                liveCart = liveCart,
                liveCartError = liveCartError,
                isLoadingCart = isLoadingCart,
                previewCart = previewCart,
                isMutatingCart = isMutatingCart,
                onAddSelectedProductToCart = onAddSelectedProductToCart,
                onRemoveCartItem = onRemoveCartItem,
            )

            HorizontalDivider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

            CheckoutReferenceSection(
                livePaymentMethods = livePaymentMethods,
                livePaymentMethodsError = livePaymentMethodsError,
                isLoadingPaymentMethods = isLoadingPaymentMethods,
                selectedPaymentMethodSlug = selectedPaymentMethodSlug,
                onPaymentMethodSelected = onPaymentMethodSelected,
                liveCart = liveCart,
                previewCart = previewCart,
                liveOrderSummary = liveOrderSummary,
                previewOrderSummary = previewOrderSummary,
                checkoutError = checkoutError,
                isCreatingOrder = isCreatingOrder,
                onCreateOrder = onCreateOrder,
            )
        }
    }
}

@Composable
private fun CatalogReferenceSection(
    liveProducts: List<StorefrontProductListItem>,
    liveProductsError: String?,
    isLoadingProducts: Boolean,
    liveCategories: List<StorefrontCategory>,
    liveCategoriesError: String?,
    isLoadingCategories: Boolean,
    selectedCategorySlug: String,
    onCategorySelected: (String) -> Unit,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onApplySearch: () -> Unit,
    onClearSearch: () -> Unit,
    appliedSearchQuery: String,
    selectedProductId: String,
    onProductSelected: (String) -> Unit,
    liveProductDetail: StorefrontProductDetail?,
    liveProductDetailError: String?,
    isLoadingProductDetail: Boolean,
) {
    val effectiveProducts = if (liveProducts.isNotEmpty()) {
        liveProducts
    } else {
        StorefrontCatalogPreviewData.filterProducts(selectedCategorySlug, appliedSearchQuery)
    }
    val effectiveCategories = if (liveCategories.isNotEmpty()) liveCategories else StorefrontCatalogPreviewData.categories
    val previewDetail = StorefrontCatalogPreviewData.detailFor(selectedProductId)
    val isUsingLiveCatalog = liveProducts.isNotEmpty()
    val effectiveDetail = if (isUsingLiveCatalog) liveProductDetail else previewDetail

    Text(
        text = "Catalog reference",
        style = MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.SemiBold,
    )

    PillRow(
        labels = listOf(
            "catalog source: ${if (isUsingLiveCatalog) "live core" else "preview fallback"}",
            "items: ${effectiveProducts.size}",
            "category: $selectedCategorySlug",
            "search: ${if (appliedSearchQuery.isBlank()) "none" else appliedSearchQuery}",
            "selected: $selectedProductId",
        ),
        dark = false,
    )

    Text(
        text = "Category discovery",
        style = MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.SemiBold,
    )

    CategoryPillRow(
        categories = effectiveCategories,
        selectedCategorySlug = selectedCategorySlug,
        onCategorySelected = onCategorySelected,
    )

    if (!isUsingLiveCatalog && liveCategoriesError != null) {
        StatusNotice(
            title = "Category fallback active",
            message = liveCategoriesError,
            accent = Color(0xFFF6E6C6),
        )
    }

    if (isLoadingCategories) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            Text(
                text = "Loading categories from /api/products/categories...",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )
        }
    }

    OutlinedTextField(
        value = searchQuery,
        onValueChange = onSearchQueryChange,
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        label = { Text("Search products") },
        supportingText = {
            Text("Use /api/products with search filters in the public reference host.")
        },
    )

    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Button(onClick = onApplySearch) {
            Text("Apply search")
        }
        Button(onClick = onClearSearch) {
            Text("Clear")
        }
    }

    if (isLoadingProducts) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            Text(
                text = "Loading products from /api/products...",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )
        }
    }

    if (!isUsingLiveCatalog && liveProductsError != null) {
        StatusNotice(
            title = "Catalog fallback active",
            message = liveProductsError,
            accent = Color(0xFFF6E6C6),
        )
    }

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        effectiveProducts.forEach { product ->
            ProductListCard(
                product = product,
                selected = product.id == selectedProductId,
                onClick = { onProductSelected(product.id) },
            )
        }
    }

    when {
        isLoadingProductDetail -> {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                Text(
                    text = "Loading product detail...",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
                )
            }
        }

        !isUsingLiveCatalog -> {
            if (previewDetail != null) {
                ProductDetailCard(product = previewDetail, sourceLabel = "preview fallback")
            }
        }

        liveProductDetail != null -> {
            ProductDetailCard(product = liveProductDetail, sourceLabel = "live core")
        }

        liveProductDetailError != null -> {
            StatusNotice(
                title = "Detail unavailable",
                message = liveProductDetailError,
                accent = Color(0xFFF5DDDA),
            )
        }
    }
}

@Composable
private fun CategoryPillRow(
    categories: List<StorefrontCategory>,
    selectedCategorySlug: String,
    onCategorySelected: (String) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Pill(
            label = "all",
            dark = false,
            selected = selectedCategorySlug == "all",
            onClick = { onCategorySelected("all") },
        )

        categories.forEach { category ->
            Pill(
                label = category.name,
                dark = false,
                selected = selectedCategorySlug == category.slug,
                onClick = { onCategorySelected(category.slug) },
            )
        }
    }
}

@Composable
private fun CartReferenceSection(
    cartAccessToken: String,
    onCartAccessTokenChange: (String) -> Unit,
    onApplyCartAccessToken: () -> Unit,
    onClearCartAccessToken: () -> Unit,
    liveCart: StorefrontCartSnapshot?,
    liveCartError: String?,
    isLoadingCart: Boolean,
    previewCart: StorefrontCartSnapshot,
    isMutatingCart: Boolean,
    onAddSelectedProductToCart: () -> Unit,
    onRemoveCartItem: (String) -> Unit,
) {
    val effectiveCart = liveCart ?: previewCart
    val isUsingLiveCart = liveCart != null

    Text(
        text = "Cart reference",
        style = MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.SemiBold,
    )

    OutlinedTextField(
        value = cartAccessToken,
        onValueChange = onCartAccessTokenChange,
        modifier = Modifier.fillMaxWidth(),
        singleLine = true,
        label = { Text("Shop access token (optional)") },
        supportingText = {
            Text("Core cart endpoints require auth. Leave empty to keep using preview cart data.")
        },
    )

    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Button(onClick = onApplyCartAccessToken) {
            Text("Connect cart")
        }
        Button(onClick = onClearCartAccessToken) {
            Text("Use preview cart")
        }
    }

    if (isLoadingCart) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            Text(
                text = "Loading /api/cart...",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )
        }
    }

    if (!isUsingLiveCart && liveCartError != null) {
        StatusNotice(
            title = "Preview cart active",
            message = liveCartError,
            accent = Color(0xFFF6E6C6),
        )
    }

    PillRow(
        labels = listOf(
            "cart source: ${if (isUsingLiveCart) "live core" else "preview fallback"}",
            "items: ${effectiveCart.itemCount}",
            "subtotal: ${formatPrice(effectiveCart.subtotal)}",
            "total: ${formatPrice(effectiveCart.total)}",
        ),
        dark = false,
    )

    Button(
        onClick = onAddSelectedProductToCart,
        enabled = !isMutatingCart,
    ) {
        Text(if (isMutatingCart) "Updating cart..." else "Add selected product")
    }

    if (effectiveCart.items.isEmpty()) {
        Text(
            text = "Cart is empty. Pick a product above, then add it here to exercise the shared cart contract.",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
        )
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            effectiveCart.items.forEach { item ->
                CartItemCard(
                    item = item,
                    onRemove = { onRemoveCartItem(item.id) },
                    removeEnabled = !isMutatingCart,
                )
            }
        }
    }
}

@Composable
private fun CartItemCard(
    item: StorefrontCartItem,
    onRemove: () -> Unit,
    removeEnabled: Boolean,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.72f)),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = item.productName,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
            )
            PillRow(
                labels = listOf(
                    "qty: ${item.quantity}",
                    "unit: ${formatPrice(item.price)}",
                    "subtotal: ${formatPrice(item.subtotal)}",
                    "shipping: ${if (item.requiresShipping) "required" else "not required"}",
                ),
                dark = false,
            )
            Button(onClick = onRemove, enabled = removeEnabled) {
                Text("Remove item")
            }
        }
    }
}

@Composable
private fun CheckoutReferenceSection(
    livePaymentMethods: List<StorefrontPaymentMethod>,
    livePaymentMethodsError: String?,
    isLoadingPaymentMethods: Boolean,
    selectedPaymentMethodSlug: String,
    onPaymentMethodSelected: (String) -> Unit,
    liveCart: StorefrontCartSnapshot?,
    previewCart: StorefrontCartSnapshot,
    liveOrderSummary: StorefrontOrderSummary?,
    previewOrderSummary: StorefrontOrderSummary?,
    checkoutError: String?,
    isCreatingOrder: Boolean,
    onCreateOrder: () -> Unit,
) {
    val effectiveCart = liveCart ?: previewCart
    val paymentMethods = if (livePaymentMethods.isNotEmpty()) livePaymentMethods else StorefrontCheckoutPreviewData.paymentMethods
    val effectiveOrder = liveOrderSummary ?: previewOrderSummary
    val isUsingLivePayments = livePaymentMethods.isNotEmpty()

    Text(
        text = "Checkout entry",
        style = MaterialTheme.typography.labelLarge,
        fontWeight = FontWeight.SemiBold,
    )

    PillRow(
        labels = listOf(
            "payments source: ${if (isUsingLivePayments) "live core" else "preview fallback"}",
            "selected method: $selectedPaymentMethodSlug",
            "cart total: ${formatPrice(effectiveCart.total)}",
            "items: ${effectiveCart.itemCount}",
        ),
        dark = false,
    )

    if (isLoadingPaymentMethods) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
            Text(
                text = "Loading /api/payments/available-methods...",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
            )
        }
    }

    if (!isUsingLivePayments && livePaymentMethodsError != null) {
        StatusNotice(
            title = "Payment methods fallback active",
            message = livePaymentMethodsError,
            accent = Color(0xFFF6E6C6),
        )
    }

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        paymentMethods.forEach { method ->
            Pill(
                label = method.displayName,
                dark = false,
                selected = selectedPaymentMethodSlug == method.pluginSlug,
                onClick = { onPaymentMethodSelected(method.pluginSlug) },
            )
        }
    }

    Button(
        onClick = onCreateOrder,
        enabled = effectiveCart.items.isNotEmpty() && !isCreatingOrder,
    ) {
        Text(if (isCreatingOrder) "Creating order..." else "Create order draft")
    }

    if (checkoutError != null) {
        StatusNotice(
            title = "Checkout fallback active",
            message = checkoutError,
            accent = Color(0xFFF6E6C6),
        )
    }

    if (effectiveOrder != null) {
        Card(
            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.72f)),
            shape = MaterialTheme.shapes.large,
        ) {
            Column(
                modifier = Modifier.padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text(
                    text = "Order summary",
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.SemiBold,
                )
                PillRow(
                    labels = listOf(
                        "order: ${effectiveOrder.id}",
                        "status: ${effectiveOrder.status}",
                        "payment: ${effectiveOrder.paymentStatus}",
                        "total: ${formatPrice(effectiveOrder.totalAmount)}",
                        "currency: ${effectiveOrder.currency}",
                    ),
                    dark = false,
                )
            }
        }
    }
}

@Composable
private fun ProductListCard(
    product: StorefrontProductListItem,
    selected: Boolean,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(
            containerColor = if (selected) Color(0xFFDDEBE7) else Color.White.copy(alpha = 0.72f),
        ),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = product.name,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
            )
            product.description?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.66f),
                )
            }
            PillRow(
                labels = listOf(
                    "price: ${formatPrice(product.price)}",
                    "stock: ${product.stock}",
                    product.categorySlug?.let { "category: $it" } ?: "category: unknown",
                ),
                dark = false,
            )
        }
    }
}

@Composable
private fun ProductDetailCard(
    product: StorefrontProductDetail,
    sourceLabel: String,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.78f)),
        shape = MaterialTheme.shapes.large,
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = "Product detail",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = product.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            product.description?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
                )
            }
            PillRow(
                labels = listOf(
                    "source: $sourceLabel",
                    "price: ${formatPrice(product.price)}",
                    "stock: ${product.stock}",
                    "shipping: ${if (product.requiresShipping) "required" else "not required"}",
                    "variants: ${product.variants.size}",
                ),
                dark = false,
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

private fun formatPrice(value: Double): String = "$" + String.format("%.2f", value)

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

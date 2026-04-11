#if canImport(SwiftUI)
import AppShell
import DebugTools
import DesignSystem
import Navigation
import Networking
import Observability
import Permissions
import Storage
import SwiftUI

@MainActor
struct RootView: View {
    @State private var previewThemeSlug = "builtin-default"
    @State private var apiBaseUrl = StorefrontContractClient.defaultDevBaseUrl
    @State private var appliedApiBaseUrl = StorefrontContractClient.defaultDevBaseUrl
    @State private var liveSnapshot: StorefrontContractSnapshot?
    @State private var liveProbeError: String?
    @State private var isProbing = true
    @State private var liveProducts: [StorefrontProductListItem] = []
    @State private var liveProductsError: String?
    @State private var isLoadingProducts = false
    @State private var liveCategories: [StorefrontCategory] = []
    @State private var liveCategoriesError: String?
    @State private var isLoadingCategories = false
    @State private var selectedCategorySlug = "all"
    @State private var searchQuery = ""
    @State private var appliedSearchQuery = ""
    @State private var selectedProductId = StorefrontCatalogPreviewData.products.first?.id ?? ""
    @State private var liveProductDetail: StorefrontProductDetail?
    @State private var liveProductDetailError: String?
    @State private var isLoadingProductDetail = false

    var body: some View {
        let previewResolution = StorefrontPreviewData.resolveTheme(previewThemeSlug)
        let liveResolution = liveSnapshot.map { StorefrontPreviewData.resolveTheme($0.activeThemeSlug) }

        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(AppShell.title)
                            .font(.system(size: 34, weight: .bold, design: .serif))

                        Text("Foundation means the reusable mobile base layer: shell, tokens, wrappers, and tooling that downstream private apps build on top of.")
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }

                    storefrontBasicVersionCard(
                        previewResolution: previewResolution,
                        liveResolution: liveResolution
                    )
                    explanationCard()

                    ForEach(NavigationRoute.allCases, id: \.self) { route in
                        NavigationLink(value: route) {
                            galleryCard(route: route)
                        }
                        .buttonStyle(.plain)
                    }

                    Text("Environment: \(AppShell.environmentName). Open any card to inspect what belongs in the public repo before Bokmoo or any other private app adds real business features.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                .padding(24)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(DesignToken.surface)
            .navigationTitle("Mobile Foundation")
            .navigationDestination(for: NavigationRoute.self) { route in
                DemoDetailView(route: route)
            }
        }
        .task(id: appliedApiBaseUrl) {
            await probeStorefront()
        }
        .task(id: liveSnapshot?.baseUrl) {
            await loadCategories()
        }
        .task(id: "\(liveSnapshot?.baseUrl ?? "preview")-\(selectedCategorySlug)-\(appliedSearchQuery)") {
            await loadCatalog()
        }
        .task(id: "\(selectedProductId)-\(selectedCategorySlug)-\(appliedSearchQuery)-\(liveProducts.count)-\(liveSnapshot?.baseUrl ?? "preview")") {
            await loadProductDetail()
        }
    }

    private func storefrontBasicVersionCard(
        previewResolution: ThemeAdapterResolution,
        liveResolution: ThemeAdapterResolution?
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Storefront Basic Version")
                .font(.headline)

            Text("This first mobile reference flow targets `builtin-default` and uses explicit fallback for non-baseline themes. Core commerce semantics stay the same either way.")
                .font(.body)
                .foregroundStyle(.secondary)

            Divider()

            Text("The real storefront runtime must resolve store and active theme from /api/store/context + /api/themes/active. This public host can probe those endpoints directly when your local Jiffoo core server is running.")
                .font(.footnote.weight(.medium))
                .foregroundStyle(.secondary)

            Text("Live core contract probe")
                .font(.subheadline.weight(.semibold))

            TextField("Core API base URL", text: $apiBaseUrl)
                .textFieldStyle(.roundedBorder)

            Text("iOS and macOS preview hosts default to 127.0.0.1:3001. Change this if your core server runs elsewhere.")
                .font(.footnote)
                .foregroundStyle(.secondary)

            Button("Resolve from core") {
                appliedApiBaseUrl = apiBaseUrl
            }

            if isProbing {
                HStack(spacing: 10) {
                    ProgressView()
                        .controlSize(.small)
                    Text("Probing /api/store/context and /api/themes/active...")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            } else if let liveSnapshot {
                VStack(alignment: .leading, spacing: 8) {
                    pill("source: live core contract", dark: false)
                    pill("store: \(liveSnapshot.storeName)", dark: false)
                    pill("locale: \(liveSnapshot.defaultLocale)", dark: false)
                    pill("active: \(liveSnapshot.activeThemeSlug)", dark: false)
                    pill("adapter: \(liveResolution?.adapterId ?? "n/a")", dark: false)
                }

                if let liveResolution, liveResolution.usesFallback {
                    fallbackNotice(liveResolution)
                }
            } else {
                statusCard(
                    title: "Live probe unavailable",
                    message: liveProbeError ?? "Core contract probe is unavailable, so the host stays on preview contract data.",
                    accent: Color(red: 0.96, green: 0.87, blue: 0.85)
                )
            }

            Divider()

            Text("Support matrix preview")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 8) {
                ForEach(StorefrontPreviewData.officialThemes, id: \.self) { entry in
                    Button {
                        previewThemeSlug = entry.slug
                    } label: {
                        pill(entry.slug, dark: false, selected: previewThemeSlug == entry.slug)
                    }
                    .buttonStyle(.plain)
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                pill("preview: \(previewThemeSlug)", dark: false)
                pill("effective: \(previewResolution.effectiveThemeSlug)", dark: false)
                pill("official status: \(previewResolution.officialStatus)", dark: false)
            }

            if previewResolution.usesFallback {
                fallbackNotice(previewResolution)
            }

            Text("Basic storefront flows")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 8) {
                ForEach(StorefrontPreviewData.basicFlows, id: \.self) { flow in
                    pill(flow, dark: false)
                }
            }

            Text("Supported theme modes: \(StorefrontClientProfile.supportedThemeModes.joined(separator: ", "))")
                .font(.footnote)
                .foregroundStyle(.secondary)

            Divider()

            catalogReferenceSection()
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }

    private func probeStorefront() async {
        isProbing = true
        liveSnapshot = nil
        liveProbeError = nil

        do {
            liveSnapshot = try await StorefrontContractClient.fetch(baseUrl: appliedApiBaseUrl)
        } catch {
            liveProbeError = error.localizedDescription
        }

        isProbing = false
    }

    private func loadCatalog() async {
        liveProducts = []
        liveProductsError = nil
        liveProductDetail = nil
        liveProductDetailError = nil

        guard let liveSnapshot else {
            let previewProducts = StorefrontCatalogPreviewData.filterProducts(
                categorySlug: selectedCategorySlug,
                searchQuery: appliedSearchQuery
            )
            if !previewProducts.contains(where: { $0.id == selectedProductId }) {
                selectedProductId = previewProducts.first?.id ?? ""
            }
            return
        }

        isLoadingProducts = true
        do {
            let products = try await StorefrontContractClient.fetchProducts(
                baseUrl: liveSnapshot.baseUrl,
                categorySlug: selectedCategorySlug,
                searchQuery: appliedSearchQuery
            )
            liveProducts = products
            if let firstId = products.first?.id {
                selectedProductId = firstId
            }
        } catch {
            liveProductsError = error.localizedDescription
        }
        isLoadingProducts = false

        let effectiveProducts = liveProducts.isEmpty
            ? StorefrontCatalogPreviewData.filterProducts(categorySlug: selectedCategorySlug, searchQuery: appliedSearchQuery)
            : liveProducts
        if !effectiveProducts.contains(where: { $0.id == selectedProductId }) {
            selectedProductId = effectiveProducts.first?.id ?? ""
        }
    }

    private func loadCategories() async {
        liveCategories = []
        liveCategoriesError = nil
        guard let liveSnapshot else { return }

        isLoadingCategories = true
        do {
            liveCategories = try await StorefrontContractClient.fetchCategories(baseUrl: liveSnapshot.baseUrl)
        } catch {
            liveCategoriesError = error.localizedDescription
            selectedCategorySlug = "all"
        }
        isLoadingCategories = false
    }

    private func loadProductDetail() async {
        liveProductDetail = nil
        liveProductDetailError = nil

        guard let liveSnapshot, !liveProducts.isEmpty, !selectedProductId.isEmpty else { return }

        isLoadingProductDetail = true
        do {
            liveProductDetail = try await StorefrontContractClient.fetchProductDetail(
                baseUrl: liveSnapshot.baseUrl,
                productId: selectedProductId
            )
        } catch {
            liveProductDetailError = error.localizedDescription
        }
        isLoadingProductDetail = false
    }

    private func explanationCard() -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("How To Use This")
                .font(.headline)
            Text("This is not a product page. It is a demo gallery for the public foundation layer.")
                .font(.body)
            Divider()
            Text("Tap a capability card to preview what the foundation owns and what should remain in private business repos.")
                .font(.footnote.weight(.medium))
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }

    private func catalogReferenceSection() -> some View {
        let effectiveProducts = liveProducts.isEmpty
            ? StorefrontCatalogPreviewData.filterProducts(categorySlug: selectedCategorySlug, searchQuery: appliedSearchQuery)
            : liveProducts
        let effectiveCategories = liveCategories.isEmpty ? StorefrontCatalogPreviewData.categories : liveCategories
        let isUsingLiveCatalog = !liveProducts.isEmpty
        let previewDetail = StorefrontCatalogPreviewData.detail(for: selectedProductId)
        let effectiveDetail = isUsingLiveCatalog ? liveProductDetail : previewDetail

        return VStack(alignment: .leading, spacing: 12) {
            Text("Catalog reference")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 8) {
                pill("catalog source: \(isUsingLiveCatalog ? "live core" : "preview fallback")", dark: false)
                pill("items: \(effectiveProducts.count)", dark: false)
                pill("category: \(selectedCategorySlug)", dark: false)
                pill("search: \(appliedSearchQuery.isEmpty ? "none" : appliedSearchQuery)", dark: false)
                pill("selected: \(selectedProductId)", dark: false)
            }

            Text("Category discovery")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 8) {
                categoryPill(title: "All", slug: "all")
                ForEach(effectiveCategories, id: \.slug) { category in
                    categoryPill(title: category.name, slug: category.slug)
                }
            }

            if isLoadingCategories {
                HStack(spacing: 10) {
                    ProgressView()
                        .controlSize(.small)
                    Text("Loading categories from /api/products/categories...")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            if liveCategories.isEmpty, let liveCategoriesError {
                statusCard(
                    title: "Category fallback active",
                    message: liveCategoriesError,
                    accent: Color(red: 0.96, green: 0.90, blue: 0.78)
                )
            }

            TextField("Search products", text: $searchQuery)
                .textFieldStyle(.roundedBorder)

            Text("Use /api/products with search filters in the public reference host.")
                .font(.footnote)
                .foregroundStyle(.secondary)

            HStack(spacing: 10) {
                Button("Apply search") {
                    appliedSearchQuery = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
                }

                Button("Clear") {
                    searchQuery = ""
                    appliedSearchQuery = ""
                }
            }

            if isLoadingProducts {
                HStack(spacing: 10) {
                    ProgressView()
                        .controlSize(.small)
                    Text("Loading products from /api/products...")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }

            if !isUsingLiveCatalog, let liveProductsError {
                statusCard(
                    title: "Catalog fallback active",
                    message: liveProductsError,
                    accent: Color(red: 0.96, green: 0.90, blue: 0.78)
                )
            }

            VStack(alignment: .leading, spacing: 10) {
                ForEach(effectiveProducts, id: \.id) { product in
                    Button {
                        selectedProductId = product.id
                    } label: {
                        productListCard(product: product, selected: product.id == selectedProductId)
                    }
                    .buttonStyle(.plain)
                }
            }

            if isLoadingProductDetail {
                HStack(spacing: 10) {
                    ProgressView()
                        .controlSize(.small)
                    Text("Loading product detail...")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            } else if let effectiveDetail {
                productDetailCard(product: effectiveDetail, sourceLabel: isUsingLiveCatalog ? "live core" : "preview fallback")
            } else if let liveProductDetailError {
                statusCard(
                    title: "Detail unavailable",
                    message: liveProductDetailError,
                    accent: Color(red: 0.96, green: 0.87, blue: 0.85)
                )
            }
        }
    }

    private func galleryCard(route: NavigationRoute) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: iconName(for: route))
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(10)
                    .background(.black.opacity(0.16), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                VStack(alignment: .leading, spacing: 8) {
                    Text(route.title)
                        .font(.headline)
                        .foregroundStyle(.white)

                    Text(route.summary)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.88))
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                ForEach(route.pills, id: \.self) { item in
                    pill(item, dark: true)
                }
            }

            Text("Open demo")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.white)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(tint(for: route))
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }

    private func productListCard(product: StorefrontProductListItem, selected: Bool) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(product.name)
                .font(.body.weight(.semibold))
            if let description = product.description {
                Text(description)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            VStack(alignment: .leading, spacing: 8) {
                pill("price: \(formatPrice(product.price))", dark: false)
                pill("stock: \(product.stock)", dark: false)
                pill("category: \(product.categorySlug ?? "unknown")", dark: false)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(selected ? Color(red: 0.87, green: 0.92, blue: 0.90) : .white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func categoryPill(title: String, slug: String) -> some View {
        Button {
            selectedCategorySlug = slug
        } label: {
            pill(title, dark: false, selected: selectedCategorySlug == slug)
        }
        .buttonStyle(.plain)
    }

    private func productDetailCard(product: StorefrontProductDetail, sourceLabel: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Product detail")
                .font(.subheadline.weight(.semibold))
            Text(product.name)
                .font(.headline)
            if let description = product.description {
                Text(description)
                    .font(.body)
                    .foregroundStyle(.secondary)
            }
            VStack(alignment: .leading, spacing: 8) {
                pill("source: \(sourceLabel)", dark: false)
                pill("price: \(formatPrice(product.price))", dark: false)
                pill("stock: \(product.stock)", dark: false)
                pill("shipping: \(product.requiresShipping ? "required" : "not required")", dark: false)
                pill("variants: \(product.variants.count)", dark: false)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func fallbackNotice(_ resolution: ThemeAdapterResolution) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Fallback active")
                .font(.subheadline.weight(.semibold))
            Text(resolution.fallbackReason ?? "Theme fallback is active.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.96, green: 0.90, blue: 0.78))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func statusCard(title: String, message: String, accent: Color) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.subheadline.weight(.semibold))
            Text(message)
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(accent)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func tint(for route: NavigationRoute) -> Color {
        switch route {
        case .designSystem: return DesignToken.primary
        case .navigation: return DesignToken.accent
        case .permissions: return DesignToken.tertiary
        case .storage: return Color(red: 0.43, green: 0.31, blue: 0.61)
        case .networking: return Color(red: 0.14, green: 0.38, blue: 0.55)
        case .observability: return Color(red: 0.42, green: 0.23, blue: 0.10)
        case .debug: return Color(red: 0.54, green: 0.18, blue: 0.23)
        }
    }

    private func iconName(for route: NavigationRoute) -> String {
        switch route {
        case .designSystem: return "paintpalette.fill"
        case .navigation: return "arrow.trianglehead.branch"
        case .permissions: return "lock.shield.fill"
        case .storage: return "externaldrive.fill"
        case .networking: return "network"
        case .observability: return "waveform.path.ecg"
        case .debug: return "ladybug.fill"
        }
    }

    private func pill(_ text: String, dark: Bool, selected: Bool = false) -> some View {
        Text(text)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(selected ? tint(for: .designSystem) : (dark ? .white.opacity(0.16) : Color.black.opacity(0.08)))
            .foregroundStyle(dark || selected ? .white : .primary)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func formatPrice(_ value: Double) -> String {
        "$" + String(format: "%.2f", value)
    }
}

@MainActor
private struct DemoDetailView: View {
    let route: NavigationRoute

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(route.summary)
                    .font(.body)
                    .foregroundStyle(.secondary)

                showcase(
                    title: "What The Foundation Owns",
                    tint: tint(for: route),
                    items: ownedItems(for: route)
                )

                showcase(
                    title: "What Private Apps Add",
                    tint: .black.opacity(0.72),
                    items: privateItems(for: route)
                )

                detailBody
            }
            .padding(24)
        }
        .background(DesignToken.surface)
        .navigationTitle(route.title)
    }

    @ViewBuilder
    private var detailBody: some View {
        switch route {
        case .designSystem:
            VStack(alignment: .leading, spacing: 12) {
                Text("Token Snapshot").font(.headline)
                ForEach(DesignToken.swatches, id: \.self) { swatch in
                    swatchRow(swatch)
                }
                Text("Corner radius token: \(Int(DesignToken.cornerRadius))")
                    .font(.footnote.monospaced())
                    .foregroundStyle(.secondary)
            }
        case .navigation:
            VStack(alignment: .leading, spacing: 12) {
                let previewRoutes = Array(NavigationRoute.allCases.prefix(4))
                Text("Route Contracts").font(.headline)
                ForEach(previewRoutes.indices, id: \.self) { index in
                    pill(previewRoutes[index].path, dark: false)
                }
                Text("The foundation can define shell routes. Bokmoo should plug real feature flows into those contracts rather than hard-code business routes here.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        case .permissions:
            VStack(alignment: .leading, spacing: 12) {
                Text("Permission Wrappers").font(.headline)
                ForEach(PermissionKind.allCases, id: \.self) { permission in
                    permissionRow(permission.rawValue, detail: permission.detail)
                }
            }
        case .storage:
            VStack(alignment: .leading, spacing: 12) {
                Text("Storage Layers").font(.headline)
                ForEach(StoragePreview.namespaces, id: \.self) { namespace in
                    pill(namespace, dark: false)
                }
                Text("The public repo owns generic storage primitives. Private apps own the real keys, models, and retention policy.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        case .networking:
            VStack(alignment: .leading, spacing: 12) {
                Text("Request Contracts").font(.headline)
                ForEach(NetworkingPreview.descriptors, id: \.self) { descriptor in
                    requestCard(descriptor)
                }
            }
        case .observability:
            VStack(alignment: .leading, spacing: 12) {
                Text("Signal Contracts").font(.headline)
                ForEach(ObservabilityPreview.signals, id: \.self) { signal in
                    signalCard(signal)
                }
            }
        case .debug:
            VStack(alignment: .leading, spacing: 12) {
                Text("Debug Surface").font(.headline)
                ForEach(DebugPanel.tools, id: \.self) { tool in
                    debugCard(tool)
                }
            }
        }
    }

    private func showcase(title: String, tint: Color, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)

            ForEach(items, id: \.self) { item in
                pill(item, dark: true)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(tint)
        .clipShape(RoundedRectangle(cornerRadius: DesignToken.cornerRadius, style: .continuous))
    }

    private func swatchRow(_ swatch: TokenSwatch) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8)
                .fill(swatch.color)
                .frame(width: 28, height: 28)
            Text(swatch.name)
        }
    }

    private func permissionRow(_ title: String, detail: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(tint(for: route))
                .frame(width: 12, height: 12)
                .padding(.top, 4)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.body.weight(.semibold))
                Text(detail).font(.footnote).foregroundStyle(.secondary)
            }
        }
    }

    private func requestCard(_ descriptor: RequestDescriptor) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(descriptor.method) \(descriptor.path)").font(.body.weight(.semibold))
            Text(descriptor.requiresAuth ? "requires downstream auth adapter" : "safe for public demo flows")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func signalCard(_ signal: LogSignal) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(signal.name).font(.body.weight(.semibold))
            Text(signal.detail).font(.footnote).foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func debugCard(_ tool: DebugTool) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(tool.title).font(.body.weight(.semibold))
            Text(tool.detail).font(.footnote).foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func pill(_ text: String, dark: Bool) -> some View {
        Text(text)
            .font(.subheadline.weight(.medium))
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(dark ? .white.opacity(0.16) : Color.black.opacity(0.08))
            .foregroundStyle(dark ? .white : .primary)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func tint(for route: NavigationRoute) -> Color {
        switch route {
        case .designSystem: return DesignToken.primary
        case .navigation: return DesignToken.accent
        case .permissions: return DesignToken.tertiary
        case .storage: return Color(red: 0.43, green: 0.31, blue: 0.61)
        case .networking: return Color(red: 0.14, green: 0.38, blue: 0.55)
        case .observability: return Color(red: 0.42, green: 0.23, blue: 0.10)
        case .debug: return Color(red: 0.54, green: 0.18, blue: 0.23)
        }
    }

    private func ownedItems(for route: NavigationRoute) -> [String] {
        switch route {
        case .designSystem: return ["shared colors", "radius scale", "typography tokens", "base components"]
        case .navigation: return ["route names", "shell entrypoints", "demo flow scaffolding"]
        case .permissions: return ["request wrappers", "educational copy patterns", "result normalization"]
        case .storage: return ["key-value adapters", "cache boundaries", "generic persistence APIs"]
        case .networking: return ["request descriptors", "auth hooks", "mock transport boundaries"]
        case .observability: return ["logger contract", "signal naming", "breadcrumbs"]
        case .debug: return ["debug menu", "fake data hooks", "verbose diagnostics"]
        }
    }

    private func privateItems(for route: NavigationRoute) -> [String] {
        switch route {
        case .designSystem: return ["Bokmoo brand styling", "marketing art", "campaign visuals"]
        case .navigation: return ["checkout flow", "account flow", "private deep links"]
        case .permissions: return ["business prompts", "feature-specific timing", "conversion copy"]
        case .storage: return ["real models", "sensitive schemas", "retention policy"]
        case .networking: return ["tenant auth adapters", "plugin-specific transport", "domain error mapping"]
        case .observability: return ["vendor config", "private event schema", "ops dashboards"]
        case .debug: return ["tenant-only flags", "private APIs", "ops credentials"]
        }
    }
}
#endif

import Foundation

public struct RequestDescriptor: Sendable, Hashable {
    public let path: String
    public let method: String
    public let requiresAuth: Bool

    public init(path: String, method: String = "GET", requiresAuth: Bool = true) {
        self.path = path
        self.method = method
        self.requiresAuth = requiresAuth
    }
}

public struct StorefrontContractSnapshot: Sendable, Hashable {
    public let baseUrl: String
    public let storeId: String
    public let storeName: String
    public let defaultLocale: String
    public let supportedLocales: [String]
    public let activeThemeSlug: String
    public let activeThemeType: String?
    public let activeThemeSource: String?

    public init(
        baseUrl: String,
        storeId: String,
        storeName: String,
        defaultLocale: String,
        supportedLocales: [String],
        activeThemeSlug: String,
        activeThemeType: String?,
        activeThemeSource: String?
    ) {
        self.baseUrl = baseUrl
        self.storeId = storeId
        self.storeName = storeName
        self.defaultLocale = defaultLocale
        self.supportedLocales = supportedLocales
        self.activeThemeSlug = activeThemeSlug
        self.activeThemeType = activeThemeType
        self.activeThemeSource = activeThemeSource
    }
}

public struct StorefrontProductListItem: Sendable, Hashable {
    public let id: String
    public let name: String
    public let description: String?
    public let price: Double
    public let stock: Int
    public let images: [String]
    public let categorySlug: String?

    public init(id: String, name: String, description: String?, price: Double, stock: Int, images: [String], categorySlug: String?) {
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock
        self.images = images
        self.categorySlug = categorySlug
    }
}

public struct StorefrontCategory: Sendable, Hashable {
    public let id: String
    public let name: String
    public let slug: String
    public let productCount: Int?

    public init(id: String, name: String, slug: String, productCount: Int?) {
        self.id = id
        self.name = name
        self.slug = slug
        self.productCount = productCount
    }
}

public struct StorefrontProductVariant: Sendable, Hashable {
    public let id: String
    public let name: String
    public let salePrice: Double
    public let baseStock: Int

    public init(id: String, name: String, salePrice: Double, baseStock: Int) {
        self.id = id
        self.name = name
        self.salePrice = salePrice
        self.baseStock = baseStock
    }
}

public struct StorefrontProductDetail: Sendable, Hashable {
    public let id: String
    public let name: String
    public let description: String?
    public let price: Double
    public let stock: Int
    public let images: [String]
    public let requiresShipping: Bool
    public let variants: [StorefrontProductVariant]

    public init(
        id: String,
        name: String,
        description: String?,
        price: Double,
        stock: Int,
        images: [String],
        requiresShipping: Bool,
        variants: [StorefrontProductVariant]
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock
        self.images = images
        self.requiresShipping = requiresShipping
        self.variants = variants
    }
}

public struct StorefrontCartItem: Sendable, Hashable {
    public let id: String
    public let productId: String
    public let productName: String
    public let price: Double
    public let quantity: Int
    public let variantId: String
    public let variantName: String?
    public let requiresShipping: Bool
    public let subtotal: Double

    public init(
        id: String,
        productId: String,
        productName: String,
        price: Double,
        quantity: Int,
        variantId: String,
        variantName: String?,
        requiresShipping: Bool,
        subtotal: Double
    ) {
        self.id = id
        self.productId = productId
        self.productName = productName
        self.price = price
        self.quantity = quantity
        self.variantId = variantId
        self.variantName = variantName
        self.requiresShipping = requiresShipping
        self.subtotal = subtotal
    }
}

public struct StorefrontCartSnapshot: Sendable, Hashable {
    public let id: String
    public let userId: String
    public let items: [StorefrontCartItem]
    public let itemCount: Int
    public let subtotal: Double
    public let tax: Double
    public let shipping: Double
    public let discount: Double
    public let total: Double
    public let status: String

    public init(
        id: String,
        userId: String,
        items: [StorefrontCartItem],
        itemCount: Int,
        subtotal: Double,
        tax: Double,
        shipping: Double,
        discount: Double,
        total: Double,
        status: String
    ) {
        self.id = id
        self.userId = userId
        self.items = items
        self.itemCount = itemCount
        self.subtotal = subtotal
        self.tax = tax
        self.shipping = shipping
        self.discount = discount
        self.total = total
        self.status = status
    }
}

public enum StorefrontCatalogPreviewData {
    public static let products: [StorefrontProductListItem] = [
        StorefrontProductListItem(
            id: "preview-foundation-watch",
            name: "Foundation Watch",
            description: "Baseline storefront sample product used to demonstrate the public client contract.",
            price: 299,
            stock: 18,
            images: [],
            categorySlug: "devices"
        ),
        StorefrontProductListItem(
            id: "preview-curator-bundle",
            name: "Curator Bundle",
            description: "Editorial-style sample item for theme-pack adapter previews.",
            price: 89,
            stock: 9,
            images: [],
            categorySlug: "digital"
        ),
        StorefrontProductListItem(
            id: "preview-stellar-seat",
            name: "Stellar Seat",
            description: "SaaS-flavored sample SKU for the first-wave storefront gallery.",
            price: 49,
            stock: 120,
            images: [],
            categorySlug: "software"
        )
    ]

    public static let categories: [StorefrontCategory] = [
        StorefrontCategory(id: "preview-devices", name: "Devices", slug: "devices", productCount: 1),
        StorefrontCategory(id: "preview-digital", name: "Digital", slug: "digital", productCount: 1),
        StorefrontCategory(id: "preview-software", name: "Software", slug: "software", productCount: 1)
    ]

    public static let details: [StorefrontProductDetail] = [
        StorefrontProductDetail(
            id: "preview-foundation-watch",
            name: "Foundation Watch",
            description: "Baseline storefront sample product used to demonstrate the public client contract.",
            price: 299,
            stock: 18,
            images: [],
            requiresShipping: true,
            variants: [
                StorefrontProductVariant(id: "preview-foundation-watch-default", name: "Default", salePrice: 299, baseStock: 18)
            ]
        ),
        StorefrontProductDetail(
            id: "preview-curator-bundle",
            name: "Curator Bundle",
            description: "Editorial-style sample item for theme-pack adapter previews.",
            price: 89,
            stock: 9,
            images: [],
            requiresShipping: false,
            variants: [
                StorefrontProductVariant(id: "preview-curator-bundle-default", name: "Digital access", salePrice: 89, baseStock: 9)
            ]
        ),
        StorefrontProductDetail(
            id: "preview-stellar-seat",
            name: "Stellar Seat",
            description: "SaaS-flavored sample SKU for the first-wave storefront gallery.",
            price: 49,
            stock: 120,
            images: [],
            requiresShipping: false,
            variants: [
                StorefrontProductVariant(id: "preview-stellar-seat-monthly", name: "Monthly", salePrice: 49, baseStock: 120),
                StorefrontProductVariant(id: "preview-stellar-seat-annual", name: "Annual", salePrice: 399, baseStock: 64)
            ]
        )
    ]

    public static func detail(for productId: String) -> StorefrontProductDetail? {
        details.first(where: { $0.id == productId })
    }

    public static func filterProducts(categorySlug: String?, searchQuery: String) -> [StorefrontProductListItem] {
        let normalizedQuery = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        return products.filter { product in
            let categoryMatches = categorySlug == nil || categorySlug == "" || categorySlug == "all" || product.categorySlug == categorySlug
            let searchMatches = normalizedQuery.isEmpty ||
                product.name.lowercased().contains(normalizedQuery) ||
                (product.description ?? "").lowercased().contains(normalizedQuery)

            return categoryMatches && searchMatches
        }
    }
}

public enum StorefrontCartPreviewData {
    public static func emptyCart() -> StorefrontCartSnapshot {
        StorefrontCartSnapshot(
            id: "preview-cart",
            userId: "preview-user",
            items: [],
            itemCount: 0,
            subtotal: 0,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: 0,
            status: "active"
        )
    }

    public static func addProduct(
        cart: StorefrontCartSnapshot,
        product: StorefrontProductDetail,
        quantity: Int = 1
    ) -> StorefrontCartSnapshot {
        let variant = product.variants.first
        let variantId = variant?.id ?? "\(product.id)-default"
        let unitPrice = variant?.salePrice ?? product.price

        let updatedItems: [StorefrontCartItem]
        if let existing = cart.items.first(where: { $0.productId == product.id && $0.variantId == variantId }) {
            updatedItems = cart.items.map { item in
                guard item.id == existing.id else { return item }
                let newQuantity = item.quantity + quantity
                return StorefrontCartItem(
                    id: item.id,
                    productId: item.productId,
                    productName: item.productName,
                    price: item.price,
                    quantity: newQuantity,
                    variantId: item.variantId,
                    variantName: item.variantName,
                    requiresShipping: item.requiresShipping,
                    subtotal: item.price * Double(newQuantity)
                )
            }
        } else {
            updatedItems = cart.items + [
                StorefrontCartItem(
                    id: "preview-item-\(product.id)-\(variantId)",
                    productId: product.id,
                    productName: product.name,
                    price: unitPrice,
                    quantity: quantity,
                    variantId: variantId,
                    variantName: variant?.name,
                    requiresShipping: product.requiresShipping,
                    subtotal: unitPrice * Double(quantity)
                )
            ]
        }

        return recalculate(cart: StorefrontCartSnapshot(
            id: cart.id,
            userId: cart.userId,
            items: updatedItems,
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            tax: cart.tax,
            shipping: cart.shipping,
            discount: cart.discount,
            total: cart.total,
            status: cart.status
        ))
    }

    public static func removeItem(cart: StorefrontCartSnapshot, itemId: String) -> StorefrontCartSnapshot {
        recalculate(cart: StorefrontCartSnapshot(
            id: cart.id,
            userId: cart.userId,
            items: cart.items.filter { $0.id != itemId },
            itemCount: cart.itemCount,
            subtotal: cart.subtotal,
            tax: cart.tax,
            shipping: cart.shipping,
            discount: cart.discount,
            total: cart.total,
            status: cart.status
        ))
    }

    private static func recalculate(cart: StorefrontCartSnapshot) -> StorefrontCartSnapshot {
        let subtotal = cart.items.reduce(0) { $0 + $1.subtotal }
        let itemCount = cart.items.reduce(0) { $0 + $1.quantity }

        return StorefrontCartSnapshot(
            id: cart.id,
            userId: cart.userId,
            items: cart.items,
            itemCount: itemCount,
            subtotal: subtotal,
            tax: 0,
            shipping: 0,
            discount: 0,
            total: subtotal,
            status: cart.status
        )
    }
}

public enum StorefrontContractClient {
    public static let defaultDevBaseUrl = "http://127.0.0.1:3001"

    public static func fetch(baseUrl: String) async throws -> StorefrontContractSnapshot {
        let normalizedBaseUrl = baseUrl.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
        let storeEnvelope: StoreContextEnvelope = try await request(path: "/api/store/context", baseUrl: normalizedBaseUrl)
        let themeEnvelope: ActiveThemeEnvelope = try await request(path: "/api/themes/active", baseUrl: normalizedBaseUrl)

        guard storeEnvelope.success, let storeData = storeEnvelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/store/context")
        }

        guard themeEnvelope.success, let themeData = themeEnvelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/themes/active")
        }

        return StorefrontContractSnapshot(
            baseUrl: normalizedBaseUrl,
            storeId: storeData.storeId,
            storeName: storeData.storeName,
            defaultLocale: storeData.defaultLocale,
            supportedLocales: storeData.supportedLocales,
            activeThemeSlug: themeData.slug,
            activeThemeType: themeData.type,
            activeThemeSource: themeData.source
        )
    }

    public static func fetchProducts(
        baseUrl: String,
        limit: Int = 6,
        categorySlug: String? = nil,
        searchQuery: String = ""
    ) async throws -> [StorefrontProductListItem] {
        let normalizedBaseUrl = normalize(baseUrl)
        let path = buildProductsPath(limit: limit, categorySlug: categorySlug, searchQuery: searchQuery)
        let envelope: ProductListEnvelope = try await request(path: path, baseUrl: normalizedBaseUrl)

        guard envelope.success, let data = envelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/products")
        }

        return data.items.map {
            StorefrontProductListItem(
                id: $0.id,
                name: $0.name,
                description: $0.description,
                price: $0.price,
                stock: $0.stock,
                images: $0.images,
                categorySlug: nil
            )
        }
    }

    public static func fetchCategories(baseUrl: String, limit: Int = 8) async throws -> [StorefrontCategory] {
        let normalizedBaseUrl = normalize(baseUrl)
        let envelope: ProductCategoryEnvelope = try await request(
            path: "/api/products/categories?page=1&limit=\(limit)",
            baseUrl: normalizedBaseUrl
        )

        guard envelope.success, let data = envelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/products/categories")
        }

        return data.items.map {
            StorefrontCategory(
                id: $0.id,
                name: $0.name,
                slug: $0.slug,
                productCount: $0.productCount
            )
        }
    }

    public static func fetchProductDetail(baseUrl: String, productId: String) async throws -> StorefrontProductDetail {
        let normalizedBaseUrl = normalize(baseUrl)
        let envelope: ProductDetailEnvelope = try await request(path: "/api/products/\(productId)", baseUrl: normalizedBaseUrl)

        guard envelope.success, let data = envelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/products/:id")
        }

        return StorefrontProductDetail(
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
            images: data.images,
            requiresShipping: data.requiresShipping,
            variants: data.variants.map {
                StorefrontProductVariant(id: $0.id, name: $0.name, salePrice: $0.salePrice, baseStock: $0.baseStock)
            }
        )
    }

    public static func fetchCart(baseUrl: String, bearerToken: String) async throws -> StorefrontCartSnapshot {
        let normalizedBaseUrl = normalize(baseUrl)
        let envelope: CartEnvelope = try await request(path: "/api/cart", baseUrl: normalizedBaseUrl, bearerToken: bearerToken)

        guard envelope.success, let data = envelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/cart")
        }

        return cart(from: data)
    }

    public static func addToCart(
        baseUrl: String,
        bearerToken: String,
        productId: String,
        variantId: String,
        quantity: Int = 1
    ) async throws -> StorefrontCartSnapshot {
        let normalizedBaseUrl = normalize(baseUrl)
        let payload = AddToCartPayload(productId: productId, quantity: quantity, variantId: variantId)
        let envelope: CartEnvelope = try await request(
            path: "/api/cart/items",
            baseUrl: normalizedBaseUrl,
            method: "POST",
            bearerToken: bearerToken,
            body: payload
        )

        guard envelope.success, let data = envelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/cart/items")
        }

        return cart(from: data)
    }

    public static func removeFromCart(
        baseUrl: String,
        bearerToken: String,
        itemId: String
    ) async throws -> StorefrontCartSnapshot {
        let normalizedBaseUrl = normalize(baseUrl)
        let envelope: CartEnvelope = try await request(
            path: "/api/cart/items/\(itemId)",
            baseUrl: normalizedBaseUrl,
            method: "DELETE",
            bearerToken: bearerToken
        )

        guard envelope.success, let data = envelope.data else {
            throw StorefrontContractError.invalidEnvelope(path: "/api/cart/items/:itemId")
        }

        return cart(from: data)
    }

    private static func request<T: Decodable>(
        path: String,
        baseUrl: String,
        method: String = "GET",
        bearerToken: String? = nil
    ) async throws -> T {
        let normalizedBaseUrl = normalize(baseUrl)
        guard let url = URL(string: "\(normalizedBaseUrl)\(path)") else {
            throw StorefrontContractError.invalidBaseUrl(baseUrl)
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 5
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let bearerToken, !bearerToken.isEmpty {
            request.setValue("Bearer \(bearerToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await perform(request: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw StorefrontContractError.invalidResponse(path: path)
        }

        guard 200 ..< 300 ~= httpResponse.statusCode else {
            let message = String(data: data, encoding: .utf8) ?? "HTTP \(httpResponse.statusCode)"
            throw StorefrontContractError.httpFailure(path: path, message: message)
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    private static func request<T: Decodable, Body: Encodable>(
        path: String,
        baseUrl: String,
        method: String = "GET",
        bearerToken: String? = nil,
        body: Body? = nil
    ) async throws -> T {
        let normalizedBaseUrl = normalize(baseUrl)
        guard let url = URL(string: "\(normalizedBaseUrl)\(path)") else {
            throw StorefrontContractError.invalidBaseUrl(baseUrl)
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 5
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let bearerToken, !bearerToken.isEmpty {
            request.setValue("Bearer \(bearerToken)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.httpBody = try JSONEncoder().encode(body)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let (data, response) = try await perform(request: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw StorefrontContractError.invalidResponse(path: path)
        }

        guard 200 ..< 300 ~= httpResponse.statusCode else {
            let message = String(data: data, encoding: .utf8) ?? "HTTP \(httpResponse.statusCode)"
            throw StorefrontContractError.httpFailure(path: path, message: message)
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    private static func normalize(_ baseUrl: String) -> String {
        var normalized = baseUrl
        while normalized.hasSuffix("/") {
            normalized.removeLast()
        }
        return normalized
    }

    private static func buildProductsPath(limit: Int, categorySlug: String?, searchQuery: String) -> String {
        var components = URLComponents()
        components.path = "/api/products"
        var queryItems = [
            URLQueryItem(name: "page", value: "1"),
            URLQueryItem(name: "limit", value: String(limit))
        ]

        if let categorySlug, !categorySlug.isEmpty, categorySlug != "all" {
            queryItems.append(URLQueryItem(name: "category", value: categorySlug))
        }

        let normalizedQuery = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        if !normalizedQuery.isEmpty {
            queryItems.append(URLQueryItem(name: "search", value: normalizedQuery))
        }

        components.queryItems = queryItems
        return components.string ?? "/api/products?page=1&limit=\(limit)"
    }

    private static func perform(request: URLRequest) async throws -> (Data, URLResponse) {
        try await withCheckedThrowingContinuation { continuation in
            let task = URLSession.shared.dataTask(with: request) { data, response, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                guard let data, let response else {
                    continuation.resume(throwing: StorefrontContractError.invalidResponse(path: request.url?.path ?? "unknown"))
                    return
                }

                continuation.resume(returning: (data, response))
            }

            task.resume()
        }
    }

    private static func cart(from payload: CartPayload) -> StorefrontCartSnapshot {
        StorefrontCartSnapshot(
            id: payload.id,
            userId: payload.userId,
            items: payload.items.map {
                StorefrontCartItem(
                    id: $0.id,
                    productId: $0.productId,
                    productName: $0.productName,
                    price: $0.price,
                    quantity: $0.quantity,
                    variantId: $0.variantId,
                    variantName: $0.variantName,
                    requiresShipping: $0.requiresShipping,
                    subtotal: $0.subtotal
                )
            },
            itemCount: payload.itemCount,
            subtotal: payload.subtotal,
            tax: payload.tax,
            shipping: payload.shipping,
            discount: payload.discount,
            total: payload.total,
            status: payload.status
        )
    }
}

public enum NetworkingPreview {
    public static let descriptors: [RequestDescriptor] = [
        RequestDescriptor(path: "/api/store/context", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/themes/active", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/products?page=1&limit=20", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/products/categories?page=1&limit=20", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/products?search=watch&page=1&limit=10", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/products/:id", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/cart", method: "GET", requiresAuth: true),
        RequestDescriptor(path: "/api/cart/items", method: "POST", requiresAuth: true),
        RequestDescriptor(path: "/api/cart/items/:itemId", method: "DELETE", requiresAuth: true),
        RequestDescriptor(path: "/api/orders", method: "GET", requiresAuth: true)
    ]
}

private struct StoreContextEnvelope: Decodable {
    let success: Bool
    let data: StoreContextPayload?
}

private struct StoreContextPayload: Decodable {
    let storeId: String
    let storeName: String
    let defaultLocale: String
    let supportedLocales: [String]
}

private struct ActiveThemeEnvelope: Decodable {
    let success: Bool
    let data: ActiveThemePayload?
}

private struct ActiveThemePayload: Decodable {
    let slug: String
    let type: String?
    let source: String?
}

private struct ProductListEnvelope: Decodable {
    let success: Bool
    let data: ProductListPayload?
}

private struct ProductListPayload: Decodable {
    let items: [ProductListPayloadItem]
}

private struct ProductListPayloadItem: Decodable {
    let id: String
    let name: String
    let description: String?
    let price: Double
    let stock: Int
    let images: [String]
}

private struct ProductCategoryEnvelope: Decodable {
    let success: Bool
    let data: ProductCategoryPayload?
}

private struct ProductCategoryPayload: Decodable {
    let items: [ProductCategoryPayloadItem]
}

private struct ProductCategoryPayloadItem: Decodable {
    let id: String
    let name: String
    let slug: String
    let productCount: Int?
}

private struct ProductDetailEnvelope: Decodable {
    let success: Bool
    let data: ProductDetailPayload?
}

private struct ProductDetailPayload: Decodable {
    let id: String
    let name: String
    let description: String?
    let price: Double
    let stock: Int
    let images: [String]
    let requiresShipping: Bool
    let variants: [ProductVariantPayload]
}

private struct ProductVariantPayload: Decodable {
    let id: String
    let name: String
    let salePrice: Double
    let baseStock: Int
}

private struct CartEnvelope: Decodable {
    let success: Bool
    let data: CartPayload?
}

private struct CartPayload: Decodable {
    let id: String
    let userId: String
    let items: [CartItemPayload]
    let itemCount: Int
    let subtotal: Double
    let tax: Double
    let shipping: Double
    let discount: Double
    let total: Double
    let status: String
}

private struct CartItemPayload: Decodable {
    let id: String
    let productId: String
    let productName: String
    let price: Double
    let quantity: Int
    let variantId: String
    let variantName: String?
    let requiresShipping: Bool
    let subtotal: Double
}

private struct AddToCartPayload: Encodable {
    let productId: String
    let quantity: Int
    let variantId: String
}

private enum StorefrontContractError: LocalizedError {
    case invalidBaseUrl(String)
    case invalidResponse(path: String)
    case invalidEnvelope(path: String)
    case httpFailure(path: String, message: String)

    var errorDescription: String? {
        switch self {
        case let .invalidBaseUrl(baseUrl):
            return "Invalid core API base URL: \(baseUrl)"
        case let .invalidResponse(path):
            return "Storefront contract probe returned an invalid response for \(path)."
        case let .invalidEnvelope(path):
            return "Storefront contract probe returned no usable data for \(path)."
        case let .httpFailure(path, message):
            return "Storefront contract probe failed for \(path): \(message)"
        }
    }
}

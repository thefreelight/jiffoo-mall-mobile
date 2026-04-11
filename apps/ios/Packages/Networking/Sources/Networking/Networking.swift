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

    public init(id: String, name: String, description: String?, price: Double, stock: Int, images: [String]) {
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.stock = stock
        self.images = images
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

public enum StorefrontCatalogPreviewData {
    public static let products: [StorefrontProductListItem] = [
        StorefrontProductListItem(
            id: "preview-foundation-watch",
            name: "Foundation Watch",
            description: "Baseline storefront sample product used to demonstrate the public client contract.",
            price: 299,
            stock: 18,
            images: []
        ),
        StorefrontProductListItem(
            id: "preview-curator-bundle",
            name: "Curator Bundle",
            description: "Editorial-style sample item for theme-pack adapter previews.",
            price: 89,
            stock: 9,
            images: []
        ),
        StorefrontProductListItem(
            id: "preview-stellar-seat",
            name: "Stellar Seat",
            description: "SaaS-flavored sample SKU for the first-wave storefront gallery.",
            price: 49,
            stock: 120,
            images: []
        )
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

    public static func fetchProducts(baseUrl: String, limit: Int = 6) async throws -> [StorefrontProductListItem] {
        let normalizedBaseUrl = normalize(baseUrl)
        let envelope: ProductListEnvelope = try await request(path: "/api/products?page=1&limit=\(limit)", baseUrl: normalizedBaseUrl)

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
                images: $0.images
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

    private static func request<T: Decodable>(path: String, baseUrl: String) async throws -> T {
        let normalizedBaseUrl = normalize(baseUrl)
        guard let url = URL(string: "\(normalizedBaseUrl)\(path)") else {
            throw StorefrontContractError.invalidBaseUrl(baseUrl)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 5
        request.setValue("application/json", forHTTPHeaderField: "Accept")

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
}

public enum NetworkingPreview {
    public static let descriptors: [RequestDescriptor] = [
        RequestDescriptor(path: "/api/store/context", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/themes/active", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/products?page=1&limit=20", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/products/:id", method: "GET", requiresAuth: false),
        RequestDescriptor(path: "/api/cart", method: "GET", requiresAuth: true),
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

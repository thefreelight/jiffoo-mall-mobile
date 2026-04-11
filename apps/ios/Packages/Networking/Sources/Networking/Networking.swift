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

    private static func request<T: Decodable>(path: String, baseUrl: String) async throws -> T {
        guard let url = URL(string: "\(baseUrl)\(path)") else {
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

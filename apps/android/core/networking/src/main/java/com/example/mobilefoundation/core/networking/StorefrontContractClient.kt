package com.example.mobilefoundation.core.networking

import java.io.IOException
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL
import org.json.JSONObject

data class StorefrontContractSnapshot(
    val baseUrl: String,
    val storeId: String,
    val storeName: String,
    val defaultLocale: String,
    val supportedLocales: List<String>,
    val activeThemeSlug: String,
    val activeThemeType: String?,
    val activeThemeSource: String?,
)

data class StorefrontProductListItem(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val stock: Int,
    val images: List<String>,
    val categorySlug: String?,
)

data class StorefrontCategory(
    val id: String,
    val name: String,
    val slug: String,
    val productCount: Int?,
)

data class StorefrontProductVariant(
    val id: String,
    val name: String,
    val salePrice: Double,
    val baseStock: Int,
)

data class StorefrontProductDetail(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val stock: Int,
    val images: List<String>,
    val requiresShipping: Boolean,
    val variants: List<StorefrontProductVariant>,
)

object StorefrontCatalogPreviewData {
    val products = listOf(
        StorefrontProductListItem(
            id = "preview-foundation-watch",
            name = "Foundation Watch",
            description = "Baseline storefront sample product used to demonstrate the public client contract.",
            price = 299.0,
            stock = 18,
            images = emptyList(),
            categorySlug = "devices",
        ),
        StorefrontProductListItem(
            id = "preview-curator-bundle",
            name = "Curator Bundle",
            description = "Editorial-style sample item for theme-pack adapter previews.",
            price = 89.0,
            stock = 9,
            images = emptyList(),
            categorySlug = "digital",
        ),
        StorefrontProductListItem(
            id = "preview-stellar-seat",
            name = "Stellar Seat",
            description = "SaaS-flavored sample SKU for the first-wave storefront gallery.",
            price = 49.0,
            stock = 120,
            images = emptyList(),
            categorySlug = "software",
        ),
    )

    val categories = listOf(
        StorefrontCategory(id = "preview-devices", name = "Devices", slug = "devices", productCount = 1),
        StorefrontCategory(id = "preview-digital", name = "Digital", slug = "digital", productCount = 1),
        StorefrontCategory(id = "preview-software", name = "Software", slug = "software", productCount = 1),
    )

    val details = listOf(
        StorefrontProductDetail(
            id = "preview-foundation-watch",
            name = "Foundation Watch",
            description = "Baseline storefront sample product used to demonstrate the public client contract.",
            price = 299.0,
            stock = 18,
            images = emptyList(),
            requiresShipping = true,
            variants = listOf(
                StorefrontProductVariant(
                    id = "preview-foundation-watch-default",
                    name = "Default",
                    salePrice = 299.0,
                    baseStock = 18,
                ),
            ),
        ),
        StorefrontProductDetail(
            id = "preview-curator-bundle",
            name = "Curator Bundle",
            description = "Editorial-style sample item for theme-pack adapter previews.",
            price = 89.0,
            stock = 9,
            images = emptyList(),
            requiresShipping = false,
            variants = listOf(
                StorefrontProductVariant(
                    id = "preview-curator-bundle-default",
                    name = "Digital access",
                    salePrice = 89.0,
                    baseStock = 9,
                ),
            ),
        ),
        StorefrontProductDetail(
            id = "preview-stellar-seat",
            name = "Stellar Seat",
            description = "SaaS-flavored sample SKU for the first-wave storefront gallery.",
            price = 49.0,
            stock = 120,
            images = emptyList(),
            requiresShipping = false,
            variants = listOf(
                StorefrontProductVariant(
                    id = "preview-stellar-seat-monthly",
                    name = "Monthly",
                    salePrice = 49.0,
                    baseStock = 120,
                ),
                StorefrontProductVariant(
                    id = "preview-stellar-seat-annual",
                    name = "Annual",
                    salePrice = 399.0,
                    baseStock = 64,
                ),
            ),
        ),
    )

    fun detailFor(productId: String): StorefrontProductDetail? = details.firstOrNull { it.id == productId }

    fun filterProducts(categorySlug: String?, searchQuery: String): List<StorefrontProductListItem> {
        val normalizedQuery = searchQuery.trim().lowercase()

        return products.filter { product ->
            val categoryMatches = categorySlug.isNullOrBlank() || categorySlug == "all" || product.categorySlug == categorySlug
            val searchMatches = normalizedQuery.isBlank() ||
                product.name.lowercase().contains(normalizedQuery) ||
                product.description.orEmpty().lowercase().contains(normalizedQuery)

            categoryMatches && searchMatches
        }
    }
}

object StorefrontContractClient {
    const val defaultDevBaseUrl = "http://10.0.2.2:3001"

    fun fetch(baseUrl: String): StorefrontContractSnapshot {
        val normalizedBaseUrl = baseUrl.trimEnd('/')
        val storeEnvelope = requestEnvelope("$normalizedBaseUrl/api/store/context")
        val themeEnvelope = requestEnvelope("$normalizedBaseUrl/api/themes/active")

        val storeData = requireDataObject(storeEnvelope, "/api/store/context")
        val activeThemeData = requireDataObject(themeEnvelope, "/api/themes/active")

        val locales = buildList {
            val array = storeData.optJSONArray("supportedLocales")
            if (array != null) {
                for (index in 0 until array.length()) {
                    add(array.optString(index))
                }
            }
        }

        return StorefrontContractSnapshot(
            baseUrl = normalizedBaseUrl,
            storeId = storeData.optString("storeId"),
            storeName = storeData.optString("storeName"),
            defaultLocale = storeData.optString("defaultLocale"),
            supportedLocales = locales,
            activeThemeSlug = activeThemeData.optString("slug"),
            activeThemeType = activeThemeData.optString("type").takeIf { it.isNotBlank() },
            activeThemeSource = activeThemeData.optString("source").takeIf { it.isNotBlank() },
        )
    }

    fun fetchProducts(
        baseUrl: String,
        limit: Int = 6,
        categorySlug: String? = null,
        searchQuery: String = "",
    ): List<StorefrontProductListItem> {
        val normalizedBaseUrl = baseUrl.trimEnd('/')
        val queryParts = mutableListOf("page=1", "limit=$limit")
        if (!categorySlug.isNullOrBlank() && categorySlug != "all") {
            queryParts += "category=${encode(categorySlug)}"
        }
        if (searchQuery.isNotBlank()) {
            queryParts += "search=${encode(searchQuery.trim())}"
        }
        val envelope = requestEnvelope("$normalizedBaseUrl/api/products?${queryParts.joinToString("&")}")
        val data = requireDataObject(envelope, "/api/products")
        val items = data.optJSONArray("items")
            ?: throw IOException("Contract probe returned no items for /api/products")

        return buildList {
            for (index in 0 until items.length()) {
                val item = items.optJSONObject(index) ?: continue
                add(
                    StorefrontProductListItem(
                        id = item.optString("id"),
                        name = item.optString("name"),
                        description = item.optString("description").takeIf { it.isNotBlank() },
                        price = item.optDouble("price"),
                        stock = item.optInt("stock"),
                        images = jsonArrayStrings(item.optJSONArray("images")),
                        categorySlug = null,
                    ),
                )
            }
        }
    }

    fun fetchCategories(baseUrl: String, limit: Int = 8): List<StorefrontCategory> {
        val normalizedBaseUrl = baseUrl.trimEnd('/')
        val envelope = requestEnvelope("$normalizedBaseUrl/api/products/categories?page=1&limit=$limit")
        val data = requireDataObject(envelope, "/api/products/categories")
        val items = data.optJSONArray("items")
            ?: throw IOException("Contract probe returned no items for /api/products/categories")

        return buildList {
            for (index in 0 until items.length()) {
                val item = items.optJSONObject(index) ?: continue
                add(
                    StorefrontCategory(
                        id = item.optString("id"),
                        name = item.optString("name"),
                        slug = item.optString("slug"),
                        productCount = item.optInt("productCount").takeIf { it > 0 },
                    ),
                )
            }
        }
    }

    fun fetchProductDetail(baseUrl: String, productId: String): StorefrontProductDetail {
        val normalizedBaseUrl = baseUrl.trimEnd('/')
        val envelope = requestEnvelope("$normalizedBaseUrl/api/products/$productId")
        val data = requireDataObject(envelope, "/api/products/:id")

        val variantsArray = data.optJSONArray("variants")
        val variants = buildList {
            if (variantsArray != null) {
                for (index in 0 until variantsArray.length()) {
                    val item = variantsArray.optJSONObject(index) ?: continue
                    add(
                        StorefrontProductVariant(
                            id = item.optString("id"),
                            name = item.optString("name"),
                            salePrice = item.optDouble("salePrice"),
                            baseStock = item.optInt("baseStock"),
                        ),
                    )
                }
            }
        }

        return StorefrontProductDetail(
            id = data.optString("id"),
            name = data.optString("name"),
            description = data.optString("description").takeIf { it.isNotBlank() },
            price = data.optDouble("price"),
            stock = data.optInt("stock"),
            images = jsonArrayStrings(data.optJSONArray("images")),
            requiresShipping = data.optBoolean("requiresShipping"),
            variants = variants,
        )
    }

    private fun requestEnvelope(urlString: String): JSONObject {
        val connection = (URL(urlString).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 5_000
            readTimeout = 5_000
            setRequestProperty("Accept", "application/json")
        }

        try {
            val statusCode = connection.responseCode
            val body = (if (statusCode in 200..299) connection.inputStream else connection.errorStream)
                ?.bufferedReader()
                ?.use { it.readText() }
                .orEmpty()

            if (statusCode !in 200..299) {
                val message = body.takeIf { it.isNotBlank() } ?: "HTTP $statusCode"
                throw IOException("Storefront contract probe failed for $urlString: $message")
            }

            return JSONObject(body)
        } finally {
            connection.disconnect()
        }
    }

    private fun requireDataObject(envelope: JSONObject, contractPath: String): JSONObject {
        if (!envelope.optBoolean("success")) {
            val errorMessage = envelope.optJSONObject("error")?.optString("message")
                ?: "Unknown core API error"
            throw IOException("Contract probe failed for $contractPath: $errorMessage")
        }

        return envelope.optJSONObject("data")
            ?: throw IOException("Contract probe returned no data for $contractPath")
    }

    private fun jsonArrayStrings(array: org.json.JSONArray?): List<String> = buildList {
        if (array != null) {
            for (index in 0 until array.length()) {
                val value = array.optString(index)
                if (value.isNotBlank()) {
                    add(value)
                }
            }
        }
    }

    private fun encode(value: String): String = URLEncoder.encode(value, Charsets.UTF_8.name())
}

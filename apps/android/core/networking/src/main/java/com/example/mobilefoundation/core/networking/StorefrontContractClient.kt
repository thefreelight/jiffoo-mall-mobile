package com.example.mobilefoundation.core.networking

import java.io.IOException
import java.net.HttpURLConnection
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
}

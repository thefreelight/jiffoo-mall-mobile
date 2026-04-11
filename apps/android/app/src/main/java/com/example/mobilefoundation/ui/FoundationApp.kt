package com.example.mobilefoundation.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.mobilefoundation.ui.theme.FoundationTheme

@Composable
fun FoundationApp() {
    FoundationTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Scaffold { innerPadding ->
                FoundationScreen(contentPadding = innerPadding)
            }
        }
    }
}

@Composable
private fun FoundationScreen(contentPadding: PaddingValues) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(contentPadding)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        Text(
            text = "Mobile Foundation",
            style = MaterialTheme.typography.headlineLarge.copy(
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
            ),
            color = MaterialTheme.colorScheme.onBackground,
        )

        Text(
            text = "Public native shell and reusable capabilities for open-source mobile foundations.",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
        )

        CapabilityCard(
            title = "Public Boundary",
            items = listOf("App shell", "Design tokens", "Navigation contracts", "Debug tooling"),
            containerColor = Color(0xFF1F7A63),
        )

        CapabilityCard(
            title = "Package Map",
            items = listOf("demo", "debug"),
            containerColor = Color(0xFFE58E26),
        )

        CapabilityCard(
            title = "System Wrappers",
            items = listOf("camera", "notifications", "location"),
            containerColor = Color(0xFF28356E),
        )

        Text(
            text = "Android host is now runnable. Next: lift shared capability modules out of the shell.",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.55f),
        )
    }
}

@Composable
private fun CapabilityCard(
    title: String,
    items: List<String>,
    containerColor: Color,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(containerColor, shape = MaterialTheme.shapes.extraLarge)
            .padding(16.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
                fontWeight = FontWeight.SemiBold,
            )

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items.forEach { item ->
                    Pill(label = item)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun Pill(label: String) {
    Box(
        modifier = Modifier
            .background(Color.Black.copy(alpha = 0.18f), shape = MaterialTheme.shapes.large)
            .padding(horizontal = 12.dp, vertical = 8.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = Color.White,
        )
    }
}

@Preview(showBackground = true, backgroundColor = 0xFFFAF7F0, showSystemUi = true)
@Composable
private fun FoundationPreview() {
    FoundationApp()
}

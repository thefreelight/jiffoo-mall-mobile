package com.example.mobilefoundation.core.designsystem

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class TokenSwatch(
    val label: String,
    val color: Color,
)

object DesignToken {
    val surface = Color(0xFFFAF7F0)
    val surfaceInverse = Color(0xFF1E1C1A)
    val primary = Color(0xFF1F7A63)
    val accent = Color(0xFFE58E26)
    val tertiary = Color(0xFF28356E)
    val text = Color(0xFF181613)
    val muted = Color(0xFF7A746B)
    const val cornerRadius = 16

    val swatches = listOf(
        TokenSwatch("Surface", surface),
        TokenSwatch("Primary", primary),
        TokenSwatch("Accent", accent),
        TokenSwatch("Tertiary", tertiary),
    )

    val previewTags = listOf("tokens", "theme", "components")
}

private val LightColors = lightColorScheme(
    primary = DesignToken.primary,
    secondary = DesignToken.accent,
    tertiary = DesignToken.tertiary,
    background = DesignToken.surface,
    surface = DesignToken.surface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = DesignToken.text,
    onSurface = DesignToken.text,
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF5FB09A),
    secondary = Color(0xFFF0A84F),
    tertiary = Color(0xFF7082D8),
)

private val FoundationTypography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Bold,
        fontSize = 34.sp,
        lineHeight = 40.sp,
    ),
    titleMedium = TextStyle(
        fontWeight = FontWeight.SemiBold,
        fontSize = 20.sp,
        lineHeight = 24.sp,
    ),
    bodyLarge = TextStyle(
        fontSize = 18.sp,
        lineHeight = 26.sp,
    ),
    labelLarge = TextStyle(
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 18.sp,
    ),
)

@Composable
fun FoundationTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = FoundationTypography,
        shapes = Shapes(
            extraLarge = RoundedCornerShape(DesignToken.cornerRadius.dp),
        ),
        content = content,
    )
}

package com.electroassistant.sa.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = PrimarySky,
    onPrimary = Color(0xFF0F172A),
    primaryContainer = PrimarySkyDark,
    onPrimaryContainer = Color.White,
    secondary = AccentAmber,
    onSecondary = Color(0xFF0F172A),
    background = DarkBackground,
    onBackground = TextPrimary,
    surface = DarkSurface,
    onSurface = TextPrimary,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = TextSecondary,
    outline = DarkBorder,
    error = DangerRose,
    onError = Color.White
)

@Composable
fun ElectroAssistantTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}

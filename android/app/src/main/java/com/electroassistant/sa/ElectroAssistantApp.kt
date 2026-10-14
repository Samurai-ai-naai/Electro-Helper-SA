package com.electroassistant.sa

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.DeviceHub
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.SquareFoot
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.electroassistant.sa.ui.screens.*

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object CableSizing : Screen("cable_sizing", "Cable Sizing", Icons.Default.ElectricBolt)
    object CoCAudit : Screen("coc_audit", "CoC Audit", Icons.Default.Assignment)
    object Pinouts : Screen("pinouts", "Pinouts", Icons.Default.DeviceHub)
    object Diagnostics : Screen("diagnostics", "Diagnostics", Icons.Default.Build)
    object DbDesign : Screen("db_design", "DB Balancer", Icons.Default.Layers)
    object BuildingPlan : Screen("building_plan", "Plan & Conduit", Icons.Default.SquareFoot)
}

@Composable
fun ElectroAssistantApp() {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.CableSizing) }
    val screens = listOf(
        Screen.CableSizing,
        Screen.CoCAudit,
        Screen.Pinouts,
        Screen.Diagnostics,
        Screen.DbDesign,
        Screen.BuildingPlan
    )

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color(0xFF0F172A)
            ) {
                screens.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = currentScreen == screen,
                        onClick = { currentScreen = screen },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF38BDF8),
                            selectedTextColor = Color(0xFF38BDF8),
                            unselectedIconColor = Color(0xFF94A3B8),
                            unselectedTextColor = Color(0xFF94A3B8),
                            indicatorColor = Color(0xFF1E293B)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Surface(
            modifier = Modifier.padding(innerPadding),
            color = Color(0xFF0B0F17)
        ) {
            when (currentScreen) {
                Screen.CableSizing -> CableSizingScreen()
                Screen.CoCAudit -> CoCVerificationScreen()
                Screen.Pinouts -> PinoutViewerScreen()
                Screen.Diagnostics -> DiagnosticTreeScreen()
                Screen.DbDesign -> DbDesignScreen()
                Screen.BuildingPlan -> BuildingPlanScreen()
            }
        }
    }
}

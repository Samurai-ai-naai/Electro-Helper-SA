package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class BuildingSymbol(
    val name: String,
    val ref: String,
    val heightAff: String,
    val description: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BuildingPlanScreen() {
    var conduitSizeMm by remember { mutableStateOf(20) }
    var wireCount2_5 by remember { mutableStateOf(4) }
    var wireCount1_5 by remember { mutableStateOf(2) }

    // Conductor areas: 2.5mm² ~10.2mm², 1.5mm² ~7.1mm²
    val totalCableArea = (wireCount2_5 * 10.2) + (wireCount1_5 * 7.1)
    val conduitArea = when (conduitSizeMm) {
        16 -> 132.7
        20 -> 221.7
        25 -> 363.0
        else -> 615.7
    }
    val fillPercent = (totalCableArea / conduitArea) * 100.0
    val isFillCompliant = fillPercent <= 40.0 // SANS 10142-1 max 40% fill rule

    val symbols = listOf(
        BuildingSymbol("One-Way Light Switch", "SANS 10143", "1250 mm AFF", "Single-pole lighting control on strike side of door"),
        BuildingSymbol("Two-Way Light Switch", "SANS 10143", "1250 mm AFF", "Changeover switch for stairwells and corridors"),
        BuildingSymbol("Switched Socket Outlet (SSO 16A)", "SANS 164-1", "300 mm AFF", "Standard 3-pin round earth plug (1100mm in kitchen)"),
        BuildingSymbol("Dedicated Socket (Clean / Red)", "SANS 164-4", "300 mm AFF", "Flat earth pin dedicated for IT/UPS equipment"),
        BuildingSymbol("Geyser Isolator with Pilot", "SANS 10142-1", "1500 mm AFF", "Double-pole 30A switch within 1.5m of water heater"),
        BuildingSymbol("Stove Isolator", "SANS 10142-1", "1400 mm AFF", "Double-pole 45A/60A within 1.5m of cooktop (not above plates)"),
        BuildingSymbol("Air Conditioner Isolator", "SANS 10142-1", "1200 mm AFF", "Weatherproof IP65 lockable rotary isolator at outdoor unit"),
        BuildingSymbol("Main Distribution Board (MDB)", "SANS 10142-1", "1700 mm AFF", "Main switchboard housing main incomer and surge arrestor")
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Plan Symbols & Conduit Fill", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A),
                    titleContentColor = Color.White
                )
            )
        },
        containerColor = Color(0xFF0B0F17)
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Conduit Fill Estimator Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("SANS 10142-1 Conduit Fill Estimator", fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8), fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                if (isFillCompliant) Icons.Default.CheckCircle else Icons.Default.Warning,
                                contentDescription = null,
                                tint = if (isFillCompliant) Color(0xFF34D399) else Color(0xFFF87171)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Fill: %.1f%% / 40.0%% Max (%s)".format(fillPercent, if (isFillCompliant) "PASS" else "OVERFILLED"),
                                fontWeight = FontWeight.Bold,
                                color = if (isFillCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                fontSize = 15.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Conduit Size: ${conduitSizeMm}mm • Wires: ${wireCount2_5}x 2.5mm² + ${wireCount1_5}x 1.5mm²",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }

            // Standard Architectural Symbols Header
            item {
                Text(
                    "South African Architectural Symbols (SANS 10143)",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 15.sp
                )
            }

            items(symbols) { s ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(s.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                            Text(s.heightAff, color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(s.description, color = Color(0xFF94A3B8), fontSize = 12.sp)
                        Text("Standard: ${s.ref}", color = Color(0xFF38BDF8), fontSize = 10.sp, fontFamily = FontFamily.Monospace, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}

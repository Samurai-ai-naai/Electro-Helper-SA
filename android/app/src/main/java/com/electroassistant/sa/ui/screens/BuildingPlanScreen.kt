package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
    var wireCount1_5 by remember { mutableStateOf(2) }
    var wireCount2_5 by remember { mutableStateOf(4) }
    var wireCount4_0 by remember { mutableStateOf(0) }
    var wireCount6_0 by remember { mutableStateOf(0) }

    // Conductor nominal overall areas under SANS 10142-1 Table 6.7:
    // 1.5mm² ~ 7.1mm², 2.5mm² ~ 10.2mm², 4.0mm² ~ 15.2mm², 6.0mm² ~ 21.2mm²
    val totalCableArea = (wireCount1_5 * 7.1) + (wireCount2_5 * 10.2) + (wireCount4_0 * 15.2) + (wireCount6_0 * 21.2)
    val conduitArea = when (conduitSizeMm) {
        16 -> 132.7 // ~13mm ID
        20 -> 221.7 // ~16.8mm ID
        25 -> 363.0 // ~21.5mm ID
        32 -> 615.7 // ~28mm ID
        else -> 221.7
    }

    val fillPercent = if (conduitArea > 0) (totalCableArea / conduitArea) * 100.0 else 0.0
    val isFillCompliant = fillPercent <= 40.0 // SANS 10142-1 max 40% fill rule (Space Factor)

    val symbols = listOf(
        BuildingSymbol("One-Way Light Switch", "SANS 10143", "1250 mm AFF", "Single-pole lighting control on strike side of door"),
        BuildingSymbol("Two-Way Light Switch", "SANS 10143", "1250 mm AFF", "Changeover switch for stairwells and long corridors"),
        BuildingSymbol("Switched Socket Outlet (SSO 16A)", "SANS 164-1 / 164-2", "300 mm AFF", "Standard RSA 3-pin round earth & new compact 164-2 standard (1100mm kitchen)"),
        BuildingSymbol("Dedicated Clean Socket (Red)", "SANS 164-4", "300 mm AFF", "Flat earth pin dedicated for IT, inverter, or UPS protected circuits"),
        BuildingSymbol("Geyser Isolator with Pilot", "SANS 10142-1 Clause 6.15", "1500 mm AFF", "Double-pole 30A isolator with neon pilot within 1.5m of water heater"),
        BuildingSymbol("Stove Isolator", "SANS 10142-1 Clause 6.16", "1400 mm AFF", "Double-pole 45A/60A switch within 1.5m of cooktop (not positioned above burners)"),
        BuildingSymbol("Air Conditioner Isolator", "SANS 10142-1 Clause 6.17", "1200 mm AFF", "Weatherproof IP65 lockable rotary isolator mounted adjacent to outdoor unit"),
        BuildingSymbol("Main Distribution Board (MDB)", "SANS 10142-1 Clause 6.6", "1700 mm AFF", "Main switchboard housing main isolator, ELCB, and surge protection")
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
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Conduit Fill Status Hero Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isFillCompliant) Color(0xFF1E293B) else Color(0xFF450A0A)
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("SANS 10142-1 CONDUIT FILL FACTOR", fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8), fontSize = 11.sp)
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (isFillCompliant) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        if (isFillCompliant) Icons.Default.CheckCircle else Icons.Default.Warning,
                                        contentDescription = null,
                                        tint = if (isFillCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        if (isFillCompliant) "SANS PASS (≤40%)" else "OVERFILLED (>40%)",
                                        color = if (isFillCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Row(verticalAlignment = Alignment.Bottom) {
                            Text(
                                "%.1f".format(fillPercent),
                                fontSize = 42.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "% Fill",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isFillCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                modifier = Modifier.padding(bottom = 6.dp)
                            )
                            Spacer(modifier = Modifier.weight(1f))
                            Text(
                                "Max Allowed: 40.0%",
                                fontSize = 12.sp,
                                color = Color(0xFF94A3B8),
                                modifier = Modifier.padding(bottom = 6.dp)
                            )
                        }

                        LinearProgressIndicator(
                            progress = (fillPercent / 100.0).toFloat().coerceIn(0f, 1f),
                            modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                            color = if (isFillCompliant) Color(0xFF34D399) else Color(0xFFEF4444),
                            trackColor = Color(0xFF0F172A)
                        )

                        Text(
                            "Total Cable Area: %.1f mm² • Conduit Internal Area: %.1f mm²".format(totalCableArea, conduitArea),
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }

            // Interactive Wire Count Steppers & Conduit Selector Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Conduit Diameter:", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(16, 20, 25, 32).forEach { size ->
                                FilterChip(
                                    selected = conduitSizeMm == size,
                                    onClick = { conduitSizeMm = size },
                                    label = { Text("${size}mm Conduit", fontSize = 11.sp) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }

                        HorizontalDivider(color = Color(0xFF334155))

                        Text("Enclosed Conductors:", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        WireStepperRow("1.5 mm² Cu (Lighting)", wireCount1_5, onMinus = { if (wireCount1_5 > 0) wireCount1_5-- }, onPlus = { wireCount1_5++ })
                        WireStepperRow("2.5 mm² Cu (Plugs & Geyser)", wireCount2_5, onMinus = { if (wireCount2_5 > 0) wireCount2_5-- }, onPlus = { wireCount2_5++ })
                        WireStepperRow("4.0 mm² Cu (AC & Cold Room)", wireCount4_0, onMinus = { if (wireCount4_0 > 0) wireCount4_0-- }, onPlus = { wireCount4_0++ })
                        WireStepperRow("6.0 mm² Cu (Stove & Inverter)", wireCount6_0, onMinus = { if (wireCount6_0 > 0) wireCount6_0-- }, onPlus = { wireCount6_0++ })
                    }
                }
            }

            // Standard Architectural Symbols Header
            item {
                Text(
                    "South African Architectural Symbols (SANS 10143)",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 14.sp
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

@Composable
fun WireStepperRow(label: String, count: Int, onMinus: () -> Unit, onPlus: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = Color(0xFFE2E8F0), fontSize = 12.sp)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            IconButton(
                onClick = onMinus,
                modifier = Modifier.size(32.dp),
                colors = IconButtonDefaults.iconButtonColors(containerColor = Color(0xFF0F172A))
            ) {
                Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = Color.White, modifier = Modifier.size(16.dp))
            }
            Text(
                count.toString(),
                fontWeight = FontWeight.Bold,
                color = Color(0xFF38BDF8),
                fontSize = 14.sp,
                fontFamily = FontFamily.Monospace,
                modifier = Modifier.width(20.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            IconButton(
                onClick = onPlus,
                modifier = Modifier.size(32.dp),
                colors = IconButtonDefaults.iconButtonColors(containerColor = Color(0xFF0F172A))
            ) {
                Icon(Icons.Default.Add, contentDescription = "Increase", tint = Color.White, modifier = Modifier.size(16.dp))
            }
        }
    }
}

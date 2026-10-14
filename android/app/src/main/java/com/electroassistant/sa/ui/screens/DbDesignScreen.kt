package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class DbCircuitComposeItem(
    val id: String,
    val name: String,
    val breakerRatingA: Int,
    val loadWatts: Int,
    var phase: String,
    val isRcd: Boolean,
    val cableSizeMm2: Double
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DbDesignScreen() {
    var circuits by remember {
        mutableStateOf(
            listOf(
                DbCircuitComposeItem("1", "Lighting - Ground Floor", 10, 1200, "L1", true, 1.5),
                DbCircuitComposeItem("2", "Plugs 1 - Kitchen Counter", 20, 3400, "L2", true, 2.5),
                DbCircuitComposeItem("3", "Plugs 2 - Living Room & TV", 20, 2200, "L3", true, 2.5),
                DbCircuitComposeItem("4", "Main Residential Geyser", 20, 3000, "L1", false, 2.5),
                DbCircuitComposeItem("5", "Electric Stove & Oven", 35, 6500, "L2", false, 6.0),
                DbCircuitComposeItem("6", "Cold Room Compressor", 25, 4200, "L3", true, 4.0),
                DbCircuitComposeItem("7", "Workshop Aircon", 16, 2400, "L1", true, 2.5),
                DbCircuitComposeItem("8", "Borehole Submersible", 16, 2200, "L2", true, 2.5),
                DbCircuitComposeItem("9", "Sub-DB Outbuilding", 32, 4800, "L3", true, 6.0)
            )
        )
    }

    val l1Watts = circuits.filter { it.phase == "L1" }.sumOf { it.loadWatts }
    val l2Watts = circuits.filter { it.phase == "L2" }.sumOf { it.loadWatts }
    val l3Watts = circuits.filter { it.phase == "L3" }.sumOf { it.loadWatts }
    val totalWatts = l1Watts + l2Watts + l3Watts
    val l1Amps = l1Watts / 230.0
    val l2Amps = l2Watts / 230.0
    val l3Amps = l3Watts / 230.0
    val avgAmps = (l1Amps + l2Amps + l3Amps) / 3.0
    val maxDev = maxOf(
        kotlin.math.abs(l1Amps - avgAmps),
        kotlin.math.abs(l2Amps - avgAmps),
        kotlin.math.abs(l3Amps - avgAmps)
    )
    val imbalancePercent = if (avgAmps > 0) (maxDev / avgAmps) * 100.0 else 0.0
    val isImbalanceAlert = imbalancePercent > 15.0

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("DB Design & Three-Phase Balancer", fontWeight = FontWeight.Bold) },
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
            // Imbalance Status Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isImbalanceAlert) Color(0xFF7F1D1D) else Color(0xFF064E3B)
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                if (isImbalanceAlert) Icons.Default.Warning else Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = if (isImbalanceAlert) Color(0xFFF87171) else Color(0xFF34D399)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Phase Imbalance: %.1f%%".format(imbalancePercent),
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 16.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            if (isImbalanceAlert)
                                "SANS 10142-1 Warning: Imbalance exceeds 15% limit. High neutral circulating current risk!"
                            else
                                "SANS Compliant: Load is evenly distributed across L1, L2, and L3.",
                            color = Color(0xFFE2E8F0),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Phase Meters
            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("L1 (Red)", color = Color(0xFFF87171), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            Text("%.1f A".format(l1Amps), color = Color.White, fontWeight = FontWeight.Black, fontSize = 16.sp)
                            Text("%.1f kW".format(l1Watts / 1000.0), color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("L2 (White)", color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            Text("%.1f A".format(l2Amps), color = Color.White, fontWeight = FontWeight.Black, fontSize = 16.sp)
                            Text("%.1f kW".format(l2Watts / 1000.0), color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("L3 (Blue)", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            Text("%.1f A".format(l3Amps), color = Color.White, fontWeight = FontWeight.Black, fontSize = 16.sp)
                            Text("%.1f kW".format(l3Watts / 1000.0), color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }
                    }
                }
            }

            // Circuit DIN-Rail List
            items(circuits) { c ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = when (c.phase) {
                                "L1" -> Color(0xFF991B1B)
                                "L2" -> Color(0xFF92400E)
                                else -> Color(0xFF075985)
                            }
                        ) {
                            Text(
                                text = c.phase,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(c.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(
                                "Cable: ${c.cableSizeMm2} mm² Cu • ${if (c.isRcd) "30mA RCD" else "No RCD"}",
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("${c.breakerRatingA}A MCB", color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("${c.loadWatts} W", color = Color.White, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                        }
                    }
                }
            }
        }
    }
}

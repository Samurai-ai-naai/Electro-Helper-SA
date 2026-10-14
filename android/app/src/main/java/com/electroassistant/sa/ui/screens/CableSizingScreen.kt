package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.electroassistant.sa.calculator.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CableSizingScreen() {
    var supplyType by remember { mutableStateOf(SupplyType.SINGLE_PHASE) }
    var loadWatts by remember { mutableStateOf(3500.0) }
    var loadWattsText by remember { mutableStateOf("3.5") }
    var lengthMeters by remember { mutableStateOf(25.0) }
    var lengthMetersText by remember { mutableStateOf("25") }
    var powerFactor by remember { mutableStateOf(0.90) }
    var installationMethod by remember { mutableStateOf(InstallationMethod.CONDUIT_SURFACE_TRUNKING) }
    var insulationType by remember { mutableStateOf(InsulationType.PVC_70) }
    var ambientTemp by remember { mutableStateOf(30.0) }
    var groupingCount by remember { mutableStateOf(1) }

    val result = remember(
        supplyType, loadWatts, lengthMeters, powerFactor,
        installationMethod, insulationType, ambientTemp, groupingCount
    ) {
        SANS10142Calculator.calculate(
            CalculationInput(
                supplyType = supplyType,
                loadPowerWatts = loadWatts,
                powerFactor = powerFactor,
                oneWayLengthMeters = lengthMeters,
                installationMethod = installationMethod,
                insulationType = insulationType,
                ambientTemperatureC = ambientTemp,
                groupingCircuitsCount = groupingCount
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SANS 10142 Cable Sizing Engine", fontWeight = FontWeight.Bold) },
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
            // Recommendation Hero Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (result.isVoltageDropCompliant) Color(0xFF1E293B) else Color(0xFF450A0A)
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "RECOMMENDED COPPER CABLE",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF38BDF8)
                            )
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (result.isVoltageDropCompliant) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        if (result.isVoltageDropCompliant) Icons.Default.CheckCircle else Icons.Default.Warning,
                                        contentDescription = null,
                                        tint = if (result.isVoltageDropCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        if (result.isVoltageDropCompliant) "SANS PASS (≤5%)" else "VOLT DROP FAIL (>5%)",
                                        color = if (result.isVoltageDropCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Row(
                            verticalAlignment = Alignment.Bottom,
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            Text(
                                text = "${result.selectedCableSizeMm2}",
                                fontSize = 44.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "mm² Cu",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF38BDF8),
                                modifier = Modifier.padding(bottom = 6.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Engineering Metrics Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Design (Ib)", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                Text("%.1f A".format(result.designCurrentIb), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = FontFamily.Monospace)
                            }
                            Column {
                                Text("Derated (Iz)", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                Text("%.1f A".format(result.cableDeratedCapacityAmps), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                            }
                            Column {
                                Text("Volt Drop (ΔV)", fontSize = 10.sp, color = Color(0xFF94A3B8))
                                Text(
                                    "%.2f V (%.1f%%)".format(result.voltageDropVolts, result.voltageDropPercent),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (result.isVoltageDropCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(color = Color(0xFF334155))
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Recommended MCB: ${result.recommendedMcbRatingAmps}A", fontSize = 12.sp, color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                            Text("Min Earth: ${if (result.selectedCableSizeMm2 <= 16) result.selectedCableSizeMm2 else 16.0} mm² Cu", fontSize = 12.sp, color = Color(0xFF34D399), fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Interactive Controls Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Circuit Specifications", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)

                        // Supply Type
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { supplyType = SupplyType.SINGLE_PHASE },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (supplyType == SupplyType.SINGLE_PHASE) Color(0xFF0284C7) else Color(0xFF334155)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("1-Phase (230V AC)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            Button(
                                onClick = { supplyType = SupplyType.THREE_PHASE },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (supplyType == SupplyType.THREE_PHASE) Color(0xFF0284C7) else Color(0xFF334155)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("3-Phase (400V AC)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Load Power (kW) input and slider
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Load Power: %.1f kW".format(loadWatts / 1000.0), fontSize = 12.sp, color = Color(0xFFE2E8F0))
                            OutlinedTextField(
                                value = loadWattsText,
                                onValueChange = {
                                    loadWattsText = it
                                    val kw = it.toDoubleOrNull()
                                    if (kw != null && kw > 0) loadWatts = kw * 1000.0
                                },
                                label = { Text("kW") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                singleLine = true,
                                modifier = Modifier.width(90.dp)
                            )
                        }
                        Slider(
                            value = (loadWatts / 1000.0).toFloat().coerceIn(0.5f, 60.0f),
                            onValueChange = {
                                loadWatts = (it * 1000).toDouble()
                                loadWattsText = "%.1f".format(it)
                            },
                            valueRange = 0.5f..60.0f
                        )

                        // Route Length (Meters)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Route Length: ${lengthMeters.toInt()} meters", fontSize = 12.sp, color = Color(0xFFE2E8F0))
                            OutlinedTextField(
                                value = lengthMetersText,
                                onValueChange = {
                                    lengthMetersText = it
                                    val m = it.toDoubleOrNull()
                                    if (m != null && m > 0) lengthMeters = m
                                },
                                label = { Text("Meters") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                modifier = Modifier.width(90.dp)
                            )
                        }
                        Slider(
                            value = lengthMeters.toFloat().coerceIn(5f, 150f),
                            onValueChange = {
                                lengthMeters = it.toDouble()
                                lengthMetersText = it.toInt().toString()
                            },
                            valueRange = 5f..150f
                        )

                        // Installation Method Selector
                        Text("Installation Method:", fontSize = 12.sp, color = Color(0xFF94A3B8))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf(
                                InstallationMethod.CONDUIT_SURFACE_TRUNKING to "Surface Conduit",
                                InstallationMethod.CONDUIT_INSULATED to "In Thermal Wall",
                                InstallationMethod.CLIPPED_DIRECT_TRAY to "Clipped / Tray",
                                InstallationMethod.UNDERGROUND_DUCT to "Underground SWA"
                            ).forEach { (method, label) ->
                                FilterChip(
                                    selected = installationMethod == method,
                                    onClick = { installationMethod = method },
                                    label = { Text(label, fontSize = 10.sp) }
                                )
                            }
                        }

                        // Insulation Type
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            FilterChip(
                                selected = insulationType == InsulationType.PVC_70,
                                onClick = { insulationType = InsulationType.PVC_70 },
                                label = { Text("70°C Copper PVC", fontSize = 11.sp) }
                            )
                            FilterChip(
                                selected = insulationType == InsulationType.XLPE_90,
                                onClick = { insulationType = InsulationType.XLPE_90 },
                                label = { Text("90°C Copper XLPE", fontSize = 11.sp) }
                            )
                        }

                        // Ambient Temperature Ct
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Ambient Temp (Ct): ${ambientTemp.toInt()}°C", fontSize = 12.sp, color = Color(0xFFE2E8F0))
                            Text("Ct Factor: %.2f".format(result.appliedCtFactor), fontSize = 12.sp, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                        }
                        Slider(
                            value = ambientTemp.toFloat().coerceIn(20f, 55f),
                            onValueChange = { ambientTemp = it.toDouble() },
                            valueRange = 20f..55f,
                            steps = 6
                        )

                        // Grouping Circuits Cg
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Bundled Circuits (Cg): $groupingCount", fontSize = 12.sp, color = Color(0xFFE2E8F0))
                            Text("Cg Factor: %.2f".format(result.appliedCgFactor), fontSize = 12.sp, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                        }
                        Slider(
                            value = groupingCount.toFloat(),
                            onValueChange = { groupingCount = it.toInt() },
                            valueRange = 1f..10f,
                            steps = 8
                        )
                    }
                }
            }
        }
    }
}

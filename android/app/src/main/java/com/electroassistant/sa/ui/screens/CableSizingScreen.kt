package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.electroassistant.sa.calculator.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CableSizingScreen() {
    var supplyType by remember { mutableStateOf(SupplyType.SINGLE_PHASE) }
    var loadWatts by remember { mutableStateOf(3000.0) }
    var lengthMeters by remember { mutableStateOf(20.0) }
    var powerFactor by remember { mutableStateOf(0.85) }
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
                title = { Text("SANS 10142 Cable Sizing", fontWeight = FontWeight.Bold) },
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Recommendation Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "RECOMMENDED COPPER CABLE",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF38BDF8)
                        )
                        Row(
                            verticalAlignment = Alignment.Bottom,
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            Text(
                                text = "${result.selectedCableSizeMm2}",
                                fontSize = 42.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                fontFamily = FontFamily.Monospace
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "mm²",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF38BDF8)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Design Current (Ib)", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                Text("%.1f A".format(result.designCurrentIb), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            Column {
                                Text("Derated Capacity (Iz)", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                Text("%.1f A".format(result.cableDeratedCapacityAmps), fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8))
                            }
                            Column {
                                Text("Volt Drop (ΔV)", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                Text(
                                    "%.1f V (%.1f%%)".format(result.voltageDropVolts, result.voltageDropPercent),
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (result.isVoltageDropCompliant) Color(0xFF34D399) else Color(0xFFF87171)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(10.dp))
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

            // Quick Parameters
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Sizing Inputs", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)

                        // Supply Type
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { supplyType = SupplyType.SINGLE_PHASE },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (supplyType == SupplyType.SINGLE_PHASE) Color(0xFF0284C7) else Color(0xFF1E293B)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("1-Phase 230V", fontSize = 12.sp)
                            }
                            Button(
                                onClick = { supplyType = SupplyType.THREE_PHASE },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (supplyType == SupplyType.THREE_PHASE) Color(0xFF0284C7) else Color(0xFF1E293B)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("3-Phase 400V", fontSize = 12.sp)
                            }
                        }

                        // Power Slider
                        Text("Load Power: ${loadWatts / 1000} kW", fontSize = 12.sp, color = Color(0xFF94A3B8))
                        Slider(
                            value = (loadWatts / 1000).toFloat(),
                            onValueChange = { loadWatts = (it * 1000).toDouble() },
                            valueRange = 0.5f..50.0f
                        )

                        // Length Slider
                        Text("Cable Route Length: ${lengthMeters.toInt()} meters", fontSize = 12.sp, color = Color(0xFF94A3B8))
                        Slider(
                            value = lengthMeters.toFloat(),
                            onValueChange = { lengthMeters = it.toDouble() },
                            valueRange = 5f..150f
                        )

                        // Power Factor
                        Text("Power Factor: %.2f".format(powerFactor), fontSize = 12.sp, color = Color(0xFF94A3B8))
                        Slider(
                            value = powerFactor.toFloat(),
                            onValueChange = { powerFactor = it.toDouble() },
                            valueRange = 0.70f..1.00f
                        )
                    }
                }
            }
        }
    }
}

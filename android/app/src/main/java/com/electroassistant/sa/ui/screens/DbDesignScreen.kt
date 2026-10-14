package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.electroassistant.sa.viewmodel.DbCircuitItem
import com.electroassistant.sa.viewmodel.DbDesignUiState
import com.electroassistant.sa.viewmodel.DbDesignViewModel
import com.electroassistant.sa.viewmodel.DbSupplyType
import com.electroassistant.sa.viewmodel.SpdClass

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DbDesignScreen(
    viewModel: DbDesignViewModel = remember { DbDesignViewModel() }
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("DB Design & Phase Balancer", fontWeight = FontWeight.Bold) },
                actions = {
                    if (uiState.supplyType == DbSupplyType.THREE_PHASE) {
                        Button(
                            onClick = { viewModel.autoBalancePhases() },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Auto-Balance", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(onClick = { showAddDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Circuit", tint = Color(0xFF38BDF8))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A),
                    titleContentColor = Color.White
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Color(0xFF0284C7),
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Circuit")
            }
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
            // Supply Type Switcher & DIN Config
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = { viewModel.setSupplyType(DbSupplyType.THREE_PHASE) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (uiState.supplyType == DbSupplyType.THREE_PHASE) Color(0xFF0284C7) else Color(0xFF334155)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("3-Phase 400V (L1/L2/L3)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                            Button(
                                onClick = { viewModel.setSupplyType(DbSupplyType.SINGLE_PHASE) },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (uiState.supplyType == DbSupplyType.SINGLE_PHASE) Color(0xFF0284C7) else Color(0xFF334155)
                                ),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("1-Phase 230V", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        // DIN Rail Capacity Tracker
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "DIN Enclosure: ${uiState.dinWaysUsed} / ${uiState.dbTotalWays} Ways",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                            val isOverflow = uiState.dinWaysUsed > uiState.dbTotalWays
                            Text(
                                if (isOverflow) "OVER CAPACITY!" else "${uiState.dbTotalWays - uiState.dinWaysUsed} Spare",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isOverflow) Color(0xFFF87171) else Color(0xFF34D399)
                            )
                        }
                        LinearProgressIndicator(
                            progress = (uiState.dinWaysUsed.toFloat() / uiState.dbTotalWays.toFloat()).coerceIn(0f, 1f),
                            modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                            color = if (uiState.dinWaysUsed > uiState.dbTotalWays) Color(0xFFEF4444) else Color(0xFF38BDF8),
                            trackColor = Color(0xFF0F172A)
                        )
                    }
                }
            }

            // Phase Imbalance Verdict (3-Phase mode)
            if (uiState.supplyType == DbSupplyType.THREE_PHASE) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = if (uiState.isImbalanceAlert) Color(0xFF7F1D1D) else Color(0xFF064E3B)
                        ),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    if (uiState.isImbalanceAlert) Icons.Default.Warning else Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = if (uiState.isImbalanceAlert) Color(0xFFF87171) else Color(0xFF34D399)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "Phase Imbalance: %.1f%%".format(uiState.imbalancePercent),
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    fontSize = 15.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                if (uiState.isImbalanceAlert)
                                    "SANS 10142-1 Warning: Imbalance exceeds 15% limit. Click 'Auto-Balance' to equalize circuits!"
                                else
                                    "SANS Compliant: Phase loads are balanced within permissible South African standard tolerances.",
                                color = Color(0xFFE2E8F0),
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                // Phase Gauges Cards
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        PhaseMetricCard("L1 (Red)", uiState.l1Amps, uiState.l1Watts, Color(0xFFF87171), Modifier.weight(1f))
                        PhaseMetricCard("L2 (White)", uiState.l2Amps, uiState.l2Watts, Color(0xFFFBBF24), Modifier.weight(1f))
                        PhaseMetricCard("L3 (Blue)", uiState.l3Amps, uiState.l3Watts, Color(0xFF38BDF8), Modifier.weight(1f))
                    }
                }
            }

            // Circuit Header & Action
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Sub-Circuits (${uiState.circuits.size})",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 14.sp
                    )
                    Text(
                        "Total: %.1f kW".format(uiState.totalWatts / 1000.0),
                        color = Color(0xFF38BDF8),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // Circuit List Items
            items(uiState.circuits, key = { it.id }) { c ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Phase Selector Chip (Click to toggle L1 -> L2 -> L3)
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = when (c.phase) {
                                "L1" -> Color(0xFF991B1B)
                                "L2" -> Color(0xFF92400E)
                                else -> Color(0xFF075985)
                            },
                            modifier = Modifier.clickable {
                                viewModel.toggleCircuitPhase(c.id)
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
                            Text("%.1f A (%.0fW)".format(c.currentAmps, c.loadWatts), color = Color.White, fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                        }

                        IconButton(
                            onClick = { viewModel.removeCircuit(c.id) },
                            modifier = Modifier.size(32.dp).padding(start = 6.dp)
                        ) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFF64748B), modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }

    // Add Circuit Dialog
    if (showAddDialog) {
        AddCircuitDialog(
            supplyType = uiState.supplyType,
            onDismiss = { showAddDialog = false },
            onAdd = { name, breakerA, watts, pf, phase, isRcd, cableMm2 ->
                viewModel.addCircuit(name, breakerA, watts, pf, phase, isRcd, cableMm2)
                showAddDialog = false
            }
        )
    }
}

@Composable
fun PhaseMetricCard(title: String, amps: Double, watts: Double, accentColor: Color, modifier: Modifier = Modifier) {
    Card(modifier = modifier, colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(title, color = accentColor, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            Text("%.1f A".format(amps), color = Color.White, fontWeight = FontWeight.Black, fontSize = 15.sp, fontFamily = FontFamily.Monospace)
            Text("%.2f kW".format(watts / 1000.0), color = Color(0xFF94A3B8), fontSize = 11.sp)
        }
    }
}

@Composable
fun AddCircuitDialog(
    supplyType: DbSupplyType,
    onDismiss: () -> Unit,
    onAdd: (name: String, breakerA: Int, watts: Double, pf: Double, phase: String, isRcd: Boolean, cableMm2: Double) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var wattsStr by remember { mutableStateOf("2500") }
    var breakerA by remember { mutableStateOf(20) }
    var cableMm2 by remember { mutableStateOf(2.5) }
    var phase by remember { mutableStateOf("L1") }
    var isRcd by remember { mutableStateOf(true) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Sub-Circuit", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Circuit Name") },
                    placeholder = { Text("e.g. Geyser 2, Kitchen Aircon") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = wattsStr,
                    onValueChange = { wattsStr = it },
                    label = { Text("Load Power (Watts)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                if (supplyType == DbSupplyType.THREE_PHASE) {
                    Text("Phase Assignment:", fontSize = 12.sp, color = Color.Gray)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("L1", "L2", "L3").forEach { p ->
                            FilterChip(
                                selected = phase == p,
                                onClick = { phase = p },
                                label = { Text(p) }
                            )
                        }
                    }
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("30mA RCD Protection", fontSize = 13.sp)
                    Switch(checked = isRcd, onCheckedChange = { isRcd = it })
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val watts = wattsStr.toDoubleOrNull() ?: 2000.0
                    onAdd(name, breakerA, watts, 0.90, phase, isRcd, cableMm2)
                }
            ) {
                Text("Add Circuit")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

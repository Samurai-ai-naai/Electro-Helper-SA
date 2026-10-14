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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.electroassistant.sa.viewmodel.CoCVerificationViewModel
import com.electroassistant.sa.viewmodel.TestReadingItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CoCVerificationScreen(
    viewModel: CoCVerificationViewModel = remember { CoCVerificationViewModel() }
) {
    val uiState by viewModel.uiState.collectAsState()
    var showReportDialog by remember { mutableStateOf(false) }
    var showAddCircuitDialog by remember { mutableStateOf(false) }
    val clipboardManager = LocalClipboardManager.current
    var copiedFeedback by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("CoC Inspection Audit Sheet", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = {
                        viewModel.generateJobCardReport()
                        showReportDialog = true
                    }) {
                        Icon(Icons.Default.Description, contentDescription = "View Report", tint = Color(0xFF34D399))
                    }
                    IconButton(onClick = { showAddCircuitDialog = true }) {
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
                onClick = { showAddCircuitDialog = true },
                containerColor = Color(0xFF0284C7),
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Test Reading")
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
            // Overall Status Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (uiState.isCoCCompliant) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                if (uiState.isCoCCompliant) Icons.Default.CheckCircle else Icons.Default.Warning,
                                contentDescription = null,
                                tint = if (uiState.isCoCCompliant) Color(0xFF34D399) else Color(0xFFF87171)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                if (uiState.isCoCCompliant) "SANS 10142-1 COMPLIANT" else "DEFECTS DETECTED (NON-COMPLIANT)",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 15.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "Certificate: ${uiState.certificateNumber} • Client: ${uiState.clientName} • Passed: ${uiState.passedCircuits}/${uiState.totalCircuits} Circuits",
                            color = Color(0xFFE2E8F0),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Installation Metadata & Incomer Specs
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Installation & Incomer Ratings", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Main Isolator: 80A TP&N", color = Color(0xFF38BDF8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                            Text("Earth Leakage: 30mA (Class A)", color = Color(0xFF34D399), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                        }
                        Text("Premises: ${uiState.installationAddress}", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        Text("Supply: ${uiState.supplyType} • System Earthing: ${uiState.earthingSystem}", color = Color(0xFF94A3B8), fontSize = 11.sp)
                    }
                }
            }

            // Section 8 Visual Checklist Card (Interactive Toggles)
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Section 8 Table 8.1 Visual Checklist", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                            Text("Tap to Toggle", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }

                        val checks = listOf(
                            Triple("Main Isolator Accessible & Rated", uiState.visualChecks.mainIsolatorAccessible) {
                                viewModel.updateVisualCheck { it.copy(mainIsolatorAccessible = !it.mainIsolatorAccessible) }
                            },
                            Triple("Neutral & Earth Busbars Separated", uiState.visualChecks.neutralEarthSeparatedCorrectly) {
                                viewModel.updateVisualCheck { it.copy(neutralEarthSeparatedCorrectly = !it.neutralEarthSeparatedCorrectly) }
                            },
                            Triple("DB Legended & Circuits Labeled", uiState.visualChecks.dbLegendedAndIdentified) {
                                viewModel.updateVisualCheck { it.copy(dbLegendedAndIdentified = !it.dbLegendedAndIdentified) }
                            },
                            Triple("IP2X Finger-Safe Touch Barriers", uiState.visualChecks.ip2xFingerSafeBarriers) {
                                viewModel.updateVisualCheck { it.copy(ip2xFingerSafeBarriers = !it.ip2xFingerSafeBarriers) }
                            },
                            Triple("Type 2 SPD Surge Protection Green", uiState.visualChecks.surgeProtectionSpdFunctional) {
                                viewModel.updateVisualCheck { it.copy(surgeProtectionSpdFunctional = !it.surgeProtectionSpdFunctional) }
                            },
                            Triple("Earth Electrode & Bonding Intact", uiState.visualChecks.earthElectrodeBonded) {
                                viewModel.updateVisualCheck { it.copy(earthElectrodeBonded = !it.earthElectrodeBonded) }
                            },
                            Triple("Water Pipes & Geyser Bonded", uiState.visualChecks.geyserAndPipesBonded) {
                                viewModel.updateVisualCheck { it.copy(geyserAndPipesBonded = !it.geyserAndPipesBonded) }
                            },
                            Triple("Cable Glands & Strain Relief", uiState.visualChecks.cablesSecuredAndGlanded) {
                                viewModel.updateVisualCheck { it.copy(cablesSecuredAndGlanded = !it.cablesSecuredAndGlanded) }
                            }
                        )

                        checks.forEach { (label, passed, onToggle) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { onToggle() }
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(label, color = Color(0xFFE2E8F0), fontSize = 12.sp)
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (passed) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                                ) {
                                    Text(
                                        if (passed) "PASS" else "FAIL",
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                        color = if (passed) Color(0xFF34D399) else Color(0xFFF87171),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Readings List Header & Action
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Circuit Test Readings (Clause 8.6)",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 14.sp
                    )
                    Text(
                        "${uiState.readings.size} Circuits Tested",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp
                    )
                }
            }

            // Interactive Readings List Items
            items(uiState.readings, key = { it.id }) { item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (item.isCircuitOverallPass) Color(0xFF1E293B) else Color(0xFF450A0A)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(item.circuitName, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                                Text("MCB: ${item.breakerRatingA}A", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (item.isCircuitOverallPass) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                                ) {
                                    Text(
                                        if (item.isCircuitOverallPass) "PASS" else "FAIL RED",
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                        color = if (item.isCircuitOverallPass) Color(0xFF34D399) else Color(0xFFF87171),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 11.sp
                                    )
                                }
                                IconButton(
                                    onClick = { viewModel.removeCircuitReading(item.id) },
                                    modifier = Modifier.size(32.dp).padding(start = 4.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFF64748B), modifier = Modifier.size(16.dp))
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Test Reading Details Grid
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(
                                "Rpe Continuity: %.3f Ω".format(item.earthContinuityOhms),
                                fontSize = 11.sp,
                                color = if (item.isContinuityPass) Color(0xFF34D399) else Color(0xFFF87171),
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Limit: <= 0.20 Ω",
                                fontSize = 10.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(
                                "Insulation (500V): %.1f MΩ".format(item.insulationPhaseNeutralMOhm),
                                fontSize = 11.sp,
                                color = if (item.isInsulationPnPass) Color(0xFF34D399) else Color(0xFFF87171),
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Limit: >= 1.0 MΩ",
                                fontSize = 10.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(
                                "ELCB Trip: %.1f ms (%.1f mA)".format(item.earthLeakageTripTimeMs, item.earthLeakageTripCurrentMa),
                                fontSize = 11.sp,
                                color = if (item.isEarthLeakagePass) Color(0xFF34D399) else Color(0xFFF87171),
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Limit: <= 30 ms",
                                fontSize = 10.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(
                                "Loop Zs: %.2f Ω • PSCC: %.2f kA".format(item.loopImpedanceZsOhms, item.psccKa),
                                fontSize = 11.sp,
                                color = if (item.isPsccSafe) Color(0xFF38BDF8) else Color(0xFFF87171),
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "MCB: %.1f kA".format(item.breakerBreakingCapacityKa),
                                fontSize = 10.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }
                    }
                }
            }
        }
    }

    // Add Circuit Reading Dialog
    if (showAddCircuitDialog) {
        AddTestReadingDialog(
            onDismiss = { showAddCircuitDialog = false },
            onAdd = { reading ->
                viewModel.addCircuitReading(reading)
                showAddCircuitDialog = false
            }
        )
    }

    // Report Summary Dialog
    if (showReportDialog) {
        AlertDialog(
            onDismissRequest = {
                showReportDialog = false
                copiedFeedback = false
            },
            title = { Text("SANS 10142-1 CoC Report", fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    Text(
                        uiState.reportSummaryText.ifEmpty { "Generating report summary..." },
                        fontFamily = FontFamily.Monospace,
                        fontSize = 11.sp,
                        lineHeight = 16.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        clipboardManager.setText(AnnotatedString(uiState.reportSummaryText))
                        copiedFeedback = true
                    }
                ) {
                    Text(if (copiedFeedback) "Copied!" else "Copy Report")
                }
            },
            dismissButton = {
                TextButton(onClick = { showReportDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun AddTestReadingDialog(
    onDismiss: () -> Unit,
    onAdd: (TestReadingItem) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var mcbRatingStr by remember { mutableStateOf("20") }
    var rpeStr by remember { mutableStateOf("0.08") }
    var rinsPnStr by remember { mutableStateOf("50.0") }
    var rinsPeStr by remember { mutableStateOf("50.0") }
    var rinsNeStr by remember { mutableStateOf("50.0") }
    var elcbTimeStr by remember { mutableStateOf("18.0") }
    var elcbCurrentStr by remember { mutableStateOf("22.0") }
    var zsStr by remember { mutableStateOf("0.35") }
    var mcbCapacityStr by remember { mutableStateOf("6.0") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Circuit Test Reading", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Circuit Name") },
                    placeholder = { Text("e.g. Kitchen Plugs, Geyser 1") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = mcbRatingStr,
                        onValueChange = { mcbRatingStr = it },
                        label = { Text("MCB (A)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = rpeStr,
                        onValueChange = { rpeStr = it },
                        label = { Text("Rpe (Ω)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = rinsPnStr,
                        onValueChange = { rinsPnStr = it },
                        label = { Text("Rins P-N (MΩ)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = rinsPeStr,
                        onValueChange = { rinsPeStr = it },
                        label = { Text("Rins P-E (MΩ)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = elcbTimeStr,
                        onValueChange = { elcbTimeStr = it },
                        label = { Text("ELCB Time (ms)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = zsStr,
                        onValueChange = { zsStr = it },
                        label = { Text("Loop Zs (Ω)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val zs = zsStr.toDoubleOrNull() ?: 0.35
                    val pscc = 230.0 / zs / 1000.0
                    val reading = TestReadingItem(
                        circuitName = name.ifBlank { "Circuit Tested" },
                        breakerRatingA = mcbRatingStr.toIntOrNull() ?: 20,
                        earthContinuityOhms = rpeStr.toDoubleOrNull() ?: 0.08,
                        insulationPhaseNeutralMOhm = rinsPnStr.toDoubleOrNull() ?: 50.0,
                        insulationPhaseEarthMOhm = rinsPeStr.toDoubleOrNull() ?: 50.0,
                        insulationNeutralEarthMOhm = rinsNeStr.toDoubleOrNull() ?: 50.0,
                        earthLeakageTripTimeMs = elcbTimeStr.toDoubleOrNull() ?: 18.0,
                        earthLeakageTripCurrentMa = elcbCurrentStr.toDoubleOrNull() ?: 22.0,
                        loopImpedanceZsOhms = zs,
                        psccKa = pscc,
                        touchVoltageVolts = (230.0 / zs) * 0.15,
                        breakerBreakingCapacityKa = mcbCapacityStr.toDoubleOrNull() ?: 6.0
                    )
                    onAdd(reading)
                }
            ) {
                Text("Add Reading")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

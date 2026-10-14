package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
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
                },
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
                                if (uiState.isCoCCompliant) "SANS 10142-1 COMPLIANT" else "DEFECTS DETECTED",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 16.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Certificate: ${uiState.certificateNumber} • ${uiState.clientName}",
                            color = Color(0xFFE2E8F0),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Installation Metadata Summary
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Installation & Contractor Details", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Text("Contractor: ${uiState.contractorName} (${uiState.accreditationNumber})", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        Text("Premises: ${uiState.installationAddress}", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        Text("Supply: ${uiState.supplyType} • Earthing: ${uiState.earthingSystem}", color = Color(0xFF38BDF8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            // Section 8 Visual Checklist Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Section 8 Table 8.1 Visual Checklist", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)

                        val checks = listOf(
                            "Main Isolator Accessible & Rated" to uiState.visualChecks.mainIsolatorAccessible,
                            "Neutral & Earth Busbars Separated" to uiState.visualChecks.neutralEarthSeparatedCorrectly,
                            "DB Legended & Circuits Labeled" to uiState.visualChecks.dbLegendedAndIdentified,
                            "IP2X Finger-Safe Touch Barriers" to uiState.visualChecks.ip2xFingerSafeBarriers,
                            "Type 2 SPD Surge Protection Green" to uiState.visualChecks.surgeProtectionSpdFunctional,
                            "Earth Electrode & Bonding Intact" to uiState.visualChecks.earthElectrodeBonded,
                            "Water Pipes & Geyser Bonded" to uiState.visualChecks.geyserAndPipesBonded,
                            "Cable Glands & Strain Relief" to uiState.visualChecks.cablesSecuredAndGlanded
                        )

                        checks.forEach { (label, passed) ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(label, color = Color(0xFFE2E8F0), fontSize = 11.sp)
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = if (passed) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                                ) {
                                    Text(
                                        if (passed) "PASS" else "FAIL",
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
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

            // Readings List Header
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
                    Text("${uiState.readings.size} Circuits", color = Color(0xFF94A3B8), fontSize = 12.sp)
                }
            }

            items(uiState.readings) { item ->
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
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(item.circuitName, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                            Text(
                                if (item.isCircuitOverallPass) "PASS" else "FAIL",
                                fontWeight = FontWeight.Bold,
                                color = if (item.isCircuitOverallPass) Color(0xFF34D399) else Color(0xFFF87171),
                                fontSize = 12.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "Earth Continuity (Rpe): ${item.earthContinuityOhms} Ω (Max 0.20 Ω)",
                            fontSize = 11.sp,
                            color = if (item.isContinuityPass) Color(0xFF94A3B8) else Color(0xFFF87171),
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            "Insulation (500V DC): ${item.insulationPhaseNeutralMOhm} MΩ (Min 1.0 MΩ)",
                            fontSize = 11.sp,
                            color = if (item.isInsulationPnPass) Color(0xFF94A3B8) else Color(0xFFF87171),
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            "ELCB 30mA Trip Time: ${item.earthLeakageTripTimeMs} ms (Max 30 ms)",
                            fontSize = 11.sp,
                            color = if (item.isEarthLeakagePass) Color(0xFF94A3B8) else Color(0xFFF87171),
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            "Loop Zs: ${item.loopImpedanceZsOhms} Ω • PSCC: ${item.psccKa} kA (MCB: ${item.breakerBreakingCapacityKa} kA)",
                            fontSize = 11.sp,
                            color = if (item.isPsccSafe) Color(0xFF38BDF8) else Color(0xFFF87171),
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }

    // Report Dialog
    if (showReportDialog) {
        AlertDialog(
            onDismissRequest = { showReportDialog = false },
            title = { Text("SANS 10142-1 CoC Report", fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    uiState.reportSummaryText.ifEmpty { "Generating report summary..." },
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    lineHeight = 16.sp
                )
            },
            confirmButton = {
                TextButton(onClick = { showReportDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}

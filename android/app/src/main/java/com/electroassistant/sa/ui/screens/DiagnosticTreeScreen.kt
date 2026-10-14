package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Refresh
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
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.pow
import kotlin.math.roundToInt

data class DiagnosticOption(
    val label: String,
    val summary: String,
    val nextNodeId: String? = null,
    val isResolution: Boolean = false,
    val resolutionType: String = "pass", // "pass", "fail", "action_required"
    val remedySteps: List<String> = emptyList(),
    val sansRef: String? = null
)

data class DiagnosticNode(
    val id: String,
    val stepNumber: Int,
    val title: String,
    val instruction: String,
    val meterSetting: String? = null,
    val expectedReading: String? = null,
    val safetyWarning: String? = null,
    val options: List<DiagnosticOption>
)

data class DiagnosticTreeItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val category: String,
    val rootNodeId: String,
    val nodes: Map<String, DiagnosticNode>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnosticTreeScreen() {
    val diagnosticTrees = remember {
        listOf(
            DiagnosticTreeItem(
                id = "earth_leakage",
                title = "Nuisance Earth Leakage Tripping (30mA ELCB)",
                subtitle = "SANS 10142-1 fault isolation for tripping main earth leakage units",
                category = "Electrical",
                rootNodeId = "el_1",
                nodes = mapOf(
                    "el_1" to DiagnosticNode(
                        id = "el_1",
                        stepNumber = 1,
                        title = "Initial Breaker Shedding & Reset",
                        instruction = "Turn OFF all circuit breakers fed downstream of the 30mA Earth Leakage unit. Leave the main isolator ON. Attempt to lift the Earth Leakage switch.",
                        meterSetting = "Visual inspection",
                        safetyWarning = "Keep fingers behind IP2X deadfront panel. Do not touch exposed live busbars.",
                        expectedReading = "ELCB toggle stays engaged in closed position.",
                        options = listOf(
                            DiagnosticOption(
                                label = "ELCB trips immediately with all sub-breakers OFF",
                                summary = "Direct Neutral-to-Earth fault inside the DB or on common neutral bar.",
                                nextNodeId = "el_ne_test"
                            ),
                            DiagnosticOption(
                                label = "ELCB stays UP successfully with all sub-breakers OFF",
                                summary = "Fault is on an individual branch circuit.",
                                nextNodeId = "el_branch_test"
                            )
                        )
                    ),
                    "el_ne_test" to DiagnosticNode(
                        id = "el_ne_test",
                        stepNumber = 2,
                        title = "Neutral-to-Earth Megger Isolation",
                        instruction = "Switch OFF Main Isolator. Disconnect incoming municipal neutral from the neutral bar. Set Insulation Tester to 500V DC. Measure resistance between DB Neutral bar and DB Earth bar.",
                        meterSetting = "Megger @ 500V DC (MΩ scale)",
                        expectedReading = "Mandatory minimum 1.0 MΩ (SANS 10142-1 Clause 8.6.3). Normal is >50 MΩ.",
                        options = listOf(
                            DiagnosticOption(
                                label = "Reading is < 1.0 MΩ (e.g. 0.02 MΩ or 0.00 Ω dead short)",
                                summary = "Confirmed Neutral-Earth breakdown or moisture inside conduit.",
                                isResolution = true,
                                resolutionType = "fail",
                                remedySteps = listOf(
                                    "Unscrew branch neutral conductors one by one while watching the Megger display.",
                                    "When the reading jumps back up to >10 MΩ, the lifted conductor is the faulty circuit.",
                                    "Trace conductor to junction box or light point; inspect for pinched neutral or moisture.",
                                    "Repair damaged cable, re-terminate on neutral bar, and re-verify insulation (>= 1.0 MΩ)."
                                ),
                                sansRef = "SANS 10142-1 Clause 8.6.3 & Clause 6.1.4"
                            ),
                            DiagnosticOption(
                                label = "Reading is > 1.0 MΩ (Insulation healthy)",
                                summary = "ELCB internal mechanical latch failure or transient capacitive leakage.",
                                isResolution = true,
                                resolutionType = "action_required",
                                remedySteps = listOf(
                                    "Test ELCB with dedicated RCD tester on Ramp mode (15mA to 30mA).",
                                    "If trip time exceeds 30ms or trips below 15mA, replace ELCB with a SANS 767 compliant unit."
                                ),
                                sansRef = "SANS 10142-1 Clause 8.6.4"
                            )
                        )
                    ),
                    "el_branch_test" to DiagnosticNode(
                        id = "el_branch_test",
                        stepNumber = 2,
                        title = "Branch Circuit Sequential Re-engagement",
                        instruction = "With ELCB ON, flip sub-breakers ON one at a time with a 2-second delay between each. Note which specific circuit breaker immediately trips the ELCB.",
                        meterSetting = "Visual observation",
                        expectedReading = "Identify the single faulty branch circuit breaker.",
                        options = listOf(
                            DiagnosticOption(
                                label = "Trips immediately when flipping Geyser / Stove circuit",
                                summary = "Heating element insulation breakdown caused by scale and thermal fatigue.",
                                isResolution = true,
                                resolutionType = "action_required",
                                remedySteps = listOf(
                                    "Isolate rotary switch and drain water heater.",
                                    "Replace 3kW/4kW heating element and inspect thermostat pocket for moisture.",
                                    "Test element cold insulation at 500V DC (must be >= 1.0 MΩ).",
                                    "Confirm pipe bonding earth continuity Rpe <= 0.20 Ω."
                                ),
                                sansRef = "SANS 10142-1 Clause 6.15 & Clause 8.6.2"
                            ),
                            DiagnosticOption(
                                label = "ELCB holds all breakers, but trips when appliances turn ON",
                                summary = "Cumulative standing leakage from multiple switch-mode power supplies.",
                                isResolution = true,
                                resolutionType = "pass",
                                remedySteps = listOf(
                                    "Measure standing leakage with high-resolution mA clamp meter clamped around L+N.",
                                    "If standing leakage exceeds 10mA, split the DB across two 30mA Earth Leakage units.",
                                    "Install dedicated RCBO for sensitive refrigeration or computer gear."
                                ),
                                sansRef = "SANS 10142-1 Clause 6.7.5 & Annexure E"
                            )
                        )
                    )
                )
            ),
            DiagnosticTreeItem(
                id = "compressor_failure",
                title = "Compressor Won't Start (Humming / Overload Trip)",
                subtitle = "HVAC-R refrigeration diagnostics: windings, capacitors, potential relays",
                category = "HVAC-R",
                rootNodeId = "comp_1",
                nodes = mapOf(
                    "comp_1" to DiagnosticNode(
                        id = "comp_1",
                        stepNumber = 1,
                        title = "Voltage Drop & Acoustic Check",
                        instruction = "Measure supply voltage across L and N at compressor contactor during starting attempt. Listen for hum and Klixon overload click.",
                        meterSetting = "AC Voltmeter (600V range)",
                        expectedReading = "230V AC ± 10% (207V - 253V) under load.",
                        safetyWarning = "Discharge capacitors with a 20kΩ 5W resistor before touching terminals.",
                        options = listOf(
                            DiagnosticOption(
                                label = "Voltage dips severely (< 190V AC) during start attempt",
                                summary = "Excessive feeder cable impedance or pitted contactor points.",
                                isResolution = true,
                                resolutionType = "action_required",
                                remedySteps = listOf(
                                    "Inspect contactor silver contacts for severe pitting and high contact resistance.",
                                    "Re-size supply cable using ElectroAssistant Cable Sizing module to enforce < 5% voltage drop."
                                ),
                                sansRef = "SANS 10142-1 Clause 6.2.8.2"
                            ),
                            DiagnosticOption(
                                label = "Voltage remains solid 230V AC, compressor hums then clicks overload",
                                summary = "Compressor cannot break away: starting components or locked rotor.",
                                nextNodeId = "comp_windings"
                            )
                        )
                    ),
                    "comp_windings" to DiagnosticNode(
                        id = "comp_windings",
                        stepNumber = 2,
                        title = "Winding Resistance (C-R-S) & Ground Test",
                        instruction = "Disconnect all wires from compressor terminals C, R, S. Measure resistance: 1) C to R, 2) C to S, 3) R to S. Then measure each pin to copper suction pipe (ground).",
                        meterSetting = "Low Ohms (Ω) & 500V DC Megger to ground",
                        expectedReading = "Golden Law: R(CR) + R(CS) = R(RS) within ±0.3Ω. Ground resistance > 5 MΩ.",
                        options = listOf(
                            DiagnosticOption(
                                label = "Winding formula fails or grounded pin detected (< 1.0 MΩ)",
                                summary = "Compressor motor winding burned out or shorted to grounded shell.",
                                isResolution = true,
                                resolutionType = "fail",
                                remedySteps = listOf(
                                    "Compressor has suffered irreversible motor failure (burnout).",
                                    "Recover refrigerant charge safely into cylinder in compliance with SANS 10147.",
                                    "Replace compressor, install suction filter drier, perform acid burnout test, vacuum to < 250 microns, and recharge by weight."
                                ),
                                sansRef = "SANS 10147 & SANS 10142-1 Clause 8.6.3"
                            ),
                            DiagnosticOption(
                                label = "Windings pass formula perfectly and zero ground leak",
                                summary = "Motor windings healthy. Check run/start capacitor and potential relay.",
                                isResolution = true,
                                resolutionType = "pass",
                                remedySteps = listOf(
                                    "Check run capacitor capacitance (μF) with multimeter (must be within ±5% of rating).",
                                    "Verify potential relay coil resistance (Pins 2 to 5 should measure 3,000Ω - 10,000Ω).",
                                    "Install a genuine 3-wire 5-2-1 hard start kit to provide extra breakaway starting torque."
                                )
                            )
                        )
                    )
                )
            ),
            DiagnosticTreeItem(
                id = "inverter_neutral",
                title = "Off-Grid Inverter Neutral Float & Nuisance Trips",
                subtitle = "SANS 10142-1 Annex S & SANS 10142-2 bonding diagnostics for solar inverters",
                category = "Solar PV",
                rootNodeId = "inv_1",
                nodes = mapOf(
                    "inv_1" to DiagnosticNode(
                        id = "inv_1",
                        stepNumber = 1,
                        title = "Island Mode Neutral-to-Earth Voltage",
                        instruction = "Switch OFF the Eskom grid incomer so inverter operates in Island/Battery mode. Measure AC voltage between Inverter Output Neutral and DB Earth bar.",
                        meterSetting = "AC Voltmeter (600V range)",
                        expectedReading = "SANS 10142-1 Annex S limit: Neutral-to-Earth voltage must be < 5.0V AC (ideally < 1.0V AC). If reading is ~115V AC, neutral is floating!",
                        options = listOf(
                            DiagnosticOption(
                                label = "Neutral-to-Earth measures ~115V AC (Floating Neutral)",
                                summary = "Inverter dynamic bonding relay is disabled or missing. Dangerous floating neutral!",
                                isResolution = true,
                                resolutionType = "fail",
                                remedySteps = listOf(
                                    "Enable 'Signal Island Mode' or 'Ground Relay' in inverter firmware settings (Sunsynk / Deye / Victron).",
                                    "If the inverter lacks an internal relay, install an external AC contactor interlocked with grid presence to connect Neutral to Earth only during islanding."
                                ),
                                sansRef = "SANS 10142-1 Annex S & NRS 097-2-1"
                            ),
                            DiagnosticOption(
                                label = "Neutral-to-Earth measures < 2.0V AC (Solid Earth Reference)",
                                summary = "Bonding contactor is functioning correctly.",
                                isResolution = true,
                                resolutionType = "pass",
                                remedySteps = listOf(
                                    "Verify that earth continuity to the main earth electrode is <= 0.20 Ω.",
                                    "Ensure all solar PV panels and mounting rails are bonded with minimum 6mm² copper earth conductor."
                                ),
                                sansRef = "SANS 10142-2 Section 7"
                            )
                        )
                    )
                )
            )
        )
    }

    var selectedTreeId by remember { mutableStateOf("earth_leakage") }
    val currentTree = diagnosticTrees.firstOrNull { it.id == selectedTreeId } ?: diagnosticTrees.first()
    var currentNodeId by remember(selectedTreeId) { mutableStateOf(currentTree.rootNodeId) }
    var stepHistory by remember(selectedTreeId) { mutableStateOf(listOf(currentTree.rootNodeId)) }
    val currentNode = currentTree.nodes[currentNodeId] ?: currentTree.nodes.values.first()

    // 3-Phase Voltage Unbalance State
    var v1Text by remember { mutableStateOf("232") }
    var v2Text by remember { mutableStateOf("228") }
    var v3Text by remember { mutableStateOf("219") }
    val v1 = v1Text.toDoubleOrNull() ?: 232.0
    val v2 = v2Text.toDoubleOrNull() ?: 228.0
    val v3 = v3Text.toDoubleOrNull() ?: 219.0
    val vAvg = (v1 + v2 + v3) / 3.0
    val maxDev = max(abs(v1 - vAvg), max(abs(v2 - vAvg), abs(v3 - vAvg)))
    val unbalancePercent = if (vAvg > 0) (maxDev / vAvg) * 100.0 else 0.0
    val isUnbalanceAlert = unbalancePercent > 2.0

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Field Diagnostics & Motor Tools", fontWeight = FontWeight.Bold) },
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
            // Category Selectors
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    diagnosticTrees.forEach { tree ->
                        FilterChip(
                            selected = selectedTreeId == tree.id,
                            onClick = {
                                selectedTreeId = tree.id
                                currentNodeId = tree.rootNodeId
                                stepHistory = listOf(tree.rootNodeId)
                            },
                            label = { Text(tree.category, fontSize = 11.sp) }
                        )
                    }
                }
            }

            // Current Tree Header Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(currentTree.title, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Text(currentTree.subtitle, color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                    }
                }
            }

            // Current Step Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0xFF0284C7)
                            ) {
                                Text(
                                    "Step ${currentNode.stepNumber}",
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(currentNode.title, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        }
                        Text(currentNode.instruction, color = Color(0xFFE2E8F0), fontSize = 13.sp, lineHeight = 18.sp)
                        currentNode.meterSetting?.let {
                            Text("Meter Mode: $it", color = Color(0xFF38BDF8), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                        }
                        currentNode.expectedReading?.let {
                            Text("Baseline: $it", color = Color(0xFF34D399), fontSize = 11.sp)
                        }
                        currentNode.safetyWarning?.let {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFF451A03)
                            ) {
                                Text(
                                    "⚠️ Safety Warning: $it",
                                    modifier = Modifier.padding(8.dp),
                                    color = Color(0xFFFDBA74),
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }
                }
            }

            // Decision Options
            items(currentNode.options) { opt ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(opt.label, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Text(opt.summary, color = Color(0xFF94A3B8), fontSize = 12.sp, modifier = Modifier.padding(vertical = 4.dp))
                        if (opt.isResolution) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = when (opt.resolutionType) {
                                    "pass" -> Color(0xFF064E3B)
                                    "fail" -> Color(0xFF7F1D1D)
                                    else -> Color(0xFF78350F)
                                },
                                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            if (opt.resolutionType == "pass") Icons.Default.CheckCircle else Icons.Default.Warning,
                                            contentDescription = null,
                                            tint = if (opt.resolutionType == "pass") Color(0xFF34D399) else Color(0xFFF87171),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            if (opt.resolutionType == "pass") "SANS Resolution" else "Required Rectification",
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White,
                                            fontSize = 12.sp
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    opt.remedySteps.forEach { step ->
                                        Text("• $step", color = Color(0xFFE2E8F0), fontSize = 11.sp, modifier = Modifier.padding(vertical = 1.dp))
                                    }
                                    opt.sansRef?.let { ref ->
                                        Text("Ref: $ref", color = Color(0xFF93C5FD), fontSize = 10.sp, fontFamily = FontFamily.Monospace, modifier = Modifier.padding(top = 4.dp))
                                    }
                                }
                            }
                        } else {
                            Button(
                                onClick = {
                                    opt.nextNodeId?.let { nextId ->
                                        currentNodeId = nextId
                                        stepHistory = stepHistory + nextId
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                            ) {
                                Text("Select & Proceed", fontSize = 12.sp)
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(14.dp))
                            }
                        }
                    }
                }
            }

            // Restart Button
            if (stepHistory.size > 1) {
                item {
                    OutlinedButton(
                        onClick = {
                            currentNodeId = currentTree.rootNodeId
                            stepHistory = listOf(currentTree.rootNodeId)
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Restart Decision Tree", fontSize = 12.sp)
                    }
                }
            }

            // Interactive Tool: Compressor Terminal Resistance Checker (Common, Run, Start)
            item {
                var rcrText by remember { mutableStateOf("3.2") }
                var rcsText by remember { mutableStateOf("6.8") }
                var rrsText by remember { mutableStateOf("10.0") }
                val rcr = rcrText.toDoubleOrNull() ?: 3.2
                val rcs = rcsText.toDoubleOrNull() ?: 6.8
                val rrs = rrsText.toDoubleOrNull() ?: 10.0
                val expectedRrs = rcr + rcs
                val diffPercent = if (rrs > 0) abs(rrs - expectedRrs) / rrs * 100.0 else 0.0
                val isWindingBalanced = diffPercent <= 5.0 && rcs > rcr

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text("HVAC Compressor Winding Tester (C-R-S)", fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8), fontSize = 13.sp)
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = if (isWindingBalanced) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                            ) {
                                Text(
                                    if (isWindingBalanced) "WINDINGS PASS" else "WINDING FAULT",
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                    color = if (isWindingBalanced) Color(0xFF34D399) else Color(0xFFF87171),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp
                                )
                            }
                        }
                        Text("Rule: R(CR) + R(CS) = R(RS) and R(CS) > R(CR)", fontSize = 11.sp, color = Color(0xFF94A3B8), fontFamily = FontFamily.Monospace)

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = rcrText,
                                onValueChange = { rcrText = it },
                                label = { Text("R(CR) Run Ω") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = rcsText,
                                onValueChange = { rcsText = it },
                                label = { Text("R(CS) Start Ω") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = rrsText,
                                onValueChange = { rrsText = it },
                                label = { Text("R(RS) Total Ω") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Text(
                            if (isWindingBalanced)
                                "Healthy Single-Phase Compressor Motor: Run Winding (%.1f Ω) + Start Winding (%.1f Ω) = %.1f Ω (Measured: %.1f Ω, Deviation: %.1f%%)".format(rcr, rcs, expectedRrs, rrs, diffPercent)
                            else
                                "Defect Detected: Windings deviate by %.1f%% or Start (%.1f Ω) <= Run (%.1f Ω). Possible turn-to-turn short or damaged winding!".format(diffPercent, rcs, rcr),
                            color = if (isWindingBalanced) Color(0xFF34D399) else Color(0xFFF87171),
                            fontSize = 11.sp
                        )
                    }
                }
            }

            // Interactive Tool: 50Hz RSA Capacitor Microfarad Tester
            item {
                var capVoltageText by remember { mutableStateOf("230") }
                var capCurrentText by remember { mutableStateOf("2.6") }
                val vCap = capVoltageText.toDoubleOrNull() ?: 230.0
                val iCap = capCurrentText.toDoubleOrNull() ?: 2.6
                // RSA 50Hz: C (uF) = (I * 2650) / V
                val calcUf = if (vCap > 0) (iCap * 2650.0) / vCap else 0.0

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text("50Hz Capacitor Tester [C = (I × 2650) / V]", fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8), fontSize = 13.sp)
                            Text("%.1f µF".format(calcUf), fontWeight = FontWeight.Black, color = Color(0xFFFBBF24), fontSize = 16.sp, fontFamily = FontFamily.Monospace)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = capVoltageText,
                                onValueChange = { capVoltageText = it },
                                label = { Text("Capacitor Volts (V)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                            OutlinedTextField(
                                value = capCurrentText,
                                onValueChange = { capCurrentText = it },
                                label = { Text("Capacitor Amps (A)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                modifier = Modifier.weight(1f)
                            )
                        }
                        Text("Calculated Capacitance: %.1f µF at 50Hz. Compare with capacitor label rating (±5% tolerance).".format(calcUf), fontSize = 11.sp, color = Color(0xFF94A3B8))
                    }
                }
            }

            // Bonus Tool: 3-Phase Unbalance Calculator
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Three-Phase Voltage Unbalance Calculator", fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8), fontSize = 13.sp)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Unbalance: %.1f%%".format(unbalancePercent), fontWeight = FontWeight.Bold, color = if (isUnbalanceAlert) Color(0xFFF87171) else Color(0xFF34D399), fontSize = 13.sp)
                            Text(if (isUnbalanceAlert) "EXCESSIVE (>2%)" else "COMPLIANT (<=2%)", color = if (isUnbalanceAlert) Color(0xFFF87171) else Color(0xFF34D399), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(
                            "Avg: %.1fV • Max Dev: %.1fV • Winding Temp Rise: ~%d%%".format(
                                vAvg, maxDev, (2 * unbalancePercent.pow(2)).roundToInt()
                            ),
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }
}

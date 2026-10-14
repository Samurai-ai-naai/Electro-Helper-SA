package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.electroassistant.sa.calculator.*
import com.electroassistant.sa.viewmodel.CableSizingViewModel
import com.electroassistant.sa.viewmodel.CableSubTab

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CableSizingScreen(
    viewModel: CableSizingViewModel = remember { CableSizingViewModel() }
) {
    val uiState by viewModel.uiState.collectAsState()
    val cableResult = uiState.cableResult

    // Local string buffers for smooth typing
    var loadWattsText by remember(uiState.loadWatts) { mutableStateOf((uiState.loadWatts / 1000.0).toString()) }
    var lengthMetersText by remember(uiState.lengthMeters) { mutableStateOf(uiState.lengthMeters.toInt().toString()) }
    var motorKwText by remember(uiState.motorKw) { mutableStateOf(uiState.motorKw.toString()) }
    var pfKwText by remember(uiState.pfActiveKw) { mutableStateOf(uiState.pfActiveKw.toString()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("SANS 10142 Electrical Calculators", fontWeight = FontWeight.Bold) },
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
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Sub-utility Navigation Strip
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(
                        CableSubTab.CABLE_SIZING to "Cables",
                        CableSubTab.MOTOR_CAPACITORS to "Motors",
                        CableSubTab.POWER_FACTOR to "P.F. / kVAR",
                        CableSubTab.RESISTOR_DECODER to "Resistors"
                    ).forEach { (tab, label) ->
                        FilterChip(
                            selected = uiState.activeSubTab == tab,
                            onClick = { viewModel.selectSubTab(tab) },
                            label = { Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Color(0xFF0284C7),
                                selectedLabelColor = Color.White,
                                containerColor = Color(0xFF1E293B),
                                labelColor = Color(0xFF94A3B8)
                            )
                        )
                    }
                }
            }

            when (uiState.activeSubTab) {
                CableSubTab.CABLE_SIZING -> {
                    // Compliance Summary Card
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = if (cableResult.isVoltageDropCompliant) Color(0xFF1E293B) else Color(0xFF450A0A)
                            ),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "SANS 10142-1 CABLE SIZING",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF94A3B8)
                                        )
                                        Text(
                                            text = "${cableResult.selectedCableSizeMm2} mm² Copper",
                                            fontSize = 24.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color.White
                                        )
                                    }
                                    Surface(
                                        color = if (cableResult.isVoltageDropCompliant) Color(0xFF064E3B) else Color(0xFF7F1D1D),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            Icon(
                                                if (cableResult.isVoltageDropCompliant) Icons.Default.CheckCircle else Icons.Default.Warning,
                                                contentDescription = null,
                                                tint = if (cableResult.isVoltageDropCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                                modifier = Modifier.size(16.dp)
                                            )
                                            Text(
                                                if (cableResult.isVoltageDropCompliant) "SANS PASS (≤5%)" else "VOLT DROP FAIL (>5%)",
                                                color = if (cableResult.isVoltageDropCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }

                                Divider(color = Color(0xFF334155))

                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Column {
                                        Text("Design Load (Ib)", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                        Text("%.1f A".format(cableResult.designCurrentIb), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = FontFamily.Monospace)
                                    }
                                    Column {
                                        Text("Derated Cap (Iz)", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                        Text("%.1f A".format(cableResult.cableDeratedCapacityAmps), fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                                    }
                                    Column {
                                        Text("Volt Drop (ΔV)", fontSize = 11.sp, color = Color(0xFF94A3B8))
                                        Text(
                                            "%.2f V (%.1f%%)".format(cableResult.voltageDropVolts, cableResult.voltageDropPercent),
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (cableResult.isVoltageDropCompliant) Color(0xFF34D399) else Color(0xFFF87171),
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFF0F172A), RoundedCornerShape(8.dp))
                                        .padding(8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Recommended MCB: ${cableResult.recommendedMcbRatingAmps}A", fontSize = 12.sp, color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold)
                                    Text("Min Earth: ${cableResult.recommendedEarthConductorSizeMm2} mm² Cu", fontSize = 12.sp, color = Color(0xFF34D399), fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    // Cable Parameters Form
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                Text("Installation & Load Parameters", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)

                                // Supply Type Selection
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = { viewModel.updateCableParameters(supplyType = SupplyType.SINGLE_PHASE) },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (uiState.supplyType == SupplyType.SINGLE_PHASE) Color(0xFF0284C7) else Color(0xFF334155)
                                        ),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text("1-Phase (230V)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                    Button(
                                        onClick = { viewModel.updateCableParameters(supplyType = SupplyType.THREE_PHASE) },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (uiState.supplyType == SupplyType.THREE_PHASE) Color(0xFF0284C7) else Color(0xFF334155)
                                        ),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text("3-Phase (400V)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                // Load Power (kW)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Load Power: %.1f kW".format(uiState.loadWatts / 1000.0), fontSize = 12.sp, color = Color(0xFFE2E8F0))
                                    OutlinedTextField(
                                        value = loadWattsText,
                                        onValueChange = {
                                            loadWattsText = it
                                            val kw = it.toDoubleOrNull()
                                            if (kw != null && kw > 0) viewModel.updateCableParameters(loadWatts = kw * 1000.0)
                                        },
                                        label = { Text("kW") },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                        singleLine = true,
                                        modifier = Modifier.width(90.dp)
                                    )
                                }
                                Slider(
                                    value = (uiState.loadWatts / 1000.0).toFloat().coerceIn(0.5f, 60.0f),
                                    onValueChange = { viewModel.updateCableParameters(loadWatts = it.toDouble() * 1000.0) },
                                    valueRange = 0.5f..60.0f
                                )

                                // Route Length (Meters)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Route Length: ${uiState.lengthMeters.toInt()} meters", fontSize = 12.sp, color = Color(0xFFE2E8F0))
                                    OutlinedTextField(
                                        value = lengthMetersText,
                                        onValueChange = {
                                            lengthMetersText = it
                                            val m = it.toDoubleOrNull()
                                            if (m != null && m > 0) viewModel.updateCableParameters(lengthMeters = m)
                                        },
                                        label = { Text("Meters") },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        singleLine = true,
                                        modifier = Modifier.width(90.dp)
                                    )
                                }
                                Slider(
                                    value = uiState.lengthMeters.toFloat().coerceIn(5f, 150f),
                                    onValueChange = { viewModel.updateCableParameters(lengthMeters = it.toDouble()) },
                                    valueRange = 5f..150f
                                )

                                // Installation Method
                                Text("Installation Method (SANS 10142-1):", fontSize = 12.sp, color = Color(0xFF94A3B8))
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf(
                                        InstallationMethod.CONDUIT_SURFACE_TRUNKING to "Surface Conduit",
                                        InstallationMethod.CONDUIT_INSULATED to "In Thermal Wall",
                                        InstallationMethod.CLIPPED_DIRECT_TRAY to "Clipped / Tray",
                                        InstallationMethod.UNDERGROUND_DUCT to "Underground SWA"
                                    ).forEach { (method, label) ->
                                        FilterChip(
                                            selected = uiState.installationMethod == method,
                                            onClick = { viewModel.updateCableParameters(installationMethod = method) },
                                            label = { Text(label, fontSize = 10.sp) }
                                        )
                                    }
                                }

                                // Insulation Type
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    FilterChip(
                                        selected = uiState.insulationType == InsulationType.PVC_70,
                                        onClick = { viewModel.updateCableParameters(insulationType = InsulationType.PVC_70) },
                                        label = { Text("70°C Copper PVC", fontSize = 11.sp) }
                                    )
                                    FilterChip(
                                        selected = uiState.insulationType == InsulationType.XLPE_90,
                                        onClick = { viewModel.updateCableParameters(insulationType = InsulationType.XLPE_90) },
                                        label = { Text("90°C Copper XLPE", fontSize = 11.sp) }
                                    )
                                }

                                // Ambient Temperature Ct
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Ambient Temp (Ct): ${uiState.ambientTemp.toInt()}°C", fontSize = 12.sp, color = Color(0xFFE2E8F0))
                                    Text("Ct Factor: %.2f".format(cableResult.deratingFactorCt), fontSize = 12.sp, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                                }
                                Slider(
                                    value = uiState.ambientTemp.toFloat().coerceIn(20f, 55f),
                                    onValueChange = { viewModel.updateCableParameters(ambientTemp = it.toDouble()) },
                                    valueRange = 20f..55f,
                                    steps = 6
                                )

                                // Grouping Circuits Cg
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Bundled Circuits (Cg): ${uiState.groupingCount}", fontSize = 12.sp, color = Color(0xFFE2E8F0))
                                    Text("Cg Factor: %.2f".format(cableResult.deratingFactorCg), fontSize = 12.sp, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                                }
                                Slider(
                                    value = uiState.groupingCount.toFloat(),
                                    onValueChange = { viewModel.updateCableParameters(groupingCount = it.toInt()) },
                                    valueRange = 1f..10f,
                                    steps = 8
                                )
                            }
                        }
                    }
                }

                CableSubTab.MOTOR_CAPACITORS -> {
                    // Motor Run & Start Capacitor Calculator
                    item {
                        val mot = uiState.motorResult
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                Text("Motor Run & Start Capacitor Calculator", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Sizes continuous run capacitors and start hard-start kits for 1-phase compressor and fan motors (50Hz SANS).", fontSize = 12.sp, color = Color(0xFF94A3B8))

                                // Result Banner
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFF0F172A), RoundedCornerShape(12.dp))
                                        .padding(14.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Run Capacitor (Continuous):", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text("${mot.runCapacitanceUf} µF", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Start Capacitor Range (Kit):", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text("${mot.startCapacitanceMinUf.toInt()} – ${mot.startCapacitanceMaxUf.toInt()} µF", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFBBF24), fontFamily = FontFamily.Monospace)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Min Working AC Voltage:", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text("${mot.recommendedWorkingVoltageVac}V AC", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF34D399), fontFamily = FontFamily.Monospace)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Estimated Full Load Amps (FLA):", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text("${mot.estimatedFullLoadAmps} A", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White, fontFamily = FontFamily.Monospace)
                                    }
                                }

                                // Inputs
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Motor Power: %.2f kW (%.1f HP)".format(uiState.motorKw, mot.motorPowerHp), fontSize = 13.sp, color = Color.White)
                                    OutlinedTextField(
                                        value = motorKwText,
                                        onValueChange = {
                                            motorKwText = it
                                            val kw = it.toDoubleOrNull()
                                            if (kw != null && kw > 0) viewModel.updateMotorCapacitor(kw = kw)
                                        },
                                        label = { Text("kW") },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                        singleLine = true,
                                        modifier = Modifier.width(90.dp)
                                    )
                                }
                                Slider(
                                    value = uiState.motorKw.toFloat().coerceIn(0.2f, 7.5f),
                                    onValueChange = { viewModel.updateMotorCapacitor(kw = it.toDouble()) },
                                    valueRange = 0.2f..7.5f
                                )
                            }
                        }
                    }
                }

                CableSubTab.POWER_FACTOR -> {
                    // Power Factor & Reactive Power Correction
                    item {
                        val pf = uiState.pfResult
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                Text("Power Factor & kVAR Correction", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                Text("Sizes automatic capacitor banks to eliminate Eskom maximum demand penalties (cos φ < 0.95).", fontSize = 12.sp, color = Color(0xFF94A3B8))

                                // Results
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFF0F172A), RoundedCornerShape(12.dp))
                                        .padding(14.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Required Capacitor Bank:", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text("${pf.requiredCapacitorBankKvar} kVAR", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Capacitance (Delta):", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text("${pf.requiredCapacitanceUf} µF", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF34D399), fontFamily = FontFamily.Monospace)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Current Reduction:", fontSize = 13.sp, color = Color(0xFF94A3B8))
                                        Text("${pf.currentBeforeAmps}A → ${pf.currentAfterAmps}A (-${pf.currentSavedAmps}A)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFBBF24), fontFamily = FontFamily.Monospace)
                                    }
                                }

                                // Active Power Input
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Active Load: ${uiState.pfActiveKw.toInt()} kW", fontSize = 13.sp, color = Color.White)
                                    OutlinedTextField(
                                        value = pfKwText,
                                        onValueChange = {
                                            pfKwText = it
                                            val kw = it.toDoubleOrNull()
                                            if (kw != null && kw > 0) viewModel.updatePowerFactor(kw = kw)
                                        },
                                        label = { Text("kW") },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                                        singleLine = true,
                                        modifier = Modifier.width(90.dp)
                                    )
                                }

                                // Initial cos phi
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Initial Power Factor: %.2f".format(uiState.pfInitialCos), fontSize = 12.sp, color = Color(0xFFE2E8F0))
                                }
                                Slider(
                                    value = uiState.pfInitialCos.toFloat(),
                                    onValueChange = { viewModel.updatePowerFactor(initialCos = it.toDouble()) },
                                    valueRange = 0.50f..0.95f,
                                    steps = 9
                                )

                                // Target cos phi
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Target Power Factor: %.2f".format(uiState.pfTargetCos), fontSize = 12.sp, color = Color(0xFFE2E8F0))
                                }
                                Slider(
                                    value = uiState.pfTargetCos.toFloat(),
                                    onValueChange = { viewModel.updatePowerFactor(targetCos = it.toDouble()) },
                                    valueRange = 0.90f..1.00f,
                                    steps = 10
                                )
                            }
                        }
                    }
                }

                CableSubTab.RESISTOR_DECODER -> {
                    // Resistor Color Decoder
                    item {
                        val res = uiState.resistorResult
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                Text("Resistor Color Code Decoder", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)

                                // Result Box
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFF0F172A), RoundedCornerShape(12.dp))
                                        .padding(14.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("Decoded Nominal Value:", fontSize = 12.sp, color = Color(0xFF94A3B8))
                                    Text(
                                        res.formattedResistance + " ±${res.tolerancePercent}%",
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color(0xFF38BDF8),
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        "Min: %.2f Ω | Max: %.2f Ω".format(res.minResistanceOhms, res.maxResistanceOhms),
                                        fontSize = 11.sp,
                                        color = Color(0xFF94A3B8),
                                        fontFamily = FontFamily.Monospace
                                    )
                                }

                                // Band 1 Selector
                                Text("1st Band: ${getBandColorName(uiState.band1)}", fontSize = 12.sp, color = Color.White)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    (1..9).forEach { d ->
                                        Surface(
                                            modifier = Modifier
                                                .size(28.dp)
                                                .clickable { viewModel.updateResistorBands(b1 = d) }
                                                .border(
                                                    width = if (uiState.band1 == d) 2.dp else 0.dp,
                                                    color = Color.White,
                                                    shape = RoundedCornerShape(4.dp)
                                                ),
                                            color = getBandColor(d),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {}
                                    }
                                }

                                // Band 2 Selector
                                Text("2nd Band: ${getBandColorName(uiState.band2)}", fontSize = 12.sp, color = Color.White)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    (0..9).forEach { d ->
                                        Surface(
                                            modifier = Modifier
                                                .size(28.dp)
                                                .clickable { viewModel.updateResistorBands(b2 = d) }
                                                .border(
                                                    width = if (uiState.band2 == d) 2.dp else 0.dp,
                                                    color = Color.White,
                                                    shape = RoundedCornerShape(4.dp)
                                                ),
                                            color = getBandColor(d),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {}
                                    }
                                }

                                // Multiplier
                                Text("Multiplier: 10^${uiState.multiplierExp} (${getBandColorName(uiState.multiplierExp)})", fontSize = 12.sp, color = Color.White)
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    (0..6).forEach { d ->
                                        Surface(
                                            modifier = Modifier
                                                .size(28.dp)
                                                .clickable { viewModel.updateResistorBands(mult = d) }
                                                .border(
                                                    width = if (uiState.multiplierExp == d) 2.dp else 0.dp,
                                                    color = Color.White,
                                                    shape = RoundedCornerShape(4.dp)
                                                ),
                                            color = getBandColor(d),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun getBandColor(digit: Int): Color {
    return when (digit) {
        0 -> Color(0xFF000000) // Black
        1 -> Color(0xFF8B4513) // Brown
        2 -> Color(0xFFDC2626) // Red
        3 -> Color(0xFFEA580C) // Orange
        4 -> Color(0xFFEAB308) // Yellow
        5 -> Color(0xFF16A34A) // Green
        6 -> Color(0xFF2563EB) // Blue
        7 -> Color(0xFF9333EA) // Violet
        8 -> Color(0xFF6B7280) // Grey
        9 -> Color(0xFFF8FAFC) // White
        else -> Color.Gray
    }
}

private fun getBandColorName(digit: Int): String {
    return when (digit) {
        0 -> "Black (0)"
        1 -> "Brown (1)"
        2 -> "Red (2)"
        3 -> "Orange (3)"
        4 -> "Yellow (4)"
        5 -> "Green (5)"
        6 -> "Blue (6)"
        7 -> "Violet (7)"
        8 -> "Grey (8)"
        9 -> "White (9)"
        else -> "N/A"
    }
}

package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Search
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

data class TerminalItem(
    val pin: String,
    val label: String,
    val function: String,
    val voltageRating: String = "230V AC",
    val wireColorHint: String = "Brown"
)

data class HardwareDevice(
    val id: String,
    val category: String,
    val title: String,
    val subtitle: String,
    val manufacturer: String,
    val terminals: List<TerminalItem>,
    val fieldNotes: List<String>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PinoutViewerScreen() {
    val sampleDevices = remember {
        listOf(
            HardwareDevice(
                id = "eliwell_974",
                category = "HVAC",
                title = "Eliwell IDPlus 974",
                subtitle = "Dual Probe, 3-Relay (Compressor, Defrost, Fan)",
                manufacturer = "Eliwell / Invensys",
                terminals = listOf(
                    TerminalItem("1", "Relay Common", "Live 230V feed for relays", "230V AC", "Brown"),
                    TerminalItem("2", "OUT 1 (Compressor)", "Compressor contactor coil (8A / 2HP)", "230V AC", "Black"),
                    TerminalItem("3", "OUT 2 (Defrost)", "Defrost electric heater contactor (8A)", "230V AC", "Orange"),
                    TerminalItem("4", "OUT 3 (Evap Fan)", "Evaporator fan motor relay (5A)", "230V AC", "Yellow"),
                    TerminalItem("6", "Power Supply (L)", "Instrument power Live input", "230V AC", "Brown"),
                    TerminalItem("7", "Power Supply (N)", "Instrument power Neutral return", "0V Neutral", "Blue"),
                    TerminalItem("8", "Probe Common", "Analogue ground for NTC probes", "SELV", "White"),
                    TerminalItem("9", "Pb1 (Room Air)", "Cabinet air temperature NTC probe", "SELV", "Grey"),
                    TerminalItem("10", "Pb2 (Evap Coil)", "Defrost termination NTC sensor", "SELV", "Grey")
                ),
                fieldNotes = listOf(
                    "Bridge terminal 1 to 6 if all relays are powered from the same control phase breaker.",
                    "SANS 10142-1 Clause 6.1.4: Never run probe signal cables in the same conduit as 230V motor lines.",
                    "Defrost termination parameter dLt sets the coil temperature to terminate electric heating."
                )
            ),
            HardwareDevice(
                id = "dixell_xr60cx",
                category = "HVAC",
                title = "Dixell XR60CX",
                subtitle = "Digital Controller with 3 Relays, 2 Probes & TTL Port",
                manufacturer = "Emerson / Dixell",
                terminals = listOf(
                    TerminalItem("1", "Line (Relay Feed)", "Live feed to compressor and defrost relays", "230V AC", "Brown"),
                    TerminalItem("2", "Compressor OUT", "Normally open contact to compressor contactor (20A)", "230V AC", "Black"),
                    TerminalItem("3", "Defrost OUT", "Defrost electric heater contact (8A)", "230V AC", "Orange"),
                    TerminalItem("4", "Fan Common", "Evaporator fan power input", "230V AC", "Brown"),
                    TerminalItem("5", "Fan OUT", "Evaporator fan motor contact", "230V AC", "Yellow"),
                    TerminalItem("6", "Power Supply (L)", "Instrument power supply Live", "230V AC", "Brown"),
                    TerminalItem("7", "Power Supply (N)", "Instrument power supply Neutral", "0V Neutral", "Blue")
                ),
                fieldNotes = listOf(
                    "Press and hold SET + DOWN for 3 seconds to access Hidden Parameters (Pr2).",
                    "NTC 10k probe measures 10kΩ at 25°C, rising to ~32.6kΩ at 0°C."
                )
            ),
            HardwareDevice(
                id = "carel_easy",
                category = "HVAC",
                title = "Carel Easy (PJEZ / PJS)",
                subtitle = "Refrigerated Display & Cold Storage Controller",
                manufacturer = "Carel",
                terminals = listOf(
                    TerminalItem("1", "Power Supply (L)", "Live 230V supply", "230V AC", "Brown"),
                    TerminalItem("2", "Power Supply (N)", "Neutral 230V return", "0V Neutral", "Blue"),
                    TerminalItem("7", "Relay 1 (Compressor)", "Compressor contact (12A / 2HP)", "230V AC", "Black"),
                    TerminalItem("8", "Relay 1 Common", "Compressor relay feed", "230V AC", "Brown"),
                    TerminalItem("9", "Relay 2 (Defrost)", "Defrost contact (8A)", "230V AC", "Orange"),
                    TerminalItem("11", "Relay 3 (Fan)", "Evaporator fan motor contact (5A)", "230V AC", "Yellow")
                ),
                fieldNotes = listOf(
                    "Ensure parameter /P1 is set to 0 for standard NTC or 1 for PTC probes."
                )
            ),
            HardwareDevice(
                id = "hard_start_521",
                category = "Relays & Starters",
                title = "5-2-1 Compressor Hard-Start Kit",
                subtitle = "Potential Relay & Dual Capacitor Wiring",
                manufacturer = "Universal / Mars",
                terminals = listOf(
                    TerminalItem("Pin 1", "Relay Contact", "Connects to Start Capacitor with bleed resistor", "370V AC", "Black"),
                    TerminalItem("Pin 2", "Relay Coil / Contact", "Connects to Compressor START (S) and Run Cap HERM", "Back-EMF (300V+)", "Yellow"),
                    TerminalItem("Pin 5", "Relay Coil Return", "Connects to Compressor COMMON (C) / Line Live", "230V AC", "Red")
                ),
                fieldNotes = listOf(
                    "Potential relay coil between Pin 2 and Pin 5 measures generated Back-EMF.",
                    "At ~80% speed, Back-EMF climbs above 240V-300V, exciting coil 2-5 and opening contact 1-2.",
                    "Always verify winding resistance: R(CR) + R(CS) = R(RS)."
                )
            ),
            HardwareDevice(
                id = "omron_8pin",
                category = "Relays & Starters",
                title = "Omron H3CR / AH3-3 Octal 8-Pin Relay",
                subtitle = "Multi-Function Industrial DIN Timer Relay",
                manufacturer = "Omron / Fuji Electric",
                terminals = listOf(
                    TerminalItem("Pin 2", "Coil A1 (Line L)", "Timer coil power input Live", "230V AC", "Brown"),
                    TerminalItem("Pin 7", "Coil A2 (Neutral N)", "Timer coil power return Neutral", "0V Neutral", "Blue"),
                    TerminalItem("Pin 1", "Contact 1 COM", "Timed changeover pole 1", "250V AC", "Grey"),
                    TerminalItem("Pin 3", "Contact 1 NO", "Normally open timed contact", "250V AC", "Yellow"),
                    TerminalItem("Pin 4", "Contact 1 NC", "Normally closed timed contact", "250V AC", "Orange"),
                    TerminalItem("Pin 8", "Contact 2 COM", "Timed changeover pole 2", "250V AC", "White"),
                    TerminalItem("Pin 6", "Contact 2 NO", "Normally open timed contact", "250V AC", "Yellow"),
                    TerminalItem("Pin 5", "Contact 2 NC", "Normally closed timed contact", "250V AC", "Orange")
                ),
                fieldNotes = listOf(
                    "In compressor anti-short-cycle circuits, configure 3-5 minute delay-on-break to allow refrigerant pressures to equalize."
                )
            ),
            HardwareDevice(
                id = "inverter_bms",
                category = "Comms & Power",
                title = "Inverter BMS CAN & RS485 Pinouts",
                subtitle = "Sunsynk, Deye, Victron to Pylontech/Hubble",
                manufacturer = "Sunsynk / Victron / Deye",
                terminals = listOf(
                    TerminalItem("Pin 4", "CAN-High (CAN-H)", "Sunsynk / Deye CANbus positive", "SELV Data", "Blue"),
                    TerminalItem("Pin 5", "CAN-Low (CAN-L)", "Sunsynk / Deye CANbus negative", "SELV Data", "White/Blue"),
                    TerminalItem("Pin 7", "RS485-A / Victron CAN-H", "Modbus A or Victron VE.Can High", "SELV Data", "White/Brown"),
                    TerminalItem("Pin 8", "RS485-B / Victron CAN-L", "Modbus B or Victron VE.Can Low", "SELV Data", "Brown")
                ),
                fieldNotes = listOf(
                    "Pylontech custom cable: Pin 4 on Sunsynk connects to Pin 2 on Pylontech; Pin 5 connects to Pin 1.",
                    "SANS 10142-2: Inverter must safely shut down if BMS communication drops."
                )
            ),
            HardwareDevice(
                id = "rj45_wiring",
                category = "Comms & Power",
                title = "RJ45 Modular Plug (T568A / T568B)",
                subtitle = "Network & Inverter Comms Twisted Pair Standards",
                manufacturer = "ANSI/TIA-568",
                terminals = listOf(
                    TerminalItem("Pin 1", "T568B: W/ORG • T568A: W/GRN", "TX+ Transmit positive", "Data", "White/Orange"),
                    TerminalItem("Pin 2", "T568B: ORG • T568A: GRN", "TX- Transmit negative", "Data", "Orange"),
                    TerminalItem("Pin 3", "T568B: W/GRN • T568A: W/ORG", "RX+ Receive positive", "Data", "White/Green"),
                    TerminalItem("Pin 4", "Blue", "CAN-High / Data", "Data", "Blue"),
                    TerminalItem("Pin 5", "White/Blue", "CAN-Low / Data", "Data", "White/Blue"),
                    TerminalItem("Pin 6", "T568B: GRN • T568A: ORG", "RX- Receive negative", "Data", "Green"),
                    TerminalItem("Pin 7", "White/Brown", "RS485-A / Data", "Data", "White/Brown"),
                    TerminalItem("Pin 8", "Brown", "RS485-B / GND", "Data", "Brown")
                ),
                fieldNotes = listOf(
                    "T568B is the standard for South African commercial and residential installations."
                )
            )
        )
    }

    var selectedCategory by remember { mutableStateOf("All") }
    var selectedDevice by remember { mutableStateOf(sampleDevices.first()) }

    // Compressor CSR Auto-Validator Inputs
    var rcr by remember { mutableStateOf(3.2) }
    var rcs by remember { mutableStateOf(5.8) }
    var rrs by remember { mutableStateOf(9.0) }
    val formulaSum = rcr + rcs
    val diff = kotlin.math.abs(formulaSum - rrs)
    val isCsrValid = diff <= 0.3

    val categories = listOf("All", "HVAC", "Relays & Starters", "Comms & Power")
    val filteredDevices = sampleDevices.filter {
        selectedCategory == "All" || it.category == selectedCategory
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Hardware Pinouts & Schematics", fontWeight = FontWeight.Bold) },
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
            // Category Chips
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    categories.forEach { cat ->
                        FilterChip(
                            selected = selectedCategory == cat,
                            onClick = { selectedCategory = cat },
                            label = { Text(cat, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
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

            // Device Picker Carousel
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    filteredDevices.take(3).forEach { dev ->
                        Button(
                            onClick = { selectedDevice = dev },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedDevice.id == dev.id) Color(0xFF0284C7) else Color(0xFF1E293B)
                            ),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(dev.title.split(" ").take(2).joinToString(" "), fontSize = 11.sp, maxLines = 1)
                        }
                    }
                }
            }

            // Selected Device Header Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(selectedDevice.title, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
                        Text(selectedDevice.subtitle, color = Color(0xFF94A3B8), fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp))
                        Text(
                            "Manufacturer: ${selectedDevice.manufacturer}",
                            color = Color(0xFF38BDF8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier.padding(top = 6.dp)
                        )
                    }
                }
            }

            // CSR Auto-Validator (when viewing hard-start or compressor)
            if (selectedDevice.id == "hard_start_521") {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF172554)),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Compressor Winding Resistance Auto-Validator", fontWeight = FontWeight.Bold, color = Color(0xFF93C5FD), fontSize = 13.sp)
                            Text("Law: R(Common-Run) + R(Common-Start) = R(Run-Start)", color = Color(0xFFDBEAFE), fontSize = 11.sp)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("R(CR) + R(CS) = %.1fΩ".format(formulaSum), color = Color.White, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                                Text("R(RS) = %.1fΩ".format(rrs), color = Color.White, fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                            }
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = if (isCsrValid) Color(0xFF064E3B) else Color(0xFF7F1D1D)
                            ) {
                                Text(
                                    if (isCsrValid) "✓ Winding resistance formula valid (Diff: %.2fΩ)".format(diff)
                                    else "✗ Winding formula mismatch! Possible shorted turns (Diff: %.2fΩ)".format(diff),
                                    modifier = Modifier.padding(8.dp),
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // Terminals List Header
            item {
                Text(
                    "Terminal Wiring Matrix (${selectedDevice.terminals.size} Pins)",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 14.sp
                )
            }

            items(selectedDevice.terminals) { term ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color(0xFF1E293B)
                        ) {
                            Text(
                                text = term.pin,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF38BDF8),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(term.label, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                            Text(term.function, color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }
                        Text(term.wireColorHint, color = Color(0xFFFBBF24), fontSize = 11.sp, fontFamily = FontFamily.Monospace)
                    }
                }
            }

            // Field Notes
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Field Electrician Notes", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 12.sp)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        selectedDevice.fieldNotes.forEach { note ->
                            Text("• $note", color = Color(0xFFCBD5E1), fontSize = 11.sp, modifier = Modifier.padding(vertical = 1.dp))
                        }
                    }
                }
            }
        }
    }
}

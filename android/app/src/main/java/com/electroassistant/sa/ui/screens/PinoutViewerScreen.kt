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
                    TerminalItem("7", "Power Supply (N)", "Instrument power Neutral return", "0V Neutral", "Blue")
                ),
                fieldNotes = listOf(
                    "Bridge terminal 1 to 6 if all relays are powered from the same control phase breaker.",
                    "SANS 10142-1 Clause 6.1.4: Never run probe signal cables in the same conduit as 230V motor lines."
                )
            ),
            HardwareDevice(
                id = "hard_start_521",
                category = "Relays & Starters",
                title = "5-2-1 Compressor Hard-Start Kit",
                subtitle = "Potential Relay & Dual Capacitor Wiring",
                manufacturer = "Universal",
                terminals = listOf(
                    TerminalItem("Pin 1", "Relay Contact", "Connects to Start Capacitor with bleed resistor", "370V AC", "Black"),
                    TerminalItem("Pin 2", "Relay Coil / Contact", "Connects to Compressor START (S) and Run Cap HERM", "Back-EMF", "Yellow"),
                    TerminalItem("Pin 5", "Relay Coil Return", "Connects to Compressor COMMON (C) / Line Live", "230V AC", "Red")
                ),
                fieldNotes = listOf(
                    "Back-EMF across start winding drops start capacitor out at 75-80% speed.",
                    "Always verify winding resistance: R(CR) + R(CS) = R(RS)."
                )
            )
        )
    }

    var selectedDevice by remember { mutableStateOf(sampleDevices.first()) }

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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(selectedDevice.title, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
                        Text(selectedDevice.subtitle, color = Color(0xFF94A3B8), fontSize = 12.sp)
                    }
                }
            }

            items(selectedDevice.terminals) { term ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF111827))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Pin ${term.pin}: ${term.label}", fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.weight(1f))
                        Text(term.wireColorHint, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace)
                    }
                }
            }
        }
    }
}

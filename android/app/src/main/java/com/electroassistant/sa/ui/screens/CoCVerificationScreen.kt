package com.electroassistant.sa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.electroassistant.sa.viewmodel.CoCVerificationViewModel
import com.electroassistant.sa.viewmodel.TestReadingItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CoCVerificationScreen(
    viewModel: CoCVerificationViewModel = remember { CoCVerificationViewModel() }
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("CoC Inspection Audit Sheet", fontWeight = FontWeight.Bold) },
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

            // Readings List Header
            item {
                Text(
                    "Circuit Test Readings (Clause 8.6)",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 15.sp
                )
            }

            items(uiState.readings) { item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
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
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Earth Continuity (Rpe): ${item.earthContinuityOhms} Ω (Max 0.20 Ω)",
                            fontSize = 12.sp,
                            color = if (item.isContinuityPass) Color(0xFF94A3B8) else Color(0xFFF87171),
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            "Insulation (500V): ${item.insulationPhaseNeutralMOhm} MΩ (Min 1.0 MΩ)",
                            fontSize = 12.sp,
                            color = if (item.isInsulationPnPass) Color(0xFF94A3B8) else Color(0xFFF87171),
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            "ELCB 30mA Trip Time: ${item.earthLeakageTripTimeMs} ms (Max 30 ms)",
                            fontSize = 12.sp,
                            color = if (item.isEarthLeakagePass) Color(0xFF94A3B8) else Color(0xFFF87171),
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        }
    }
}

package com.electroassistant.sa.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID
import kotlin.math.abs

enum class DbSupplyType {
    SINGLE_PHASE,
    THREE_PHASE
}

enum class SpdClass(val label: String, val rating: String) {
    CLASS_1("Type 1 (Class I)", "10/350 µs Lightning Current (25-50 kA)"),
    CLASS_2("Type 2 (Class II)", "8/20 µs Transient Surge (40 kA) - SANS Standard"),
    CLASS_3("Type 3 (Class III)", "1.2/50 µs Fine Protection for Sensitive Electronics")
}

data class DbCircuitItem(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val breakerRatingA: Int,
    val loadWatts: Double,
    val powerFactor: Double = 0.85,
    var phase: String = "L1", // "L1", "L2", "L3"
    val isRcd: Boolean = true,
    val cableSizeMm2: Double = 2.5
) {
    val currentAmps: Double
        get() = if (loadWatts > 0) loadWatts / (230.0 * powerFactor.coerceIn(0.5, 1.0)) else 0.0
}

data class DbDesignUiState(
    val supplyType: DbSupplyType = DbSupplyType.THREE_PHASE,
    val mainSwitchRatingA: Int = 80,
    val elcbRatingMa: Int = 30,
    val spdClass: SpdClass = SpdClass.CLASS_2,
    val dbTotalWays: Int = 24,
    val circuits: List<DbCircuitItem> = listOf(
        DbCircuitItem(id = "1", name = "Lights - Ground Floor", breakerRatingA = 10, loadWatts = 850.0, powerFactor = 0.95, phase = "L1", isRcd = false, cableSizeMm2 = 1.5),
        DbCircuitItem(id = "2", name = "Plugs - Kitchen & Dining", breakerRatingA = 20, loadWatts = 3400.0, powerFactor = 0.90, phase = "L2", isRcd = true, cableSizeMm2 = 2.5),
        DbCircuitItem(id = "3", name = "Plugs - Living Room & TV", breakerRatingA = 20, loadWatts = 2200.0, powerFactor = 0.95, phase = "L3", isRcd = true, cableSizeMm2 = 2.5),
        DbCircuitItem(id = "4", name = "Main Residential Geyser", breakerRatingA = 20, loadWatts = 3000.0, powerFactor = 1.00, phase = "L1", isRcd = false, cableSizeMm2 = 2.5),
        DbCircuitItem(id = "5", name = "Electric Stove & Oven", breakerRatingA = 35, loadWatts = 6500.0, powerFactor = 1.00, phase = "L2", isRcd = false, cableSizeMm2 = 6.0),
        DbCircuitItem(id = "6", name = "Cold Room Compressor", breakerRatingA = 25, loadWatts = 4200.0, powerFactor = 0.82, phase = "L3", isRcd = true, cableSizeMm2 = 4.0),
        DbCircuitItem(id = "7", name = "Workshop Aircon", breakerRatingA = 16, loadWatts = 2400.0, powerFactor = 0.85, phase = "L1", isRcd = true, cableSizeMm2 = 2.5),
        DbCircuitItem(id = "8", name = "Borehole Submersible", breakerRatingA = 16, loadWatts = 2200.0, powerFactor = 0.80, phase = "L2", isRcd = true, cableSizeMm2 = 2.5),
        DbCircuitItem(id = "9", name = "Sub-DB Outbuilding", breakerRatingA = 32, loadWatts = 4800.0, powerFactor = 0.90, phase = "L3", isRcd = true, cableSizeMm2 = 6.0)
    )
) {
    val l1Watts: Double get() = circuits.filter { it.phase == "L1" }.sumOf { it.loadWatts }
    val l2Watts: Double get() = circuits.filter { it.phase == "L2" }.sumOf { it.loadWatts }
    val l3Watts: Double get() = circuits.filter { it.phase == "L3" }.sumOf { it.loadWatts }
    val totalWatts: Double get() = l1Watts + l2Watts + l3Watts

    val l1Amps: Double get() = circuits.filter { it.phase == "L1" }.sumOf { it.currentAmps }
    val l2Amps: Double get() = circuits.filter { it.phase == "L2" }.sumOf { it.currentAmps }
    val l3Amps: Double get() = circuits.filter { it.phase == "L3" }.sumOf { it.currentAmps }

    val avgAmps: Double get() = (l1Amps + l2Amps + l3Amps) / 3.0

    val maxDeviationAmps: Double
        get() = maxOf(
            abs(l1Amps - avgAmps),
            abs(l2Amps - avgAmps),
            abs(l3Amps - avgAmps)
        )

    val imbalancePercent: Double
        get() = if (avgAmps > 0.0) (maxDeviationAmps / avgAmps) * 100.0 else 0.0

    val isImbalanceAlert: Boolean get() = imbalancePercent > 15.0

    // DIN Rail Used modules: Main Switch (3 or 4 poles) + ELCB (2 or 4 poles) + SPD (2 or 4 poles) + 1 pole per circuit
    val dinWaysUsed: Int
        get() = (if (supplyType == DbSupplyType.THREE_PHASE) 3 else 2) + // Main Switch
                (if (supplyType == DbSupplyType.THREE_PHASE) 4 else 2) + // ELCB
                (if (supplyType == DbSupplyType.THREE_PHASE) 4 else 2) + // SPD
                circuits.size
}

class DbDesignViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(DbDesignUiState())
    val uiState: StateFlow<DbDesignUiState> = _uiState.asStateFlow()

    fun setSupplyType(type: DbSupplyType) {
        _uiState.update { current ->
            if (type == DbSupplyType.SINGLE_PHASE) {
                current.copy(
                    supplyType = type,
                    circuits = current.circuits.map { it.copy(phase = "L1") }
                )
            } else {
                current.copy(supplyType = type)
            }
        }
    }

    fun setMainSwitchRating(rating: Int) {
        _uiState.update { it.copy(mainSwitchRatingA = rating) }
    }

    fun setSpdClass(spd: SpdClass) {
        _uiState.update { it.copy(spdClass = spd) }
    }

    fun setDbTotalWays(ways: Int) {
        _uiState.update { it.copy(dbTotalWays = ways) }
    }

    fun toggleCircuitPhase(id: String) {
        _uiState.update { current ->
            if (current.supplyType == DbSupplyType.SINGLE_PHASE) return@update current
            current.copy(
                circuits = current.circuits.map { c ->
                    if (c.id == id) {
                        val nextPhase = when (c.phase) {
                            "L1" -> "L2"
                            "L2" -> "L3"
                            else -> "L1"
                        }
                        c.copy(phase = nextPhase)
                    } else c
                }
            )
        }
    }

    fun setCircuitPhase(id: String, phase: String) {
        _uiState.update { current ->
            current.copy(
                circuits = current.circuits.map {
                    if (it.id == id) it.copy(phase = phase) else it
                }
            )
        }
    }

    fun addCircuit(
        name: String,
        breakerRatingA: Int,
        loadWatts: Double,
        powerFactor: Double = 0.85,
        phase: String = "L1",
        isRcd: Boolean = true,
        cableSizeMm2: Double = 2.5
    ) {
        val newCircuit = DbCircuitItem(
            name = name.ifBlank { "Circuit ${_uiState.value.circuits.size + 1}" },
            breakerRatingA = breakerRatingA,
            loadWatts = loadWatts,
            powerFactor = powerFactor,
            phase = phase,
            isRcd = isRcd,
            cableSizeMm2 = cableSizeMm2
        )
        _uiState.update { it.copy(circuits = it.circuits + newCircuit) }
    }

    fun removeCircuit(id: String) {
        _uiState.update { it.copy(circuits = it.circuits.filterNot { c -> c.id == id }) }
    }

    /**
     * SANS 10142-1 Three-Phase Load Balancing Algorithm (Longest Processing Time Heuristic)
     * Automatically assigns circuits to L1, L2, or L3 to minimize unbalance (< 10%).
     */
    fun autoBalancePhases() {
        _uiState.update { current ->
            if (current.supplyType == DbSupplyType.SINGLE_PHASE) return@update current

            // Sort circuits in descending order of current load
            val sorted = current.circuits.sortedByDescending { it.currentAmps }
            val phaseLoads = mutableMapOf("L1" to 0.0, "L2" to 0.0, "L3" to 0.0)
            val updatedCircuits = mutableListOf<DbCircuitItem>()

            for (circuit in sorted) {
                // Find phase with the lowest cumulative load
                val minPhase = phaseLoads.minByOrNull { it.value }?.key ?: "L1"
                phaseLoads[minPhase] = (phaseLoads[minPhase] ?: 0.0) + circuit.currentAmps
                updatedCircuits.add(circuit.copy(phase = minPhase))
            }

            current.copy(circuits = updatedCircuits)
        }
    }
}

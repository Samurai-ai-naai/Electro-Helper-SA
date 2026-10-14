package com.electroassistant.sa.viewmodel

import androidx.lifecycle.ViewModel
import com.electroassistant.sa.calculator.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

enum class CableSubTab {
    CABLE_SIZING,
    MOTOR_CAPACITORS,
    POWER_FACTOR,
    RESISTOR_DECODER
}

data class CableSizingUiState(
    val activeSubTab: CableSubTab = CableSubTab.CABLE_SIZING,

    // Cable Sizing Engine
    val supplyType: SupplyType = SupplyType.SINGLE_PHASE,
    val loadWatts: Double = 3500.0,
    val lengthMeters: Double = 25.0,
    val powerFactor: Double = 0.90,
    val installationMethod: InstallationMethod = InstallationMethod.CONDUIT_SURFACE_TRUNKING,
    val insulationType: InsulationType = InsulationType.PVC_70,
    val ambientTemp: Double = 30.0,
    val groupingCount: Int = 1,
    val cableResult: CableSizingResult = SANS10142Calculator.calculate(
        CalculationInput(
            supplyType = SupplyType.SINGLE_PHASE,
            loadPowerWatts = 3500.0,
            powerFactor = 0.90,
            oneWayLengthMeters = 25.0,
            installationMethod = InstallationMethod.CONDUIT_SURFACE_TRUNKING,
            insulationType = InsulationType.PVC_70,
            ambientTemperatureC = 30.0,
            groupingCircuitsCount = 1
        )
    ),

    // Motor Run/Start Capacitor
    val motorKw: Double = 2.2,
    val motorVoltage: Double = 230.0,
    val motorEfficiency: Double = 0.82,
    val motorResult: MotorCapacitorResult = SANS10142Calculator.calculateMotorCapacitor(
        motorPowerKw = 2.2,
        supplyVoltage = 230.0,
        efficiency = 0.82
    ),

    // Power Factor & Reactive Power Correction
    val pfActiveKw: Double = 45.0,
    val pfInitialCos: Double = 0.75,
    val pfTargetCos: Double = 0.98,
    val pfVoltage: Double = 400.0,
    val pfIsThreePhase: Boolean = true,
    val pfResult: PowerFactorResult = SANS10142Calculator.calculatePowerFactorCorrection(
        activePowerKw = 45.0,
        initialCosPhi = 0.75,
        targetCosPhi = 0.98,
        supplyVoltage = 400.0,
        isThreePhase = true
    ),

    // Resistor Decoder
    val resistorBandCount: Int = 4,
    val band1: Int = 1, // Brown
    val band2: Int = 0, // Black
    val band3: Int = 0, // Black
    val multiplierExp: Int = 3, // Orange (x1k)
    val tolerancePct: Double = 5.0, // Gold (5%)
    val resistorResult: ResistorColorResult = SANS10142Calculator.decodeResistor4Band(1, 0, 3, 5.0)
)

class CableSizingViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(CableSizingUiState())
    val uiState: StateFlow<CableSizingUiState> = _uiState.asStateFlow()

    fun selectSubTab(tab: CableSubTab) {
        _uiState.update { it.copy(activeSubTab = tab) }
    }

    fun updateCableParameters(
        supplyType: SupplyType? = null,
        loadWatts: Double? = null,
        lengthMeters: Double? = null,
        powerFactor: Double? = null,
        installationMethod: InstallationMethod? = null,
        insulationType: InsulationType? = null,
        ambientTemp: Double? = null,
        groupingCount: Int? = null
    ) {
        _uiState.update { current ->
            val newSupplyType = supplyType ?: current.supplyType
            val newLoadWatts = loadWatts ?: current.loadWatts
            val newLength = lengthMeters ?: current.lengthMeters
            val newPf = powerFactor ?: current.powerFactor
            val newMethod = installationMethod ?: current.installationMethod
            val newInsulation = insulationType ?: current.insulationType
            val newTemp = ambientTemp ?: current.ambientTemp
            val newGrouping = groupingCount ?: current.groupingCount

            val newResult = SANS10142Calculator.calculate(
                CalculationInput(
                    supplyType = newSupplyType,
                    loadPowerWatts = newLoadWatts,
                    powerFactor = newPf,
                    oneWayLengthMeters = newLength,
                    installationMethod = newMethod,
                    insulationType = newInsulation,
                    ambientTemperatureC = newTemp,
                    groupingCircuitsCount = newGrouping
                )
            )

            current.copy(
                supplyType = newSupplyType,
                loadWatts = newLoadWatts,
                lengthMeters = newLength,
                powerFactor = newPf,
                installationMethod = newMethod,
                insulationType = newInsulation,
                ambientTemp = newTemp,
                groupingCount = newGrouping,
                cableResult = newResult
            )
        }
    }

    fun updateMotorCapacitor(
        kw: Double? = null,
        voltage: Double? = null,
        efficiency: Double? = null
    ) {
        _uiState.update { current ->
            val newKw = kw ?: current.motorKw
            val newVolt = voltage ?: current.motorVoltage
            val newEff = efficiency ?: current.motorEfficiency

            val newResult = SANS10142Calculator.calculateMotorCapacitor(
                motorPowerKw = newKw,
                supplyVoltage = newVolt,
                efficiency = newEff
            )

            current.copy(
                motorKw = newKw,
                motorVoltage = newVolt,
                motorEfficiency = newEff,
                motorResult = newResult
            )
        }
    }

    fun updatePowerFactor(
        kw: Double? = null,
        initialCos: Double? = null,
        targetCos: Double? = null,
        voltage: Double? = null,
        isThreePhase: Boolean? = null
    ) {
        _uiState.update { current ->
            val newKw = kw ?: current.pfActiveKw
            val newInit = initialCos ?: current.pfInitialCos
            val newTarget = targetCos ?: current.pfTargetCos
            val newVolt = voltage ?: current.pfVoltage
            val new3Ph = isThreePhase ?: current.pfIsThreePhase

            val newResult = SANS10142Calculator.calculatePowerFactorCorrection(
                activePowerKw = newKw,
                initialCosPhi = newInit,
                targetCosPhi = newTarget,
                supplyVoltage = newVolt,
                isThreePhase = new3Ph
            )

            current.copy(
                pfActiveKw = newKw,
                pfInitialCos = newInit,
                pfTargetCos = newTarget,
                pfVoltage = newVolt,
                pfIsThreePhase = new3Ph,
                pfResult = newResult
            )
        }
    }

    fun updateResistorBands(
        bandCount: Int? = null,
        b1: Int? = null,
        b2: Int? = null,
        b3: Int? = null,
        mult: Int? = null,
        tol: Double? = null
    ) {
        _uiState.update { current ->
            val count = bandCount ?: current.resistorBandCount
            val b1Val = b1 ?: current.band1
            val b2Val = b2 ?: current.band2
            val b3Val = b3 ?: current.band3
            val multVal = mult ?: current.multiplierExp
            val tolVal = tol ?: current.tolerancePct

            val res = if (count == 5) {
                SANS10142Calculator.decodeResistor5Band(b1Val, b2Val, b3Val, multVal, tolVal)
            } else {
                SANS10142Calculator.decodeResistor4Band(b1Val, b2Val, multVal, tolVal)
            }

            current.copy(
                resistorBandCount = count,
                band1 = b1Val,
                band2 = b2Val,
                band3 = b3Val,
                multiplierExp = multVal,
                tolerancePct = tolVal,
                resistorResult = res
            )
        }
    }
}

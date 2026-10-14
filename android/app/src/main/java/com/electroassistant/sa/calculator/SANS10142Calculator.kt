package com.electroassistant.sa.calculator

import kotlin.math.sqrt
import kotlin.math.roundToInt

/**
 * ElectroAssistant SA & HVAC Field Suite
 * SANS 10142-1 (2020) Cable Sizing and Voltage Drop Calculation Engine
 * Implements SANS 10142-1 South African Standard for the Wiring of Premises:
 * - Nominal single-phase 230V AC / three-phase 400V AC
 * - 70°C Copper PVC and 90°C XLPE cable current-carrying capacity (Table 6.4a - 6.4d)
 * - Ambient temperature derating factor Ct (Table 6.2)
 * - Grouping derating factor Cg (Table 6.3)
 * - Maximum allowable 5.0% voltage drop limit (11.5V single-phase / 20.0V three-phase)
 * - Breaker coordination: Ib <= In <= Iz
 */

enum class SupplyType(val nominalVoltage: Double) {
    SINGLE_PHASE(230.0),
    THREE_PHASE(400.0)
}

enum class InsulationType(val label: String) {
    PVC_70("70°C Copper PVC"),
    XLPE_90("90°C Copper XLPE")
}

enum class InstallationMethod(val sansReference: String, val description: String) {
    CONDUIT_INSULATED("Method 1 (Ref A)", "Enclosed in conduit in thermally insulating wall"),
    CONDUIT_SURFACE_TRUNKING("Method 3 (Ref B)", "Enclosed in conduit on surface or trunking"),
    CLIPPED_DIRECT_TRAY("Method 4 (Ref C)", "Clipped direct or on perforated cable tray"),
    UNDERGROUND_DUCT("Method 5 (Ref D)", "In underground conduit, duct, or direct buried")
}

data class CableSpecification(
    val sizeMm2: Double,
    val capacityPvcConduitInsulated: Double,
    val capacityPvcConduitSurface: Double,
    val capacityPvcClippedDirect: Double,
    val capacityPvcUndergroundDuct: Double,
    val capacityXlpeConduitInsulated: Double,
    val capacityXlpeConduitSurface: Double,
    val capacityXlpeClippedDirect: Double,
    val capacityXlpeUndergroundDuct: Double,
    val mvPerAmpMeterSinglePhase: Double,
    val mvPerAmpMeterThreePhase: Double,
    val standardMcbRatingA: Int
)

data class CalculationInput(
    val supplyType: SupplyType,
    val loadPowerWatts: Double,
    val powerFactor: Double = 0.85,
    val oneWayLengthMeters: Double,
    val installationMethod: InstallationMethod,
    val insulationType: InsulationType,
    val ambientTemperatureC: Double = 30.0,
    val groupingCircuitsCount: Int = 1
)

data class EvaluatedCableOption(
    val sizeMm2: Double,
    val baseCapacityAmps: Double,
    val deratedCapacityAmps: Double,
    val voltageDropVolts: Double,
    val voltageDropPercent: Double,
    val passesCapacity: Boolean,
    val passesVoltageDrop: Boolean,
    val isCompliant: Boolean
)

data class CableSizingResult(
    val nominalVoltage: Double,
    val designCurrentIb: Double,
    val deratingFactorCt: Double,
    val deratingFactorCg: Double,
    val combinedDerating: Double,
    val requiredCapacityIzPrime: Double,
    val selectedCableSizeMm2: Double,
    val cableBaseCapacityAmps: Double,
    val cableDeratedCapacityAmps: Double,
    val voltageDropVolts: Double,
    val voltageDropPercent: Double,
    val maxAllowableVoltageDropVolts: Double,
    val isVoltageDropCompliant: Boolean,
    val isCapacityCompliant: Boolean,
    val recommendedMcbRatingAmps: Int,
    val isOvercurrentCoordinated: Boolean,
    val sansClauses: List<String>,
    val evaluatedOptions: List<EvaluatedCableOption>,
    val appliedCtFactor: Double = deratingFactorCt,
    val appliedCgFactor: Double = deratingFactorCg
)

object SANS10142Calculator {
    private val ambientDeratingPvc = mapOf(
        25 to 1.06, 30 to 1.00, 35 to 0.94, 40 to 0.87,
        45 to 0.79, 50 to 0.71, 55 to 0.61, 60 to 0.50
    )
    private val ambientDeratingXlpe = mapOf(
        25 to 1.04, 30 to 1.00, 35 to 0.96, 40 to 0.91,
        45 to 0.87, 50 to 0.82, 55 to 0.76, 60 to 0.71
    )

    private val groupingDerating = mapOf(
        1 to 1.00, 2 to 0.80, 3 to 0.70, 4 to 0.65, 5 to 0.60,
        6 to 0.57, 7 to 0.54, 8 to 0.52, 9 to 0.50, 10 to 0.48,
        12 to 0.45, 16 to 0.41, 20 to 0.38
    )

    val standardMcbRatings = listOf(6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250)

    val cableSpecifications = listOf(
        CableSpecification(1.5, 14.5, 17.5, 19.5, 22.0, 19.0, 23.0, 26.0, 29.0, 29.0, 25.0, 16),
        CableSpecification(2.5, 19.5, 24.0, 27.0, 29.0, 26.0, 31.0, 36.0, 39.0, 18.0, 15.0, 20),
        CableSpecification(4.0, 26.0, 32.0, 36.0, 38.0, 35.0, 42.0, 49.0, 52.0, 11.0, 9.5, 32),
        CableSpecification(6.0, 34.0, 41.0, 46.0, 47.0, 45.0, 54.0, 62.0, 66.0, 7.3, 6.4, 40),
        CableSpecification(10.0, 46.0, 57.0, 63.0, 63.0, 62.0, 75.0, 85.0, 90.0, 4.4, 3.8, 63),
        CableSpecification(16.0, 61.0, 76.0, 85.0, 83.0, 83.0, 100.0, 115.0, 115.0, 2.8, 2.4, 80),
        CableSpecification(25.0, 80.0, 101.0, 112.0, 110.0, 110.0, 133.0, 152.0, 149.0, 1.75, 1.50, 100),
        CableSpecification(35.0, 99.0, 125.0, 138.0, 132.0, 137.0, 164.0, 188.0, 180.0, 1.25, 1.10, 125),
        CableSpecification(50.0, 119.0, 151.0, 168.0, 160.0, 167.0, 198.0, 228.0, 215.0, 0.93, 0.80, 160),
        CableSpecification(70.0, 151.0, 192.0, 213.0, 202.0, 216.0, 253.0, 291.0, 275.0, 0.63, 0.55, 200),
        CableSpecification(95.0, 182.0, 232.0, 258.0, 242.0, 264.0, 306.0, 354.0, 335.0, 0.46, 0.40, 250),
        CableSpecification(120.0, 210.0, 269.0, 299.0, 279.0, 308.0, 354.0, 410.0, 385.0, 0.36, 0.32, 315),
        CableSpecification(150.0, 240.0, 300.0, 344.0, 315.0, 356.0, 407.0, 472.0, 440.0, 0.29, 0.26, 400)
    )

    fun calculate(input: CalculationInput): CableSizingResult {
        val vNominal = input.supplyType.nominalVoltage
        val pf = input.powerFactor.coerceIn(0.1, 1.0)
        val length = input.oneWayLengthMeters.coerceAtLeast(0.5)

        val designCurrentIb = when (input.supplyType) {
            SupplyType.SINGLE_PHASE -> input.loadPowerWatts / (vNominal * pf)
            SupplyType.THREE_PHASE -> input.loadPowerWatts / (sqrt(3.0) * vNominal * pf)
        }

        val ct = getTemperatureDerating(input.ambientTemperatureC, input.insulationType)
        val cg = getGroupingDerating(input.groupingCircuitsCount)
        val combinedDerating = ct * cg
        val requiredCapacityIzPrime = designCurrentIb / combinedDerating

        val evaluatedOptions = cableSpecifications.map { spec ->
            val baseCapacity = when (input.insulationType) {
                InsulationType.PVC_70 -> when (input.installationMethod) {
                    InstallationMethod.CONDUIT_INSULATED -> spec.capacityPvcConduitInsulated
                    InstallationMethod.CONDUIT_SURFACE_TRUNKING -> spec.capacityPvcConduitSurface
                    InstallationMethod.CLIPPED_DIRECT_TRAY -> spec.capacityPvcClippedDirect
                    InstallationMethod.UNDERGROUND_DUCT -> spec.capacityPvcUndergroundDuct
                }
                InsulationType.XLPE_90 -> when (input.installationMethod) {
                    InstallationMethod.CONDUIT_INSULATED -> spec.capacityXlpeConduitInsulated
                    InstallationMethod.CONDUIT_SURFACE_TRUNKING -> spec.capacityXlpeConduitSurface
                    InstallationMethod.CLIPPED_DIRECT_TRAY -> spec.capacityXlpeClippedDirect
                    InstallationMethod.UNDERGROUND_DUCT -> spec.capacityXlpeUndergroundDuct
                }
            }

            val deratedCapacity = baseCapacity * combinedDerating
            val mvPerAmpMeter = if (input.supplyType == SupplyType.SINGLE_PHASE) {
                spec.mvPerAmpMeterSinglePhase
            } else {
                spec.mvPerAmpMeterThreePhase
            }

            val voltDropVolts = (mvPerAmpMeter * designCurrentIb * length) / 1000.0
            val voltDropPercent = (voltDropVolts / vNominal) * 100.0

            val passesCapacity = deratedCapacity >= designCurrentIb
            val passesVoltDrop = voltDropPercent <= 5.0

            EvaluatedCableOption(
                sizeMm2 = spec.sizeMm2,
                baseCapacityAmps = baseCapacity,
                deratedCapacityAmps = deratedCapacity,
                voltageDropVolts = voltDropVolts,
                voltageDropPercent = voltDropPercent,
                passesCapacity = passesCapacity,
                passesVoltageDrop = passesVoltDrop,
                isCompliant = passesCapacity && passesVoltDrop
            )
        }

        val selectedOption = evaluatedOptions.firstOrNull { it.isCompliant }
            ?: evaluatedOptions.last()

        val maxAllowedVd = 0.05 * vNominal
        val recommendedMcb = standardMcbRatings.firstOrNull { it >= designCurrentIb }
            ?: standardMcbRatings.last()

        val isOvercurrentCoordinated = designCurrentIb <= recommendedMcb &&
                recommendedMcb <= selectedOption.deratedCapacityAmps

        val sansClauses = listOf(
            "SANS 10142-1 Clause 6.2.7: Current-carrying capacity coordination (Ib <= In <= Iz)",
            "SANS 10142-1 Clause 6.2.8.2: Maximum voltage drop limit is 5.0% (${if (input.supplyType == SupplyType.SINGLE_PHASE) "11.5 V for 230 V" else "20.0 V for 400 V"})",
            "SANS 10142-1 Table 6.2: Ambient temperature derating factor Ct = %.2f (at %.1f°C)".format(ct, input.ambientTemperatureC),
            "SANS 10142-1 Table 6.3: Grouping derating factor Cg = %.2f (for %d circuits)".format(cg, input.groupingCircuitsCount),
            "SANS 10142-1 Clause 6.8: Overcurrent protective device rating (MCB rating = %d A)".format(recommendedMcb)
        )

        return CableSizingResult(
            nominalVoltage = vNominal,
            designCurrentIb = designCurrentIb,
            deratingFactorCt = ct,
            deratingFactorCg = cg,
            combinedDerating = combinedDerating,
            requiredCapacityIzPrime = requiredCapacityIzPrime,
            selectedCableSizeMm2 = selectedOption.sizeMm2,
            cableBaseCapacityAmps = selectedOption.baseCapacityAmps,
            cableDeratedCapacityAmps = selectedOption.deratedCapacityAmps,
            voltageDropVolts = selectedOption.voltageDropVolts,
            voltageDropPercent = selectedOption.voltageDropPercent,
            maxAllowableVoltageDropVolts = maxAllowedVd,
            isVoltageDropCompliant = selectedOption.passesVoltageDrop,
            isCapacityCompliant = selectedOption.passesCapacity,
            recommendedMcbRatingAmps = recommendedMcb,
            isOvercurrentCoordinated = isOvercurrentCoordinated,
            sansClauses = sansClauses,
            evaluatedOptions = evaluatedOptions
        )
    }

    private fun getTemperatureDerating(tempC: Double, insulation: InsulationType): Double {
        val table = if (insulation == InsulationType.PVC_70) ambientDeratingPvc else ambientDeratingXlpe
        val temps = table.keys.sorted()
        val t = tempC.roundToInt()
        if (t <= temps.first()) return table[temps.first()] ?: 1.0
        if (t >= temps.last()) return table[temps.last()] ?: 0.5
        for (i in 0 until temps.size - 1) {
            val tLow = temps[i]
            val tHigh = temps[i + 1]
            if (t in tLow..tHigh) {
                val fLow = table[tLow] ?: 1.0
                val fHigh = table[tHigh] ?: 1.0
                return fLow + ((t - tLow).toDouble() / (tHigh - tLow)) * (fHigh - fLow)
            }
        }
        return 1.0
    }

    private fun getGroupingDerating(count: Int): Double {
        val clamped = count.coerceIn(1, 20)
        return groupingDerating[clamped] ?: when {
            clamped <= 2 -> 0.80
            clamped <= 3 -> 0.70
            clamped <= 5 -> 0.60
            clamped <= 9 -> 0.50
            clamped <= 14 -> 0.43
            else -> 0.38
        }
    }
}

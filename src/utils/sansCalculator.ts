import {
  CalculationResult,
  InstallationMethod,
  InsulationType,
  SupplyType,
} from '../types/sans';
import {
  getAmbientDerating,
  getGroupingDerating,
  SANS_CABLE_SPECS,
  STANDARD_MCB_RATINGS,
} from '../data/sansTables';

export interface CalculationInput {
  supplyType: SupplyType;
  loadType: 'kw' | 'amps' | 'kva';
  loadValue: number;
  powerFactor: number; // e.g. 0.85
  lengthMeters: number;
  installationMethod: InstallationMethod;
  insulationType: InsulationType;
  ambientTempC: number;
  groupingCircuitsCount: number;
}

export function calculateSANS10142Cable(input: CalculationInput): CalculationResult {
  const nominalVoltage = input.supplyType === 'single_phase' ? 230 : 400;
  const pf = Math.max(0.1, Math.min(1.0, input.powerFactor || 0.85));
  const length = Math.max(0.5, input.lengthMeters || 10);

  // 1. Calculate Design Current Ib
  let loadCurrentIb = 0;
  if (input.loadType === 'amps') {
    loadCurrentIb = input.loadValue;
  } else if (input.loadType === 'kw') {
    const powerWatts = input.loadValue * 1000;
    if (input.supplyType === 'single_phase') {
      loadCurrentIb = powerWatts / (nominalVoltage * pf);
    } else {
      loadCurrentIb = powerWatts / (Math.sqrt(3) * nominalVoltage * pf);
    }
  } else if (input.loadType === 'kva') {
    const va = input.loadValue * 1000;
    if (input.supplyType === 'single_phase') {
      loadCurrentIb = va / nominalVoltage;
    } else {
      loadCurrentIb = va / (Math.sqrt(3) * nominalVoltage);
    }
  }

  loadCurrentIb = Number(loadCurrentIb.toFixed(2));

  // 2. Correction factors
  const deratingCt = getAmbientDerating(input.ambientTempC, input.insulationType);
  const deratingCg = getGroupingDerating(input.groupingCircuitsCount);
  const combinedDerating = Number((deratingCt * deratingCg).toFixed(3));

  // Minimum base capacity required before derating
  const requiredCapacityIzPrime = Number((loadCurrentIb / (combinedDerating || 1)).toFixed(2));

  const maxAllowedVoltageDropPercent = 5.0; // SANS 10142-1 Clause 6.2.8.2 (5% limit: 11.5V for 230V / 20.0V for 400V)
  const maxAllowedVoltageDropVolts = Number(((maxAllowedVoltageDropPercent / 100) * nominalVoltage).toFixed(2));

  // 3. Evaluate each cable size in the SANS catalog
  const cableOptions = SANS_CABLE_SPECS.map((spec) => {
    const baseCapacity =
      input.insulationType === 'pvc_70'
        ? spec.currentCapacityPVC[input.installationMethod]
        : spec.currentCapacityXLPE[input.installationMethod];

    const deratedCapacity = Number((baseCapacity * combinedDerating).toFixed(2));

    const mvPerAmpPerMeter =
      input.supplyType === 'single_phase'
        ? spec.mvPerAmpPerMeter1Ph
        : spec.mvPerAmpPerMeter3Ph;

    // SANS 10142-1 Voltage Drop Formula: ΔV = (mV/A/m * Ib * L) / 1000
    const voltDropVolts = Number(((mvPerAmpPerMeter * loadCurrentIb * length) / 1000).toFixed(2));
    const voltDropPercent = Number(((voltDropVolts / nominalVoltage) * 100).toFixed(2));

    const capacityPass = deratedCapacity >= loadCurrentIb;
    const voltDropPass = voltDropPercent <= maxAllowedVoltageDropPercent;

    return {
      size: spec.crossSectionMm2,
      baseCapacity,
      deratedCapacity,
      voltDropVolts,
      voltDropPercent,
      capacityPass,
      voltDropPass,
      compliant: capacityPass && voltDropPass,
    };
  });

  // 4. Select the smallest compliant cable size
  const compliantOption = cableOptions.find((opt) => opt.compliant) || cableOptions[cableOptions.length - 1];
  const selectedSpec = SANS_CABLE_SPECS.find((s) => s.crossSectionMm2 === compliantOption.size) || SANS_CABLE_SPECS[0];

  const selectedBaseCapacity =
    input.insulationType === 'pvc_70'
      ? selectedSpec.currentCapacityPVC[input.installationMethod]
      : selectedSpec.currentCapacityXLPE[input.installationMethod];

  const selectedDeratedCapacity = Number((selectedBaseCapacity * combinedDerating).toFixed(2));

  // Recommended MCB Rating: standard rating >= Ib, ideally <= Iz
  let recommendedMcb = STANDARD_MCB_RATINGS.find((rating) => rating >= loadCurrentIb) || STANDARD_MCB_RATINGS[STANDARD_MCB_RATINGS.length - 1];
  const isOvercurrentCoordinated = loadCurrentIb <= recommendedMcb && recommendedMcb <= selectedDeratedCapacity;
  const minimumEarthSizeMm2 = selectedSpec.minimumEarthMm2 || 2.5;

  // Clause citations
  const sansClauses = [
    'SANS 10142-1 Clause 6.2.7: Conductor current-carrying capacity (Ib ≤ In ≤ Iz)',
    'SANS 10142-1 Clause 6.2.8.2: Maximum permissible voltage drop is 5% of nominal supply (' +
      (input.supplyType === 'single_phase' ? '11.5 V for 230 V' : '20.0 V for 400 V') + ')',
    `SANS 10142-1 Table 6.2: Ambient temperature derating Ct = ${deratingCt} (${input.ambientTempC}°C)`,
    `SANS 10142-1 Table 6.3: Grouping derating factor Cg = ${deratingCg} (${input.groupingCircuitsCount} circuit/s)`,
    `SANS 10142-1 Table 6.6: Minimum copper earth continuity conductor is ${minimumEarthSizeMm2} mm²`,
    'SANS 10142-1 Clause 6.8: Overcurrent protection and conductor coordination',
  ];

  return {
    nominalVoltage,
    loadCurrentIb,
    deratingCt,
    deratingCg,
    combinedDerating,
    requiredCapacityIzPrime,
    selectedCableSizeMm2: compliantOption.size,
    minimumEarthSizeMm2,
    cableBaseCapacity: selectedBaseCapacity,
    cableDeratedCapacity: selectedDeratedCapacity,
    voltageDropVolts: compliantOption.voltDropVolts,
    voltageDropPercent: compliantOption.voltDropPercent,
    maxAllowedVoltageDropVolts,
    maxAllowedVoltageDropPercent,
    isVoltageDropCompliant: compliantOption.voltDropPass,
    isCapacityCompliant: compliantOption.capacityPass,
    recommendedMcbRating: recommendedMcb,
    isOvercurrentCoordinated,
    sansClauses,
    cableOptions: cableOptions.map((o) => ({
      size: o.size,
      deratedCapacity: o.deratedCapacity,
      voltDropVolts: o.voltDropVolts,
      voltDropPercent: o.voltDropPercent,
      compliant: o.compliant,
    })),
  };
}

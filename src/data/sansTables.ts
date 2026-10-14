import { CableSizeData, InstallationMethod } from '../types/sans';

/**
 * SANS 10142-1:2020 Standard Data Tables
 * South African National Standard for the Wiring of Premises - Low-voltage installations
 */

// SANS 10142-1 Table 6.2 - Correction factors for ambient temperature (Ct)
// Reference ambient temperature in SA standard is 30°C (Factor = 1.00)
export const SANS_AMBIENT_DERATING_PVC: Record<number, number> = {
  25: 1.06,
  30: 1.00, // Standard baseline
  35: 0.94,
  40: 0.87,
  45: 0.79,
  50: 0.71,
  55: 0.61,
  60: 0.50,
};

export const SANS_AMBIENT_DERATING_XLPE: Record<number, number> = {
  25: 1.04,
  30: 1.00, // Standard baseline
  35: 0.96,
  40: 0.91,
  45: 0.87,
  50: 0.82,
  55: 0.76,
  60: 0.71,
};

// SANS 10142-1 Table 6.3 - Correction factors for groups of cables (Cg)
// Number of circuits or multi-core cables touching or enclosed
export const SANS_GROUPING_DERATING: Record<number, number> = {
  1: 1.00,
  2: 0.80,
  3: 0.70,
  4: 0.65,
  5: 0.60,
  6: 0.57,
  7: 0.54,
  8: 0.52,
  9: 0.50,
  10: 0.48,
  12: 0.45,
  16: 0.41,
  20: 0.38,
};

/**
 * Helper to interpolate or get closest ambient temperature factor
 */
export function getAmbientDerating(tempC: number, insulation: 'pvc_70' | 'xlpe_90'): number {
  const table = insulation === 'pvc_70' ? SANS_AMBIENT_DERATING_PVC : SANS_AMBIENT_DERATING_XLPE;
  const temps = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (tempC <= temps[0]) return table[temps[0]];
  if (tempC >= temps[temps.length - 1]) return table[temps[temps.length - 1]];

  for (let i = 0; i < temps.length - 1; i++) {
    const tLow = temps[i];
    const tHigh = temps[i + 1];
    if (tempC >= tLow && tempC <= tHigh) {
      const fLow = table[tLow];
      const fHigh = table[tHigh];
      return Number((fLow + ((tempC - tLow) / (tHigh - tLow)) * (fHigh - fLow)).toFixed(3));
    }
  }
  return 1.0;
}

/**
 * Helper to get grouping factor
 */
export function getGroupingDerating(circuitsCount: number): number {
  const count = Math.max(1, Math.min(20, Math.round(circuitsCount)));
  if (SANS_GROUPING_DERATING[count]) {
    return SANS_GROUPING_DERATING[count];
  }
  if (count <= 2) return 0.80;
  if (count <= 3) return 0.70;
  if (count <= 5) return 0.60;
  if (count <= 9) return 0.50;
  if (count <= 14) return 0.43;
  return 0.38;
}

/**
 * SANS 10142-1 Table 6.6: Minimum cross-sectional area of earth continuity conductors
 */
export function getMinimumEarthConductor(phaseMm2: number): number {
  if (phaseMm2 <= 16) return phaseMm2;
  if (phaseMm2 <= 35) return 16;
  if (phaseMm2 <= 50) return 25;
  if (phaseMm2 <= 95) return 35;
  if (phaseMm2 <= 150) return 70;
  return Math.round(phaseMm2 / 2);
}

/**
 * SANS 10142-1 Copper Conductors Table (Tables 6.4a, 6.4b, 6.4c, 6.4d)
 * Current-carrying capacities (Amperes), Voltage Drop (mV/A/m), and Minimum Earth (mm²)
 */
export const SANS_CABLE_SPECS: CableSizeData[] = [
  {
    crossSectionMm2: 1.5,
    currentCapacityPVC: {
      conduit_insulated: 14.5,
      conduit_wall: 17.5,
      clipped_direct: 19.5,
      underground_duct: 22.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 19.0,
      conduit_wall: 23.0,
      clipped_direct: 26.0,
      underground_duct: 29.0,
    },
    mvPerAmpPerMeter1Ph: 29.0,
    mvPerAmpPerMeter3Ph: 25.0,
    standardMcbAmps: 16,
    minimumEarthMm2: 1.5,
  },
  {
    crossSectionMm2: 2.5,
    currentCapacityPVC: {
      conduit_insulated: 19.5,
      conduit_wall: 24.0,
      clipped_direct: 27.0,
      underground_duct: 29.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 26.0,
      conduit_wall: 31.0,
      clipped_direct: 36.0,
      underground_duct: 39.0,
    },
    mvPerAmpPerMeter1Ph: 18.0,
    mvPerAmpPerMeter3Ph: 15.0,
    standardMcbAmps: 20,
    minimumEarthMm2: 2.5,
  },
  {
    crossSectionMm2: 4.0,
    currentCapacityPVC: {
      conduit_insulated: 26.0,
      conduit_wall: 32.0,
      clipped_direct: 36.0,
      underground_duct: 38.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 35.0,
      conduit_wall: 42.0,
      clipped_direct: 49.0,
      underground_duct: 52.0,
    },
    mvPerAmpPerMeter1Ph: 11.0,
    mvPerAmpPerMeter3Ph: 9.5,
    standardMcbAmps: 32,
    minimumEarthMm2: 4.0,
  },
  {
    crossSectionMm2: 6.0,
    currentCapacityPVC: {
      conduit_insulated: 34.0,
      conduit_wall: 41.0,
      clipped_direct: 46.0,
      underground_duct: 47.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 45.0,
      conduit_wall: 54.0,
      clipped_direct: 62.0,
      underground_duct: 66.0,
    },
    mvPerAmpPerMeter1Ph: 7.3,
    mvPerAmpPerMeter3Ph: 6.4,
    standardMcbAmps: 40,
    minimumEarthMm2: 6.0,
  },
  {
    crossSectionMm2: 10.0,
    currentCapacityPVC: {
      conduit_insulated: 46.0,
      conduit_wall: 57.0,
      clipped_direct: 63.0,
      underground_duct: 63.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 62.0,
      conduit_wall: 75.0,
      clipped_direct: 85.0,
      underground_duct: 90.0,
    },
    mvPerAmpPerMeter1Ph: 4.4,
    mvPerAmpPerMeter3Ph: 3.8,
    standardMcbAmps: 63,
    minimumEarthMm2: 10.0,
  },
  {
    crossSectionMm2: 16.0,
    currentCapacityPVC: {
      conduit_insulated: 61.0,
      conduit_wall: 76.0,
      clipped_direct: 85.0,
      underground_duct: 83.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 83.0,
      conduit_wall: 100.0,
      clipped_direct: 115.0,
      underground_duct: 115.0,
    },
    mvPerAmpPerMeter1Ph: 2.8,
    mvPerAmpPerMeter3Ph: 2.4,
    standardMcbAmps: 80,
    minimumEarthMm2: 16.0,
  },
  {
    crossSectionMm2: 25.0,
    currentCapacityPVC: {
      conduit_insulated: 80.0,
      conduit_wall: 101.0,
      clipped_direct: 112.0,
      underground_duct: 110.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 110.0,
      conduit_wall: 133.0,
      clipped_direct: 152.0,
      underground_duct: 149.0,
    },
    mvPerAmpPerMeter1Ph: 1.75,
    mvPerAmpPerMeter3Ph: 1.50,
    standardMcbAmps: 100,
    minimumEarthMm2: 16.0,
  },
  {
    crossSectionMm2: 35.0,
    currentCapacityPVC: {
      conduit_insulated: 99.0,
      conduit_wall: 125.0,
      clipped_direct: 138.0,
      underground_duct: 132.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 137.0,
      conduit_wall: 164.0,
      clipped_direct: 188.0,
      underground_duct: 180.0,
    },
    mvPerAmpPerMeter1Ph: 1.25,
    mvPerAmpPerMeter3Ph: 1.10,
    standardMcbAmps: 125,
    minimumEarthMm2: 16.0,
  },
  {
    crossSectionMm2: 50.0,
    currentCapacityPVC: {
      conduit_insulated: 119.0,
      conduit_wall: 151.0,
      clipped_direct: 168.0,
      underground_duct: 160.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 167.0,
      conduit_wall: 198.0,
      clipped_direct: 228.0,
      underground_duct: 215.0,
    },
    mvPerAmpPerMeter1Ph: 0.93,
    mvPerAmpPerMeter3Ph: 0.80,
    standardMcbAmps: 160,
    minimumEarthMm2: 25.0,
  },
  {
    crossSectionMm2: 70.0,
    currentCapacityPVC: {
      conduit_insulated: 151.0,
      conduit_wall: 192.0,
      clipped_direct: 213.0,
      underground_duct: 202.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 216.0,
      conduit_wall: 253.0,
      clipped_direct: 291.0,
      underground_duct: 275.0,
    },
    mvPerAmpPerMeter1Ph: 0.63,
    mvPerAmpPerMeter3Ph: 0.55,
    standardMcbAmps: 200,
    minimumEarthMm2: 35.0,
  },
  {
    crossSectionMm2: 95.0,
    currentCapacityPVC: {
      conduit_insulated: 182.0,
      conduit_wall: 232.0,
      clipped_direct: 258.0,
      underground_duct: 242.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 264.0,
      conduit_wall: 306.0,
      clipped_direct: 354.0,
      underground_duct: 335.0,
    },
    mvPerAmpPerMeter1Ph: 0.46,
    mvPerAmpPerMeter3Ph: 0.40,
    standardMcbAmps: 250,
    minimumEarthMm2: 50.0,
  },
  {
    crossSectionMm2: 120.0,
    currentCapacityPVC: {
      conduit_insulated: 210.0,
      conduit_wall: 269.0,
      clipped_direct: 299.0,
      underground_duct: 279.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 308.0,
      conduit_wall: 354.0,
      clipped_direct: 410.0,
      underground_duct: 385.0,
    },
    mvPerAmpPerMeter1Ph: 0.36,
    mvPerAmpPerMeter3Ph: 0.32,
    standardMcbAmps: 315,
    minimumEarthMm2: 70.0,
  },
  {
    crossSectionMm2: 150.0,
    currentCapacityPVC: {
      conduit_insulated: 240.0,
      conduit_wall: 300.0,
      clipped_direct: 344.0,
      underground_duct: 315.0,
    },
    currentCapacityXLPE: {
      conduit_insulated: 356.0,
      conduit_wall: 407.0,
      clipped_direct: 472.0,
      underground_duct: 440.0,
    },
    mvPerAmpPerMeter1Ph: 0.29,
    mvPerAmpPerMeter3Ph: 0.26,
    standardMcbAmps: 400,
    minimumEarthMm2: 70.0,
  },
];

export const STANDARD_MCB_RATINGS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

export const INSTALLATION_METHOD_LABELS: Record<InstallationMethod, { name: string; sansRef: string; desc: string }> = {
  conduit_insulated: {
    name: 'Conduit in Insulated Wall',
    sansRef: 'Method 1 (Ref A)',
    desc: 'Enclosed in conduit within thermally insulating wall. Lowest heat dissipation.',
  },
  conduit_wall: {
    name: 'Conduit on Surface / Trunking',
    sansRef: 'Method 3 (Ref B)',
    desc: 'Enclosed in surface-mounted conduit on brickwork/wood or inside PVC/steel trunking.',
  },
  clipped_direct: {
    name: 'Clipped Direct / Cable Tray',
    sansRef: 'Method 4 (Ref C)',
    desc: 'Clipped directly to masonry/joists or laid in ventilated perforated cable tray.',
  },
  underground_duct: {
    name: 'Underground Duct / Buried (SWA)',
    sansRef: 'Method 5 (Ref D)',
    desc: 'Enclosed in buried PVC sleeve or direct buried SWA armoring with soil dissipation.',
  },
};

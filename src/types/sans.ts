export type SupplyType = 'single_phase' | 'three_phase';
export type CableConductor = 'copper';
export type InsulationType = 'pvc_70' | 'xlpe_90';
export type CableArmorType = 'unarmoured' | 'swa_armoured' | 'flexible_cord';

export type InstallationMethod =
  | 'conduit_insulated' // Method 1 / Ref A: Enclosed in conduit in thermally insulating wall
  | 'conduit_wall'      // Method 3 / Ref B: Enclosed in conduit on surface or trunking
  | 'clipped_direct'   // Method 4 / Ref C: Clipped direct or on cable tray
  | 'underground_duct'; // Method 5 / Ref D: In underground conduit, duct, or direct buried

export interface CableSizeData {
  crossSectionMm2: number;
  currentCapacityPVC: {
    conduit_insulated: number;
    conduit_wall: number;
    clipped_direct: number;
    underground_duct: number;
  };
  currentCapacityXLPE: {
    conduit_insulated: number;
    conduit_wall: number;
    clipped_direct: number;
    underground_duct: number;
  };
  mvPerAmpPerMeter1Ph: number;
  mvPerAmpPerMeter3Ph: number;
  standardMcbAmps: number;
  minimumEarthMm2: number; // SANS 10142-1 Table 6.6 minimum protective conductor
}

export interface CalculationResult {
  nominalVoltage: number;
  loadCurrentIb: number;
  deratingCt: number;
  deratingCg: number;
  combinedDerating: number;
  requiredCapacityIzPrime: number;
  selectedCableSizeMm2: number;
  minimumEarthSizeMm2: number;
  cableBaseCapacity: number;
  cableDeratedCapacity: number;
  voltageDropVolts: number;
  voltageDropPercent: number;
  maxAllowedVoltageDropVolts: number;
  maxAllowedVoltageDropPercent: number;
  isVoltageDropCompliant: boolean;
  isCapacityCompliant: boolean;
  recommendedMcbRating: number;
  isOvercurrentCoordinated: boolean;
  sansClauses: string[];
  cableOptions: Array<{
    size: number;
    deratedCapacity: number;
    voltDropVolts: number;
    voltDropPercent: number;
    compliant: boolean;
  }>;
}

export interface CoCTestReading {
  id: string;
  circuitName: string;
  breakerRatingA: number;
  earthContinuityOhms: number; // Max 0.20 Ohms (SANS 10142-1 Clause 8.6.2)
  insulationResistancePNE: number; // Min 1.0 MΩ (Clause 8.6.3)
  insulationResistancePE: number;  // Min 1.0 MΩ
  insulationResistanceNE: number;  // Min 1.0 MΩ
  earthLeakageTripCurrentMa: number; // 30mA rating, typically 15-30mA
  earthLeakageTripTimeMs: number; // Max 30ms (Clause 8.6.4)
  loopImpedanceZsOhms: number; // Zs
  psccKa: number; // Prospective Short Circuit Current
  touchVoltageV: number;
  breakerBreakingCapacityKa: number;
  notes?: string;
}

export interface PinoutDiagram {
  id: string;
  category: 'av_computing' | 'data_telecom' | 'hvac' | 'relays_starters' | 'comms_power';
  title: string;
  subtitle: string;
  manufacturer?: string;
  description: string;
  terminals: Array<{
    pin: string;
    label: string;
    function: string;
    wireColorHint?: string;
    voltageRating?: string;
  }>;
  schematicSvgType: string;
  fieldNotes: string[];
  parameterMenu?: Array<{
    code: string;
    description: string;
    defaultVal: string;
    recommendedRange: string;
  }>;
}

export interface DiagnosticTreeNode {
  id: string;
  treeId: string;
  stepNumber: number;
  title: string;
  instruction: string;
  multimeterSetting?: string;
  safetyWarning?: string;
  testAction?: string;
  expectedReading?: string;
  options: Array<{
    label: string;
    outcomeSummary: string;
    nextNodeId?: string;
    isResolution?: boolean;
    resolutionType?: 'pass' | 'fail' | 'action_required';
    remedySteps?: string[];
    sansRef?: string;
  }>;
}

// Module 5: DB Design & Phase Balancer Types
export interface DbCircuitItem {
  id: string;
  name: string;
  category: 'lighting' | 'plugs' | 'geyser' | 'stove' | 'aircon' | 'refrigeration' | 'sub_db' | 'motor';
  breakerRatingA: number;
  loadWatts: number;
  phase: 'L1' | 'L2' | 'L3';
  poleCount: 1 | 2 | 3;
  isRcdProtected: boolean;
  cableSizeMm2: number;
}

export interface DbPhaseBalanceSummary {
  l1LoadWatts: number;
  l2LoadWatts: number;
  l3LoadWatts: number;
  l1LoadAmps: number;
  l2LoadAmps: number;
  l3LoadAmps: number;
  totalWatts: number;
  averageAmps: number;
  imbalancePercent: number;
  isImbalanceAlert: boolean; // > 15% imbalance
}

// Module 6: Building Plan & Legend Types
export interface PlanSymbolItem {
  id: string;
  name: string;
  category: 'switches' | 'sockets' | 'isolators' | 'lighting' | 'distribution';
  standardRef: string;
  description: string;
  mountingHeightAffMm: number; // Height Above Finished Floor in mm
  symbolIcon: string;
  specs: string;
}

export interface ConduitFillConductor {
  sizeMm2: number;
  count: number;
  approxDiameterMm: number;
}

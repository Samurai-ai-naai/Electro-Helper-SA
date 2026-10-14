import React, { useState, useMemo } from 'react';
import {
  InstallationMethod,
  InsulationType,
  SupplyType,
  CalculationResult,
} from '../types/sans';
import {
  INSTALLATION_METHOD_LABELS,
} from '../data/sansTables';
import { calculateSANS10142Cable, CalculationInput } from '../utils/sansCalculator';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Shield,
  Layers,
  Cpu,
  Gauge,
  Activity,
} from 'lucide-react';

interface QuickPreset {
  id: string;
  name: string;
  category: string;
  supplyType: SupplyType;
  loadType: 'kw' | 'amps' | 'kva';
  loadValue: number;
  powerFactor: number;
  lengthMeters: number;
  method: InstallationMethod;
  insulation: InsulationType;
}

const PRESETS: QuickPreset[] = [
  {
    id: 'geyser_3kw',
    name: 'Residential Geyser (3 kW)',
    category: 'Water Heating',
    supplyType: 'single_phase',
    loadType: 'kw',
    loadValue: 3.0,
    powerFactor: 1.0,
    lengthMeters: 18,
    method: 'conduit_wall',
    insulation: 'pvc_70',
  },
  {
    id: 'stove_8kw',
    name: 'Electric Stove / Oven (8 kW)',
    category: 'Cooking',
    supplyType: 'single_phase',
    loadType: 'kw',
    loadValue: 8.0,
    powerFactor: 1.0,
    lengthMeters: 15,
    method: 'conduit_wall',
    insulation: 'pvc_70',
  },
  {
    id: 'cold_room_5kw',
    name: 'Cold Room Compressor (5.5 kW)',
    category: 'Refrigeration',
    supplyType: 'three_phase',
    loadType: 'kw',
    loadValue: 5.5,
    powerFactor: 0.82,
    lengthMeters: 32,
    method: 'clipped_direct',
    insulation: 'pvc_70',
  },
  {
    id: 'borehole_2kw',
    name: 'Borehole Submersible Pump (2.2 kW)',
    category: 'Pumping',
    supplyType: 'single_phase',
    loadType: 'kw',
    loadValue: 2.2,
    powerFactor: 0.85,
    lengthMeters: 65,
    method: 'underground_duct',
    insulation: 'pvc_70',
  },
  {
    id: 'workshop_subdb',
    name: 'Workshop Outbuilding Sub-DB (15 kVA)',
    category: 'Sub-Distribution',
    supplyType: 'three_phase',
    loadType: 'kva',
    loadValue: 15.0,
    powerFactor: 0.90,
    lengthMeters: 45,
    method: 'underground_duct',
    insulation: 'xlpe_90',
  },
  {
    id: 'aircon_server',
    name: 'Inverter PAC Server Room (7 kW)',
    category: 'HVAC-R',
    supplyType: 'single_phase',
    loadType: 'kw',
    loadValue: 7.0,
    powerFactor: 0.92,
    lengthMeters: 25,
    method: 'conduit_wall',
    insulation: 'pvc_70',
  },
];

const RESISTOR_COLORS = [
  { digit: 0, name: 'Black', hex: '#0f172a', text: '#94a3b8', mult: 1, tol: null },
  { digit: 1, name: 'Brown', hex: '#78350f', text: '#fde68a', mult: 10, tol: 1 },
  { digit: 2, name: 'Red', hex: '#dc2626', text: '#ffffff', mult: 100, tol: 2 },
  { digit: 3, name: 'Orange', hex: '#ea580c', text: '#ffffff', mult: 1000, tol: null },
  { digit: 4, name: 'Yellow', hex: '#ca8a04', text: '#000000', mult: 10000, tol: null },
  { digit: 5, name: 'Green', hex: '#16a34a', text: '#ffffff', mult: 100000, tol: 0.5 },
  { digit: 6, name: 'Blue', hex: '#2563eb', text: '#ffffff', mult: 1000000, tol: 0.25 },
  { digit: 7, name: 'Violet', hex: '#9333ea', text: '#ffffff', mult: 10000000, tol: 0.1 },
  { digit: 8, name: 'Grey', hex: '#64748b', text: '#ffffff', mult: null, tol: 0.05 },
  { digit: 9, name: 'White', hex: '#f8fafc', text: '#0f172a', mult: null, tol: null },
  { digit: -1, name: 'Gold', hex: '#d97706', text: '#ffffff', mult: 0.1, tol: 5 },
  { digit: -2, name: 'Silver', hex: '#94a3b8', text: '#0f172a', mult: 0.01, tol: 10 },
];

export const CableSizingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cable' | 'motor' | 'power_factor' | 'resistor'>('cable');

  // Cable Sizing States
  const [supplyType, setSupplyType] = useState<SupplyType>('single_phase');
  const [loadType, setLoadType] = useState<'kw' | 'amps' | 'kva'>('kw');
  const [loadValue, setLoadValue] = useState<number>(3.5);
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [lengthMeters, setLengthMeters] = useState<number>(25);
  const [installationMethod, setInstallationMethod] = useState<InstallationMethod>('conduit_wall');
  const [insulationType, setInsulationType] = useState<InsulationType>('pvc_70');
  const [ambientTempC, setAmbientTempC] = useState<number>(30);
  const [groupingCount, setGroupingCount] = useState<number>(1);

  // Motor Run & Start Capacitor Calculator States
  const [motorKw, setMotorKw] = useState<number>(2.2);
  const [motorVoltage, setMotorVoltage] = useState<number>(230);
  const [motorEfficiency, setMotorEfficiency] = useState<number>(0.82);
  const [motorPf, setMotorPf] = useState<number>(0.85);

  // Power Factor Correction States
  const [pfActiveKw, setPfActiveKw] = useState<number>(45.0);
  const [pfInitialCos, setPfInitialCos] = useState<number>(0.74);
  const [pfTargetCos, setPfTargetCos] = useState<number>(0.98);
  const [pfVoltage, setPfVoltage] = useState<number>(400);
  const [pfIsThreePhase, setPfIsThreePhase] = useState<boolean>(true);

  // Resistor Decoder States
  const [resistorBandsCount, setResistorBandsCount] = useState<4 | 5>(4);
  const [band1, setBand1] = useState<number>(1); // Brown
  const [band2, setBand2] = useState<number>(0); // Black
  const [band3, setBand3] = useState<number>(0); // Black (for 5-band)
  const [bandMultiplier, setBandMultiplier] = useState<number>(2); // Red (x100)
  const [bandTolerance, setBandTolerance] = useState<number>(5); // Gold (5%)

  const calculationInput: CalculationInput = useMemo(
    () => ({
      supplyType,
      loadType,
      loadValue,
      powerFactor,
      lengthMeters,
      installationMethod,
      insulationType,
      ambientTempC,
      groupingCircuitsCount: groupingCount,
    }),
    [
      supplyType,
      loadType,
      loadValue,
      powerFactor,
      lengthMeters,
      installationMethod,
      insulationType,
      ambientTempC,
      groupingCount,
    ]
  );

  const result: CalculationResult = useMemo(() => calculateSANS10142Cable(calculationInput), [calculationInput]);

  const isOverallCompliant = result.isCapacityCompliant && result.isVoltageDropCompliant;

  // Motor Calculations
  const motorCalculations = useMemo(() => {
    const powerWatts = motorKw * 1000;
    const hp = Number((motorKw * 1.341).toFixed(2));
    const fla = Number((powerWatts / (motorVoltage * motorEfficiency * motorPf)).toFixed(1));
    const freq = 50;

    const runUfRaw = (powerWatts * motorEfficiency * 1000000) / (2 * Math.PI * freq * motorVoltage * motorVoltage);
    const runUf = Math.max(5, Number(runUfRaw.toFixed(1)));

    const startMin = Math.round((runUf * 3) / 5) * 5;
    const startMax = Math.round((runUf * 5) / 5) * 5;

    const minVac = motorVoltage <= 240 ? 450 : 600;

    return { hp, fla, runUf, startMin, startMax, minVac };
  }, [motorKw, motorVoltage, motorEfficiency, motorPf]);

  // Power Factor Calculations
  const pfCalculations = useMemo(() => {
    const cos1 = Math.max(0.4, Math.min(0.99, pfInitialCos));
    const cos2 = Math.max(cos1, Math.min(1.0, pfTargetCos));

    const tan1 = Math.tan(Math.acos(cos1));
    const tan2 = Math.tan(Math.acos(cos2));

    const s1 = Number((pfActiveKw / cos1).toFixed(1));
    const q1 = Number((pfActiveKw * tan1).toFixed(1));

    const s2 = Number((pfActiveKw / cos2).toFixed(1));
    const q2 = Number((pfActiveKw * tan2).toFixed(1));

    const qc = Math.max(0, Number((q1 - q2).toFixed(1)));

    const freq = 50;
    const capUf = pfIsThreePhase
      ? Number(((qc * 1e9) / (3 * 2 * Math.PI * freq * pfVoltage * pfVoltage)).toFixed(1))
      : Number(((qc * 1e9) / (2 * Math.PI * freq * pfVoltage * pfVoltage)).toFixed(1));

    const i1 = pfIsThreePhase
      ? Number(((s1 * 1000) / (Math.sqrt(3) * pfVoltage)).toFixed(1))
      : Number(((s1 * 1000) / pfVoltage).toFixed(1));

    const i2 = pfIsThreePhase
      ? Number(((s2 * 1000) / (Math.sqrt(3) * pfVoltage)).toFixed(1))
      : Number(((s2 * 1000) / pfVoltage).toFixed(1));

    const iSaved = Math.max(0, Number((i1 - i2).toFixed(1)));
    const percentReduction = i1 > 0 ? Number(((iSaved / i1) * 100).toFixed(1)) : 0;

    return { s1, q1, s2, q2, qc, capUf, i1, i2, iSaved, percentReduction };
  }, [pfActiveKw, pfInitialCos, pfTargetCos, pfVoltage, pfIsThreePhase]);

  // Resistor Calculations
  const resistorCalculations = useMemo(() => {
    const multObj = RESISTOR_COLORS.find((c) => c.digit === bandMultiplier) || RESISTOR_COLORS[2];
    const mult = multObj.mult ?? 1;

    let base = 0;
    if (resistorBandsCount === 5) {
      base = band1 * 100 + band2 * 10 + band3;
    } else {
      base = band1 * 10 + band2;
    }

    const ohms = base * mult;
    let formatted = '';
    if (ohms >= 1000000) {
      formatted = `${(ohms / 1000000).toFixed(2)} MΩ`;
    } else if (ohms >= 1000) {
      formatted = `${(ohms / 1000).toFixed(2)} kΩ`;
    } else {
      formatted = `${ohms.toFixed(2)} Ω`;
    }

    const minOhms = ohms * (1 - bandTolerance / 100);
    const maxOhms = ohms * (1 + bandTolerance / 100);

    return { ohms, formatted, minOhms, maxOhms };
  }, [resistorBandsCount, band1, band2, band3, bandMultiplier, bandTolerance]);

  const applyPreset = (preset: QuickPreset) => {
    setSupplyType(preset.supplyType);
    setLoadType(preset.loadType);
    setLoadValue(preset.loadValue);
    setPowerFactor(preset.powerFactor);
    setLengthMeters(preset.lengthMeters);
    setInstallationMethod(preset.method);
    setInsulationType(preset.insulation);
  };

  const resetDefaults = () => {
    setSupplyType('single_phase');
    setLoadType('kw');
    setLoadValue(3.5);
    setPowerFactor(0.85);
    setLengthMeters(25);
    setInstallationMethod('conduit_wall');
    setInsulationType('pvc_70');
    setAmbientTempC(30);
    setGroupingCount(1);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>SANS 10142-1 Electrical & HVAC-R Engineering Calculators</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Cable Sizing, Motors & Formula Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compliant with SANS 10142-1 Tables 6.4a-d, deratings, capacitor sizing, and power factor engineering.
          </p>
        </div>
        <button
          onClick={resetDefaults}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {[
          { id: 'cable', label: 'Cable & MCB Sizing', icon: Zap },
          { id: 'motor', label: 'Motor Capacitors', icon: Gauge },
          { id: 'power_factor', label: 'Power Factor & kVAR', icon: Activity },
          { id: 'resistor', label: 'Resistor Color Codes', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CABLE SIZING */}
      {activeTab === 'cable' && (
        <div className="space-y-6">
          {/* Quick Field Presets Strip */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wider">
              Quick Field Load Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/80 active:scale-98 transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] text-sky-400 font-medium">{preset.category}</span>
                  <span className="text-xs font-semibold text-white truncate mt-0.5">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Inputs vs Real-time Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Sizing Parameters (Inputs) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Section: Supply & Load */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>1. Supply Type & Electrical Load</span>
                </h2>

                {/* Supply Type Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSupplyType('single_phase')}
                    className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                      supplyType === 'single_phase'
                        ? 'bg-sky-950/70 border-sky-500 text-sky-200 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Single-Phase 230 V AC
                    <span className="block text-[11px] font-normal text-slate-400 mt-0.5">Residential / Light Com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplyType('three_phase')}
                    className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                      supplyType === 'three_phase'
                        ? 'bg-sky-950/70 border-sky-500 text-sky-200 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Three-Phase 400 V AC
                    <span className="block text-[11px] font-normal text-slate-400 mt-0.5">Commercial & Industrial</span>
                  </button>
                </div>

                {/* Load Value & Unit Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-300 font-medium">Load Magnitude</label>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {(['kw', 'amps', 'kva'] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setLoadType(unit)}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            loadType === unit ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="1000"
                      value={loadValue}
                      onChange={(e) => setLoadValue(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                    />
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase w-12 text-center">
                      {loadType}
                    </span>
                  </div>
                </div>

                {/* Power Factor (cos φ) Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Power Factor (cos φ)</span>
                    <span className="font-mono font-bold text-sky-400">{powerFactor.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.50"
                    max="1.00"
                    step="0.01"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.50 (Inductive Motors)</span>
                    <span>0.85 (Standard HVAC-R)</span>
                    <span>1.00 (Pure Resistive)</span>
                  </div>
                </div>
              </div>

              {/* Section: Route Distance & Installation Conditions */}
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>2. Routing, SANS Deratings & Installation Method</span>
                </h2>

                {/* Route Length */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">One-Way Route Length</span>
                    <span className="font-mono font-bold text-sky-400">{lengthMeters} meters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="200"
                      step="1"
                      value={lengthMeters}
                      onChange={(e) => setLengthMeters(parseInt(e.target.value) || 1)}
                      className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={lengthMeters}
                      onChange={(e) => setLengthMeters(parseInt(e.target.value) || 1)}
                      className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono text-center outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* SANS Installation Method */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">SANS 10142-1 Installation Method</label>
                  <select
                    value={installationMethod}
                    onChange={(e) => setInstallationMethod(e.target.value as InstallationMethod)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 outline-none"
                  >
                    {(Object.keys(INSTALLATION_METHOD_LABELS) as InstallationMethod[]).map((key) => {
                      const item = INSTALLATION_METHOD_LABELS[key];
                      return (
                        <option key={key} value={key}>
                          {item.name} ({item.sansRef})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Insulation Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Insulation Operating Temperature</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInsulationType('pvc_70')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        insulationType === 'pvc_70'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">70°C Copper PVC</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Surfix, Twin & Earth, GP Wire</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInsulationType('xlpe_90')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        insulationType === 'xlpe_90'
                          ? 'bg-sky-950/40 border-sky-500 text-sky-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">90°C Copper XLPE</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Armoured SWA, Heavy Feeder</div>
                    </button>
                  </div>
                </div>

                {/* Ambient Temperature & Grouping Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Ambient Temp Ct */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Ambient Temp (Ct)</span>
                      <span className="font-mono text-sky-400 font-bold">{ambientTempC}°C</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      step="5"
                      value={ambientTempC}
                      onChange={(e) => setAmbientTempC(parseInt(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-500">
                      Factor Ct = {result.deratingCt.toFixed(2)} (Table 6.2)
                    </div>
                  </div>

                  {/* Grouping Circuits Cg */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Bundled Circuits (Cg)</span>
                      <span className="font-mono text-sky-400 font-bold">{groupingCount} circuits</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="1"
                      value={groupingCount}
                      onChange={(e) => setGroupingCount(parseInt(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-500">
                      Factor Cg = {result.deratingCg.toFixed(2)} (Table 6.3)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: SANS Verification & Results Banner */}
            <div className="lg:col-span-5 space-y-5">
              <div
                className={`rounded-2xl p-5 border shadow-xl transition-all ${
                  isOverallCompliant
                    ? 'bg-slate-900 border-emerald-500/50 shadow-emerald-950/20'
                    : 'bg-slate-900 border-rose-500/60 shadow-rose-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      SANS 10142-1 Recommendation
                    </span>
                    <div className="text-3xl font-black text-white font-mono mt-1 tracking-tight">
                      {result.selectedCableSizeMm2} mm²
                    </div>
                    <div className="text-xs font-medium text-slate-300 mt-0.5">
                      {insulationType === 'pvc_70' ? '70°C Copper PVC' : '90°C Copper XLPE'} Conductor
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
                      isOverallCompliant
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-rose-950/80 border-rose-500 text-rose-300'
                    }`}
                  >
                    {isOverallCompliant ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>SANS PASS</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>SANS FAIL</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Key Verification Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium block">Design Load Current (Ib)</span>
                    <span className="text-base font-mono font-bold text-white mt-0.5 block">
                      {result.loadCurrentIb} A
                    </span>
                    <span className="text-[10px] text-slate-500">Nominal 230/400V</span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium block">Cable Derated Cap (Iz)</span>
                    <span className="text-base font-mono font-bold text-sky-400 mt-0.5 block">
                      {result.cableDeratedCapacity} A
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Base {result.cableBaseCapacity}A • Ct×Cg: {result.combinedDerating}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium block">Voltage Drop (ΔV)</span>
                    <span
                      className={`text-base font-mono font-bold mt-0.5 block ${
                        result.voltageDropPercent <= 5.0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.voltageDropVolts} V ({result.voltageDropPercent}%)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Max allowable: {result.maxAllowedVoltageDropVolts}V (5.0%)
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium block">Recommended MCB (In)</span>
                    <span className="text-base font-mono font-bold text-amber-400 mt-0.5 block">
                      {result.recommendedMcbRating} A
                    </span>
                    <span className="text-[10px] text-slate-500">Curve 1 / C (Table 6.8)</span>
                  </div>
                </div>

                {/* SANS Rule Check List */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>Ib ≤ In ≤ Iz Overcurrent Coordination</span>
                    <span
                      className={`font-mono font-bold ${
                        result.isOvercurrentCoordinated ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.loadCurrentIb}A ≤ {result.recommendedMcbRating}A ≤ {result.cableDeratedCapacity}A
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                    <span>Earth Wire Min Size (Table 6.5)</span>
                    <span className="font-mono font-bold text-sky-400">
                      {result.minimumEarthSizeMm2} mm² Cu
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 py-1">
                    <span>SANS Clause 6.2.8.2 (5% Drop)</span>
                    <span
                      className={`font-mono font-bold ${
                        result.voltageDropPercent <= 5.0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.voltageDropPercent}% {result.voltageDropPercent <= 5.0 ? '≤ 5.0% PASS' : '> 5.0% FAIL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOTOR RUN & START CAPACITORS */}
      {activeTab === 'motor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  <span>Single-Phase Motor & Compressor Specifications</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Calculate running capacitance (PSC) and potential relay hard-start kits for refrigeration compressors and pumps (50Hz SANS).
                </p>

                {/* Motor Power Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Motor Rating: {motorKw} kW ({motorCalculations.hp} HP)</span>
                    <span className="font-mono text-sky-400 font-bold">{motorCalculations.fla} A (FLA)</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="7.5"
                    step="0.05"
                    value={motorKw}
                    onChange={(e) => setMotorKw(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.25 kW (1/3 HP)</span>
                    <span>2.2 kW (3 HP Cold Room)</span>
                    <span>7.5 kW (10 HP Industrial)</span>
                  </div>
                </div>

                {/* Supply Voltage */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Operating Supply Voltage</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[230, 240].map((v) => (
                      <button
                        key={v}
                        onClick={() => setMotorVoltage(v)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          motorVoltage === v
                            ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {v} V AC (50 Hz Single Phase)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motor Efficiency and PF */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Efficiency (η)</span>
                      <span className="font-mono text-sky-400 font-bold">{(motorEfficiency * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.65"
                      max="0.95"
                      step="0.01"
                      value={motorEfficiency}
                      onChange={(e) => setMotorEfficiency(parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Power Factor (cos φ)</span>
                      <span className="font-mono text-sky-400 font-bold">{motorPf.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.70"
                      max="0.95"
                      step="0.01"
                      value={motorPf}
                      onChange={(e) => setMotorPf(parseFloat(e.target.value))}
                      className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Calculated Capacitances */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recommended Capacitor Specifications
                </span>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Run Capacitor (Continuous Duty):</span>
                    <span className="text-2xl font-bold font-mono text-sky-400">
                      {motorCalculations.runUf} µF
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Connect across Run (R) and Start (S) terminals. Minimum rating: {motorCalculations.minVac}V AC.
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Start Capacitor Kit (3-5x Run):</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {motorCalculations.startMin} – {motorCalculations.startMax} µF
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    With 15kΩ 2W Bleeder Resistor. Switched by 5-2-1 Potential Relay or PTC starter.
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>HVAC-R Field Rule of Thumb</span>
                  </div>
                  <p>
                    For South African 230V 50Hz single-phase compressors, approximately 35–45 µF per kW is required for run capacitors. Never install a 250V capacitor on 230V mains due to auxiliary winding back-EMF exceeding 350V AC.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POWER FACTOR & KVAR CORRECTION */}
      {activeTab === 'power_factor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Load Power & Target Cos φ Parameters</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Size automatic power factor correction capacitor banks to eliminate Eskom kVA maximum demand penalties.
                </p>

                {/* Active Power Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Active Load Power (P)</span>
                    <span className="font-mono text-sky-400 font-bold">{pfActiveKw} kW</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="250"
                    step="5"
                    value={pfActiveKw}
                    onChange={(e) => setPfActiveKw(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Initial vs Target PF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Existing cos φ</span>
                      <span className="font-mono text-rose-400 font-bold">{pfInitialCos.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.50"
                      max="0.95"
                      step="0.01"
                      value={pfInitialCos}
                      onChange={(e) => setPfInitialCos(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">Uncorrected inductive load</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Target cos φ</span>
                      <span className="font-mono text-emerald-400 font-bold">{pfTargetCos.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.90"
                      max="1.00"
                      step="0.01"
                      value={pfTargetCos}
                      onChange={(e) => setPfTargetCos(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">Eskom threshold ≥ 0.95</span>
                  </div>
                </div>

                {/* System Voltage */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Supply System</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPfIsThreePhase(true);
                        setPfVoltage(400);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        pfIsThreePhase
                          ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      3-Phase 400 V AC
                    </button>
                    <button
                      onClick={() => {
                        setPfIsThreePhase(false);
                        setPfVoltage(230);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        !pfIsThreePhase
                          ? 'bg-sky-950/70 border-sky-500 text-sky-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      1-Phase 230 V AC
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: S, Q, P Triangle & Savings */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Capacitor Bank Sizing Results
                </span>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Required Capacitor Bank:</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {pfCalculations.qc} kVAR
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800">
                    <span>Equivalent Capacitance (C):</span>
                    <span className="font-mono font-bold text-sky-400">{pfCalculations.capUf} µF</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Initial kVA / Amps</span>
                    <span className="text-sm font-mono font-bold text-white block mt-0.5">
                      {pfCalculations.s1} kVA
                    </span>
                    <span className="text-[11px] font-mono text-rose-400">{pfCalculations.i1} A</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Target kVA / Amps</span>
                    <span className="text-sm font-mono font-bold text-white block mt-0.5">
                      {pfCalculations.s2} kVA
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">{pfCalculations.i2} A</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-300">
                  <strong>Current Reduction:</strong> Line current drops by{' '}
                  <span className="font-mono font-bold">{pfCalculations.iSaved} A ({pfCalculations.percentReduction}%)</span>,
                  freeing distribution transformer capacity and eliminating low PF surcharge fines.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESISTOR & INDUCTOR COLOR CODES */}
      {activeTab === 'resistor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span>Color Band Selector</span>
                  </h2>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setResistorBandsCount(4)}
                      className={`px-3 py-1 rounded font-semibold ${
                        resistorBandsCount === 4 ? 'bg-sky-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      4-Band
                    </button>
                    <button
                      onClick={() => setResistorBandsCount(5)}
                      className={`px-3 py-1 rounded font-semibold ${
                        resistorBandsCount === 5 ? 'bg-sky-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      5-Band
                    </button>
                  </div>
                </div>

                {/* Band 1 */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 font-medium">1st Significant Digit</span>
                  <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                    {RESISTOR_COLORS.filter((c) => c.digit >= 1 && c.digit <= 9).map((c) => (
                      <button
                        key={c.digit}
                        onClick={() => setBand1(c.digit)}
                        style={{ backgroundColor: c.hex, color: c.text }}
                        className={`h-8 rounded-lg text-xs font-bold border transition-all ${
                          band1 === c.digit ? 'border-white ring-2 ring-sky-500 scale-105' : 'border-transparent'
                        }`}
                      >
                        {c.digit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Band 2 */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 font-medium">2nd Significant Digit</span>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {RESISTOR_COLORS.filter((c) => c.digit >= 0 && c.digit <= 9).map((c) => (
                      <button
                        key={c.digit}
                        onClick={() => setBand2(c.digit)}
                        style={{ backgroundColor: c.hex, color: c.text }}
                        className={`h-8 rounded-lg text-xs font-bold border transition-all ${
                          band2 === c.digit ? 'border-white ring-2 ring-sky-500 scale-105' : 'border-transparent'
                        }`}
                      >
                        {c.digit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Band 3 (if 5-band) */}
                {resistorBandsCount === 5 && (
                  <div className="space-y-1.5">
                    <span className="text-xs text-slate-300 font-medium">3rd Significant Digit</span>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                      {RESISTOR_COLORS.filter((c) => c.digit >= 0 && c.digit <= 9).map((c) => (
                        <button
                          key={c.digit}
                          onClick={() => setBand3(c.digit)}
                          style={{ backgroundColor: c.hex, color: c.text }}
                          className={`h-8 rounded-lg text-xs font-bold border transition-all ${
                            band3 === c.digit ? 'border-white ring-2 ring-sky-500 scale-105' : 'border-transparent'
                          }`}
                        >
                          {c.digit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiplier */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 font-medium">Multiplier (10^n)</span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {RESISTOR_COLORS.filter((c) => c.mult !== null).map((c) => (
                      <button
                        key={c.digit}
                        onClick={() => setBandMultiplier(c.digit)}
                        style={{ backgroundColor: c.hex, color: c.text }}
                        className={`h-8 rounded-lg text-[10px] font-bold border transition-all truncate px-1 ${
                          bandMultiplier === c.digit ? 'border-white ring-2 ring-sky-500 scale-105' : 'border-transparent'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tolerance */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 font-medium">Tolerance</span>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {[
                      { tol: 1, name: 'Brown (±1%)' },
                      { tol: 2, name: 'Red (±2%)' },
                      { tol: 0.5, name: 'Green (±0.5%)' },
                      { tol: 5, name: 'Gold (±5%)' },
                      { tol: 10, name: 'Silver (±10%)' },
                    ].map((item) => (
                      <button
                        key={item.tol}
                        onClick={() => setBandTolerance(item.tol)}
                        className={`p-2 rounded-lg border text-[11px] font-bold transition-all ${
                          bandTolerance === item.tol
                            ? 'bg-sky-600 text-white border-sky-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Resistor & Decoded Output */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Decoded Resistance
                </span>

                {/* Visual Resistor Display */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                  <div className="flex items-center w-full max-w-[260px] h-14 relative">
                    <div className="h-1 bg-slate-500 flex-1" />
                    <div className="w-36 h-12 bg-amber-100 rounded-lg flex items-center justify-around px-2 shadow-inner border border-amber-200/50 relative overflow-hidden">
                      <div
                        className="w-3 h-full"
                        style={{ backgroundColor: RESISTOR_COLORS.find((c) => c.digit === band1)?.hex }}
                      />
                      <div
                        className="w-3 h-full"
                        style={{ backgroundColor: RESISTOR_COLORS.find((c) => c.digit === band2)?.hex }}
                      />
                      {resistorBandsCount === 5 && (
                        <div
                          className="w-3 h-full"
                          style={{ backgroundColor: RESISTOR_COLORS.find((c) => c.digit === band3)?.hex }}
                        />
                      )}
                      <div
                        className="w-3 h-full"
                        style={{ backgroundColor: RESISTOR_COLORS.find((c) => c.digit === bandMultiplier)?.hex }}
                      />
                      <div
                        className="w-3 h-full"
                        style={{
                          backgroundColor:
                            bandTolerance === 5 ? '#d97706' : bandTolerance === 10 ? '#94a3b8' : '#78350f',
                        }}
                      />
                    </div>
                    <div className="h-1 bg-slate-500 flex-1" />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Nominal Resistance:</span>
                    <span className="text-2xl font-bold font-mono text-sky-400">
                      {resistorCalculations.formatted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800">
                    <span>Tolerance Range (±{bandTolerance}%):</span>
                    <span className="font-mono text-slate-300">
                      {resistorCalculations.minOhms.toFixed(1)} Ω – {resistorCalculations.maxOhms.toFixed(1)} Ω
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="font-bold text-white">SMD Resistor Quick Tips:</div>
                  <p>
                    • 3-Digit (e.g. <strong>103</strong>): 10 × 10³ = 10,000 Ω (10 kΩ)<br />
                    • 4-Digit (e.g. <strong>4702</strong>): 470 × 10² = 47,000 Ω (47 kΩ)<br />
                    • R-Notation (e.g. <strong>R050</strong>): 0.050 Ω current sense shunt resistor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

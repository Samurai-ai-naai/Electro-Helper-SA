import React, { useState, useMemo } from 'react';
import {
  InstallationMethod,
  InsulationType,
  SupplyType,
} from '../types/sans';
import {
  INSTALLATION_METHOD_LABELS,
  SANS_AMBIENT_DERATING_PVC,
  SANS_GROUPING_DERATING,
} from '../data/sansTables';
import { calculateSANS10142Cable, CalculationInput } from '../utils/sansCalculator';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Shield,
  Layers,
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
    id: 'aircon_12000btu',
    name: 'Inverter Aircon 12k BTU (1.2 kW)',
    category: 'HVAC',
    supplyType: 'single_phase',
    loadType: 'kw',
    loadValue: 1.2,
    powerFactor: 0.90,
    lengthMeters: 25,
    method: 'clipped_direct',
    insulation: 'pvc_70',
  },
  {
    id: 'cold_room_5kw',
    name: 'Cold Room Compressor (5.5 kW 3-Ph)',
    category: 'Refrigeration',
    supplyType: 'three_phase',
    loadType: 'kw',
    loadValue: 5.5,
    powerFactor: 0.85,
    lengthMeters: 40,
    method: 'conduit_wall',
    insulation: 'pvc_70',
  },
  {
    id: 'sub_db_60a',
    name: 'Outbuilding Sub-DB Feeder (60 A)',
    category: 'Distribution',
    supplyType: 'single_phase',
    loadType: 'amps',
    loadValue: 60.0,
    powerFactor: 0.95,
    lengthMeters: 35,
    method: 'underground_duct',
    insulation: 'xlpe_90',
  },
  {
    id: 'borehole_pump',
    name: 'Borehole Submersible (2.2 kW)',
    category: 'Pumping',
    supplyType: 'single_phase',
    loadType: 'kw',
    loadValue: 2.2,
    powerFactor: 0.82,
    lengthMeters: 65,
    method: 'underground_duct',
    insulation: 'pvc_70',
  },
];

export const CableSizingScreen: React.FC = () => {
  // Input states
  const [supplyType, setSupplyType] = useState<SupplyType>('single_phase');
  const [loadType, setLoadType] = useState<'kw' | 'amps' | 'kva'>('kw');
  const [loadValue, setLoadValue] = useState<number>(3.0);
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [lengthMeters, setLengthMeters] = useState<number>(20);
  const [installationMethod, setInstallationMethod] = useState<InstallationMethod>('conduit_wall');
  const [insulationType, setInsulationType] = useState<InsulationType>('pvc_70');
  const [ambientTempC, setAmbientTempC] = useState<number>(30);
  const [groupingCount, setGroupingCount] = useState<number>(1);

  // Active calculation input object
  const calcInput: CalculationInput = useMemo(
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

  // Run calculation in real time
  const result = useMemo(() => calculateSANS10142Cable(calcInput), [calcInput]);

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
    setLoadValue(3.0);
    setPowerFactor(0.85);
    setLengthMeters(20);
    setInstallationMethod('conduit_wall');
    setInsulationType('pvc_70');
    setAmbientTempC(30);
    setGroupingCount(1);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Standard Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-sky-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>SANS 10142-1:2020 Clause 6.2 & Table 6.4b</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Cable Sizing & Voltage Drop Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Exact mathematical sizing for 70°C PVC & 90°C XLPE copper cables under South African regulations.
          </p>
        </div>
        <button
          onClick={resetDefaults}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

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
                <span className="block text-[11px] font-normal text-slate-400 mt-0.5">Commercial / Industrial</span>
              </button>
            </div>

            {/* Load Input & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Load Magnitude
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-sky-500 transition-colors">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    value={loadValue}
                    onChange={(e) => setLoadValue(Math.max(0.1, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 text-base font-bold text-white bg-transparent outline-none tabular-nums"
                  />
                  <div className="flex bg-slate-900 border-l border-slate-800">
                    <button
                      type="button"
                      onClick={() => setLoadType('kw')}
                      className={`px-3 text-xs font-semibold ${
                        loadType === 'kw' ? 'text-sky-400 bg-sky-950/50' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      kW
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoadType('amps')}
                      className={`px-3 text-xs font-semibold ${
                        loadType === 'amps' ? 'text-sky-400 bg-sky-950/50' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Amps
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoadType('kva')}
                      className={`px-3 text-xs font-semibold ${
                        loadType === 'kva' ? 'text-sky-400 bg-sky-950/50' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      kVA
                    </button>
                  </div>
                </div>
              </div>

              {/* Power Factor (cos φ) */}
              <div className="sm:col-span-5">
                <label className="text-xs text-slate-400 mb-1.5 block font-medium flex justify-between">
                  <span>Power Factor (cos φ)</span>
                  <span className="font-mono text-sky-400 font-bold">{powerFactor.toFixed(2)}</span>
                </label>
                <div className="flex items-center gap-2 h-11">
                  <input
                    type="range"
                    min="0.70"
                    max="1.00"
                    step="0.01"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* Cable Run Length */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium flex justify-between">
                <span>One-Way Cable Route Length (L)</span>
                <span className="font-mono text-amber-400 font-bold">{lengthMeters} meters</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="250"
                  step="1"
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="w-20 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={lengthMeters}
                    onChange={(e) => setLengthMeters(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 text-center font-mono font-bold text-sm bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Installation Environment & Derating */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>2. Installation Method & Deratings</span>
            </h2>

            {/* Installation Method Options */}
            <div>
              <label className="text-xs text-slate-400 mb-2 block font-medium">
                Installation Method (SANS 10142-1 Table 6.4)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(INSTALLATION_METHOD_LABELS) as InstallationMethod[]).map((m) => {
                  const info = INSTALLATION_METHOD_LABELS[m];
                  const isSelected = installationMethod === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInstallationMethod(m)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{info.name}</span>
                        <span className="text-[10px] font-mono text-sky-400">{info.sansRef}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {info.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Insulation Type & Ambient / Grouping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Insulation Type */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Insulation Class
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setInsulationType('pvc_70')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      insulationType === 'pvc_70' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    70°C PVC
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsulationType('xlpe_90')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      insulationType === 'xlpe_90' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    90°C XLPE
                  </button>
                </div>
              </div>

              {/* Ambient Temp */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium flex justify-between">
                  <span>Ambient Temp</span>
                  <span className="font-mono text-white font-bold">{ambientTempC}°C</span>
                </label>
                <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
                  {[25, 30, 35, 40, 50].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAmbientTempC(t)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg ${
                        ambientTempC === t ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouping Circuits */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium flex justify-between">
                  <span>Grouped Circuits</span>
                  <span className="font-mono text-white font-bold">{groupingCount}</span>
                </label>
                <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
                  {[1, 2, 3, 4, 6].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGroupingCount(c)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg ${
                        groupingCount === c ? 'bg-slate-800 text-sky-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Recommended Sizing */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Recommended Cable Size Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 border-2 border-sky-500/70 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-28 h-28 text-sky-400" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                <span>Recommended SANS 10142-1 Cable</span>
                <span className="font-mono bg-sky-950/80 px-2 py-0.5 rounded text-sky-300">
                  {insulationType === 'pvc_70' ? '70°C Copper PVC' : '90°C Copper XLPE'}
                </span>
              </div>

              {/* Big Cable Size Display */}
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                  {result.selectedCableSizeMm2}
                </span>
                <span className="text-2xl font-bold text-sky-400">mm²</span>
                <span className="text-xs text-slate-400 ml-2">Copper Conductor</span>
              </div>

              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Design Current (Ib)</span>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {result.loadCurrentIb} A
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Derated Capacity (Iz)</span>
                  <span className="text-lg font-bold font-mono text-sky-400 tabular-nums">
                    {result.cableDeratedCapacity} A
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Voltage Drop (ΔV)</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-lg font-bold font-mono tabular-nums ${
                        result.isVoltageDropCompliant ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.voltageDropVolts} V
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({result.voltageDropPercent}%)
                    </span>
                  </div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Recommended MCB</span>
                  <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                    {result.recommendedMcbRating} A
                  </span>
                </div>
              </div>

              {/* Earth Conductor Sizing (Table 6.6) */}
              <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Min Earth Conductor (Table 6.6):</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {result.minimumEarthSizeMm2} mm² Copper Earth
                </span>
              </div>

              {/* Voltage Drop Status Banner */}
              <div
                className={`mt-4 p-3 rounded-xl border flex items-center gap-3 ${
                  result.isVoltageDropCompliant
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                {result.isVoltageDropCompliant ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-bold">
                    {result.isVoltageDropCompliant
                      ? 'Voltage Drop Within SANS 5.0% Limit'
                      : 'Exceeds SANS 5.0% Voltage Drop Limit!'}
                  </span>
                  <p className="opacity-80 mt-0.5">
                    Measured: {result.voltageDropVolts}V / Max Allowable: {result.maxAllowedVoltageDropVolts}V (5% of{' '}
                    {result.nominalVoltage}V)
                  </p>
                </div>
              </div>

              {/* Derating Factors Summary */}
              <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between px-1">
                <span>Thermal Ct: {result.deratingCt} ({ambientTempC}°C)</span>
                <span>Grouping Cg: {result.deratingCg} ({groupingCount} circuits)</span>
                <span>Total Factor: {result.combinedDerating}</span>
              </div>
            </div>
          </div>

          {/* SANS Clause Compliance List */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>SANS 10142-1 Clause Validations</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {result.sansClauses.map((clause, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold shrink-0">•</span>
                  <span>{clause}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SANS 10142 Cable Cross-Section Comparison Table */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              SANS Conductor Cross-Section Catalog Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates capacity derating and voltage drop for every copper cable gauge.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            Design Current: {result.loadCurrentIb} A @ {lengthMeters} m
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Size (mm²)</th>
                <th className="py-2.5 px-3">Derated Capacity (Iz)</th>
                <th className="py-2.5 px-3">Voltage Drop (V)</th>
                <th className="py-2.5 px-3">Drop (%)</th>
                <th className="py-2.5 px-3">Capacity Status</th>
                <th className="py-2.5 px-3">Volt Drop Status</th>
                <th className="py-2.5 px-3">SANS 10142 Sizing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {result.cableOptions.map((opt) => {
                const isSelected = opt.size === result.selectedCableSizeMm2;
                return (
                  <tr
                    key={opt.size}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-sky-950/40 text-white font-bold'
                        : opt.compliant
                        ? 'hover:bg-slate-800/40 text-slate-300'
                        : 'opacity-50 hover:opacity-80 text-slate-500'
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span>{opt.size} mm²</span>
                      {isSelected && (
                        <span className="text-[10px] bg-sky-500 text-slate-950 px-1.5 py-0.2 rounded font-sans font-bold">
                          SELECTED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums">{opt.deratedCapacity} A</td>
                    <td className="py-2.5 px-3 tabular-nums">{opt.voltDropVolts} V</td>
                    <td className="py-2.5 px-3 tabular-nums">{opt.voltDropPercent}%</td>
                    <td className="py-2.5 px-3 font-sans">
                      {opt.deratedCapacity >= result.loadCurrentIb ? (
                        <span className="text-emerald-400">Pass (≥ {result.loadCurrentIb}A)</span>
                      ) : (
                        <span className="text-rose-400">Overloaded (&lt; {result.loadCurrentIb}A)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {opt.voltDropPercent <= 5.0 ? (
                        <span className="text-emerald-400">Pass (≤ 5%)</span>
                      ) : (
                        <span className="text-rose-400">Fail (&gt; 5%)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {opt.compliant ? (
                        <span className="text-emerald-400 font-semibold">Compliant</span>
                      ) : (
                        <span className="text-slate-500">Non-compliant</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

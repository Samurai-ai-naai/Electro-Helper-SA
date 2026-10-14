import React, { useState, useMemo } from 'react';
import { DbCircuitItem, DbPhaseBalanceSummary } from '../types/sans';
import {
  Layers,
  Zap,
  Printer,
  Plus,
  Trash2,
  Shuffle,
  AlertTriangle,
} from 'lucide-react';

const INITIAL_CIRCUITS: DbCircuitItem[] = [
  { id: 'db_1', name: 'Lighting - Ground Floor', category: 'lighting', breakerRatingA: 10, loadWatts: 1200, phase: 'L1', poleCount: 1, isRcdProtected: true, cableSizeMm2: 1.5 },
  { id: 'db_2', name: 'Plugs 1 - Kitchen Counter', category: 'plugs', breakerRatingA: 20, loadWatts: 3400, phase: 'L2', poleCount: 1, isRcdProtected: true, cableSizeMm2: 2.5 },
  { id: 'db_3', name: 'Plugs 2 - Living Room & TV', category: 'plugs', breakerRatingA: 20, loadWatts: 2200, phase: 'L3', poleCount: 1, isRcdProtected: true, cableSizeMm2: 2.5 },
  { id: 'db_4', name: 'Main Residential Geyser', category: 'geyser', breakerRatingA: 20, loadWatts: 3000, phase: 'L1', poleCount: 1, isRcdProtected: false, cableSizeMm2: 2.5 },
  { id: 'db_5', name: 'Electric Stove & Oven', category: 'stove', breakerRatingA: 35, loadWatts: 6500, phase: 'L2', poleCount: 1, isRcdProtected: false, cableSizeMm2: 6.0 },
  { id: 'db_6', name: 'Cold Room Compressor', category: 'refrigeration', breakerRatingA: 25, loadWatts: 4200, phase: 'L3', poleCount: 1, isRcdProtected: true, cableSizeMm2: 4.0 },
  { id: 'db_7', name: 'Workshop Inverter Aircon', category: 'aircon', breakerRatingA: 16, loadWatts: 2400, phase: 'L1', poleCount: 1, isRcdProtected: true, cableSizeMm2: 2.5 },
  { id: 'db_8', name: 'Borehole Submersible Pump', category: 'motor', breakerRatingA: 16, loadWatts: 2200, phase: 'L2', poleCount: 1, isRcdProtected: true, cableSizeMm2: 2.5 },
  { id: 'db_9', name: 'Outbuilding Sub-DB', category: 'sub_db', breakerRatingA: 32, loadWatts: 4800, phase: 'L3', poleCount: 1, isRcdProtected: true, cableSizeMm2: 6.0 },
];

export const DbDesignScreen: React.FC = () => {
  const [supplyType, setSupplyType] = useState<'three_phase' | 'single_phase'>('three_phase');
  const [mainBreakerA, setMainBreakerA] = useState<number>(100);
  const [elcbRatingA, setElcbRatingA] = useState<number>(63);
  const [hasSpd, setHasSpd] = useState<boolean>(true);
  const [circuits, setCircuits] = useState<DbCircuitItem[]>(INITIAL_CIRCUITS);
  const [showLegendModal, setShowLegendModal] = useState<boolean>(false);

  // New circuit form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<DbCircuitItem['category']>('plugs');
  const [newBreakerA, setNewBreakerA] = useState(20);
  const [newWatts, setNewWatts] = useState(2500);
  const [newPhase, setNewPhase] = useState<'L1' | 'L2' | 'L3'>('L1');
  const [newRcd, setNewRcd] = useState(true);

  // Phase loading balance calculations
  const balanceSummary: DbPhaseBalanceSummary = useMemo(() => {
    let l1Watts = 0;
    let l2Watts = 0;
    let l3Watts = 0;

    circuits.forEach((c) => {
      if (c.phase === 'L1') l1Watts += c.loadWatts;
      else if (c.phase === 'L2') l2Watts += c.loadWatts;
      else if (c.phase === 'L3') l3Watts += c.loadWatts;
    });

    const vSingle = 230; // nominal 230V to neutral
    const l1Amps = Number((l1Watts / vSingle).toFixed(1));
    const l2Amps = Number((l2Watts / vSingle).toFixed(1));
    const l3Amps = Number((l3Watts / vSingle).toFixed(1));
    const totalWatts = l1Watts + l2Watts + l3Watts;
    const avgAmps = (l1Amps + l2Amps + l3Amps) / 3;

    let imbalancePercent = 0;
    if (avgAmps > 0) {
      const maxDev = Math.max(
        Math.abs(l1Amps - avgAmps),
        Math.abs(l2Amps - avgAmps),
        Math.abs(l3Amps - avgAmps)
      );
      imbalancePercent = Number(((maxDev / avgAmps) * 100).toFixed(1));
    }

    return {
      l1LoadWatts: l1Watts,
      l2LoadWatts: l2Watts,
      l3LoadWatts: l3Watts,
      l1LoadAmps: l1Amps,
      l2LoadAmps: l2Amps,
      l3LoadAmps: l3Amps,
      totalWatts,
      averageAmps: Number(avgAmps.toFixed(1)),
      imbalancePercent,
      isImbalanceAlert: imbalancePercent > 15.0, // SANS 10142 threshold
    };
  }, [circuits]);

  // Phase auto-balancer optimization algorithm (Greedy LPT heuristic)
  const autoBalancePhases = () => {
    if (supplyType === 'single_phase') return;
    const sorted = [...circuits].sort((a, b) => b.loadWatts - a.loadWatts);
    const phaseLoads = { L1: 0, L2: 0, L3: 0 };
    const updated: DbCircuitItem[] = [];

    sorted.forEach((circuit) => {
      // Find phase currently carrying the minimum load
      let minPhase: 'L1' | 'L2' | 'L3' = 'L1';
      if (phaseLoads.L2 < phaseLoads[minPhase]) minPhase = 'L2';
      if (phaseLoads.L3 < phaseLoads[minPhase]) minPhase = 'L3';

      phaseLoads[minPhase] += circuit.loadWatts;
      updated.push({ ...circuit, phase: minPhase });
    });

    setCircuits(updated);
  };

  const handleAddCircuit = () => {
    if (!newName.trim()) return;
    const cableSize = newBreakerA <= 10 ? 1.5 : newBreakerA <= 20 ? 2.5 : newBreakerA <= 32 ? 4.0 : 6.0;
    const item: DbCircuitItem = {
      id: 'db_' + Date.now(),
      name: newName.trim(),
      category: newCategory,
      breakerRatingA: newBreakerA,
      loadWatts: newWatts,
      phase: supplyType === 'single_phase' ? 'L1' : newPhase,
      poleCount: 1,
      isRcdProtected: newRcd,
      cableSizeMm2: cableSize,
    };
    setCircuits([...circuits, item]);
    setNewName('');
  };

  const handleDeleteCircuit = (id: string) => {
    setCircuits(circuits.filter((c) => c.id !== id));
  };

  const handleTogglePhase = (id: string) => {
    if (supplyType === 'single_phase') return;
    setCircuits(
      circuits.map((c) => {
        if (c.id !== id) return c;
        const nextPhase: 'L1' | 'L2' | 'L3' =
          c.phase === 'L1' ? 'L2' : c.phase === 'L2' ? 'L3' : 'L1';
        return { ...c, phase: nextPhase };
      })
    );
  };

  const maxPhaseWatts = Math.max(
    balanceSummary.l1LoadWatts,
    balanceSummary.l2LoadWatts,
    balanceSummary.l3LoadWatts,
    1
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Distribution Board Engineering & DIN-Rail Builder</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            DB Design & Three-Phase Load Balancer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build distribution board layouts, balance phase loadings (L1/L2/L3), and generate door legends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {supplyType === 'three_phase' && (
            <button
              onClick={autoBalancePhases}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl transition-all shadow-sm"
              title="Auto-distribute circuits to balance phase current"
            >
              <Shuffle className="w-4 h-4" />
              <span>Auto-Balance Phases</span>
            </button>
          )}
          <button
            onClick={() => setShowLegendModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl border border-slate-700 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print DB Legend</span>
          </button>
        </div>
      </div>

      {/* Supply Type & Incomer Controls */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>DB Supply Architecture & Main Incomers</span>
          </h2>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setSupplyType('three_phase')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                supplyType === 'three_phase' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Three-Phase (400V 3P+N)
            </button>
            <button
              type="button"
              onClick={() => setSupplyType('single_phase')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                supplyType === 'single_phase' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Single-Phase (230V 1P+N)
            </button>
          </div>
        </div>

        {/* Visual Incomer DIN Module Preview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Main Switch */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase">MAIN SWITCH</span>
            <span className="text-sm font-bold text-white mt-1">
              {mainBreakerA}A {supplyType === 'three_phase' ? '4P' : '2P'}
            </span>
            <span className="text-[10px] text-amber-400 mt-0.5">Isolator</span>
          </div>

          {/* Surge Protection */}
          {hasSpd && (
            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/50 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase">TYPE 2 SPD</span>
              <span className="text-sm font-bold text-emerald-400 mt-1">40 kA</span>
              <span className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> GREEN OK
              </span>
            </div>
          )}

          {/* Earth Leakage */}
          <div className="p-3 rounded-lg bg-slate-900 border border-sky-500/50 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase">EARTH LEAKAGE</span>
            <span className="text-sm font-bold text-sky-400 mt-1">{elcbRatingA}A 30mA</span>
            <span className="text-[10px] text-slate-400 mt-0.5">SANS 767</span>
          </div>

          <div className="flex-1 min-w-[200px] text-right text-slate-400 text-xs font-sans">
            Total Connected Circuits: <strong className="text-white">{circuits.length}</strong> •{' '}
            Total Connected Load:{' '}
            <strong className="text-amber-400 font-mono">
              {(balanceSummary.totalWatts / 1000).toFixed(1)} kW
            </strong>
          </div>
        </div>
      </div>

      {/* Three-Phase Balancing Meters */}
      {supplyType === 'three_phase' && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Phase Load Balancing (L1 / L2 / L3)</span>
              </h3>
              <p className="text-xs text-slate-400">
                SANS 10142-1 recommendation: Keep phase imbalance below 15% to prevent neutral overheating and voltage distortion.
              </p>
            </div>
            <span
              className={`text-xs font-bold font-mono px-3 py-1 rounded-lg border ${
                balanceSummary.isImbalanceAlert
                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}
            >
              Imbalance: {balanceSummary.imbalancePercent}%{' '}
              {balanceSummary.isImbalanceAlert ? '(EXCESSIVE > 15%)' : '(BALANCED ≤ 15%)'}
            </span>
          </div>

          {/* Phase Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Phase L1 (Red Phase) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase">Phase L1 (Red)</span>
                <span className="text-xs font-mono font-bold text-white">
                  {balanceSummary.l1LoadAmps} A
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(balanceSummary.l1LoadWatts / maxPhaseWatts) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Load: {(balanceSummary.l1LoadWatts / 1000).toFixed(1)} kW</span>
                <span>
                  {circuits.filter((c) => c.phase === 'L1').length} circuits
                </span>
              </div>
            </div>

            {/* Phase L2 (White/Yellow Phase) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Phase L2 (White)</span>
                <span className="text-xs font-mono font-bold text-white">
                  {balanceSummary.l2LoadAmps} A
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(balanceSummary.l2LoadWatts / maxPhaseWatts) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Load: {(balanceSummary.l2LoadWatts / 1000).toFixed(1)} kW</span>
                <span>
                  {circuits.filter((c) => c.phase === 'L2').length} circuits
                </span>
              </div>
            </div>

            {/* Phase L3 (Blue Phase) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase">Phase L3 (Blue)</span>
                <span className="text-xs font-mono font-bold text-white">
                  {balanceSummary.l3LoadAmps} A
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(balanceSummary.l3LoadWatts / maxPhaseWatts) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Load: {(balanceSummary.l3LoadWatts / 1000).toFixed(1)} kW</span>
                <span>
                  {circuits.filter((c) => c.phase === 'L3').length} circuits
                </span>
              </div>
            </div>
          </div>

          {/* Warning Banner if Imbalance > 15% */}
          {balanceSummary.isImbalanceAlert && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/60 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">SANS Phase Imbalance Warning ({balanceSummary.imbalancePercent}%):</strong>
                <p className="opacity-90 mt-0.5">
                  Uneven distribution causes high neutral circulating currents. Tap{' '}
                  <strong className="underline cursor-pointer" onClick={autoBalancePhases}>
                    Auto-Balance Phases
                  </strong>{' '}
                  or tap the phase tags below to redistribute high-wattage geyser/stove loads.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DIN Rail Circuit Breakers List */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">
              Connected Branch Circuit Breakers (DIN-Rail)
            </h3>
            <p className="text-xs text-slate-400">
              Tap the phase tag (L1 / L2 / L3) to toggle circuit phase allocation.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {circuits.map((circuit, idx) => (
            <div
              key={circuit.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 w-5">#{idx + 1}</span>
                {/* Phase Toggle Button */}
                {supplyType === 'three_phase' ? (
                  <button
                    onClick={() => handleTogglePhase(circuit.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold font-mono transition-transform active:scale-95 border ${
                      circuit.phase === 'L1'
                        ? 'bg-rose-950 text-rose-300 border-rose-700'
                        : circuit.phase === 'L2'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-sky-950 text-sky-300 border-sky-700'
                    }`}
                    title="Tap to switch phase"
                  >
                    {circuit.phase}
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300">
                    230V
                  </span>
                )}
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block">
                    {circuit.name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Cable: {circuit.cableSizeMm2} mm² Cu</span>
                    <span>•</span>
                    <span className={circuit.isRcdProtected ? 'text-emerald-400' : 'text-slate-500'}>
                      {circuit.isRcdProtected ? '30mA RCD' : 'No RCD (Dedicated/Main)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-amber-400 block">
                    {circuit.breakerRatingA}A MCB
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {circuit.loadWatts} W ({(circuit.loadWatts / 230).toFixed(1)} A)
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteCircuit(circuit.id)}
                  className="text-slate-600 hover:text-rose-400 p-1.5 transition-colors"
                  title="Remove circuit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Circuit Inline Form */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <input
            type="text"
            placeholder="Circuit Name (e.g. Swimming Pool Pump)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="sm:col-span-4 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
          />
          <input
            type="number"
            placeholder="Load Watts"
            value={newWatts}
            onChange={(e) => setNewWatts(Number(e.target.value))}
            className="sm:col-span-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
          />
          <select
            value={newBreakerA}
            onChange={(e) => setNewBreakerA(Number(e.target.value))}
            className="sm:col-span-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
          >
            {[10, 16, 20, 25, 32, 40, 50, 63].map((a) => (
              <option key={a} value={a}>
                {a}A Breaker
              </option>
            ))}
          </select>
          {supplyType === 'three_phase' && (
            <select
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value as any)}
              className="sm:col-span-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
            >
              <option value="L1">Phase L1</option>
              <option value="L2">Phase L2</option>
              <option value="L3">Phase L3</option>
            </select>
          )}
          <button
            type="button"
            onClick={handleAddCircuit}
            className={`${
              supplyType === 'three_phase' ? 'sm:col-span-2' : 'sm:col-span-4'
            } flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Circuit</span>
          </button>
        </div>
      </div>

      {/* DB Door Schedule / Circuit Legend Modal */}
      {showLegendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-white text-sm">
                SANS 10142-1 Distribution Board Door Legend
              </h3>
              <button
                onClick={() => setShowLegendModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 leading-relaxed">
                <div className="font-bold text-white mb-1">DISTRIBUTION BOARD IDENTIFICATION SCHEDULE</div>
                <div>Supply: {supplyType === 'three_phase' ? 'Three-Phase 400V 50Hz' : 'Single-Phase 230V 50Hz'}</div>
                <div>Main Switch: {mainBreakerA}A | Earth Leakage: {elcbRatingA}A 30mA</div>
                <div>Phase Imbalance: {balanceSummary.imbalancePercent}% | Total Load: {(balanceSummary.totalWatts / 1000).toFixed(1)} kW</div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-1 px-2">Cct #</th>
                    <th className="py-1 px-2">Description</th>
                    <th className="py-1 px-2">Phase</th>
                    <th className="py-1 px-2">MCB</th>
                    <th className="py-1 px-2">Cable</th>
                    <th className="py-1 px-2">RCD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {circuits.map((c, i) => (
                    <tr key={c.id}>
                      <td className="py-1 px-2 font-bold">{i + 1}</td>
                      <td className="py-1 px-2 text-white">{c.name}</td>
                      <td className="py-1 px-2">{c.phase}</td>
                      <td className="py-1 px-2">{c.breakerRatingA}A</td>
                      <td className="py-1 px-2">{c.cableSizeMm2} mm²</td>
                      <td className="py-1 px-2">{c.isRcdProtected ? 'YES' : 'NO'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Door Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

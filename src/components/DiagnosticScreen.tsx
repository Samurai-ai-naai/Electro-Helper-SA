import React, { useState } from 'react';
import { DIAGNOSTIC_TREES, DiagnosticTree } from '../data/diagnosticTrees';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Gauge,
  ShieldAlert,
  ArrowRight,
  Calculator,
  Zap,
} from 'lucide-react';

export const DiagnosticScreen: React.FC = () => {
  const [selectedTreeId, setSelectedTreeId] = useState<string>(DIAGNOSTIC_TREES[0].id);
  const [currentNodeId, setCurrentNodeId] = useState<string>(DIAGNOSTIC_TREES[0].initialNodeId);
  const [stepHistory, setStepHistory] = useState<string[]>([DIAGNOSTIC_TREES[0].initialNodeId]);

  // Three-Phase Unbalance Sub-Calculator State (for Motor Diagnostics)
  const [vL1, setVL1] = useState(405);
  const [vL2, setVL2] = useState(392);
  const [vL3, setVL3] = useState(401);

  const activeTree: DiagnosticTree =
    DIAGNOSTIC_TREES.find((t) => t.id === selectedTreeId) || DIAGNOSTIC_TREES[0];
  const currentNode = activeTree.nodes[currentNodeId] || activeTree.nodes[activeTree.initialNodeId];

  const handleSelectTree = (treeId: string) => {
    setSelectedTreeId(treeId);
    const newTree = DIAGNOSTIC_TREES.find((t) => t.id === treeId) || DIAGNOSTIC_TREES[0];
    setCurrentNodeId(newTree.initialNodeId);
    setStepHistory([newTree.initialNodeId]);
  };

  const handleSelectOption = (nextNodeId?: string) => {
    if (!nextNodeId) return;
    setCurrentNodeId(nextNodeId);
    setStepHistory((prev) => [...prev, nextNodeId]);
  };

  const handleRestartTree = () => {
    setCurrentNodeId(activeTree.initialNodeId);
    setStepHistory([activeTree.initialNodeId]);
  };

  // 3-Phase Unbalance Calculation
  const vAvg = (vL1 + vL2 + vL3) / 3;
  const maxDev = Math.max(Math.abs(vL1 - vAvg), Math.abs(vL2 - vAvg), Math.abs(vL3 - vAvg));
  const percentUnbalance = Number(((maxDev / vAvg) * 100).toFixed(2));
  const isUnbalanceDangerous = percentUnbalance > 2.0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>On-Site Systematic Fault Isolation Trees</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            HVAC-R & Electrical Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Clause-compliant interactive troubleshooting flowcharts for nuisance trips, compressor lockups, and solar islanding.
          </p>
        </div>

        {/* Tree Restart Button */}
        <button
          onClick={handleRestartTree}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-semibold self-start sm:self-auto transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Tree</span>
        </button>
      </div>

      {/* Tree Category Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DIAGNOSTIC_TREES.map((tree) => {
          const isSelected = selectedTreeId === tree.id;
          return (
            <button
              key={tree.id}
              onClick={() => handleSelectTree(tree.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold tracking-wider opacity-75">
                {tree.category}
              </span>
              <span>{tree.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Node Viewport */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-sky-950 text-sky-400 border border-sky-800 font-mono text-xs font-bold">
              Step {currentNode.stepNumber}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {currentNode.title}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Path depth: {stepHistory.length}
          </span>
        </div>

        {/* Inspection Instruction */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {currentNode.instruction}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
            {currentNode.multimeterSetting && (
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Multimeter / Test Setting</span>
                  <span className="font-mono text-sky-300 font-semibold">
                    {currentNode.multimeterSetting}
                  </span>
                </div>
              </div>
            )}
            {currentNode.expectedReading && (
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Expected Standard Baseline</span>
                  <span className="font-mono text-emerald-300 font-semibold">
                    {currentNode.expectedReading}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Safety Warning */}
          {currentNode.safetyWarning && (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/50 flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold">SANS Safety Directive:</strong> {currentNode.safetyWarning}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Branching Options */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Select Field Observation:
          </label>
          <div className="grid grid-cols-1 gap-3">
            {currentNode.options.map((opt, idx) => (
              <div
                key={idx}
                className="bg-slate-950 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{opt.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{opt.outcomeSummary}</span>
                </div>

                {/* Resolution / Remedy Card */}
                {opt.isResolution ? (
                  <div
                    className={`p-4 rounded-xl border space-y-2.5 ${
                      opt.resolutionType === 'pass'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : opt.resolutionType === 'fail'
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                        : 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.resolutionType === 'pass' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {opt.resolutionType === 'pass'
                          ? 'SANS Resolution & Fix Identified'
                          : 'Mandatory Defect Rectification Required'}
                      </span>
                    </div>

                    {opt.remedySteps && (
                      <ul className="space-y-1.5 text-xs">
                        {opt.remedySteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {opt.sansRef && (
                      <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-sky-300">
                        Reference: {opt.sansRef}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectOption(opt.nextNodeId)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold active:scale-95 transition-all shadow-sm"
                  >
                    <span>Proceed to Next Diagnostic Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field Utility: Three-Phase Voltage Unbalance Calculator */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-400" />
              <span>Three-Phase Voltage Unbalance & Motor Derating Calculator</span>
            </h3>
            <p className="text-xs text-slate-400">
              SANS / NEMA limit: Voltage unbalance exceeding 1.0% causes extreme motor winding heating. Over 2.0% requires derating.
            </p>
          </div>
          <span
            className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
              isUnbalanceDangerous
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}
          >
            Unbalance: {percentUnbalance}% {isUnbalanceDangerous ? '(EXCESSIVE)' : '(SAFE)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-400 mb-1 block font-medium">Phase L1-L2 Voltage (V)</label>
            <input
              type="number"
              value={vL1}
              onChange={(e) => setVL1(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-slate-400 mb-1 block font-medium">Phase L2-L3 Voltage (V)</label>
            <input
              type="number"
              value={vL2}
              onChange={(e) => setVL2(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-slate-400 mb-1 block font-medium">Phase L3-L1 Voltage (V)</label>
            <input
              type="number"
              value={vL3}
              onChange={(e) => setVL3(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span>Average Line Voltage: <strong className="text-white font-mono">{vAvg.toFixed(1)} V</strong></span>
          <span>Max Deviation: <strong className="text-white font-mono">{maxDev.toFixed(1)} V</strong></span>
          <span className={isUnbalanceDangerous ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
            Winding Temperature Rise Factor: ~{Math.round(2 * Math.pow(percentUnbalance, 2))}%
          </span>
        </div>
      </div>

      {/* Interactive Tool: HVAC Compressor Winding Validator (C-R-S) */}
      <CompressorWindingValidator />

      {/* Interactive Tool: 50Hz RSA Capacitor Microfarad Tester */}
      <CapacitorMicrofaradTester />
    </div>
  );
};

const CompressorWindingValidator: React.FC = () => {
  const [rcr, setRcr] = useState<number>(3.2);
  const [rcs, setRcs] = useState<number>(6.8);
  const [rrs, setRrs] = useState<number>(10.0);

  const expectedRrs = rcr + rcs;
  const diffPercent = rrs > 0 ? (Math.abs(rrs - expectedRrs) / rrs) * 100 : 0;
  const isWindingPass = diffPercent <= 5.0 && rcs > rcr;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            <span>Single-Phase HVAC Compressor Winding Resistance Tester (C-R-S)</span>
          </h3>
          <p className="text-xs text-slate-400">
            SANS / Field Diagnostic Rule: R(Common-Run) + R(Common-Start) must equal R(Run-Start) within ±5%, and R(CS) &gt; R(CR).
          </p>
        </div>
        <span
          className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
            isWindingPass
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : 'bg-rose-950 text-rose-400 border border-rose-800'
          }`}
        >
          {isWindingPass ? '✓ WINDINGS BALANCED & HEALTHY' : '⚠ WINDING DEFECT DETECTED'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-slate-400 mb-1 block font-medium">Common to Run R(CR) [Ω]</label>
          <input
            type="number"
            step="0.1"
            value={rcr}
            onChange={(e) => setRcr(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
          />
          <span className="text-[10px] text-slate-500 mt-0.5 block">Run winding (lower resistance)</span>
        </div>
        <div>
          <label className="text-slate-400 mb-1 block font-medium">Common to Start R(CS) [Ω]</label>
          <input
            type="number"
            step="0.1"
            value={rcs}
            onChange={(e) => setRcs(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
          />
          <span className="text-[10px] text-slate-500 mt-0.5 block">Start winding (higher resistance)</span>
        </div>
        <div>
          <label className="text-slate-400 mb-1 block font-medium">Run to Start R(RS) [Ω]</label>
          <input
            type="number"
            step="0.1"
            value={rrs}
            onChange={(e) => setRrs(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
          />
          <span className="text-[10px] text-slate-500 mt-0.5 block">Total series resistance</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Calculated Sum R(CR) + R(CS): <strong className="text-white font-mono">{expectedRrs.toFixed(1)} Ω</strong> (Measured: <strong className="text-white font-mono">{rrs.toFixed(1)} Ω</strong>)</span>
        <span>Deviation: <strong className={diffPercent <= 5 ? 'text-emerald-400' : 'text-rose-400'}>{diffPercent.toFixed(1)}%</strong></span>
        <span className="text-[11px] text-slate-400">Remember to test each pin to ground casing with 500V DC (&gt;5 MΩ required)</span>
      </div>
    </div>
  );
};

const CapacitorMicrofaradTester: React.FC = () => {
  const [volts, setVolts] = useState<number>(230);
  const [amps, setAmps] = useState<number>(2.6);

  // South African 50Hz grid formula: C (uF) = (I * 2650) / V
  const calcUf = volts > 0 ? (amps * 2650) / volts : 0;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>50Hz Single-Phase Run/Start Capacitor Microfarad Tester</span>
          </h3>
          <p className="text-xs text-slate-400">
            Active under-load test formula for 50Hz RSA system: C (µF) = (I × 2650) / V.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Calculated Capacitance:</span>
          <span className="text-base font-black font-mono px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-lg">
            {calcUf.toFixed(1)} µF
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="text-slate-400 mb-1 block font-medium">Measured AC Voltage Across Capacitor (V)</label>
          <input
            type="number"
            value={volts}
            onChange={(e) => setVolts(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
          />
        </div>
        <div>
          <label className="text-slate-400 mb-1 block font-medium">Measured Current Through Capacitor Lead (A)</label>
          <input
            type="number"
            step="0.1"
            value={amps}
            onChange={(e) => setAmps(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold"
          />
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Tip: Compare calculated µF against the capacitor label rating. If the value has dropped by more than ±5%, replace the capacitor to avoid compressor motor overheating and starting torque failure.
      </p>
    </div>
  );
};

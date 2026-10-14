import React, { useState } from 'react';
import { CoCTestReading, SupplyType } from '../types/sans';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Printer,
  Copy,
  Download,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';

const INITIAL_READINGS: CoCTestReading[] = [
  {
    id: 'c1',
    circuitName: 'Main Feeder Incomer (100A 3-Ph)',
    breakerRatingA: 100,
    earthContinuityOhms: 0.04,
    insulationResistancePNE: 95.0,
    insulationResistancePE: 90.0,
    insulationResistanceNE: 85.0,
    earthLeakageTripCurrentMa: 22.0,
    earthLeakageTripTimeMs: 18.0,
    loopImpedanceZsOhms: 0.24,
    psccKa: 4.5,
    touchVoltageV: 8.2,
    breakerBreakingCapacityKa: 10.0,
    notes: 'Main distribution board incomer from Eskom municipal meter',
  },
  {
    id: 'c2',
    circuitName: 'Cold Room Compressor #1 (5.5kW)',
    breakerRatingA: 32,
    earthContinuityOhms: 0.12,
    insulationResistancePNE: 42.0,
    insulationResistancePE: 38.0,
    insulationResistanceNE: 40.0,
    earthLeakageTripCurrentMa: 24.0,
    earthLeakageTripTimeMs: 22.0,
    loopImpedanceZsOhms: 0.38,
    psccKa: 3.1,
    touchVoltageV: 13.5,
    breakerBreakingCapacityKa: 6.0,
    notes: 'Bitzer semi-hermetic compressor on AC-3 contactor',
  },
  {
    id: 'c3',
    circuitName: 'Evaporator Defrost Heaters (4kW)',
    breakerRatingA: 20,
    earthContinuityOhms: 0.14,
    insulationResistancePNE: 16.0,
    insulationResistancePE: 15.0,
    insulationResistanceNE: 14.0,
    earthLeakageTripCurrentMa: 23.0,
    earthLeakageTripTimeMs: 25.0,
    loopImpedanceZsOhms: 0.44,
    psccKa: 2.7,
    touchVoltageV: 16.0,
    breakerBreakingCapacityKa: 6.0,
    notes: 'Incoloy electric defrost elements with high-temp Klixon',
  },
  {
    id: 'c4',
    circuitName: 'General Purpose Sockets (Plugs 1)',
    breakerRatingA: 20,
    earthContinuityOhms: 0.16,
    insulationResistancePNE: 65.0,
    insulationResistancePE: 60.0,
    insulationResistanceNE: 55.0,
    earthLeakageTripCurrentMa: 21.0,
    earthLeakageTripTimeMs: 19.0,
    loopImpedanceZsOhms: 0.52,
    psccKa: 2.2,
    touchVoltageV: 18.2,
    breakerBreakingCapacityKa: 6.0,
    notes: 'Ring circuit fed via 30mA CBI Earth Leakage unit',
  },
];

export const CoCVerificationScreen: React.FC = () => {
  // Job Card & Installation Metadata
  const [certNumber, setCertNumber] = useState('EC-2026-SA0091');
  const [contractorName, setContractorName] = useState('ElectroServices SA (Pty) Ltd');
  const [accreditationNumber, setAccreditationNumber] = useState('ECA-GP-98421');
  const [clientName, setClientName] = useState('Pretoria Cold Storage Facility');
  const [installationAddress, setInstallationAddress] = useState('12 Van der Hoff Rd, Pretoria West');
  const [supplyType, setSupplyType] = useState<SupplyType>('three_phase');
  const [earthingSystem, setEarthingSystem] = useState<'TN-S' | 'TN-C-S' | 'TT'>('TN-S');
  const [testInstrument, setTestInstrument] = useState('Megger MFT1741+ Multifunction (SN: 20491823)');

  // Section 8 Visual Checklist States
  const [visualChecks, setVisualChecks] = useState({
    mainIsolatorAccessible: true,
    neutralEarthSeparatedCorrectly: true,
    dbLegendedAndIdentified: true,
    ip2xFingerSafeBarriers: true,
    surgeProtectionSpdFunctional: true,
    earthElectrodeBonded: true,
    geyserAndPipesBonded: true,
    cablesSecuredAndGlanded: true,
  });

  // Circuit Test Readings
  const [readings, setReadings] = useState<CoCTestReading[]>(INITIAL_READINGS);
  const [copiedReport, setCopiedReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // New Circuit Temp Form
  const [newCircuitName, setNewCircuitName] = useState('');
  const [newBreakerA, setNewBreakerA] = useState(20);
  const [newRpe, setNewRpe] = useState(0.09);
  const [newRins, setNewRins] = useState(50.0);
  const [newTripTime, setNewTripTime] = useState(19.0);
  const [newTripCurrent, setNewTripCurrent] = useState(22.0);
  const [newZs, setNewZs] = useState(0.40);
  const [newBreakingKa, setNewBreakingKa] = useState(6.0);

  const toggleVisualCheck = (key: keyof typeof visualChecks) => {
    setVisualChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddCircuit = () => {
    if (!newCircuitName.trim()) return;
    const zs = Math.max(0.01, newZs);
    const nominalV = supplyType === 'single_phase' ? 230 : 400;
    const faultCurrent = nominalV / zs;
    const psccKa = Number((faultCurrent / 1000).toFixed(2));
    const touchV = Number((faultCurrent * 0.15).toFixed(1));

    const newReading: CoCTestReading = {
      id: 'c_' + Date.now(),
      circuitName: newCircuitName.trim(),
      breakerRatingA: newBreakerA,
      earthContinuityOhms: newRpe,
      insulationResistancePNE: newRins,
      insulationResistancePE: newRins,
      insulationResistanceNE: newRins,
      earthLeakageTripCurrentMa: newTripCurrent,
      earthLeakageTripTimeMs: newTripTime,
      loopImpedanceZsOhms: zs,
      psccKa,
      touchVoltageV: touchV,
      breakerBreakingCapacityKa: newBreakingKa,
    };
    setReadings([...readings, newReading]);
    setNewCircuitName('');
  };

  const handleDeleteCircuit = (id: string) => {
    setReadings(readings.filter((r) => r.id !== id));
  };

  const updateReadingField = (id: string, field: keyof CoCTestReading, value: number | string) => {
    setReadings(
      readings.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === 'loopImpedanceZsOhms') {
          const zs = Math.max(0.01, Number(value));
          const nominalV = supplyType === 'single_phase' ? 230 : 400;
          const faultCurrent = nominalV / zs;
          updated.psccKa = Number((faultCurrent / 1000).toFixed(2));
          updated.touchVoltageV = Number((faultCurrent * 0.15).toFixed(1));
        }
        return updated;
      })
    );
  };

  // SANS Compliance Checkers
  const allVisualPass = Object.values(visualChecks).every(Boolean);

  const checkCircuitCompliance = (r: CoCTestReading) => {
    const continuityPass = r.earthContinuityOhms <= 0.20; // Clause 8.6.2 (Max 0.20 Ω)
    const insulationPass =
      r.insulationResistancePNE >= 1.0 &&
      r.insulationResistancePE >= 1.0 &&
      r.insulationResistanceNE >= 1.0; // Clause 8.6.3 (Min 1.0 MΩ at 500V DC)
    const earthLeakagePass = r.earthLeakageTripTimeMs <= 30.0; // Clause 8.6.4 (Max 30 ms)
    const psccPass = r.psccKa <= r.breakerBreakingCapacityKa; // Clause 8.6.5
    return {
      continuityPass,
      insulationPass,
      earthLeakagePass,
      psccPass,
      overallPass: continuityPass && insulationPass && earthLeakagePass && psccPass,
    };
  };

  const failedCircuitsCount = readings.filter((r) => !checkCircuitCompliance(r).overallPass).length;
  const isOverallCoCCompliant = allVisualPass && failedCircuitsCount === 0;

  // Generate formatted text job card report
  const generateReportText = () => {
    const lines = [
      '======================================================================',
      '   SOUTH AFRICAN SANS 10142-1 CERTIFICATE OF COMPLIANCE (CoC) REPORT',
      '======================================================================',
      `Certificate No: ${certNumber} | Date: ${new Date().toISOString().split('T')[0]}`,
      `Registered Contractor: ${contractorName} (${accreditationNumber})`,
      `Client / Owner:        ${clientName}`,
      `Physical Premises:     ${installationAddress}`,
      `Supply Specification:  ${supplyType === 'single_phase' ? 'Single-Phase 230V 50Hz' : 'Three-Phase 400V 50Hz'} | Earthing: ${earthingSystem}`,
      `Test Instrument:       ${testInstrument}`,
      '----------------------------------------------------------------------',
      '1. SECTION 8 TABLE 8.1 VISUAL INSPECTION CHECKLIST:',
      `   [${visualChecks.mainIsolatorAccessible ? 'PASS' : 'FAIL'}] Main Isolator accessible and rated`,
      `   [${visualChecks.neutralEarthSeparatedCorrectly ? 'PASS' : 'FAIL'}] Neutral and Earth busbars correctly isolated/bonded`,
      `   [${visualChecks.dbLegendedAndIdentified ? 'PASS' : 'FAIL'}] Distribution board legended and circuits labeled`,
      `   [${visualChecks.ip2xFingerSafeBarriers ? 'PASS' : 'FAIL'}] IP2X finger-safe barriers installed`,
      `   [${visualChecks.surgeProtectionSpdFunctional ? 'PASS' : 'FAIL'}] Type 2 Surge Protection Device (SPD) green indicator verified`,
      `   [${visualChecks.earthElectrodeBonded ? 'PASS' : 'FAIL'}] Earth electrode and main bonding conductor verified`,
      `   [${visualChecks.geyserAndPipesBonded ? 'PASS' : 'FAIL'}] Hot/Cold water pipes and geyser equipotentially bonded`,
      `   [${visualChecks.cablesSecuredAndGlanded ? 'PASS' : 'FAIL'}] Cable glands and strain relief verified`,
      '----------------------------------------------------------------------',
      '2. MANDATORY INSTRUMENT TEST READINGS (SANS 10142-1 Clause 8.6):',
    ];

    readings.forEach((r, idx) => {
      const c = checkCircuitCompliance(r);
      lines.push(`   Circuit #${idx + 1}: ${r.circuitName} (MCB: ${r.breakerRatingA}A)`);
      lines.push(`     - Earth Continuity (Rpe): ${r.earthContinuityOhms} Ω [${c.continuityPass ? 'PASS' : 'FAIL RED'}] (Limit: <= 0.20 Ω)`);
      lines.push(`     - Insulation Resistance: P-N: ${r.insulationResistancePNE}MΩ, P-E: ${r.insulationResistancePE}MΩ, N-E: ${r.insulationResistanceNE}MΩ [${c.insulationPass ? 'PASS' : 'FAIL RED'}] (Min: 1.0 MΩ)`);
      lines.push(`     - Earth Leakage 30mA: Trip Time: ${r.earthLeakageTripTimeMs} ms, Trip Current: ${r.earthLeakageTripCurrentMa} mA [${c.earthLeakagePass ? 'PASS' : 'FAIL'}] (Max: 30ms)`);
      lines.push(`     - Loop Zs: ${r.loopImpedanceZsOhms} Ω | PSCC: ${r.psccKa} kA | Breaking Capacity: ${r.breakerBreakingCapacityKa} kA [${c.psccPass ? 'SAFE' : 'OVERLOAD RISK'}]`);
    });

    lines.push('----------------------------------------------------------------------');
    lines.push(`FINAL SANS 10142 VERDICT: ${isOverallCoCCompliant ? 'COMPLIANT - APPROVED FOR CERTIFICATION' : 'NON-COMPLIANT - SANS DEVIATIONS DETECTED'}`);
    lines.push('======================================================================');
    return lines.join('\n');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReportText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SANS_CoC_Report_${certNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>SANS 10142-1:2020 Section 8 & Table 8.1 Verification</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Certificate of Compliance (CoC) Audit Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Digital testing checklist with instant pass/fail validation against South African limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl transition-all shadow-sm"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>View Job Card Report</span>
          </button>
        </div>
      </div>

      {/* SANS Overall Compliance Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isOverallCoCCompliant
            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {isOverallCoCCompliant ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
          )}
          <div>
            <h2 className="text-base font-bold">
              {isOverallCoCCompliant
                ? 'SANS 10142-1 COMPLIANT • READY FOR CERTIFICATION'
                : 'SANS 10142 NON-COMPLIANCE DETECTED'}
            </h2>
            <p className="text-xs opacity-80 mt-0.5">
              {isOverallCoCCompliant
                ? 'All visual criteria and Clause 8.6 test limits (continuity, insulation, 30mA trip) pass standard thresholds.'
                : `${failedCircuitsCount} circuit(s) or visual criteria currently violate SANS safety thresholds.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
            Circuits: {readings.length}
          </span>
          <span
            className={`px-3 py-1 rounded-lg font-bold ${
              failedCircuitsCount === 0
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-rose-500 text-white'
            }`}
          >
            {failedCircuitsCount === 0 ? '0 Defects' : `${failedCircuitsCount} Failures`}
          </span>
        </div>
      </div>

      {/* Premise & Contractor Details Accordion */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Installation & Accreditation Metadata</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 mb-1 block font-medium">CoC Reference #</label>
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 mb-1 block font-medium">Accredited Contractor</label>
            <input
              type="text"
              value={contractorName}
              onChange={(e) => setContractorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 mb-1 block font-medium">Client / Company Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 mb-1 block font-medium">Premises Address</label>
            <input
              type="text"
              value={installationAddress}
              onChange={(e) => setInstallationAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Section 8 Table 8.1 Visual Inspection Checklist */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>SANS 10142-1 Section 8 Visual Inspection Audit</span>
          </h3>
          <span className="text-xs text-sky-400 font-medium">Table 8.1 Standard Items</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {[
            { key: 'mainIsolatorAccessible', label: 'Main isolator accessible & rated' },
            { key: 'neutralEarthSeparatedCorrectly', label: 'Neutral/Earth busbars isolated/bonded' },
            { key: 'dbLegendedAndIdentified', label: 'DB legend & circuit identifiers labeled' },
            { key: 'ip2xFingerSafeBarriers', label: 'IP2X finger-safe touch protection' },
            { key: 'surgeProtectionSpdFunctional', label: 'Type 2 SPD green status verified' },
            { key: 'earthElectrodeBonded', label: 'Earth electrode & main earth conductor' },
            { key: 'geyserAndPipesBonded', label: 'Water pipes & geyser bonded' },
            { key: 'cablesSecuredAndGlanded', label: 'Cable glands & strain relief verified' },
          ].map(({ key, label }) => {
            const isChecked = visualChecks[key as keyof typeof visualChecks];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleVisualCheck(key as keyof typeof visualChecks)}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold text-[10px]'
                      : 'border-rose-400'
                  }`}
                >
                  {isChecked ? '✓' : '✗'}
                </div>
                <span className="text-xs font-medium leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mandatory Instrument Readings Table (Clause 8.6) */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">
              SANS 10142-1 Clause 8.6 Mandatory Test Readings
            </h3>
            <p className="text-xs text-slate-400">
              Limits: Earth Continuity ≤ 0.20 Ω (Clause 8.6.2) | Insulation Resistance ≥ 1.0 MΩ (500V DC) | ELCB 30mA ≤ 30 ms
            </p>
          </div>
        </div>

        {/* Readings List */}
        <div className="space-y-3">
          {readings.map((r) => {
            const comp = checkCircuitCompliance(r);
            return (
              <div
                key={r.id}
                className={`p-4 rounded-xl border transition-all ${
                  comp.overallPass
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-rose-950/20 border-rose-500/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        comp.overallPass ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-sm font-bold text-white">{r.circuitName}</span>
                    <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/40">
                      {r.breakerRatingA}A MCB
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                        comp.overallPass
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {comp.overallPass ? 'SANS PASS' : 'DEFECT DETECTED'}
                    </span>
                    <button
                      onClick={() => handleDeleteCircuit(r.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete circuit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid of measured parameters with live limits */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                  {/* Earth Continuity */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Earth Continuity (Rpe)</span>
                      <span className="text-[10px] text-slate-500">≤ 0.20 Ω</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        step="0.01"
                        value={r.earthContinuityOhms}
                        onChange={(e) =>
                          updateReadingField(r.id, 'earthContinuityOhms', Number(e.target.value))
                        }
                        className={`w-20 font-mono font-bold text-sm bg-slate-950 px-2 py-1 rounded border outline-none ${
                          comp.continuityPass
                            ? 'text-emerald-400 border-slate-700'
                            : 'text-rose-400 border-rose-500'
                        }`}
                      />
                      <span className="font-mono text-slate-400">Ω</span>
                    </div>
                  </div>

                  {/* Insulation Resistance */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Insulation (500V DC)</span>
                      <span className="text-[10px] text-slate-500">≥ 1.0 MΩ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        step="1"
                        value={r.insulationResistancePNE}
                        onChange={(e) =>
                          updateReadingField(r.id, 'insulationResistancePNE', Number(e.target.value))
                        }
                        className={`w-20 font-mono font-bold text-sm bg-slate-950 px-2 py-1 rounded border outline-none ${
                          comp.insulationPass
                            ? 'text-emerald-400 border-slate-700'
                            : 'text-rose-400 border-rose-500'
                        }`}
                      />
                      <span className="font-mono text-slate-400">MΩ</span>
                    </div>
                  </div>

                  {/* Earth Leakage Trip Time */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>30mA Trip Time</span>
                      <span className="text-[10px] text-slate-500">≤ 30 ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        step="1"
                        value={r.earthLeakageTripTimeMs}
                        onChange={(e) =>
                          updateReadingField(r.id, 'earthLeakageTripTimeMs', Number(e.target.value))
                        }
                        className={`w-20 font-mono font-bold text-sm bg-slate-950 px-2 py-1 rounded border outline-none ${
                          comp.earthLeakagePass
                            ? 'text-emerald-400 border-slate-700'
                            : 'text-rose-400 border-rose-500'
                        }`}
                      />
                      <span className="font-mono text-slate-400">ms</span>
                    </div>
                  </div>

                  {/* Loop Impedance Zs & PSCC */}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Loop Zs & PSCC</span>
                      <span className="text-[10px] text-slate-500">MCB: {r.breakerBreakingCapacityKa}kA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        step="0.01"
                        value={r.loopImpedanceZsOhms}
                        onChange={(e) =>
                          updateReadingField(r.id, 'loopImpedanceZsOhms', Number(e.target.value))
                        }
                        className="w-16 font-mono font-bold text-sm bg-slate-950 px-2 py-1 rounded border border-slate-700 text-sky-400 outline-none"
                      />
                      <span className="font-mono text-[11px] text-slate-400">
                        {r.psccKa} kA ({r.touchVoltageV}V)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Circuit Inline Form */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="New Circuit Name (e.g. Sub-DB Outbuilding, Solar Inverter AC)"
            value={newCircuitName}
            onChange={(e) => setNewCircuitName(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
          />
          <button
            type="button"
            onClick={handleAddCircuit}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Circuit Reading</span>
          </button>
        </div>
      </div>

      {/* Formatted Job Card Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  SANS 10142-1 CoC Verification Job Card
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1"
              >
                Close
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950 space-y-2 whitespace-pre-wrap leading-relaxed select-all">
              {generateReportText()}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReport ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official CoC</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

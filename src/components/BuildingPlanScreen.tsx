import React, { useState, useMemo } from 'react';
import {
  SA_ELECTRICAL_SYMBOLS,
  SANS_CONDUIT_SPECS,
  WIRE_GAUGE_AREAS,
} from '../data/buildingPlanSymbols';
import { PlanSymbolItem } from '../types/sans';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Ruler,
  Maximize2,
  Box,
  Plus,
  Trash2,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface WireCountRow {
  gauge: number;
  count: number;
}

export const BuildingPlanScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'switches' | 'sockets' | 'isolators' | 'lighting' | 'distribution'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Conduit Fill Estimator States
  const [roomName, setRoomName] = useState('Kitchen & Scullery');
  const [conduitSizeMm, setConduitSizeMm] = useState<number>(20);
  const [wireCounts, setWireCounts] = useState<WireCountRow[]>([
    { gauge: 2.5, count: 4 }, // 2 Live, 2 Neutral for Ring Sockets
    { gauge: 2.5, count: 2 }, // 2 Earth
    { gauge: 1.5, count: 2 }, // 1 Lighting strapper
  ]);

  const filteredSymbols = SA_ELECTRICAL_SYMBOLS.filter((sym) => {
    const matchesCat = selectedCategory === 'all' || sym.category === selectedCategory;
    const matchesQuery =
      sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sym.standardRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Calculate Conduit Fill Factor
  const conduitSpec = SANS_CONDUIT_SPECS[conduitSizeMm] || SANS_CONDUIT_SPECS[20];
  const fillCalculation = useMemo(() => {
    let totalCablesAreaMm2 = 0;
    let totalCablesCount = 0;

    wireCounts.forEach((row) => {
      const areaInfo = WIRE_GAUGE_AREAS[row.gauge] || { overallAreaMm2: 7.1 };
      totalCablesAreaMm2 += areaInfo.overallAreaMm2 * row.count;
      totalCablesCount += row.count;
    });

    const spaceFactorPercent = Number(
      ((totalCablesAreaMm2 / conduitSpec.internalAreaMm2) * 100).toFixed(1)
    );
    const maxAllowedPercent = 40.0; // SANS 10142-1 standard rule
    const isCompliant = spaceFactorPercent <= maxAllowedPercent;
    const remainingMm2 = Number((conduitSpec.usableAreaMm2_40pct - totalCablesAreaMm2).toFixed(1));

    return {
      totalCablesAreaMm2: Number(totalCablesAreaMm2.toFixed(1)),
      totalCablesCount,
      spaceFactorPercent,
      isCompliant,
      remainingMm2,
    };
  }, [wireCounts, conduitSpec]);

  const handleUpdateWireCount = (index: number, newCount: number) => {
    const updated = [...wireCounts];
    updated[index].count = Math.max(0, newCount);
    setWireCounts(updated);
  };

  const handleAddWireType = () => {
    setWireCounts([...wireCounts, { gauge: 2.5, count: 1 }]);
  };

  const handleRemoveWireType = (index: number) => {
    setWireCounts(wireCounts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>SANS 10143 & SANS 10142-1 Architectural Standard</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Building Plan Symbols & Conduit Fill Estimator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            South African architectural electrical symbols, standard mounting heights, and room conduit fill verification.
          </p>
        </div>
      </div>

      {/* Part A: Room-by-Room Conduit Fill Estimator */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-sky-400" />
              <span>Conduit Fill Estimator (SANS 10142-1 Clause 6.1.7)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Maximum allowable space occupancy is 40% to permit heat dissipation and draw-in without conductor stretching.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                fillCalculation.isCompliant
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-rose-950 text-rose-300 border-rose-700'
              }`}
            >
              Fill: {fillCalculation.spaceFactorPercent}% / 40.0% Max ({fillCalculation.isCompliant ? 'PASS' : 'OVERLOADED'})
            </span>
          </div>
        </div>

        {/* Room & Conduit Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Room / Conduit Zone Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>
          <div className="sm:col-span-6">
            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Conduit Outer Diameter (OD)</label>
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-700">
              {[16, 20, 25, 32].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setConduitSizeMm(sz)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    conduitSizeMm === sz ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sz} mm
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Fill Gauge */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>
              Conduit Size: <strong className="text-white font-mono">{conduitSizeMm} mm</strong> (Internal ID:{' '}
              {conduitSpec.innerDiameterMm} mm)
            </span>
            <span>
              Total Occupied Area:{' '}
              <strong className="text-white font-mono">{fillCalculation.totalCablesAreaMm2} mm²</strong> / 40% Limit:{' '}
              <strong className="text-sky-400 font-mono">{conduitSpec.usableAreaMm2_40pct} mm²</strong>
            </span>
          </div>
          {/* Progress Bar with 40% Marker */}
          <div className="relative w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-800">
            {/* 40% Threshold Indicator line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: '40%' }}
              title="SANS 40% Max Space Factor"
            />
            {/* Fill Width */}
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                fillCalculation.isCompliant ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, fillCalculation.spaceFactorPercent)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0%</span>
            <span className="text-amber-400 font-bold">40% SANS Limit</span>
            <span>100% Full</span>
          </div>
        </div>

        {/* Wire Inventory In Conduit */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Conductors Drawn in this Route:</span>
            <button
              onClick={handleAddWireType}
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Conductor Gauge</span>
            </button>
          </div>

          <div className="space-y-2">
            {wireCounts.map((row, idx) => {
              const info = WIRE_GAUGE_AREAS[row.gauge] || { overallAreaMm2: 7.1, overallDiaMm: 3.0 };
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <select
                      value={row.gauge}
                      onChange={(e) => {
                        const updated = [...wireCounts];
                        updated[idx].gauge = Number(e.target.value);
                        setWireCounts(updated);
                      }}
                      className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold outline-none"
                    >
                      {[1.5, 2.5, 4.0, 6.0, 10.0, 16.0].map((g) => (
                        <option key={g} value={g}>
                          {g} mm² PVC House Wire
                        </option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-mono text-[11px]">
                      (OD ~{info.overallDiaMm}mm | Area ~{info.overallAreaMm2}mm²)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Qty:</span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={row.count}
                        onChange={(e) => handleUpdateWireCount(idx, Number(e.target.value))}
                        className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-center font-mono font-bold text-white outline-none"
                      />
                    </div>
                    <span className="font-mono text-slate-300 w-16 text-right">
                      {(info.overallAreaMm2 * row.count).toFixed(1)} mm²
                    </span>
                    <button
                      onClick={() => handleRemoveWireType(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning or Success Message */}
        {!fillCalculation.isCompliant ? (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/60 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Conduit Overfill Violation:</strong>
              <p className="opacity-90 mt-0.5">
                Current fill is {fillCalculation.spaceFactorPercent}%, exceeding the 40% maximum allowed by SANS 10142-1.
                Increase conduit size to{' '}
                <strong className="underline cursor-pointer" onClick={() => setConduitSizeMm(conduitSizeMm === 16 ? 20 : conduitSizeMm === 20 ? 25 : 32)}>
                  {conduitSizeMm === 16 ? '20mm' : conduitSizeMm === 20 ? '25mm' : '32mm'}
                </strong>{' '}
                or run a second conduit to prevent cable insulation skinning during pulling.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>SANS Compliant Space Factor:</strong> {fillCalculation.spaceFactorPercent}% fill allows {fillCalculation.remainingMm2} mm² spare capacity for future draws and adequate thermal cooling.
            </span>
          </div>
        )}
      </div>

      {/* Part B: South African Architectural Symbols Catalog */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>South African Electrical Architectural Symbols (SANS 10143)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Official drafting symbols, standard mounting heights Above Finished Floor (AFF), and technical notes.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbols (e.g. SSO, Geyser, 2-Way, MDB, Batten)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'switches', label: 'Switches' },
              { id: 'sockets', label: 'Sockets' },
              { id: 'isolators', label: 'Isolators' },
              { id: 'lighting', label: 'Lighting' },
              { id: 'distribution', label: 'Boards' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symbols Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {filteredSymbols.map((sym) => (
            <div
              key={sym.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  {/* Symbol Vector Glyphs */}
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    {renderSymbolSvg(sym.symbolIcon)}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide block">
                      {sym.standardRef}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-snug mt-0.5">
                      {sym.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {sym.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Standard Mounting Height:</span>
                  <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {sym.mountingHeightAffMm} mm AFF
                  </span>
                </div>
                <p className="text-slate-400 leading-normal text-[10.5px]">
                  {sym.specs}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Render Vector Drawing of SA Architectural Symbols
function renderSymbolSvg(iconType: string) {
  switch (iconType) {
    case 'switch_1way':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-sky-400 stroke-current" fill="none" strokeWidth="2">
          <circle cx="16" cy="16" r="6" />
          <line x1="16" y1="10" x2="16" y2="2" />
          <line x1="16" y1="2" x2="22" y2="2" />
        </svg>
      );
    case 'switch_2way':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-amber-400 stroke-current" fill="none" strokeWidth="2">
          <circle cx="16" cy="16" r="6" />
          <line x1="16" y1="10" x2="16" y2="2" />
          <line x1="16" y1="2" x2="22" y2="2" />
          <line x1="16" y1="2" x2="10" y2="2" />
        </svg>
      );
    case 'switch_intermediate':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-purple-400 stroke-current" fill="none" strokeWidth="2">
          <circle cx="16" cy="16" r="6" />
          <line x1="16" y1="10" x2="16" y2="2" />
          <line x1="12" y1="4" x2="20" y2="4" />
          <line x1="12" y1="7" x2="20" y2="7" />
        </svg>
      );
    case 'switch_dimmer':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-emerald-400 stroke-current" fill="none" strokeWidth="2">
          <circle cx="16" cy="16" r="6" />
          <line x1="16" y1="10" x2="16" y2="2" />
          <line x1="16" y1="2" x2="22" y2="2" />
          <text x="16" y="19" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold" stroke="none">D</text>
        </svg>
      );
    case 'sso_standard':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-amber-400 stroke-current" fill="none" strokeWidth="2">
          <path d="M 6 22 A 10 10 0 0 1 26 22 Z" />
          <line x1="16" y1="12" x2="16" y2="6" />
        </svg>
      );
    case 'sso_double':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-amber-400 stroke-current" fill="none" strokeWidth="2">
          <path d="M 6 22 A 10 10 0 0 1 26 22 Z" />
          <line x1="13" y1="12" x2="13" y2="6" />
          <line x1="19" y1="12" x2="19" y2="6" />
        </svg>
      );
    case 'sso_dedicated':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-rose-500 stroke-current" fill="none" strokeWidth="2">
          <path d="M 6 22 A 10 10 0 0 1 26 22 Z" fill="#ef4444" fillOpacity="0.4" />
          <line x1="16" y1="12" x2="16" y2="6" />
        </svg>
      );
    case 'sso_weatherproof':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-sky-400 stroke-current" fill="none" strokeWidth="2">
          <path d="M 6 22 A 10 10 0 0 1 26 22 Z" />
          <line x1="16" y1="12" x2="16" y2="6" />
          <text x="16" y="21" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" stroke="none">WP</text>
        </svg>
      );
    case 'iso_geyser':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-amber-400 stroke-current" fill="none" strokeWidth="2">
          <rect x="6" y="8" width="20" height="16" rx="2" />
          <line x1="10" y1="16" x2="22" y2="16" />
          <text x="16" y="14" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold" stroke="none">G</text>
        </svg>
      );
    case 'iso_stove':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-rose-400 stroke-current" fill="none" strokeWidth="2">
          <rect x="6" y="8" width="20" height="16" rx="2" />
          <line x1="10" y1="16" x2="22" y2="16" />
          <text x="16" y="14" textAnchor="middle" fill="#f43f5e" fontSize="7" fontWeight="bold" stroke="none">S</text>
        </svg>
      );
    case 'iso_aircon':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-sky-400 stroke-current" fill="none" strokeWidth="2">
          <circle cx="16" cy="16" r="10" />
          <line x1="8" y1="16" x2="24" y2="16" />
          <text x="16" y="13" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontWeight="bold" stroke="none">AC</text>
        </svg>
      );
    case 'lum_ceiling':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-yellow-400 stroke-current" fill="none" strokeWidth="2">
          <circle cx="16" cy="16" r="7" />
          <line x1="11" y1="11" x2="21" y2="21" />
          <line x1="11" y1="21" x2="21" y2="11" />
        </svg>
      );
    case 'lum_fluorescent':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-yellow-300 stroke-current" fill="none" strokeWidth="2">
          <rect x="4" y="12" width="24" height="8" rx="1" />
          <line x1="4" y1="16" x2="28" y2="16" strokeDasharray="3,2" />
        </svg>
      );
    case 'lum_floodlight':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-orange-400 stroke-current" fill="none" strokeWidth="2">
          <polygon points="16,6 26,24 6,24" />
          <circle cx="16" cy="17" r="2" fill="#fb923c" />
        </svg>
      );
    case 'dist_main_db':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-emerald-400 stroke-current" fill="none" strokeWidth="2">
          <rect x="6" y="6" width="20" height="20" rx="2" />
          <line x1="6" y1="6" x2="26" y2="26" />
          <line x1="6" y1="26" x2="26" y2="6" />
          <text x="16" y="20" textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold" stroke="none">DB</text>
        </svg>
      );
    case 'dist_sub_db':
      return (
        <svg viewBox="0 0 32 32" className="w-8 h-8 text-sky-400 stroke-current" fill="none" strokeWidth="2">
          <rect x="6" y="6" width="20" height="20" rx="2" />
          <line x1="6" y1="6" x2="26" y2="26" />
          <text x="16" y="22" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontWeight="bold" stroke="none">SUB</text>
        </svg>
      );
    default:
      return <Box className="w-6 h-6 text-slate-400" />;
  }
}

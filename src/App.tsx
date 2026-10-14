/**
 * ElectroAssistant SA: Field Master
 * Premier South African Electrical & HVAC-R Engineering Suite compliant with SANS 10142-1/2/3.
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CableSizingScreen } from './components/CableSizingScreen';
import { CoCVerificationScreen } from './components/CoCVerificationScreen';
import { PinoutsScreen } from './components/PinoutsScreen';
import { DiagnosticScreen } from './components/DiagnosticScreen';
import { DbDesignScreen } from './components/DbDesignScreen';
import { BuildingPlanScreen } from './components/BuildingPlanScreen';
import { KotlinCodeViewer } from './components/KotlinCodeViewer';
import { DBFlashlightModal } from './components/DBFlashlightModal';
import {
  Zap,
  ClipboardCheck,
  Cpu,
  Compass,
  Layers,
  Ruler,
  FileCode2,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('cable_sizing');
  const [isFlashlightOpen, setIsFlashlightOpen] = useState<boolean>(false);

  const bottomNavItems = [
    { id: 'cable_sizing', label: 'Cables', icon: Zap },
    { id: 'coc_audit', label: 'CoC Audit', icon: ClipboardCheck },
    { id: 'pinouts', label: 'Pinouts', icon: Cpu },
    { id: 'diagnostics', label: 'Diagnose', icon: Compass },
    { id: 'db_design', label: 'DB Board', icon: Layers },
    { id: 'building_plan', label: 'Conduit', icon: Ruler },
    { id: 'kotlin_code', label: 'Kotlin', icon: FileCode2 },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      {/* Top App Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenFlashlight={() => setIsFlashlightOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'cable_sizing' && <CableSizingScreen />}
        {activeTab === 'coc_audit' && <CoCVerificationScreen />}
        {activeTab === 'pinouts' && <PinoutsScreen />}
        {activeTab === 'diagnostics' && <DiagnosticScreen />}
        {activeTab === 'db_design' && <DbDesignScreen />}
        {activeTab === 'building_plan' && <BuildingPlanScreen />}
        {activeTab === 'kotlin_code' && <KotlinCodeViewer />}
      </main>

      {/* High-Luminance DB Inspection Torch Modal */}
      <DBFlashlightModal
        isOpen={isFlashlightOpen}
        onClose={() => setIsFlashlightOpen(false)}
      />

      {/* Ergonomic Mobile Bottom Navigation Bar (Visible on mobile/tablet) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 lg:hidden">
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto overflow-x-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[48px] px-2 flex flex-col items-center justify-center transition-colors shrink-0 ${
                  isSelected ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

import React from 'react';
import {
  Zap,
  ClipboardCheck,
  Cpu,
  Compass,
  Layers,
  Ruler,
  FileCode2,
  Lightbulb,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenFlashlight: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenFlashlight,
}) => {
  const navItems = [
    { id: 'cable_sizing', label: '1. Cable Sizing', icon: Zap },
    { id: 'coc_audit', label: '2. CoC Audit', icon: ClipboardCheck },
    { id: 'pinouts', label: '3. Pinouts', icon: Cpu },
    { id: 'diagnostics', label: '4. Diagnostics', icon: Compass },
    { id: 'db_design', label: '5. DB Balancer', icon: Layers },
    { id: 'building_plan', label: '6. Plan & Conduit', icon: Ruler },
    { id: 'kotlin_code', label: 'Kotlin .kt', icon: FileCode2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
        {/* Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('cable_sizing');
          }}
          className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <span className="hidden min-[420px]:inline font-mono">ElectroAssistant SA</span>
        </a>

        {/* Desktop Single-Line Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-950/80 text-sky-300 border border-sky-600/50 shadow-sm'
                    : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action: DB Torch Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenFlashlight}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-lg transition-all shadow whitespace-nowrap"
            title="Inspect dark distribution board"
          >
            <Lightbulb className="w-3.5 h-3.5 fill-slate-950" />
            <span>DB Torch</span>
          </button>
        </div>
      </div>
    </header>
  );
};

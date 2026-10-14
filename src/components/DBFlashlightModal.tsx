import React, { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

interface DBFlashlightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DBFlashlightModal: React.FC<DBFlashlightModalProps> = ({ isOpen, onClose }) => {
  const [colorMode, setColorMode] = useState<'pure_white' | 'warm_amber' | 'high_cri'>('pure_white');
  const [brightness, setBrightness] = useState<number>(100);

  if (!isOpen) return null;

  const bgStyles = {
    pure_white: '#ffffff',
    warm_amber: '#fffbeb',
    high_cri: '#f8fafc',
  }[colorMode];

  const textColor = '#0f172a';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 transition-colors duration-200"
      style={{ backgroundColor: bgStyles, opacity: brightness / 100 }}
    >
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: textColor }}>
          <Lightbulb className="w-6 h-6 animate-pulse" />
          <span className="font-bold text-sm tracking-wide">DB INSPECTION FLASHLIGHT</span>
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-slate-900/10 hover:bg-slate-900/20 active:scale-95 transition-all text-slate-900"
          title="Exit Flashlight"
        >
          <X className="w-7 h-7" />
        </button>
      </div>

      {/* Center Guidance */}
      <div className="text-center my-auto px-4" style={{ color: textColor }}>
        <h2 className="text-2xl font-bold mb-2">High-Luminance Screen Torch</h2>
        <p className="text-sm max-w-sm mx-auto opacity-80">
          Point device screen toward distribution board busbars or dark compressor enclosures.
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="bg-slate-900/10 backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto w-full flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
          <span>Brightness: {brightness}%</span>
          <div className="flex gap-2">
            <button
              onClick={() => setColorMode('pure_white')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                colorMode === 'pure_white' ? 'bg-slate-900 text-white shadow' : 'bg-white/60 text-slate-900'
              }`}
            >
              Pure White
            </button>
            <button
              onClick={() => setColorMode('warm_amber')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                colorMode === 'warm_amber' ? 'bg-amber-600 text-white shadow' : 'bg-white/60 text-slate-900'
              }`}
            >
              Warm 3000K
            </button>
          </div>
        </div>

        <input
          type="range"
          min="30"
          max="100"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-900"
        />

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl active:scale-98 transition-transform shadow-md"
        >
          Tap to Dismiss Light
        </button>
      </div>
    </div>
  );
};

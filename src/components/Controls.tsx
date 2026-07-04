import React from 'react';

type QualityMode = 'low' | 'medium' | 'high';

interface ControlsProps {
  bhSize: number;
  setBhSize: (size: number) => void;
  onSimulate: () => void;
  isSimulating: boolean;
  quality: QualityMode;
  setQuality: (mode: QualityMode) => void;
  onPresetSelect: (size: number) => void;
  showCompanion: boolean;
  setShowCompanion: (value: boolean) => void;
  onCopyLink: () => void;
  onReset: () => void;
  copyMessage: string;
}

const presets = [
  { label: 'Tiny', value: 20, hint: 'asteroid scale' },
  { label: 'Moon', value: 3474000, hint: 'moon-sized' },
  { label: 'Earth', value: 12742000, hint: 'planet-sized' },
  { label: 'Jupiter', value: 139820000, hint: 'gas giant' },
  { label: 'Stellar', value: 30000000, hint: 'star-scale' },
];

const Controls: React.FC<ControlsProps> = ({
  bhSize,
  setBhSize,
  onSimulate,
  isSimulating,
  quality,
  setQuality,
  onPresetSelect,
  showCompanion,
  setShowCompanion,
  onCopyLink,
  onReset,
  copyMessage,
}) => {
  return (
    <div className="w-full lg:w-96 bg-white/10 backdrop-blur-lg p-6 sm:p-8 rounded-3xl border border-white/20">
      <h2 className="text-3xl font-bold mb-4">Black Hole Size</h2>
      <p className="text-sm text-gray-300 mb-4">Adjust the diameter or pick a quick preset to explore different outcomes.</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPresetSelect(preset.value)}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
          >
            <div className="font-semibold">{preset.label}</div>
            <div className="text-[11px] text-cyan-200/70">{preset.hint}</div>
          </button>
        ))}
      </div>

      <input
        type="range"
        min="1"
        max="50000000"
        value={bhSize}
        onChange={(e) => setBhSize(Number(e.target.value))}
        className="w-full mb-4 accent-red-500"
      />
      <p className="text-xl mb-4">Diameter: <strong>{bhSize.toLocaleString()} meters</strong></p>

      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300 mb-2">Quality</p>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as QualityMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setQuality(mode)}
              className={`rounded-xl border px-2 py-2 text-sm capitalize transition ${quality === mode ? 'border-amber-400 bg-amber-400/20 text-amber-100' : 'border-white/10 bg-white/5 text-gray-200'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowCompanion(!showCompanion)}
        className={`mb-4 w-full rounded-2xl border px-4 py-3 text-sm transition ${showCompanion ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100' : 'border-white/10 bg-white/5 text-gray-200'}`}
      >
        {showCompanion ? 'Hide companion object' : 'Show companion object'}
      </button>

      <div className="mb-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
        >
          Copy shareable link
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 transition hover:bg-white/10"
        >
          Reset view
        </button>
      </div>

      {copyMessage && <p className="mb-4 text-sm text-cyan-200">{copyMessage}</p>}

      <button
        onClick={onSimulate}
        disabled={isSimulating}
        className="w-full py-5 text-xl font-bold bg-red-600 hover:bg-red-700 rounded-2xl disabled:opacity-50 transition"
      >
        {isSimulating ? 'SIMULATING...' : 'RUN FIELD TEST'}
      </button>
    </div>
  );
};

export default Controls;
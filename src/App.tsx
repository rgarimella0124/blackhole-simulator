import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import SimulationScene from './components/SimulationScene';
import Controls from './components/Controls';
import { calculateImpactProfile } from './utils/physics';
import './App.css';

type QualityMode = 'low' | 'medium' | 'high';

function App() {
  const [bhSize, setBhSize] = useState(2000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState('');
  const [quality, setQuality] = useState<QualityMode>('medium');
  const [showCompanion, setShowCompanion] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const scenario = useMemo(() => calculateImpactProfile(bhSize), [bhSize]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sizeParam = Number(params.get('size'));
    const qualityParam = params.get('quality');
    const companionParam = params.get('companion');

    if (!Number.isNaN(sizeParam) && sizeParam > 0) {
      setBhSize(sizeParam);
    }
    if (qualityParam === 'low' || qualityParam === 'medium' || qualityParam === 'high') {
      setQuality(qualityParam);
    }
    if (companionParam === '1') {
      setShowCompanion(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('size', String(bhSize));
    params.set('quality', quality);
    if (showCompanion) {
      params.set('companion', '1');
    }

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', nextUrl);
  }, [bhSize, quality, showCompanion]);

  const handleSimulate = () => {
    setIsSimulating(true);
    setResult('');

    setTimeout(() => {
      setResult(scenario.outcome);
      setIsSimulating(false);
    }, 4000);
  };

  const handlePresetSelect = (size: number) => {
    setBhSize(size);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage('Link copied to clipboard.');
    } catch {
      setCopyMessage('Sharing is ready, but the clipboard was unavailable.');
    }
  };

  const handleReset = () => {
    setBhSize(2000);
    setQuality('medium');
    setShowCompanion(false);
    setResult('');
    setCopyMessage('');
  };

  const insights = [
    { title: 'Tidal forces', body: 'The closer the black hole gets, the more the Sun is stretched and disrupted.' },
    { title: 'Event horizon', body: 'The horizon marks the point where escape becomes impossible for nearby matter.' },
    { title: 'What to watch', body: 'The disk brightens, the halo distorts, and the camera closes in for a cinematic reveal.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1f] to-[#1a1a3a] p-3 sm:p-4">
      <header className="text-center py-6 sm:py-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">☀️ Sun vs Black Hole</h1>
        <p className="text-lg sm:text-xl text-gray-300">What happens when they meet?</p>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <Controls
          bhSize={bhSize}
          setBhSize={setBhSize}
          onSimulate={handleSimulate}
          isSimulating={isSimulating}
          quality={quality}
          setQuality={setQuality}
          onPresetSelect={handlePresetSelect}
          showCompanion={showCompanion}
          setShowCompanion={setShowCompanion}
          onCopyLink={handleCopyLink}
          onReset={handleReset}
          copyMessage={copyMessage}
        />

        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-700 bg-black" style={{ height: '420px', minHeight: '420px' }}>
          <Canvas
            camera={{ position: [0, 25, 45] }}
            dpr={quality === 'low' ? 1 : quality === 'medium' ? 1.25 : Math.min(window.devicePixelRatio || 1, 1.5)}
          >
            <SimulationScene
              bhRadius={bhSize / 2}
              isSimulating={isSimulating}
              impactProfile={scenario}
              quality={quality}
              showCompanion={showCompanion}
            />
          </Canvas>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Educational note</p>
              <h3 className="mt-2 text-2xl font-semibold">{scenario.title}</h3>
            </div>
            <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              {scenario.highlight}
            </span>
          </div>
          <p className="mt-4 text-lg text-gray-200">{scenario.summary}</p>
          <p className="mt-4 text-sm leading-7 text-gray-300">{scenario.fact}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {insights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-gray-300">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Science snapshot</p>
          <div className="mt-4 space-y-3 text-sm text-gray-200">
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span>Black hole size</span>
              <strong>{bhSize.toLocaleString()} m</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span>Estimated radius</span>
              <strong>{Math.round(bhSize / 2).toLocaleString()} m</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span>Mass ratio vs Sun</span>
              <strong>{scenario.massRatioToSun.toFixed(3)}×</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span>Runtime mode</span>
              <strong>{isSimulating ? 'In progress' : 'Ready'}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span>Quality preset</span>
              <strong>{quality}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span>Companion object</span>
              <strong>{showCompanion ? 'On' : 'Off'}</strong>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-green-500 bg-black/70 p-8 text-center">
          <h3 className="mb-4 text-2xl">Result</h3>
          <p className="text-xl">{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;
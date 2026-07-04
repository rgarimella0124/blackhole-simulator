import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import SimulationScene from './components/SimulationScene';
import Controls from './components/Controls';
import './App.css';

function App() {
  const [bhSize, setBhSize] = useState(2000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState('');

  const scenario = (() => {
    if (bhSize < 10000) {
      return {
        title: 'Tiny intruder',
        summary: 'A very small black hole is quickly overwhelmed by the Sun’s enormous mass.',
        fact: 'In this case the Sun would absorb the intruder long before it could do lasting damage.',
        highlight: 'The Sun wins comfortably.'
      };
    }

    if (bhSize < 1000000) {
      return {
        title: 'Medium collision',
        summary: 'A black hole of this size would distort the Sun and tear at its outer layers.',
        fact: 'This is the regime where tidal forces become dramatic and the star’s structure is heavily disrupted.',
        highlight: 'The Sun is badly damaged.'
      };
    }

    return {
      title: 'Catastrophic impact',
      summary: 'A very large black hole would dominate the system and consume the Sun’s material rapidly.',
      fact: 'Once the black hole is massive enough, the event horizon and tidal forces become overwhelmingly destructive.',
      highlight: 'The Sun is effectively destroyed.'
    };
  })();

  const handleSimulate = () => {
    setIsSimulating(true);
    setResult('');

    setTimeout(() => {
      let outcome = '';
      if (bhSize < 10000) {
        outcome = "🌞 The Sun easily gobbles up the tiny black hole!";
      } else if (bhSize < 1000000) {
        outcome = "⚠️ The black hole tears apart the Sun's outer layers.";
      } else {
        outcome = "💥 The massive black hole completely consumes the Sun!";
      }
      setResult(outcome);
      setIsSimulating(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1f] to-[#1a1a3a] p-4">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold mb-2">☀️ Sun vs Black Hole</h1>
        <p className="text-xl text-gray-300">What happens when they meet?</p>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <Controls 
          bhSize={bhSize} 
          setBhSize={setBhSize} 
          onSimulate={handleSimulate} 
          isSimulating={isSimulating} 
        />

        <div className="flex-1 bg-black rounded-2xl overflow-hidden border border-gray-700" style={{height: "600px"}}>
          <Canvas camera={{ position: [0, 25, 45] }}>
            <SimulationScene 
              bhRadius={bhSize / 2} 
              isSimulating={isSimulating} 
            />
          </Canvas>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Educational note</p>
              <h3 className="text-2xl font-semibold mt-2">{scenario.title}</h3>
            </div>
            <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              {scenario.highlight}
            </span>
          </div>
          <p className="mt-4 text-lg text-gray-200">{scenario.summary}</p>
          <p className="mt-4 text-sm leading-7 text-gray-300">{scenario.fact}</p>
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
              <span>Simulation mode</span>
              <strong>{isSimulating ? 'In progress' : 'Ready'}</strong>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="max-w-2xl mx-auto mt-8 p-8 bg-black/70 border border-green-500 rounded-2xl text-center">
          <h3 className="text-2xl mb-4">Result</h3>
          <p className="text-xl">{result}</p>
        </div>
      )}
    </div>
  );
}

export default App;
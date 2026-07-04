import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import SimulationScene from './components/SimulationScene';
import Controls from './components/Controls';
import './App.css';

function App() {
  const [bhSize, setBhSize] = useState(2000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState('');

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
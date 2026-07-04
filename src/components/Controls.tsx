import React from 'react';

interface ControlsProps {
  bhSize: number;
  setBhSize: (size: number) => void;
  onSimulate: () => void;
  isSimulating: boolean;
}

const Controls: React.FC<ControlsProps> = ({ bhSize, setBhSize, onSimulate, isSimulating }) => {
  return (
    <div className="w-full lg:w-96 bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
      <h2 className="text-3xl font-bold mb-6">Black Hole Size</h2>
      
      <input 
        type="range" 
        min="1" 
        max="50000000" 
        value={bhSize} 
        onChange={(e) => setBhSize(Number(e.target.value))}
        className="w-full mb-6 accent-red-500"
      />
      <p className="text-xl mb-8">Diameter: <strong>{bhSize.toLocaleString()} meters</strong></p>

      <button 
        onClick={onSimulate}
        disabled={isSimulating}
        className="w-full py-6 text-2xl font-bold bg-red-600 hover:bg-red-700 rounded-2xl disabled:opacity-50 transition"
      >
        {isSimulating ? "SIMULATING..." : "RUN FIELD TEST"}
      </button>
    </div>
  );
};

export default Controls;
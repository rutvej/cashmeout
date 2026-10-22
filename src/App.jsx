import React from 'react';
import { useGameStore } from './engine/store.js';
import LandingScreen from './components/screens/LandingScreen.jsx';

export default function App() {
  const { currentScreen, config, resetGame } = useGameStore();

  if (currentScreen === 'landing') {
    return <LandingScreen />;
  }

  // Placeholder for upcoming Screen 2
  if (currentScreen === 'spawn_reveal') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl max-w-md w-full space-y-3">
          <div className="text-emerald-400 font-mono text-sm font-semibold">
            ✓ Landing Complete → Screen 2 (Spawn Reveal)
          </div>
          <div className="text-left bg-slate-900 p-3 rounded-xl text-xs font-mono space-y-1 text-slate-300">
            <div><span className="text-slate-500">Seed:</span> {config.seed}</div>
            <div><span className="text-slate-500">City Tier:</span> {config.cityTier}</div>
            <div><span className="text-slate-500">Career Field:</span> {config.careerField}</div>
          </div>
          <button
            onClick={resetGame}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            ← Back to Landing
          </button>
        </div>
      </div>
    );
  }

  return null;
}

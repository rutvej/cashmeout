import React from 'react';
import { useGameStore } from './engine/store.js';
import LandingScreen from './components/screens/LandingScreen.jsx';
import SpawnRevealScreen from './components/screens/SpawnRevealScreen.jsx';

export default function App() {
  const { currentScreen, character, navigateTo } = useGameStore();

  if (currentScreen === 'landing') {
    return <LandingScreen />;
  }

  if (currentScreen === 'spawn_reveal') {
    return <SpawnRevealScreen />;
  }

  // Placeholder for upcoming Screen 3 (Goal Setup)
  if (currentScreen === 'goal_setup') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full space-y-4">
          <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            ✓ Screen 2 Complete → Ready for Screen 3 (Goal Setup)
          </div>
          <h2 className="text-xl font-bold text-white">Screen 3: Goal Setup</h2>
          <p className="text-slate-400 text-xs">
            Character: <strong className="text-white">{character?.name}</strong> (Age {character?.age}) with monthly surplus of <strong className="text-emerald-400 font-mono">₹{character?.monthlySurplus?.toLocaleString('en-IN')}</strong>.
          </p>
          <button
            onClick={() => navigateTo('spawn_reveal')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            ← Back to Spawn Reveal
          </button>
        </div>
      </div>
    );
  }

  return null;
}

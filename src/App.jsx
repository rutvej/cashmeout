import React from 'react';
import { useGameStore } from './engine/store.js';
import LandingScreen from './components/screens/LandingScreen.jsx';
import SpawnRevealScreen from './components/screens/SpawnRevealScreen.jsx';
import GoalSetupScreen from './components/screens/GoalSetupScreen.jsx';
import FinancialSetupScreen from './components/screens/FinancialSetupScreen.jsx';
import MainGameScreen from './components/screens/MainGameScreen.jsx';

export default function App() {
  const { currentScreen, character, navigateTo } = useGameStore();

  if (currentScreen === 'landing') {
    return <LandingScreen />;
  }

  if (currentScreen === 'spawn_reveal') {
    return <SpawnRevealScreen />;
  }

  if (currentScreen === 'goal_setup') {
    return <GoalSetupScreen />;
  }

  if (currentScreen === 'financial_setup') {
    return <FinancialSetupScreen />;
  }

  if (currentScreen === 'main_game') {
    return <MainGameScreen />;
  }

  // Placeholder for upcoming Screen 6 (Scorecard / Endgame)
  if (currentScreen === 'scorecard') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full space-y-4">
          <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            🎉 Age 60 Reached! Ready for Screen 6 (Scorecard)
          </div>
          <h2 className="text-xl font-bold text-white">Retirement Evaluation</h2>
          <p className="text-slate-400 text-xs">
            Review your final net worth, FI/RE status, passive withdrawal income, and life report card.
          </p>
          <button
            onClick={() => navigateTo('main_game')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            ← View Main Game Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}

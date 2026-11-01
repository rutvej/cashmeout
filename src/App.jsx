import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './engine/store.js';
import LandingScreen from './components/screens/LandingScreen.jsx';
import SpawnRevealScreen from './components/screens/SpawnRevealScreen.jsx';
import GoalSetupScreen from './components/screens/GoalSetupScreen.jsx';
import FinancialSetupScreen from './components/screens/FinancialSetupScreen.jsx';
import MainGameScreen from './components/screens/MainGameScreen.jsx';
import ScorecardScreen from './components/screens/ScorecardScreen.jsx';

export default function App() {
  const { currentScreen } = useGameStore();

  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'landing' && <LandingScreen key="landing" />}
      {currentScreen === 'spawn_reveal' && <SpawnRevealScreen key="spawn" />}
      {currentScreen === 'goal_setup' && <GoalSetupScreen key="goals" />}
      {currentScreen === 'financial_setup' && <FinancialSetupScreen key="finance" />}
      {currentScreen === 'main_game' && <MainGameScreen key="game" />}
      {currentScreen === 'scorecard' && <ScorecardScreen key="score" />}
    </AnimatePresence>
  );
}

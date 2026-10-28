import React from 'react';
import { useGameStore } from './engine/store.js';
import LandingScreen from './components/screens/LandingScreen.jsx';
import SpawnRevealScreen from './components/screens/SpawnRevealScreen.jsx';
import GoalSetupScreen from './components/screens/GoalSetupScreen.jsx';
import FinancialSetupScreen from './components/screens/FinancialSetupScreen.jsx';
import MainGameScreen from './components/screens/MainGameScreen.jsx';
import ScorecardScreen from './components/screens/ScorecardScreen.jsx';

export default function App() {
  const { currentScreen } = useGameStore();

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

  if (currentScreen === 'scorecard') {
    return <ScorecardScreen />;
  }

  return null;
}

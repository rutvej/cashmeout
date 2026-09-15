import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameStore from './engine/store';

// Screens
import Landing from './components/screens/Landing';
import SpawnReveal from './components/screens/SpawnReveal';
import GoalSetup from './components/screens/GoalSetup';
import MainGame from './components/screens/MainGame';
import Scorecard from './components/screens/Scorecard';

function App() {
  const screen = useGameStore(state => state.screen);

  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return <Landing key="landing" />;
      case 'spawn':
        return <SpawnReveal key="spawn" />;
      case 'goals':
        return <GoalSetup key="goals" />;
      case 'game':
        return <MainGame key="game" />;
      case 'scorecard':
        return <Scorecard key="scorecard" />;
      default:
        return <Landing key="landing" />;
    }
  };

  return (
    <div className="font-sans text-text-primary bg-black min-h-screen">
      <div className="max-w-md mx-auto bg-surface-bg min-h-screen relative shadow-2xl overflow-hidden sm:border-x sm:border-gray-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

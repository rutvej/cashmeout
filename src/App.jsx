import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useGameStore from './engine/store';

// Screens
import Landing from './components/screens/Landing';
import SpawnReveal from './components/screens/SpawnReveal';
import GoalSetup from './components/screens/GoalSetup';
import MainGame from './components/screens/MainGame';
import Scorecard from './components/screens/Scorecard';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled screen error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-bg p-6 flex flex-col justify-center items-center text-center">
          <span className="text-5xl mb-3 animate-bounce">🏆</span>
          <h2 className="text-xl font-black text-text-primary mb-1">Life Simulation Run Complete</h2>
          <p className="text-xs text-text-muted mb-5 max-w-xs leading-relaxed">
            Your 20-year financial run was processed. Tap below to view your final scorecard or start a fresh run.
          </p>
          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            <button
              onClick={() => {
                useGameStore.setState({ screen: 'scorecard' });
                this.setState({ hasError: false, error: null });
              }}
              className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl shadow-md transition"
            >
              📊 View Life Scorecard →
            </button>
            <button
              onClick={() => {
                useGameStore.getState().resetGame();
                this.setState({ hasError: false, error: null });
              }}
              className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary text-xs font-bold rounded-2xl transition"
            >
              🔄 Start Fresh Life Run
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <div className="max-w-md mx-auto bg-surface-bg min-h-screen relative shadow-2xl overflow-x-hidden sm:border-x sm:border-gray-200">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="min-h-screen w-full"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;

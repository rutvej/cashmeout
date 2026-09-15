import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../engine/store';
import Button from '../ui/Button';

const Landing = () => {
  const startGame = useGameStore(state => state.startGame);
  const loadGame = useGameStore(state => state.loadGame);
  const [hasSave, setHasSave] = useState(false);
  const [seedInput, setSeedInput] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [showSeedInput, setShowSeedInput] = useState(false);

  useEffect(() => {
    setHasSave(!!localStorage.getItem('cashflow-game-save'));
  }, []);

  const handleRandomizeSeed = () => {
    setSeedInput(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const handleStart = () => {
    startGame(seedInput.trim());
  };

  const handleResume = () => {
    const loaded = loadGame();
    if (!loaded) {
      // If load fails, start fresh
      startGame(seedInput.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-bg"
    >
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        {/* Logo area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-accent-action/20 rounded-3xl flex items-center justify-center mb-6"
        >
          <span className="text-4xl">₹</span>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-extrabold tracking-tight text-text-primary mb-2 text-center"
        >
          CashMe<span className="text-accent-action-dark">Out</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-text-muted text-lg font-medium mb-2 text-center"
        >
          A 20-year finance life simulation
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-text-muted text-sm mb-6 max-w-xs leading-relaxed"
        >
          Navigate salaries, investments, loans, and life events from age 22 to 42.
          Will you achieve your goals or get caught in the rat race?
        </motion.p>

        {/* Seed Selector (Minecraft-like deterministic worlds) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs mb-5"
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              World Seed
            </span>
            <button
              type="button"
              onClick={() => setShowSeedInput(!showSeedInput)}
              className="text-[10px] text-accent-action-dark font-bold hover:underline"
            >
              {showSeedInput ? 'Hide Input' : 'Customize Seed'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 flex items-center justify-between">
              {showSeedInput ? (
                <input
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  placeholder="Enter custom seed (e.g. 849201)"
                  className="w-full bg-transparent text-xs font-mono font-bold text-text-primary outline-none"
                />
              ) : (
                <span className="text-xs font-mono font-extrabold text-text-primary">
                  Seed #{seedInput}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRandomizeSeed}
              title="Generate new random seed"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <span>🎲</span>
              <span className="text-[10px] font-semibold text-text-muted">Roll</span>
            </button>
          </div>
          <span className="text-[9px] text-text-muted block mt-1.5 leading-snug">
            Same seed guarantees exact same career path, life events, and market conditions.
          </span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-3"
        >
          <Button
            fullWidth
            size="lg"
            className="rounded-full !py-4 shadow-md"
            onClick={handleStart}
          >
            Start Life (Seed #{seedInput})
          </Button>

          {hasSave && (
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              className="rounded-full"
              onClick={handleResume}
            >
              Resume Game
            </Button>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <p className="text-xs text-text-muted text-center mt-6">
        Based on real-world Indian personal finance principles
      </p>
    </motion.div>
  );
};

export default Landing;

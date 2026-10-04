import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../engine/store';

const Landing = () => {
  const startGame = useGameStore(state => state.startGame);
  const loadGame = useGameStore(state => state.loadGame);
  const setScreen = useGameStore(state => state.setScreen);
  
  const [hasSave, setHasSave] = useState(false);
  const [seedInput, setSeedInput] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [showSeedInput, setShowSeedInput] = useState(false);
  
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [retirementAge, setRetirementAge] = useState(50);

  useEffect(() => {
    setHasSave(!!localStorage.getItem('cashflow-game-save'));
  }, []);

  const handleRandomizeSeed = () => {
    setSeedInput(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seedInput);
  };

  const handleStart = () => {
    if (!selectedTier || !selectedField) return;
    startGame(seedInput.trim(), selectedTier, selectedField, retirementAge);
    setScreen('spawn');
  };

  const handleResume = () => {
    const loaded = loadGame();
    if (!loaded) {
      if (selectedTier && selectedField) {
        handleStart();
      }
    }
  };

  const tiers = [
    { id: 1, name: 'Metro City', examples: 'Mumbai, Delhi, Bengaluru...', salary: '₹30k-80k/mo' },
    { id: 2, name: 'Growing City', examples: 'Pune, Jaipur, Kochi...', salary: '₹20k-50k/mo' },
    { id: 3, name: 'Small City', examples: 'Nashik, Patna, Vadodara...', salary: '₹12k-35k/mo' }
  ];

  const fields = [
    { id: 'science', icon: '🔬', name: 'Science & Technology', desc: 'Software, Engineering, Research', growth: 'High volatility, high ceiling' },
    { id: 'arts', icon: '🎨', name: 'Arts & Humanities', desc: 'Media, Design, Education', growth: 'Slower start, passion-driven' },
    { id: 'commerce', icon: '💼', name: 'Commerce & Business', desc: 'Finance, Management, Sales', growth: 'Steady climb, corporate ladder' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-4 pb-24 font-sans selection:bg-emerald-500/30">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center pt-8 pb-4">
          <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-br from-emerald-400 to-amber-400 bg-clip-text text-transparent">
            CashMe Out
          </h1>
          <p className="text-emerald-50/60 font-medium">Your life. Your choices. Their future.</p>
        </motion.div>

        {/* Seed Section */}
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Life Seed</span>
            <button onClick={() => setShowSeedInput(!showSeedInput)} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              {showSeedInput ? 'Auto Generate' : 'Use custom seed'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 flex items-center">
              {showSeedInput ? (
                <input
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  className="w-full bg-transparent text-xl font-mono font-bold text-white outline-none"
                  placeholder="Enter seed"
                />
              ) : (
                <span className="text-2xl font-mono font-bold tracking-widest text-white">{seedInput}</span>
              )}
            </div>
            {!showSeedInput && (
              <>
                <button onClick={handleRandomizeSeed} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                  🎲
                </button>
                <button onClick={handleCopySeed} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                  📋
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Tier Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Select Starting City</h2>
          <div className="grid gap-3">
            {tiers.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`text-left p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
                  selectedTier === t.id 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold ${selectedTier === t.id ? 'text-emerald-400' : 'text-white'}`}>{t.name}</span>
                  <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-right">{t.salary}</span>
                </div>
                <p className="text-xs text-gray-400">{t.examples}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Field Selection */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Select Career Path</h2>
          <div className="grid gap-3">
            {fields.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedField(f.id)}
                className={`text-left p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 flex gap-4 items-center ${
                  selectedField === f.id 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className={`font-bold mb-0.5 ${selectedField === f.id ? 'text-emerald-400' : 'text-white'}`}>{f.name}</div>
                  <div className="text-xs text-gray-300 mb-0.5">{f.desc}</div>
                  <div className="text-[10px] text-gray-500 italic">{f.growth}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Retirement Age Slider */}
        <motion.div variants={itemVariants} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">When should they retire?</h2>
          <input 
            type="range" 
            min="45" 
            max="60" 
            value={retirementAge}
            onChange={(e) => setRetirementAge(Number(e.target.value))}
            className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between mt-3 text-xs">
            <span className="text-gray-400">starting at ~22</span>
            <span className="font-bold text-emerald-400">{retirementAge} years old · {retirementAge - 22} year journey</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0e1a]/90 backdrop-blur-md border-t border-white/10 z-50">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleStart}
            disabled={!selectedTier || !selectedField}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 ${
              selectedTier && selectedField 
                ? 'bg-emerald-500 text-[#0a0e1a] hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            Generate Character →
          </button>
          
          {hasSave && (
            <button
              onClick={handleResume}
              className="w-full py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
            >
              Resume Saved Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;

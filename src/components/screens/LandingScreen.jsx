import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  springPress,
  hardPress,
} from '../../utils/motion.js';

const CITY_TIERS = [
  {
    id: 'tier1',
    title: 'Tier 1',
    subtitle: 'Metro',
    cities: 'Mumbai, Bangalore, Delhi NCR',
    description: 'High starting salary, higher living costs & rent',
    badge: 'HIGH STAKES',
    accent: 'emerald',
  },
  {
    id: 'tier2',
    title: 'Tier 2',
    subtitle: 'Growth City',
    cities: 'Pune, Hyderabad, Ahmedabad',
    description: 'Balanced pay with moderate living expenses',
    badge: 'BALANCED',
    accent: 'blue',
  },
  {
    id: 'tier3',
    title: 'Tier 3',
    subtitle: 'Emerging',
    cities: 'Tier-3 Cities & Towns',
    description: 'Lower living expenses, steady starting pay',
    badge: 'LOW COST',
    accent: 'amber',
  },
];

const CAREER_FIELDS = [
  {
    id: 'science',
    title: 'Science / Tech',
    roles: 'Software, Data, Biotech, Engineering',
    tag: 'HIGH GROWTH',
    icon: '⚡',
  },
  {
    id: 'commerce',
    title: 'Commerce / Finance',
    roles: 'Financial Analyst, Auditing, Consulting',
    tag: 'STRUCTURED',
    icon: '📊',
  },
  {
    id: 'arts',
    title: 'Arts / Creative',
    roles: 'UI/UX, Content, Production, Architecture',
    tag: 'DYNAMIC',
    icon: '🎨',
  },
];

export default function LandingScreen() {
  const { config, setConfig, randomizeSeed, generateAndSetCharacter } = useGameStore();

  const handleSeedChange = (e) => {
    setConfig({ seed: e.target.value.trim() });
  };

  const isSeedValid = config.seed.trim().length > 0;

  const handleGenerate = () => {
    if (!isSeedValid) return;
    generateAndSetCharacter();
  };

  return (
    <motion.div
      className="min-h-screen bg-mesh-light text-slate-900 relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans"
      {...pageTransition}
    >
      <motion.div
        className="w-full max-w-2xl relative z-10 space-y-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Hero Title (CRED NeoPOP Light) ─── */}
        <motion.div className="text-center space-y-3" variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border-2 border-slate-900 bg-white text-[11px] font-mono font-bold uppercase tracking-[0.2em] shadow-hard-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            CashMeOut · Life & Cashflow Simulator
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.95]">
            Master Your
            <br />
            <span className="text-blue-600">Financial Life</span>
          </h1>

          <div className="bar-gold w-24 mx-auto" />

          <p className="text-sm text-slate-600 max-w-md mx-auto font-body leading-relaxed">
            Experience real-world cashflow, investments, and life decisions over a 37-year career.
            Deterministic seed ensures 100% reproducible outcomes.
          </p>
        </motion.div>

        {/* ─── Seed Input ─── */}
        <motion.div className="space-y-2 card-neopop p-5 bg-white" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-600">
            1. World Seed (Reproducible Runs)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.seed}
              onChange={handleSeedChange}
              maxLength={24}
              placeholder="Enter seed or roll random..."
              className="flex-1 bg-slate-50 border-2 border-slate-900 px-4 py-3 font-mono font-bold text-slate-900 text-sm outline-none focus:bg-white"
            />
            <button
              type="button"
              onClick={randomizeSeed}
              className="px-5 py-3 bg-white border-2 border-slate-900 font-mono text-xs font-black tracking-wider uppercase btn-press hover:bg-slate-100"
            >
              🎲 Roll
            </button>
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            Same seed + selections = exact same life timeline and financial trajectory.
          </p>
        </motion.div>

        {/* ─── City Tier ─── */}
        <motion.div className="space-y-3" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-600">
            2. Select City Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CITY_TIERS.map((tier) => {
              const isSelected = config.cityTier === tier.id;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setConfig({ cityTier: tier.id })}
                  className={`text-left p-4 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-slate-900 shadow-hard'
                      : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-display font-black text-lg">{tier.title}</div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                      {tier.subtitle}
                    </div>
                    <div className={`text-[11px] leading-snug pt-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {tier.description}
                    </div>
                  </div>
                  <div className="pt-3">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-slate-100 text-slate-700 border-slate-900'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Career Field ─── */}
        <motion.div className="space-y-3" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-600">
            3. Career Field
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CAREER_FIELDS.map((field) => {
              const isSelected = config.careerField === field.id;

              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => setConfig({ careerField: field.id })}
                  className={`text-left p-4 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-slate-900 shadow-hard'
                      : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-2xl">{field.icon}</span>
                    <div className="font-display font-black text-base pt-1">{field.title}</div>
                    <div className={`text-[11px] leading-snug ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {field.roles}
                    </div>
                  </div>
                  <div className="pt-3">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${
                        isSelected
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-slate-100 text-slate-700 border-slate-900'
                      }`}
                    >
                      {field.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── CTA Button ─── */}
        <motion.div variants={fadeInUp}>
          <button
            type="button"
            disabled={!isSeedValid}
            onClick={handleGenerate}
            className={`w-full py-4 px-8 font-display font-black text-lg tracking-wider uppercase text-white btn-press transition-all ${
              isSeedValid
                ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-hard'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400'
            }`}
          >
            Generate Character ➔
          </button>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}

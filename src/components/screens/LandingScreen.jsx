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

const ACCENT_COLORS = {
  emerald: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    barBg: 'bg-emerald-500',
  },
  blue: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    barBg: 'bg-blue-500',
  },
  amber: {
    border: 'border-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,166,35,0.15)]',
    barBg: 'bg-amber-500',
  },
};

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
      className="min-h-screen bg-mesh noise-overlay relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 overflow-hidden"
      {...pageTransition}
    >
      <motion.div
        className="w-full max-w-2xl relative z-10 space-y-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Hero Title ─── */}
        <motion.div className="text-center space-y-4" variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-surface-3 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Life & Cashflow Simulator
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95]">
            Your Financial
            <br />
            <span className="text-emerald-400">Life</span>
          </h1>

          <div className="bar-gold w-24 mx-auto" />

          <p className="text-sm text-slate-400 max-w-md mx-auto font-body leading-relaxed">
            Experience real-world cashflow, investments, and life decisions over a 37-year career.
            Every seed generates a unique, deterministic life.
          </p>
        </motion.div>

        {/* ─── Seed Input ─── */}
        <motion.div className="space-y-2" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
            World Seed
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={config.seed}
                onChange={handleSeedChange}
                maxLength={24}
                placeholder="Enter seed..."
                className="w-full bg-surface-1 border-b-2 border-surface-3 focus:border-emerald-500 px-4 py-3 text-base font-mono text-emerald-300 placeholder-slate-600 outline-none transition-colors"
              />
            </div>
            <motion.button
              type="button"
              onClick={randomizeSeed}
              className="px-5 py-3 bg-surface-2 border border-surface-3 text-slate-200 font-mono text-sm font-bold tracking-wider hover:bg-surface-3 transition-colors btn-press"
              {...hardPress}
            >
              🎲 ROLL
            </motion.button>
          </div>
          <p className="text-[10px] font-mono text-slate-600 tracking-wide">
            Same seed + choices = identical life scenario
          </p>
        </motion.div>

        {/* ─── City Tier ─── */}
        <motion.div className="space-y-3" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
            Select City Tier
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CITY_TIERS.map((tier) => {
              const isSelected = config.cityTier === tier.id;
              const colors = ACCENT_COLORS[tier.accent];

              return (
                <motion.button
                  key={tier.id}
                  type="button"
                  onClick={() => setConfig({ cityTier: tier.id })}
                  className={`relative text-left p-4 border-l-[3px] transition-all duration-200 ${
                    isSelected
                      ? `${colors.border} ${colors.bg} ${colors.glow}`
                      : 'border-l-surface-3 bg-surface-1 hover:bg-surface-2'
                  }`}
                  {...springPress}
                >
                  <div className="space-y-2">
                    <div>
                      <div className="font-display text-lg font-bold text-white">{tier.title}</div>
                      <div className="text-[11px] font-body text-slate-400">{tier.subtitle}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-snug font-body">
                      {tier.cities}
                    </div>
                    <div
                      className={`text-[9px] font-mono font-bold tracking-wider ${
                        isSelected ? colors.text : 'text-slate-600'
                      }`}
                    >
                      {tier.badge}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Career Field ─── */}
        <motion.div className="space-y-3" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
            Career Field
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CAREER_FIELDS.map((field) => {
              const isSelected = config.careerField === field.id;

              return (
                <motion.button
                  key={field.id}
                  type="button"
                  onClick={() => setConfig({ careerField: field.id })}
                  className={`relative text-left p-4 border transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-500/8 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                      : 'border-surface-3 bg-surface-1 hover:bg-surface-2 hover:border-surface-3'
                  }`}
                  {...springPress}
                >
                  <div className="space-y-2">
                    <span className="text-2xl">{field.icon}</span>
                    <div>
                      <div className="font-body font-bold text-sm text-white">{field.title}</div>
                      <div className="text-[11px] text-slate-400 leading-snug mt-1">
                        {field.roles}
                      </div>
                    </div>
                    <div
                      className={`text-[9px] font-mono font-bold tracking-wider ${
                        isSelected ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    >
                      {field.tag}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── CTA Button ─── */}
        <motion.div variants={fadeInUp}>
          <motion.button
            type="button"
            disabled={!isSeedValid}
            onClick={handleGenerate}
            className={`w-full py-4 px-8 font-body font-black text-base tracking-wider uppercase flex items-center justify-center gap-3 transition-all ${
              isSeedValid
                ? 'bg-emerald-500 text-surface-0 btn-press cursor-pointer hover:bg-emerald-400'
                : 'bg-surface-2 text-slate-600 cursor-not-allowed'
            }`}
            {...(isSeedValid ? hardPress : {})}
          >
            <span>Generate Character</span>
            <span className="text-lg">→</span>
          </motion.button>
          {!isSeedValid && (
            <p className="text-center text-[11px] font-mono text-rose-400/80 mt-3 tracking-wide">
              Enter or randomize a seed to proceed
            </p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

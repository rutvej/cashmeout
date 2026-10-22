import React from 'react';
import { useGameStore } from '../../engine/store.js';

const CITY_TIERS = [
  {
    id: 'tier1',
    title: 'Tier 1 (Metro)',
    subtitle: 'Mumbai, Bangalore, Delhi NCR',
    description: 'High starting salary, higher living costs & rent',
    badge: 'High Stakes',
  },
  {
    id: 'tier2',
    title: 'Tier 2 (Growth City)',
    subtitle: 'Pune, Hyderabad, Ahmedabad',
    description: 'Balanced pay with moderate living expenses',
    badge: 'Balanced',
  },
  {
    id: 'tier3',
    title: 'Tier 3 (Emerging Town)',
    subtitle: 'Tier-3 Cities & Towns',
    description: 'Lower living expenses, steady starting pay',
    badge: 'Low Cost',
  },
];

const CAREER_FIELDS = [
  {
    id: 'science',
    title: 'Science / Tech',
    roles: 'Software, Data, Biotech, Engineering',
    tag: 'High Growth',
  },
  {
    id: 'commerce',
    title: 'Commerce / Finance',
    roles: 'Financial Analyst, Auditing, Consulting',
    tag: 'Structured',
  },
  {
    id: 'arts',
    title: 'Arts / Creative',
    roles: 'UI/UX, Content, Production, Architecture',
    tag: 'Dynamic',
  },
];

export default function LandingScreen() {
  const { config, setConfig, randomizeSeed, navigateTo } = useGameStore();

  const handleSeedChange = (e) => {
    setConfig({ seed: e.target.value.trim() });
  };

  const isSeedValid = config.seed.trim().length > 0;

  const handleGenerate = () => {
    if (!isSeedValid) return;
    navigateTo('spawn_reveal');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
            <span>●</span> Life & Cashflow Simulator
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Build Your Financial Journey
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Experience real-world cashflow, investments, and life decisions. Deterministic seed ensures reproducible runs.
          </p>
        </div>

        {/* 1. World Seed */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            1. World Seed
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.seed}
              onChange={handleSeedChange}
              maxLength={24}
              placeholder="Enter seed or click Randomize..."
              className="flex-1 bg-slate-950 border border-slate-750 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-300 placeholder-slate-600 outline-none transition"
            />
            <button
              type="button"
              onClick={randomizeSeed}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <span>🎲</span>
              <span>Randomize</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Identical seed + selections will always generate the exact same life scenario.
          </p>
        </div>

        {/* 2. City Tier */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
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
                  className={`text-left p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{tier.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium mb-1.5">{tier.subtitle}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{tier.description}</div>
                  </div>
                  <div className="mt-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Career Stream */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
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
                  className={`text-left p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{field.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight mb-2">{field.roles}</div>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {field.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!isSeedValid}
            onClick={handleGenerate}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition ${
              isSeedValid
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Generate Character</span>
            <span className="text-lg">➔</span>
          </button>
          {!isSeedValid && (
            <p className="text-center text-xs text-rose-400 mt-2">
              Please enter or randomize a valid seed to proceed.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

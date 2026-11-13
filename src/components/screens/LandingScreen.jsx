import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { hasActiveGameSession, loadActiveGameSession } from '../../engine/storageEngine.js';
import { calculateNetWorth } from '../../engine/simulationEngine.js';
import { formatINR } from '../../utils/format.js';
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
  const {
    config,
    setConfig,
    randomizeSeed,
    generateAndSetCharacter,
    resumeSavedGame,
    clearSavedGame,
  } = useGameStore();

  const [activeSession, setActiveSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const hasSession = await hasActiveGameSession();
        if (hasSession && isMounted) {
          const session = await loadActiveGameSession();
          if (isMounted && session && session.character && session.status === 'in_progress') {
            setActiveSession(session);
          }
        }
      } catch (err) {
        console.warn('Failed checking active session:', err);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSeedChange = (e) => {
    setConfig({ seed: e.target.value.trim() });
  };

  const isSeedValid = config.seed.trim().length > 0;

  const handleGenerate = () => {
    if (!isSeedValid) return;
    if (activeSession) {
      setIsOverwriteModalOpen(true);
      return;
    }
    generateAndSetCharacter();
  };

  const handleResume = async () => {
    await resumeSavedGame();
  };

  const handleConfirmOverwrite = async () => {
    await clearSavedGame();
    setActiveSession(null);
    setIsOverwriteModalOpen(false);
    generateAndSetCharacter();
  };

  // Calculated session attributes if active session exists
  const sessionAge = activeSession?.simulation?.currentAge || activeSession?.character?.age || 23;
  const sessionMonth = activeSession?.simulation?.currentMonthIndex || 0;
  const sessionNetWorth = activeSession
    ? calculateNetWorth(
        activeSession.character,
        activeSession.goals || [],
        activeSession.character?.liquidCash || 0
      )
    : 0;
  const sessionCompany =
    activeSession?.character?.company ||
    activeSession?.character?.companyName ||
    activeSession?.character?.city ||
    'TechCorp';

  return (
    <motion.div
      className="min-h-screen bg-mesh-light text-slate-900 relative flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 overflow-x-hidden font-sans"
      {...pageTransition}
    >
      <motion.div
        className="w-full max-w-2xl relative z-10 space-y-4 sm:space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Hero Title (CRED NeoPOP Light) ─── */}
        <motion.div className="text-center space-y-2 sm:space-y-3" variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 border-2 border-slate-900 bg-white text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-hard-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            CashMeOut · Life & Cashflow Simulator
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.98]">
            Master Your{' '}
            <span className="text-blue-600">Financial Life</span>
          </h1>

          <div className="bar-gold w-20 sm:w-24 mx-auto" />

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-body leading-relaxed px-2">
            Experience real-world cashflow, investments, and life decisions over a 37-year career.
            Deterministic seed ensures 100% reproducible outcomes.
          </p>
        </motion.div>

        {/* ─── Phase 11: NeoPOP "Resume Active Life" Card ─── */}
        {activeSession && (
          <motion.div
            className="card-neopop p-4 sm:p-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-2 border-slate-900 shadow-hard-lg space-y-4"
            variants={fadeInUp}
            data-testid="resume-active-life-card"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-100 border border-slate-900 text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider text-emerald-950">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Life in Progress
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                Month {sessionMonth} (Year {Math.floor(sessionMonth / 12) + 1})
              </span>
            </div>

            {/* Character & Career Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 leading-tight">
                  {activeSession.character?.name}
                </h2>
                <div className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                  {activeSession.character?.jobTitle}{' '}
                  <span className="text-slate-400 font-normal">at</span>{' '}
                  <span className="text-blue-700 font-bold">{sessionCompany}</span>
                </div>
              </div>

              {/* Net Worth & Age Badges */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="px-3 py-1.5 bg-white border-2 border-slate-900 text-right">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Net Worth
                  </span>
                  <span className="text-sm sm:text-base font-mono font-black text-slate-900">
                    {formatINR(sessionNetWorth)}
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-white border-2 border-slate-900 text-center">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Age
                  </span>
                  <span className="text-sm sm:text-base font-mono font-black text-blue-600">
                    {sessionAge}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleResume}
                className="w-full py-3.5 sm:py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm sm:text-base tracking-wider uppercase btn-press shadow-hard flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                ▶ RESUME LIFE (Age {sessionAge}, Month {sessionMonth})
              </button>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-slate-500">
                  Seed: <strong className="font-bold text-slate-800">{activeSession.config?.seed || activeSession.character?.seed}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOverwriteModalOpen(true)}
                  className="text-xs font-mono font-bold text-rose-600 hover:text-rose-800 underline uppercase tracking-wider cursor-pointer"
                >
                  Start New Life
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Seed Input ─── */}
        <motion.div className="space-y-1.5 card-neopop p-3.5 sm:p-5 bg-white" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-600">
            1. World Seed (Reproducible Runs)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.seed}
              onChange={handleSeedChange}
              maxLength={24}
              placeholder="Enter seed or roll random..."
              className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-900 px-3 py-2 sm:px-4 sm:py-2.5 font-mono font-bold text-slate-900 text-xs sm:text-sm outline-none focus:bg-white"
            />
            <button
              type="button"
              onClick={randomizeSeed}
              className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-white border-2 border-slate-900 font-mono text-xs font-black tracking-wider uppercase btn-press hover:bg-slate-100 shrink-0"
            >
              🎲 Roll
            </button>
          </div>
          <p className="text-[10px] font-mono text-slate-500 hidden sm:block">
            Same seed + selections = exact same life timeline and financial trajectory.
          </p>
        </motion.div>

        {/* ─── City Tier ─── */}
        <motion.div className="space-y-1.5" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-600">
            2. Select City Tier
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {CITY_TIERS.map((tier) => {
              const isSelected = config.cityTier === tier.id;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setConfig({ cityTier: tier.id })}
                  className={`text-left p-2.5 sm:p-4 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-slate-900 shadow-hard'
                      : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="font-display font-black text-sm sm:text-lg leading-tight">{tier.title}</div>
                    <div className={`text-[11px] sm:text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                      {tier.subtitle}
                    </div>
                    <div className={`hidden sm:block text-[11px] leading-snug pt-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {tier.description}
                    </div>
                  </div>
                  <div className="pt-2 sm:pt-3">
                    <span
                      className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 border ${
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
        <motion.div className="space-y-1.5" variants={fadeInUp}>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-slate-600">
            3. Career Field
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {CAREER_FIELDS.map((field) => {
              const isSelected = config.careerField === field.id;

              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => setConfig({ careerField: field.id })}
                  className={`text-left p-2.5 sm:p-4 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-slate-900 shadow-hard'
                      : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-xl sm:text-2xl">{field.icon}</span>
                    <div className="font-display font-black text-xs sm:text-base pt-0.5 sm:pt-1 leading-tight">{field.title}</div>
                    <div className={`hidden sm:block text-[11px] leading-snug ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {field.roles}
                    </div>
                  </div>
                  <div className="pt-2 sm:pt-3">
                    <span
                      className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 border ${
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
        <motion.div variants={fadeInUp} className="pt-1">
          <button
            type="button"
            disabled={!isSeedValid}
            onClick={handleGenerate}
            className={`w-full py-3.5 sm:py-4 px-6 sm:px-8 font-display font-black text-base sm:text-lg tracking-wider uppercase text-white btn-press transition-all ${
              isSeedValid
                ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-hard'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-400'
            }`}
          >
            Generate Character ➔
          </button>
        </motion.div>

      </motion.div>

      {/* ─── Overwrite Confirmation Modal ─── */}
      {isOverwriteModalOpen && activeSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          data-testid="overwrite-confirmation-modal"
        >
          <div className="bg-white border-2 border-slate-900 shadow-hard-lg max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-display font-black text-lg text-slate-900 tracking-tight">
                Overwrite Saved Life?
              </h3>
            </div>

            <p className="text-xs sm:text-sm font-body text-slate-700 leading-relaxed">
              You have an active ongoing life for{' '}
              <strong className="font-bold text-slate-900">{activeSession.character?.name}</strong>{' '}
              (Age {sessionAge}). Starting a new life will overwrite your saved progress. Proceed?
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOverwriteModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-white border-2 border-slate-900 font-mono font-bold text-xs uppercase tracking-wider text-slate-800 hover:bg-slate-50 btn-press"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOverwrite}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white border-2 border-slate-900 font-mono font-black text-xs uppercase tracking-wider btn-press shadow-hard-sm"
              >
                Overwrite & Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

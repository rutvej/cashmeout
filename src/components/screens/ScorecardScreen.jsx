import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { evaluateScorecard } from '../../engine/scoringEngine.js';
import { formatINR } from '../../utils/format.js';
import {
  pageSlideUp,
  staggerContainer,
  fadeInUp,
  scaleIn,
  popIn,
  springPress,
  hardPress,
} from '../../utils/motion.js';

/* ─── Animated Counter ─── */
function useAnimatedCounter(target, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ─── Vertical Bar Meter ─── */
function PillarBar({ label, score, maxScore, delay = 0 }) {
  const pct = Math.round((score / maxScore) * 100);
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-[10px] font-mono font-bold text-emerald-400">{score}/{maxScore}</div>
      <div className="w-10 h-32 bg-surface-0 border border-surface-3 relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-emerald-500"
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="text-[9px] font-mono text-slate-500 text-center leading-tight max-w-[60px]">
        {label}
      </div>
    </motion.div>
  );
}

export default function ScorecardScreen() {
  const store = useGameStore();
  const { character, goals, simulation, navigateTo, resetGame, setConfig } = store;

  if (!character) return null;

  const result = evaluateScorecard(store);
  const {
    grade,
    title,
    breakdown,
    totalNetWorth,
    liquidBankBalance,
    outstandingDebt,
    monthlyPassiveIncome,
    annualLivingExpenses,
    fiRatio,
    isFinanciallyIndependent,
    goalsCompletedCount,
    totalGoalsCount,
    bestDecision,
    criticalLesson,
  } = result;

  const animatedScore = useAnimatedCounter(breakdown.totalScore, 2000);
  const animatedNetWorth = useAnimatedCounter(totalNetWorth, 1800);

  const handlePlayAgainSameSeed = () => {
    const seed = character.seed;
    resetGame();
    setConfig({ seed });
  };

  const handleRollNewLife = () => {
    resetGame();
  };

  // Grade-specific styles
  const gradeAccent = {
    'A+': { bg: 'bg-emerald-500/10', border: 'border-emerald-400', text: 'text-emerald-300', glow: 'animate-glow' },
    'A': { bg: 'bg-emerald-500/8', border: 'border-emerald-500/60', text: 'text-emerald-400', glow: '' },
    'B': { bg: 'bg-amber-500/8', border: 'border-amber-500/60', text: 'text-amber-300', glow: '' },
    'C': { bg: 'bg-orange-500/8', border: 'border-orange-500/60', text: 'text-orange-400', glow: '' },
    'D': { bg: 'bg-rose-500/8', border: 'border-rose-500/60', text: 'text-rose-400', glow: '' },
    'F': { bg: 'bg-rose-600/10', border: 'border-rose-600/60', text: 'text-rose-500', glow: '' },
  };
  const gs = gradeAccent[grade] || gradeAccent.B;

  return (
    <motion.div
      className="min-h-screen bg-mesh noise-overlay relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8"
      {...pageSlideUp}
    >
      <motion.div
        className="w-full max-w-4xl relative z-10 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header ─── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-3 gap-2"
          variants={fadeInUp}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                Simulation Complete
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
              {character.name}'s Scorecard
            </h1>
          </div>
          <div className="text-[10px] font-mono text-slate-600 sm:text-right">
            Age {character.retirementAge} · Seed <span className="text-emerald-400 font-bold">#{character.seed}</span>
          </div>
        </motion.div>

        {/* ─── Grade Hero ─── */}
        <motion.div
          className={`p-6 sm:p-8 border ${gs.border} ${gs.bg} ${gs.glow} flex flex-col sm:flex-row items-center justify-between gap-6`}
          variants={scaleIn}
        >
          <div className="flex items-center gap-6">
            {/* Grade Badge */}
            <motion.div
              className={`w-24 h-24 border-2 ${gs.border} bg-surface-0 flex items-center justify-center font-display font-black text-5xl ${gs.text}`}
              {...popIn}
            >
              {grade}
            </motion.div>

            <div className="space-y-1">
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                Financial Assessment
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white">{title}</h2>
              <p className="text-xs text-slate-400 font-mono">
                Score: <strong className="text-white">{animatedScore} / 100</strong>
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-surface-0 p-4 border border-surface-3 shrink-0">
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-600">FI/RE Status</div>
            <div className={`text-sm font-mono font-black ${isFinanciallyIndependent ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isFinanciallyIndependent ? 'SELF-SUSTAINING' : 'PARTIAL'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              4% rule covers <strong className="text-white">{(fiRatio * 100).toFixed(0)}%</strong>
            </div>
          </div>
        </motion.div>

        {/* ─── Snapshot Metrics ─── */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3" variants={fadeInUp}>
          {[
            { label: 'Final Net Worth', value: formatINR(animatedNetWorth), sub: `Liquid: ${formatINR(liquidBankBalance)}`, color: 'text-white' },
            { label: 'Passive Income', value: formatINR(monthlyPassiveIncome), sub: `Costs: ${formatINR(Math.round(annualLivingExpenses / 12))}/mo`, color: 'text-emerald-400' },
            { label: 'Debt', value: outstandingDebt === 0 ? 'DEBT FREE' : formatINR(outstandingDebt), sub: outstandingDebt === 0 ? 'Zero liabilities' : 'Needs liquidation', color: outstandingDebt === 0 ? 'text-emerald-400' : 'text-rose-400' },
          ].map((m) => (
            <div key={m.label} className="bg-surface-1 border border-surface-3 p-4 space-y-1">
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-600">{m.label}</div>
              <div className={`text-2xl font-mono font-black ${m.color}`}>{m.value}</div>
              <div className="text-[10px] font-mono text-slate-600">{m.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* ─── Pillar Breakdown (Vertical Bars) ─── */}
        <motion.div className="bg-surface-1 border border-surface-3 p-5 space-y-4" variants={fadeInUp}>
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
            Score Pillars
          </div>
          <div className="flex items-end justify-center gap-8">
            <PillarBar label="FI/RE" score={breakdown.financialIndependenceScore} maxScore={40} delay={0.1} />
            <PillarBar label="Milestones" score={breakdown.milestoneCompletionScore} maxScore={30} delay={0.2} />
            <PillarBar label="Debt Free" score={breakdown.debtFreeScore} maxScore={15} delay={0.3} />
            <PillarBar label="Safety" score={breakdown.safetyBufferScore} maxScore={15} delay={0.4} />
          </div>
          <div className="text-center text-[10px] font-mono text-slate-500">
            {goalsCompletedCount}/{totalGoalsCount} milestones achieved
          </div>
        </motion.div>

        {/* ─── Milestone Audit ─── */}
        <motion.div className="space-y-3" variants={fadeInUp}>
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
            Milestone Audit
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {goals.map((g) => {
              const current = g.currentAmount || 0;
              const target = g.targetAmount || 1;
              const isAchieved = current >= target;

              return (
                <div
                  key={g.id}
                  className="p-3 bg-surface-1 border border-surface-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{g.icon}</span>
                    <span className="font-body font-semibold text-xs text-white">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-500">{formatINR(current)}</span>
                    <span className={`font-bold ${isAchieved ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isAchieved ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Insights ─── */}
        <motion.div className="bg-surface-1 border border-surface-3 p-4 space-y-3 text-xs font-body" variants={fadeInUp}>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">💡</span>
            <div>
              <strong className="text-slate-200">Strength:</strong>{' '}
              <span className="text-slate-500">{bestDecision}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">⚠️</span>
            <div>
              <strong className="text-slate-200">Lesson:</strong>{' '}
              <span className="text-slate-500">{criticalLesson}</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Actions ─── */}
        <motion.div className="pt-2 flex flex-col sm:flex-row gap-3 items-center" variants={fadeInUp}>
          <motion.button
            type="button"
            onClick={() => navigateTo('main_game')}
            className="w-full sm:w-auto px-6 py-3.5 border border-surface-3 text-slate-400 hover:text-white hover:border-slate-500 text-xs font-body font-semibold transition-colors"
            {...springPress}
          >
            ← Review
          </motion.button>

          <motion.button
            type="button"
            onClick={handlePlayAgainSameSeed}
            className="w-full sm:flex-1 py-3.5 px-5 border border-surface-3 bg-surface-1 text-white font-body font-bold text-sm hover:bg-surface-2 transition-colors"
            {...springPress}
          >
            Replay Seed #{character.seed}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleRollNewLife}
            className="w-full sm:flex-1 py-4 px-6 bg-accent-gold text-surface-0 font-body font-black text-sm tracking-wider uppercase btn-press cursor-pointer hover:brightness-110 transition-all"
            {...hardPress}
          >
            Roll New Life →
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

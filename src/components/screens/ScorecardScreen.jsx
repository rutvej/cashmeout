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

/* ─── Vertical Pillar Bar Meter ─── */
function PillarBar({ label, score, maxScore, delay = 0 }) {
  const pct = Math.round((score / maxScore) * 100);
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-xs font-mono font-bold text-slate-900">{score}/{maxScore}</div>
      <div className="w-12 h-32 bg-slate-100 border-2 border-slate-900 relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-emerald-500"
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="text-[10px] font-mono font-bold text-slate-700 text-center leading-tight max-w-[70px]">
        {label}
      </div>
    </motion.div>
  );
}

export default function ScorecardScreen() {
  const store = useGameStore();
  const { character, goals, resetGame, setConfig } = store;

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

  const animatedScore = useAnimatedCounter(breakdown.totalScore, 1800);
  const animatedNetWorth = useAnimatedCounter(totalNetWorth, 1500);

  const handlePlayAgainSameSeed = () => {
    const seed = character.seed;
    resetGame();
    setConfig({ seed });
  };

  const handleRollNewLife = () => {
    resetGame();
  };

  return (
    <motion.div
      className="min-h-screen bg-mesh-light text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8"
      {...pageSlideUp}
    >
      <motion.div
        className="w-full max-w-4xl space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-900 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Simulation Complete · Retirement Reached
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900">
              {character.name}'s Financial Life Scorecard
            </h1>
          </div>
          <div className="text-xs font-mono font-bold text-slate-600 sm:text-right">
            Age {character.retirementAge || 60} · Seed <span className="text-blue-700">#{character.seed}</span>
          </div>
        </div>

        {/* ─── Grade Hero Banner (Light CRED NeoPOP) ─── */}
        <motion.div
          className="card-neopop p-6 sm:p-8 bg-white flex flex-col sm:flex-row items-center justify-between gap-6"
          variants={scaleIn}
        >
          <div className="flex items-center gap-6">
            {/* Grade Badge */}
            <motion.div
              className="w-24 h-24 border-3 border-slate-900 bg-amber-400 text-slate-950 flex items-center justify-center font-display font-black text-5xl shadow-hard"
              {...popIn}
            >
              {grade}
            </motion.div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Final Financial Assessment
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">{title}</h2>
              <p className="text-xs font-mono text-slate-700">
                Score: <strong className="text-slate-900 text-sm font-black">{animatedScore} / 100 Points</strong>
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-slate-50 border-2 border-slate-900 p-4 shrink-0 font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">FI/RE Status</span>
            <div className={`text-sm font-black ${isFinanciallyIndependent ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isFinanciallyIndependent ? '100% SELF-SUSTAINING' : 'PARTIAL COVERAGE'}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              4% rule covers <strong>{(fiRatio * 100).toFixed(0)}%</strong> of living costs
            </div>
          </div>
        </motion.div>

        {/* ─── Snapshot Metrics ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="card-neopop-sm bg-white p-4 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Final Net Worth</span>
            <div className="text-2xl font-mono font-black text-slate-900">{formatINR(animatedNetWorth)}</div>
            <div className="text-[11px] font-mono text-slate-600">Liquid Cash: {formatINR(liquidBankBalance)}</div>
          </div>

          <div className="card-neopop-sm bg-white p-4 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Monthly Passive Income</span>
            <div className="text-2xl font-mono font-black text-emerald-700">{formatINR(monthlyPassiveIncome)}</div>
            <div className="text-[11px] font-mono text-slate-600">Living Costs: {formatINR(Math.round(annualLivingExpenses / 12))}/mo</div>
          </div>

          <div className="card-neopop-sm bg-white p-4 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">Debt Freedom</span>
            <div className={`text-2xl font-mono font-black ${outstandingDebt === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {outstandingDebt === 0 ? '₹0 (DEBT FREE)' : formatINR(outstandingDebt)}
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              {outstandingDebt === 0 ? 'Zero liabilities at retirement' : 'Requires liquidation'}
            </div>
          </div>
        </div>

        {/* ─── Scoring Breakdown by Pillar ─── */}
        <div className="card-neopop bg-white p-6 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Scoring Breakdown by Pillar
          </span>
          <div className="flex items-end justify-around py-2">
            <PillarBar label="FI/RE 4%" score={breakdown.financialIndependenceScore} maxScore={40} delay={0.1} />
            <PillarBar label="Milestones" score={breakdown.milestoneCompletionScore} maxScore={30} delay={0.2} />
            <PillarBar label="Debt Free" score={breakdown.debtFreeScore} maxScore={15} delay={0.3} />
            <PillarBar label="Safety Buffer" score={breakdown.safetyBufferScore} maxScore={15} delay={0.4} />
          </div>
          <div className="text-center text-xs font-mono font-bold text-slate-600 border-t border-slate-200 pt-3">
            {goalsCompletedCount} of {totalGoalsCount} Life Milestones Successfully Achieved
          </div>
        </div>

        {/* ─── Milestone Audit ─── */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
            Life Milestones Audit
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {goals.map((g) => {
              const current = g.currentAmount || 0;
              const target = g.targetAmount || 1;
              const isAchieved = current >= target;

              return (
                <div
                  key={g.id}
                  className="card-neopop-sm bg-white p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{g.icon}</span>
                    <span className="font-sans font-bold text-slate-900">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">{formatINR(current)}</span>
                    <span className={`font-bold ${isAchieved ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isAchieved ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Insights ─── */}
        <div className="card-neopop-sm bg-slate-50 p-4 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-emerald-700">💡</span>
            <div>
              <strong className="text-slate-900 font-sans">Key Strength:</strong>{' '}
              <span className="text-slate-700">{bestDecision}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-700">⚠️</span>
            <div>
              <strong className="text-slate-900 font-sans">Critical Lesson:</strong>{' '}
              <span className="text-slate-700">{criticalLesson}</span>
            </div>
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={handlePlayAgainSameSeed}
            className="w-full sm:flex-1 py-4 px-6 bg-white border-2 border-slate-900 font-mono font-bold text-xs uppercase btn-press text-slate-900"
          >
            Replay Life (Seed #{character.seed})
          </button>

          <button
            type="button"
            onClick={handleRollNewLife}
            className="w-full sm:flex-1 py-4 px-6 bg-slate-900 text-white font-display font-black text-sm uppercase tracking-wider btn-press hover:bg-slate-800 transition-colors"
          >
            Roll New Random Life ➔
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR, formatPercent } from '../../utils/format.js';
import {
  pageSlideUp,
  staggerContainer,
  fadeInUp,
  fadeIn,
  scaleIn,
  hardPress,
  springPress,
} from '../../utils/motion.js';

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ─── Stat Row Component ─── */
function StatRow({ label, value, color = 'text-slate-200', delay = 0 }) {
  return (
    <motion.div
      className="flex justify-between items-baseline py-2 border-b border-surface-3/50"
      variants={fadeInUp}
    >
      <span className="text-xs text-slate-500 font-body">{label}</span>
      <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
    </motion.div>
  );
}

export default function SpawnRevealScreen() {
  const { character, navigateTo, resetGame } = useGameStore();

  if (!character) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-4 font-body">No character generated yet.</p>
        <button
          onClick={resetGame}
          className="px-5 py-2.5 bg-emerald-500 text-surface-0 font-bold btn-press"
        >
          Go to Landing
        </button>
      </div>
    );
  }

  const {
    name,
    age,
    city,
    jobTitle,
    primaryDream,
    grossMonthlySalary,
    taxAndPFDeductions,
    monthlyTakeHome,
    expenses,
    loans,
    totalFixedExpenses,
    totalLoanEMIs,
    totalMonthlyOutflow,
    monthlySurplus,
    liquidCash,
    seed,
  } = character;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const animatedSurplus = useAnimatedCounter(monthlySurplus);
  const animatedTakeHome = useAnimatedCounter(monthlyTakeHome);

  return (
    <motion.div
      className="min-h-screen bg-mesh noise-overlay relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8"
      {...pageSlideUp}
    >
      <motion.div
        className="w-full max-w-3xl relative z-10 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header Bar ─── */}
        <motion.div
          className="flex items-center justify-between pb-4 border-b border-surface-3"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
              Spawn Profile
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-600">
            Seed <span className="text-emerald-400 font-bold">#{seed}</span>
          </div>
        </motion.div>

        {/* ─── Character Identity ─── */}
        <motion.div
          className="bg-surface-1 border border-surface-3 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
          variants={scaleIn}
        >
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-400 flex items-center justify-center text-surface-0 font-display font-black text-3xl shadow-hard-emerald shrink-0">
            {initials}
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-black text-white">{name}</h2>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-surface-2 border border-surface-3 text-[10px] font-mono font-bold text-slate-300">
                  AGE {age}
                </span>
                <span className="px-2.5 py-0.5 bg-surface-2 border border-surface-3 text-[10px] font-mono font-bold text-slate-300">
                  📍 {city}
                </span>
              </div>
            </div>
            <div className="text-emerald-400 font-body font-semibold text-sm">{jobTitle}</div>
            <p className="text-xs text-slate-500 italic font-body">"{primaryDream}"</p>
          </div>
        </motion.div>

        {/* ─── Financial Dossier: Inflow vs Outflow ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inflow Column */}
          <motion.div
            className="bg-surface-1 border-l-[3px] border-l-emerald-500 border-y border-r border-surface-3 p-5 space-y-1"
            variants={fadeInUp}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-400">
                Monthly Inflow
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                EARNINGS
              </span>
            </div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <StatRow label="Gross Monthly CTC" value={formatINR(grossMonthlySalary)} />
              <StatRow
                label="Taxes & PF Deductions"
                value={`- ${formatINR(taxAndPFDeductions)}`}
                color="text-rose-400"
              />
            </motion.div>

            <div className="pt-3 mt-2 border-t border-surface-3 flex justify-between items-baseline">
              <span className="font-body font-bold text-white text-sm">Take-Home Pay</span>
              <span className="text-2xl font-mono font-black text-emerald-400">
                {formatINR(animatedTakeHome)}
              </span>
            </div>
          </motion.div>

          {/* Outflow Column */}
          <motion.div
            className="bg-surface-1 border-l-[3px] border-l-slate-600 border-y border-r border-surface-3 p-5 space-y-1"
            variants={fadeInUp}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
                Monthly Outflow
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-surface-2 text-slate-400 border border-surface-3">
                EXPENSES
              </span>
            </div>

            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <StatRow label="Housing / Rent" value={formatINR(expenses.rent)} />
              <StatRow label="Utilities & Bills" value={formatINR(expenses.utilities)} />
              <StatRow label="Groceries & Food" value={formatINR(expenses.groceries)} />
              <StatRow label="Lifestyle & Dining" value={formatINR(expenses.lifestyle)} />
              {expenses.dependantSupport > 0 && (
                <StatRow
                  label="Family Support"
                  value={formatINR(expenses.dependantSupport)}
                  color="text-amber-300"
                />
              )}
              {totalLoanEMIs > 0 && (
                <StatRow
                  label="Loan EMIs"
                  value={formatINR(totalLoanEMIs)}
                  color="text-rose-300"
                />
              )}
            </motion.div>

            <div className="pt-3 mt-2 border-t border-surface-3 flex justify-between items-baseline">
              <span className="font-body font-bold text-white text-sm">Total Outflow</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                {formatINR(totalMonthlyOutflow)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ─── Loan Notice ─── */}
        {loans.length > 0 && (
          <motion.div
            className="p-4 bg-amber-500/5 border-l-[3px] border-l-amber-500 border-y border-r border-amber-500/20 flex items-start gap-3"
            variants={fadeInUp}
          >
            <span className="text-xl mt-0.5">🎓</span>
            <div className="space-y-0.5 flex-1 text-xs font-body">
              <div className="font-bold text-amber-300">{loans[0].name} Active</div>
              <p className="text-slate-400">
                Principal:{' '}
                <strong className="text-white font-mono">{formatINR(loans[0].principalRemaining)}</strong>{' '}
                at <strong className="text-white">{formatPercent(loans[0].interestRateAnnual)}</strong>{' '}
                p.a. ({loans[0].tenureMonthsRemaining} months at {formatINR(loans[0].emi)}/mo)
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Surplus Banner ─── */}
        <motion.div
          className="p-6 bg-surface-1 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 animate-glow"
          variants={scaleIn}
        >
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
              Net Monthly Surplus
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400">
              {formatINR(animatedSurplus)}
              <span className="text-sm font-normal text-slate-500 ml-2">/ mo</span>
            </div>
            <p className="text-[11px] text-slate-500 font-body">
              Unallocated cash after all expenses & debts — ready to invest.
            </p>
          </div>

          <div className="text-center sm:text-right bg-surface-0 p-4 border border-surface-3">
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
              Bank Buffer
            </div>
            <div className="text-xl font-mono font-black text-white">{formatINR(liquidCash)}</div>
            <div className="text-[10px] text-slate-600 font-mono">Emergency baseline</div>
          </div>
        </motion.div>

        {/* ─── Actions ─── */}
        <motion.div
          className="pt-2 flex flex-col sm:flex-row gap-3 items-center"
          variants={fadeInUp}
        >
          <motion.button
            type="button"
            onClick={resetGame}
            className="w-full sm:w-auto px-6 py-3.5 border border-surface-3 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-body font-semibold transition-colors"
            {...springPress}
          >
            ← Reroll
          </motion.button>
          <motion.button
            type="button"
            onClick={() => navigateTo('goal_setup')}
            className="w-full flex-1 py-4 px-8 bg-emerald-500 text-surface-0 font-body font-black text-base tracking-wider uppercase flex items-center justify-center gap-3 btn-press cursor-pointer hover:bg-emerald-400 transition-colors"
            {...hardPress}
          >
            <span>Continue to Goals</span>
            <span className="text-lg">→</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

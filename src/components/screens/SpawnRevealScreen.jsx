import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR, formatPercent } from '../../utils/format.js';
import {
  pageSlideUp,
  staggerContainer,
  fadeInUp,
  scaleIn,
} from '../../utils/motion.js';

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target, duration = 1200) {
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

function StatRow({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="flex justify-between items-baseline py-1 sm:py-1.5 border-b border-slate-200 text-xs gap-2">
      <span className="text-slate-600 font-sans truncate">{label}</span>
      <span className={`font-mono font-bold shrink-0 ${color}`}>{value}</span>
    </div>
  );
}

export default function SpawnRevealScreen() {
  const { character, navigateTo, resetGame } = useGameStore();

  if (!character) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6">
        <p className="text-slate-600 mb-4 font-bold">No character generated yet.</p>
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-slate-900 text-white font-bold btn-press"
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
      className="min-h-screen bg-mesh-light text-slate-900 relative flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 overflow-x-hidden"
      {...pageSlideUp}
    >
      <motion.div
        className="w-full max-w-3xl space-y-3.5 sm:space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between pb-2 sm:pb-3 border-b-2 border-slate-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-600">
              Character Profile Revealed
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-600">
            Seed <span className="text-blue-700">#{seed}</span>
          </div>
        </div>

        {/* ─── Identity Card ─── */}
        <motion.div
          className="card-neopop p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 bg-white"
          variants={scaleIn}
        >
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-white font-display font-black text-2xl sm:text-3xl shadow-hard shrink-0">
            {initials}
          </div>

          <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl sm:text-3xl font-black text-slate-900">{name}</h2>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-900 text-[9px] sm:text-[10px] font-mono font-bold text-slate-800">
                Age {age}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-900 text-[9px] sm:text-[10px] font-mono font-bold text-slate-800">
                📍 {city}
              </span>
            </div>
            <div className="text-blue-700 font-bold text-xs sm:text-sm font-sans">{jobTitle}</div>
            <p className="text-[11px] sm:text-xs text-slate-600 italic font-body pt-0.5">
              "{primaryDream}"
            </p>
          </div>
        </motion.div>

        {/* ─── Inflow vs Outflow Columns ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          
          {/* Monthly Inflow */}
          <div className="card-neopop-sm p-3.5 sm:p-5 space-y-1.5 sm:space-y-2 bg-white">
            <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-900">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                Monthly Inflow
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-slate-900">
                EARNINGS
              </span>
            </div>

            <StatRow label="Gross Monthly CTC" value={formatINR(grossMonthlySalary)} />
            <StatRow label="Taxes & PF Deductions" value={`- ${formatINR(taxAndPFDeductions)}`} color="text-rose-600" />

            <div className="pt-2 flex justify-between items-baseline border-t-2 border-slate-900">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">Take-Home Pay</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-emerald-700">
                {formatINR(animatedTakeHome)}
              </span>
            </div>
          </div>

          {/* Monthly Outflow */}
          <div className="card-neopop-sm p-3.5 sm:p-5 space-y-1.5 sm:space-y-2 bg-white">
            <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-900">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
                Monthly Outflow
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-900">
                EXPENSES
              </span>
            </div>

            <StatRow label="Housing / Rent" value={formatINR(expenses.rent)} />
            <StatRow label="Utilities & Bills" value={formatINR(expenses.utilities)} />
            <StatRow label="Groceries & Food" value={formatINR(expenses.groceries)} />
            <StatRow label="Lifestyle & Dining" value={formatINR(expenses.lifestyle)} />
            {expenses.dependantSupport > 0 && (
              <StatRow label="Family Support" value={formatINR(expenses.dependantSupport)} color="text-amber-700" />
            )}
            {totalLoanEMIs > 0 && (
              <StatRow label="Loan EMIs" value={formatINR(totalLoanEMIs)} color="text-rose-600" />
            )}

            <div className="pt-2 flex justify-between items-baseline border-t-2 border-slate-900">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">Total Outflow</span>
              <span className="text-base sm:text-lg font-mono font-bold text-slate-900">
                {formatINR(totalMonthlyOutflow)}
              </span>
            </div>
          </div>

        </div>

        {/* ─── Loan Notice ─── */}
        {loans.length > 0 && (
          <div className="card-neopop-sm p-3 sm:p-4 bg-amber-50 border-2 border-slate-900 flex items-start gap-2.5">
            <span className="text-xl sm:text-2xl mt-0.5">🎓</span>
            <div className="space-y-0.5 flex-1 text-xs">
              <div className="font-bold text-amber-950 text-xs sm:text-sm">{loans[0].name} Active</div>
              <p className="text-slate-700 text-[11px] sm:text-xs">
                Principal remaining:{' '}
                <strong className="text-slate-900 font-mono">{formatINR(loans[0].principalRemaining)}</strong>{' '}
                at <strong className="text-slate-900">{formatPercent(loans[0].interestRateAnnual)}</strong>{' '}
                p.a. ({loans[0].tenureMonthsRemaining} months at {formatINR(loans[0].emi)}/mo).
              </p>
            </div>
          </div>
        )}

        {/* ─── Cashflow Surplus Banner ─── */}
        <motion.div
          className="card-neopop p-4 sm:p-6 bg-white border-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5"
          variants={scaleIn}
        >
          <div className="space-y-0.5 sm:space-y-1 text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Net Monthly Surplus (Investable)
            </span>
            <div className="text-3xl sm:text-5xl font-mono font-black text-emerald-700">
              {formatINR(animatedSurplus)}
              <span className="text-xs sm:text-sm font-normal text-slate-500 ml-1.5 font-sans">/ mo</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 pt-0.5">
              Available cash after all living costs and debt obligations — ready to fund life goals.
            </p>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right bg-slate-50 border-2 border-slate-900 p-2.5 sm:p-4 shrink-0 font-mono flex sm:flex-col justify-between items-center sm:items-end">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Liquid Buffer</span>
              <div className="text-lg sm:text-xl font-black text-slate-900">{formatINR(liquidCash)}</div>
            </div>
            <div className="text-[10px] text-slate-500 hidden sm:block">Bank baseline</div>
          </div>
        </motion.div>

        {/* ─── Action Buttons ─── */}
        <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-center">
          <button
            type="button"
            onClick={resetGame}
            className="w-full sm:w-auto px-5 py-3 sm:py-3.5 bg-white border-2 border-slate-900 text-slate-700 font-mono font-bold text-xs uppercase btn-press hover:bg-slate-50 transition-colors"
          >
            ← Back / Reroll
          </button>
          <button
            type="button"
            onClick={() => navigateTo('goal_setup')}
            className="w-full flex-1 py-3.5 sm:py-4 px-6 sm:px-8 bg-slate-900 text-white font-display font-black text-sm sm:text-base uppercase tracking-wider btn-press hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>Continue to Financial Goals</span>
            <span className="ml-2">➔</span>
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}

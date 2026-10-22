import React from 'react';
import { useGameStore } from '../../engine/store.js';
import { formatINR, formatPercent } from '../../utils/format.js';

export default function SpawnRevealScreen() {
  const { character, navigateTo, resetGame } = useGameStore();

  if (!character) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-4">No character generated yet.</p>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl"
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Spawn Profile Revealed
            </span>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Seed: <span className="text-emerald-400 font-semibold">#{seed}</span>
          </div>
        </div>

        {/* Character Identity Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
            {initials}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-white">{name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                Age {age}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                📍 {city}
              </span>
            </div>
            <div className="text-emerald-400 font-medium text-sm">{jobTitle}</div>
            <p className="text-xs text-slate-400 italic pt-0.5">
              "{primaryDream}"
            </p>
          </div>
        </div>

        {/* Financial Columns: Inflow vs Outflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Monthly Inflow */}
          <div className="bg-slate-950/50 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span>Monthly Inflow</span>
              <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">Earnings</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Gross Monthly CTC</span>
                <span className="text-slate-200 font-mono">{formatINR(grossMonthlySalary)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes & PF Deductions</span>
                <span className="text-rose-400 font-mono">- {formatINR(taxAndPFDeductions)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white">Take-Home Pay</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {formatINR(monthlyTakeHome)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Outflow */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Monthly Outflow</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">Expenses</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Housing / Rent</span>
                <span className="text-slate-200 font-mono">{formatINR(expenses.rent)}</span>
              </div>
              <div className="flex justify-between">
                <span>Utilities & Bills</span>
                <span className="text-slate-200 font-mono">{formatINR(expenses.utilities)}</span>
              </div>
              <div className="flex justify-between">
                <span>Groceries & Food</span>
                <span className="text-slate-200 font-mono">{formatINR(expenses.groceries)}</span>
              </div>
              <div className="flex justify-between">
                <span>Lifestyle & Dining</span>
                <span className="text-slate-200 font-mono">{formatINR(expenses.lifestyle)}</span>
              </div>
              {expenses.dependantSupport > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>Family Support</span>
                  <span className="font-mono">{formatINR(expenses.dependantSupport)}</span>
                </div>
              )}
              {totalLoanEMIs > 0 && (
                <div className="flex justify-between text-rose-300">
                  <span>Loan EMIs</span>
                  <span className="font-mono">{formatINR(totalLoanEMIs)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm">
                <span className="font-bold text-white">Total Outflow</span>
                <span className="font-bold text-slate-200 font-mono">
                  {formatINR(totalMonthlyOutflow)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Education Loan Notice (if present) */}
        {loans.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
            <span className="text-lg">🎓</span>
            <div className="space-y-0.5 flex-1">
              <div className="font-bold text-amber-300">{loans[0].name} Active</div>
              <p className="text-slate-300">
                Principal remaining: <strong className="text-white font-mono">{formatINR(loans[0].principalRemaining)}</strong> at{' '}
                <strong className="text-white">{formatPercent(loans[0].interestRateAnnual)}</strong> p.a. ({loans[0].tenureMonthsRemaining} months tenure remaining at {formatINR(loans[0].emi)}/mo).
              </p>
            </div>
          </div>
        )}

        {/* Cashflow Snapshot: Surplus + Bank Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Monthly Surplus (Investable)
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {formatINR(monthlySurplus)} <span className="text-sm font-normal text-slate-400">/ mo</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unallocated cash after all living expenses & debts. Ready to fund life goals.
            </p>
          </div>

          <div className="text-center sm:text-right bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Liquid Bank Buffer</div>
            <div className="text-lg font-black text-white font-mono">{formatINR(liquidCash)}</div>
            <div className="text-[10px] text-slate-500">Emergency baseline</div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={resetGame}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition"
          >
            ← Back / Reroll
          </button>
          <button
            type="button"
            onClick={() => navigateTo('goal_setup')}
            className="w-full flex-1 py-3.5 px-6 rounded-2xl font-bold text-base bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Continue to Financial Goals</span>
            <span className="text-lg">➔</span>
          </button>
        </div>

      </div>
    </div>
  );
}

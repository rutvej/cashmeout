import React from 'react';
import { useGameStore } from '../../engine/store.js';
import { evaluateScorecard } from '../../engine/scoringEngine.js';
import { formatINR } from '../../utils/format.js';

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

  const handlePlayAgainSameSeed = () => {
    const seed = character.seed;
    resetGame();
    setConfig({ seed });
  };

  const handleRollNewLife = () => {
    resetGame();
  };

  // Grade color theme
  const gradeStyles = {
    'A+': 'from-amber-500/20 via-emerald-500/20 to-teal-500/20 border-emerald-400 text-emerald-300',
    'A': 'from-emerald-500/20 via-teal-500/20 to-slate-900 border-emerald-500/50 text-emerald-400',
    'B': 'from-amber-500/20 via-slate-900 to-slate-900 border-amber-500/50 text-amber-300',
    'C': 'from-orange-500/20 via-slate-900 to-slate-900 border-orange-500/50 text-orange-400',
    'D': 'from-rose-500/20 via-slate-900 to-slate-900 border-rose-500/50 text-rose-400',
    'F': 'from-rose-600/20 via-slate-900 to-slate-900 border-rose-600/50 text-rose-500',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Simulation Complete • Retirement Reached
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {character.name}'s Financial Life Scorecard
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-400 sm:text-right">
            Age {character.retirementAge} • Seed <span className="text-emerald-400 font-bold">#{character.seed}</span>
          </div>
        </div>

        {/* Hero Grade Banner */}
        <div className={`p-6 rounded-3xl border bg-gradient-to-r flex flex-col sm:flex-row items-center justify-between gap-6 ${gradeStyles[grade] || gradeStyles.B}`}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-slate-950/80 border border-current flex items-center justify-center font-black text-4xl shadow-xl">
              {grade}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Final Financial Assessment
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{title}</h2>
              <p className="text-xs text-slate-300">
                Overall Financial Health Score: <strong className="text-white font-mono">{breakdown.totalScore} / 100 Points</strong>
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400">FI/RE Status</div>
            <div className={`text-base font-black ${isFinanciallyIndependent ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isFinanciallyIndependent ? '100% SELF-SUSTAINING' : 'PARTIAL COVERAGE'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              4% rule covers <strong className="text-white font-mono">{(fiRatio * 100).toFixed(0)}%</strong> of living costs
            </div>
          </div>
        </div>

        {/* Snapshot Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Final Net Worth</div>
            <div className="text-2xl font-black text-white font-mono">{formatINR(totalNetWorth)}</div>
            <div className="text-[11px] text-slate-500">Liquid Cash: {formatINR(liquidBankBalance)}</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Passive Income</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{formatINR(monthlyPassiveIncome)}</div>
            <div className="text-[11px] text-slate-500">Living Costs: {formatINR(Math.round(annualLivingExpenses / 12))}/mo</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Debt Freedom</div>
            <div className={`text-2xl font-black font-mono ${outstandingDebt === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {outstandingDebt === 0 ? '₹0 (DEBT FREE)' : formatINR(outstandingDebt)}
            </div>
            <div className="text-[11px] text-slate-500">
              {outstandingDebt === 0 ? 'Zero liabilities at retirement' : 'Unpaid debt requires liquidation'}
            </div>
          </div>

        </div>

        {/* Scoring Breakdown (4 Pillars) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Scoring Breakdown by Pillar
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">1. Financial Independence (4% Rule):</span>
                <span className="font-mono text-emerald-400 font-bold">{breakdown.financialIndependenceScore} / 40 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(breakdown.financialIndependenceScore / 40) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">2. Life Milestones Achieved ({goalsCompletedCount}/{totalGoalsCount}):</span>
                <span className="font-mono text-emerald-400 font-bold">{breakdown.milestoneCompletionScore} / 30 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(breakdown.milestoneCompletionScore / 30) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">3. Debt-Free Retirement:</span>
                <span className="font-mono text-emerald-400 font-bold">{breakdown.debtFreeScore} / 15 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(breakdown.debtFreeScore / 15) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">4. Liquid Safety Buffer:</span>
                <span className="font-mono text-emerald-400 font-bold">{breakdown.safetyBufferScore} / 15 pts</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(breakdown.safetyBufferScore / 15) * 100}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>

        {/* Life Milestones Checklist */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Life Milestones Audit
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {goals.map((g) => {
              const current = g.currentAmount || 0;
              const target = g.targetAmount || 1;
              const isAchieved = current >= target;

              return (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{g.icon}</span>
                    <span className="font-semibold text-white">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{formatINR(current)}</span>
                    <span className={isAchieved ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {isAchieved ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Life Insights */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">💡</span>
            <div>
              <strong className="text-slate-200">Key Strength:</strong>{' '}
              <span className="text-slate-400">{bestDecision}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">⚠️</span>
            <div>
              <strong className="text-slate-200">Critical Lesson:</strong>{' '}
              <span className="text-slate-400">{criticalLesson}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={() => navigateTo('main_game')}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition"
          >
            ← Review Dashboard
          </button>

          <button
            type="button"
            onClick={handlePlayAgainSameSeed}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 transition"
          >
            Replay Life (Same Seed #{character.seed})
          </button>

          <button
            type="button"
            onClick={handleRollNewLife}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition cursor-pointer"
          >
            Roll New Random Life ➔
          </button>
        </div>

      </div>
    </div>
  );
}

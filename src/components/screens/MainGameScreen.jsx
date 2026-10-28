import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../engine/store.js';
import { calculateNetWorth } from '../../engine/simulationEngine.js';
import { INSTRUMENTS } from '../../engine/compoundingEngine.js';
import { formatINR, formatPercent } from '../../utils/format.js';
import FinancialSetupScreen from './FinancialSetupScreen.jsx';
import VacationModal from '../game/VacationModal.jsx';
import RaiseModal from '../game/RaiseModal.jsx';
import MilestoneModal from '../game/MilestoneModal.jsx';

export default function MainGameScreen() {
  const {
    character,
    goals,
    insurance,
    simulation,
    play,
    pause,
    setSpeed,
    tickMonth,
    prepayLoan,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('goals'); // 'goals' | 'career' | 'loans' | 'insurance'
  const [isAdjustingAllocations, setIsAdjustingAllocations] = useState(false);

  // Simulation timer loop
  useEffect(() => {
    if (simulation.isPaused) return;

    const intervalMap = {
      1: 1500,
      2: 800,
      5: 350,
    };
    const intervalMs = intervalMap[simulation.gameSpeed] || 1500;

    const timer = setInterval(() => {
      tickMonth();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulation.isPaused, simulation.gameSpeed, tickMonth]);

  if (!character) return null;

  const netWorth = calculateNetWorth(character, goals, character.liquidCash);
  const totalMonthsTotal = (character.retirementAge - character.age) * 12;
  const progressToRetirement = Math.min(
    100,
    (simulation.currentMonthIndex / totalMonthsTotal) * 100
  );

  const totalEMIs = (character.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalInsurance =
    (insurance.health?.isPurchased ? insurance.health.monthlyPremium : 0) +
    (insurance.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0);

  const totalSIPs = goals.reduce((sum, g) => sum + (g.effectiveMonthlySIP || g.baseMonthlySIP || 0), 0);
  const currentYear = Math.floor(simulation.currentMonthIndex / 12) + 1;
  const currentMonthInYear = (simulation.currentMonthIndex % 12) + 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto space-y-5">
        
        {/* Top Simulation Command Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Age & Year Tracker */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
                {simulation.currentAge}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base">
                    Age {simulation.currentAge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    (Yr {currentYear}, Mo {currentMonthInYear})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Retirement target: Age {character.retirementAge} (in {character.retirementAge - simulation.currentAge} years)
                </div>
              </div>
            </div>

            {/* Financial Ledger Snapshot */}
            <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-2.5 rounded-2xl">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Net Worth</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  {formatINR(netWorth)}
                </div>
              </div>
              <div className="h-7 w-px bg-slate-800"></div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Bank Cash</div>
                <div className="text-base font-black text-white font-mono">
                  {formatINR(character.liquidCash)}
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={simulation.isPaused ? play : pause}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                  simulation.isPaused
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <span>{simulation.isPaused ? '▶ Resume' : '⏸ Pause'}</span>
              </button>

              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeed(spd)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      simulation.gameSpeed === spd
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Career Timeline Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Career Journey ({progressToRetirement.toFixed(0)}% to Retirement)</span>
              <span>Age 60</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progressToRetirement}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* Monthly Cashflow Ticker */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Take-Home:</span>
            <span className="font-mono text-emerald-400 font-bold">{formatINR(character.monthlyTakeHome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Living Exp:</span>
            <span className="font-mono text-slate-300">{formatINR(character.totalFixedExpenses)}</span>
          </div>
          {totalEMIs > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Loan EMIs:</span>
              <span className="font-mono text-rose-300">{formatINR(totalEMIs)}</span>
            </div>
          )}
          {totalInsurance > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Insurance:</span>
              <span className="font-mono text-slate-300">{formatINR(totalInsurance)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Active SIPs:</span>
            <span className="font-mono text-emerald-400 font-bold">{formatINR(totalSIPs)}/mo</span>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'goals'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Goal Buckets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'career'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💼 Career & Incomes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'loans'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💳 Loans & Debts ({(character.loans || []).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insurance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'insurance'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Insurance Protection
          </button>
        </div>

        {/* Tab 1: Goal Buckets */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Goal Buckets & Waterfall Overflow
              </span>
              <button
                type="button"
                onClick={() => {
                  pause();
                  setIsAdjustingAllocations(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-emerald-400 transition"
              >
                ⚙️ Adjust SIPs & Redirections
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((goal) => {
                const current = goal.currentAmount || 0;
                const target = goal.targetAmount || 1;
                const pct = Math.min(100, Math.round((current / target) * 100));
                const inst = INSTRUMENTS[goal.instrumentId] || INSTRUMENTS.savings;
                const effectiveSIP = goal.effectiveMonthlySIP || goal.baseMonthlySIP || 0;
                const bonusSIP = Math.max(0, effectiveSIP - (goal.baseMonthlySIP || 0));

                return (
                  <div
                    key={goal.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1.5 bg-slate-950 rounded-xl">{goal.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-white">{goal.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {inst.name} ({(inst.annualRate * 100).toFixed(0)}%)
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {goal.id === 'goal_emergency' && current >= target && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            🛡️ SHIELD 100%
                          </span>
                        )}
                        {goal.id === 'goal_emergency' && current < target && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                            ⚡ REFILL ACTIVE
                          </span>
                        )}
                        {goal.id !== 'goal_emergency' && current >= target && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                            🏆 100% FUNDED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-bold">{formatINR(current)}</span>
                        <span className="text-slate-400">{formatINR(target)} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Monthly SIP & Redirection Info */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-850 text-xs">
                      <div className="text-slate-400">
                        Monthly SIP: <strong className="text-white font-mono">{formatINR(effectiveSIP)}</strong>
                        {bonusSIP > 0 && (
                          <span className="text-emerald-400 font-mono text-[10px] ml-1">
                            (+{formatINR(bonusSIP)} waterfall)
                          </span>
                        )}
                      </div>
                      {goal.redirectGoalId && (
                        <div className="text-[10px] text-slate-500">
                          ↪️ Redirection set
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Career & Incomes */}
        {activeTab === 'career' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Career Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Job Title:</span>
                  <span className="text-white font-bold">{character.jobTitle}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>City & Tier:</span>
                  <span className="text-white font-bold">{character.city} ({character.cityTier})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Field:</span>
                  <span className="text-white font-bold capitalize">{character.careerField}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Monthly CTC:</span>
                  <span className="text-emerald-400 font-mono font-bold">{formatINR(character.grossMonthlySalary)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Take-Home Pay:</span>
                  <span className="text-emerald-400 font-mono font-bold">{formatINR(character.monthlyTakeHome)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Annual Appraisal Cycle:</span>
                  <span className="text-slate-200">Every 12 Months (+5% to +8%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Loans & Debts */}
        {activeTab === 'loans' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Active Debt & Loans</h3>
            {(!character.loans || character.loans.length === 0) ? (
              <p className="text-xs text-emerald-400">🎉 You are completely debt-free!</p>
            ) : (
              <div className="space-y-3">
                {character.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm">{loan.name}</div>
                      <div className="text-slate-400">
                        Remaining Principal: <strong className="text-emerald-400 font-mono">{formatINR(loan.principalRemaining)}</strong> at {formatPercent(loan.interestRateAnnual)} p.a.
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        EMI: {formatINR(loan.emi)}/mo • {loan.tenureMonthsRemaining} months left
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => prepayLoan(loan.id, 25000)}
                      disabled={character.liquidCash < 25000}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        character.liquidCash >= 25000
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Prepay ₹25,000 from Bank
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Insurance */}
        {activeTab === 'insurance' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Risk Protection Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{insurance.health.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${insurance.health.isPurchased ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {insurance.health.isPurchased ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-slate-400">{insurance.health.description}</p>
                <div className="text-emerald-400 font-mono font-semibold pt-1">
                  Premium: {formatINR(insurance.health.monthlyPremium)}/mo • Cover: {formatINR(insurance.health.sumInsured)}
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{insurance.termLife.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${insurance.termLife.isPurchased ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {insurance.termLife.isPurchased ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-slate-400">{insurance.termLife.description}</p>
                <div className="text-emerald-400 font-mono font-semibold pt-1">
                  Premium: {formatINR(insurance.termLife.monthlyPremium)}/mo • Cover: {formatINR(insurance.termLife.sumInsured)}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Auto-Pause Modals */}
      {simulation.activeModal?.type === 'vacation' && (
        <VacationModal data={simulation.activeModal.data} />
      )}

      {simulation.activeModal?.type === 'raise' && (
        <RaiseModal
          data={simulation.activeModal}
          onAdjustAllocations={() => {
            setIsAdjustingAllocations(true);
          }}
        />
      )}

      {simulation.activeModal?.type === 'milestone' && (
        <MilestoneModal goal={simulation.activeModal.goal} />
      )}

      {/* Reusable In-Game Allocation Adjustment Modal */}
      {isAdjustingAllocations && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <FinancialSetupScreen
            isModal={true}
            onClose={() => setIsAdjustingAllocations(false)}
          />
        </div>
      )}

    </div>
  );
}

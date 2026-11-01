import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { calculateNetWorth } from '../../engine/simulationEngine.js';
import { INSTRUMENTS } from '../../engine/compoundingEngine.js';
import { formatINR, formatPercent } from '../../utils/format.js';
import FinancialSetupScreen from './FinancialSetupScreen.jsx';
import VacationModal from '../game/VacationModal.jsx';
import RaiseModal from '../game/RaiseModal.jsx';
import MilestoneModal from '../game/MilestoneModal.jsx';
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  springPress,
  hardPress,
  backdropFade,
  sheetSlideUp,
} from '../../utils/motion.js';

/* ─── Circular Progress Ring ─── */
function ProgressRing({ percent, size = 48, stroke = 3.5, color = '#059669' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="butt"
        className="transition-all duration-300 ease-out"
      />
    </svg>
  );
}

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
    navigateTo,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('goals');
  const [isAdjustingAllocations, setIsAdjustingAllocations] = useState(false);

  // Retirement target computation
  const retirementAge = character?.retirementAge || 60;
  const totalMonthsTotal = ((character?.retirementAge || 60) - (character?.age || 23)) * 12;
  const progressToRetirement = Math.min(
    100,
    Math.round((simulation.currentMonthIndex / totalMonthsTotal) * 100)
  );
  const isRetirementReached =
    simulation.currentAge >= retirementAge || simulation.currentMonthIndex >= totalMonthsTotal;

  // Auto-navigate to Scorecard when simulation finishes
  useEffect(() => {
    if (isRetirementReached) {
      pause();
      navigateTo('scorecard');
    }
  }, [isRetirementReached, pause, navigateTo]);

  // Simulation timer loop
  useEffect(() => {
    if (simulation.isPaused || isRetirementReached) return;
    const intervalMap = { 1: 1500, 2: 800, 5: 350 };
    const intervalMs = intervalMap[simulation.gameSpeed] || 1500;
    const timer = setInterval(() => {
      tickMonth();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [simulation.isPaused, simulation.gameSpeed, isRetirementReached, tickMonth]);

  if (!character) return null;

  const netWorth = calculateNetWorth(character, goals, character.liquidCash);
  const totalEMIs = (character.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalInsurance =
    (insurance.health?.isPurchased ? insurance.health.monthlyPremium : 0) +
    (insurance.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0);
  const totalSIPs = goals.reduce((sum, g) => sum + (g.effectiveMonthlySIP || g.baseMonthlySIP || 0), 0);
  const currentYear = Math.floor(simulation.currentMonthIndex / 12) + 1;
  const currentMonthInYear = (simulation.currentMonthIndex % 12) + 1;

  const TABS = [
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'career', label: 'Career', icon: '💼' },
    { id: 'loans', label: 'Loans', icon: '💳' },
    { id: 'insurance', label: 'Shield', icon: '🛡️' },
  ];

  return (
    <motion.div
      className="min-h-screen bg-mesh-light text-slate-900 flex flex-col p-3 sm:p-5 lg:p-6"
      {...pageTransition}
    >
      <div className="w-full max-w-5xl mx-auto space-y-4 flex-1">

        {/* ─── Simulation Finished Banner (Guarantee user is never stuck) ─── */}
        {isRetirementReached && (
          <div className="card-neopop p-4 bg-amber-100 border-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <span className="font-display font-black text-lg text-slate-900 block">
                  Career Simulation Complete! Reached Age {simulation.currentAge}
                </span>
                <span className="text-xs text-slate-700">
                  Your 37-year financial journey has concluded.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('scorecard')}
              className="px-6 py-2.5 bg-slate-900 text-white font-mono font-bold text-xs btn-press uppercase tracking-wider"
            >
              View Final Scorecard ➔
            </button>
          </div>
        )}

        {/* ─── Top Command Bar (Light CRED NeoPOP) ─── */}
        <div className="card-neopop p-4 sm:p-5 space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Age Badge */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <ProgressRing percent={progressToRetirement} size={54} stroke={4} color="#2563EB" />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-lg text-slate-900">
                  {simulation.currentAge}
                </div>
              </div>
              <div>
                <div className="font-display font-black text-slate-900 text-base">
                  Age {simulation.currentAge}
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-500">
                  Year {currentYear} · Month {currentMonthInYear} · Target Age {retirementAge}
                </div>
              </div>
            </div>

            {/* Net Worth Hero */}
            <div className="text-center sm:text-left bg-slate-50 border-2 border-slate-900 px-5 py-2.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Accumulated Net Worth
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900">
                {formatINR(netWorth)}
              </span>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={simulation.isPaused ? play : pause}
                className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider uppercase btn-press ${
                  simulation.isPaused
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-500'
                }`}
              >
                {simulation.isPaused ? '▶ PLAY' : '⏸ PAUSE'}
              </button>

              <div className="flex bg-white border-2 border-slate-900 p-0.5">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeed(spd)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold transition-all ${
                      simulation.gameSpeed === spd
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Career Progress Line */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-mono font-bold text-slate-500">
              <span>Career Journey ({progressToRetirement}% Completed)</span>
              <span>Retirement Age {retirementAge}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 border-2 border-slate-900 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressToRetirement}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── Cashflow Ticker Strip ─── */}
        <div className="card-neopop-sm bg-white p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase text-[10px]">Take-Home:</span>
            <span className="text-emerald-700 font-black">{formatINR(character.monthlyTakeHome)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase text-[10px]">Expenses:</span>
            <span className="text-slate-800">{formatINR(character.totalFixedExpenses)}</span>
          </div>
          {totalEMIs > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 uppercase text-[10px]">EMIs:</span>
              <span className="text-rose-600">{formatINR(totalEMIs)}</span>
            </div>
          )}
          {totalInsurance > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 uppercase text-[10px]">Insurance:</span>
              <span className="text-slate-800">{formatINR(totalInsurance)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase text-[10px]">Active SIPs:</span>
            <span className="text-blue-700 font-black">{formatINR(totalSIPs)}/mo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 uppercase text-[10px]">Bank Cash:</span>
            <span className="text-slate-900 font-black">{formatINR(character.liquidCash)}</span>
          </div>
        </div>

        {/* ─── Tabs Navigation ─── */}
        <div className="flex border-b-2 border-slate-900 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-t-2 border-x-2 border-slate-900 transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 -mb-[2px] shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Tab 1: Goals ─── */}
        {activeTab === 'goals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                Active Goal Buckets & Waterfall Overflow
              </span>
              <button
                type="button"
                onClick={() => {
                  pause();
                  setIsAdjustingAllocations(true);
                }}
                className="px-3.5 py-1.5 bg-white border-2 border-slate-900 text-xs font-mono font-bold btn-press-sm hover:bg-slate-50"
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
                const ringColor = pct >= 100 ? '#059669' : pct >= 60 ? '#D97706' : '#2563EB';

                return (
                  <div
                    key={goal.id}
                    className="card-neopop-sm p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <ProgressRing percent={pct} size={46} stroke={3.5} color={ringColor} />
                          <div className="absolute inset-0 flex items-center justify-center text-lg">
                            {goal.icon}
                          </div>
                        </div>
                        <div>
                          <div className="font-display font-black text-sm text-slate-900">{goal.name}</div>
                          <div className="text-[11px] font-mono font-bold text-slate-500">
                            {inst.name} · {(inst.annualRate * 100).toFixed(0)}% p.a.
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {goal.id === 'goal_emergency' && current >= target && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-100 border border-slate-900 text-emerald-900">
                            🛡️ 100% BUFFER
                          </span>
                        )}
                        {goal.id === 'goal_emergency' && current < target && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-100 border border-slate-900 text-amber-900">
                            ⚡ REFILL ACTIVE
                          </span>
                        )}
                        {goal.id !== 'goal_emergency' && current >= target && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-100 border border-slate-900 text-emerald-900">
                            🏆 100% FUNDED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono font-bold">
                        <span className="text-emerald-700">{formatINR(current)}</span>
                        <span className="text-slate-600">{formatINR(target)} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 border border-slate-900 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: ringColor }}
                        />
                      </div>
                    </div>

                    {/* SIP Info */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-mono">
                      <div className="text-slate-600">
                        SIP: <strong className="text-slate-900 font-bold">{formatINR(effectiveSIP)}</strong>
                        {bonusSIP > 0 && (
                          <span className="text-emerald-700 font-bold ml-1">(+{formatINR(bonusSIP)} ↪)</span>
                        )}
                      </div>
                      {goal.redirectGoalId && (
                        <span className="text-[10px] text-blue-700 font-bold">
                          ↪ Redirect active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Tab 2: Career ─── */}
        {activeTab === 'career' && (
          <div className="card-neopop p-5 space-y-4 bg-white">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">
              Career Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5">
                {[
                  ['Job Title', character.jobTitle],
                  ['City & Tier', `${character.city} (${character.cityTier})`],
                  ['Field', character.careerField],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-600">{label}</span>
                    <span className="text-slate-900 font-bold capitalize">{val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                {[
                  ['Gross CTC', formatINR(character.grossMonthlySalary), 'text-emerald-700 font-mono'],
                  ['Take-Home', formatINR(character.monthlyTakeHome), 'text-emerald-700 font-mono'],
                  ['Appraisal Cycle', '+5–7% Annual Hike', 'text-slate-800'],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-600">{label}</span>
                    <span className={`font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab 3: Loans ─── */}
        {activeTab === 'loans' && (
          <div className="card-neopop p-5 space-y-4 bg-white">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">
              Active Debt & Liabilities
            </h3>
            {(!character.loans || character.loans.length === 0) ? (
              <p className="text-xs font-mono font-bold text-emerald-700">🎉 Congratulations! You are 100% debt-free!</p>
            ) : (
              <div className="space-y-3">
                {character.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-4 bg-slate-50 border-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{loan.name}</div>
                      <div className="text-slate-600">
                        Remaining Principal: <strong className="text-slate-900 font-mono">{formatINR(loan.principalRemaining)}</strong> at {formatPercent(loan.interestRateAnnual)} p.a.
                      </div>
                      <div className="text-slate-500 font-mono text-[11px]">
                        EMI: {formatINR(loan.emi)}/mo · {loan.tenureMonthsRemaining} months left
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => prepayLoan(loan.id, 25000)}
                      disabled={character.liquidCash < 25000}
                      className={`px-4 py-2 text-xs font-mono font-bold uppercase btn-press-sm transition-all ${
                        character.liquidCash >= 25000
                          ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-400'
                      }`}
                    >
                      Prepay ₹25,000
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab 4: Insurance ─── */}
        {activeTab === 'insurance' && (
          <div className="card-neopop p-5 space-y-4 bg-white">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">
              Risk Protection Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[insurance.health, insurance.termLife].map((ins) => (
                <div key={ins.name} className="p-4 bg-slate-50 border-2 border-slate-900 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{ins.name}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border border-slate-900 ${
                      ins.isPurchased ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {ins.isPurchased ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-slate-600">{ins.description}</p>
                  <div className="text-slate-900 font-mono font-bold pt-1">
                    Premium: {formatINR(ins.monthlyPremium)}/mo · Cover: {formatINR(ins.sumInsured)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ─── Auto-Pause Modals ─── */}
      {simulation.activeModal?.type === 'vacation' && (
        <VacationModal data={simulation.activeModal.data} />
      )}
      {simulation.activeModal?.type === 'raise' && (
        <RaiseModal
          data={simulation.activeModal}
          onAdjustAllocations={() => setIsAdjustingAllocations(true)}
        />
      )}
      {simulation.activeModal?.type === 'milestone' && (
        <MilestoneModal goal={simulation.activeModal.goal} />
      )}

      {/* ─── Allocation Adjustment Modal ─── */}
      {isAdjustingAllocations && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl max-h-[94vh] overflow-y-auto card-neopop bg-white">
            <FinancialSetupScreen
              isModal={true}
              onClose={() => setIsAdjustingAllocations(false)}
            />
          </div>
        </div>
      )}

    </motion.div>
  );
}

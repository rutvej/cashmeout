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
function ProgressRing({ percent, size = 48, stroke = 3, color = '#10b981' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, percent) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1f2937"
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
        className="transition-all duration-500 ease-out"
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
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('goals');
  const [isAdjustingAllocations, setIsAdjustingAllocations] = useState(false);

  // Simulation timer loop
  useEffect(() => {
    if (simulation.isPaused) return;
    const intervalMap = { 1: 1500, 2: 800, 5: 350 };
    const intervalMs = intervalMap[simulation.gameSpeed] || 1500;
    const timer = setInterval(() => { tickMonth(); }, intervalMs);
    return () => clearInterval(timer);
  }, [simulation.isPaused, simulation.gameSpeed, tickMonth]);

  if (!character) return null;

  const netWorth = calculateNetWorth(character, goals, character.liquidCash);
  const totalMonthsTotal = (character.retirementAge - character.age) * 12;
  const progressToRetirement = Math.min(100, (simulation.currentMonthIndex / totalMonthsTotal) * 100);
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
      className="min-h-screen bg-surface-0 text-slate-100 flex flex-col p-3 sm:p-5 lg:p-6"
      {...pageTransition}
    >
      <div className="w-full max-w-5xl mx-auto space-y-4 flex-1">

        {/* ─── Command Bar ─── */}
        <motion.div
          className="bg-surface-1 border border-surface-3 p-4 sm:p-5 space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Age Badge */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <ProgressRing percent={progressToRetirement} size={52} stroke={3} />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-lg text-white">
                  {simulation.currentAge}
                </div>
              </div>
              <div>
                <div className="font-body font-extrabold text-white text-sm">
                  Age {simulation.currentAge}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Yr {currentYear} · Mo {currentMonthInYear} · Retire at {character.retirementAge}
                </div>
              </div>
            </div>

            {/* Net Worth Hero */}
            <div className="text-center">
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-600">
                Net Worth
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
                {formatINR(netWorth)}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={simulation.isPaused ? play : pause}
                className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-all btn-press ${
                  simulation.isPaused
                    ? 'bg-emerald-500 text-surface-0'
                    : 'bg-amber-500 text-surface-0'
                }`}
                {...hardPress}
              >
                {simulation.isPaused ? '▶ PLAY' : '⏸ PAUSE'}
              </motion.button>

              <div className="flex bg-surface-0 border border-surface-3 p-0.5">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeed(spd)}
                    className={`px-2.5 py-1.5 text-[10px] font-mono font-bold transition-all ${
                      simulation.gameSpeed === spd
                        ? 'bg-surface-3 text-emerald-400'
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Line */}
          <div className="w-full h-px bg-surface-3 relative">
            <motion.div
              className="h-px bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressToRetirement}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* ─── Cashflow Ticker ─── */}
        <div className="bg-surface-1 border border-surface-3 flex flex-wrap divide-x divide-surface-3">
          {[
            { label: 'Take-Home', value: formatINR(character.monthlyTakeHome), color: 'text-emerald-400' },
            { label: 'Expenses', value: formatINR(character.totalFixedExpenses), color: 'text-slate-300' },
            ...(totalEMIs > 0 ? [{ label: 'EMIs', value: formatINR(totalEMIs), color: 'text-rose-400' }] : []),
            ...(totalInsurance > 0 ? [{ label: 'Insurance', value: formatINR(totalInsurance), color: 'text-slate-300' }] : []),
            { label: 'SIPs', value: `${formatINR(totalSIPs)}/mo`, color: 'text-emerald-400' },
            { label: 'Bank', value: formatINR(character.liquidCash), color: 'text-white' },
          ].map((item, i) => (
            <div key={i} className="flex-1 min-w-[100px] px-3 py-2.5 text-center">
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.15em] text-slate-600">
                {item.label}
              </div>
              <div className={`text-xs font-mono font-bold ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* ─── Tab Navigation ─── */}
        <div className="flex border-b border-surface-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-b-emerald-500 text-emerald-400'
                  : 'border-b-transparent text-slate-500 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Tab: Goals ─── */}
        {activeTab === 'goals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                Goal Buckets
              </span>
              <motion.button
                type="button"
                onClick={() => { pause(); setIsAdjustingAllocations(true); }}
                className="px-3 py-1.5 bg-surface-1 border border-surface-3 hover:border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 transition-colors"
                {...springPress}
              >
                ⚙️ ADJUST
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((goal) => {
                const current = goal.currentAmount || 0;
                const target = goal.targetAmount || 1;
                const pct = Math.min(100, Math.round((current / target) * 100));
                const inst = INSTRUMENTS[goal.instrumentId] || INSTRUMENTS.savings;
                const effectiveSIP = goal.effectiveMonthlySIP || goal.baseMonthlySIP || 0;
                const bonusSIP = Math.max(0, effectiveSIP - (goal.baseMonthlySIP || 0));
                const ringColor = pct >= 100 ? '#10b981' : pct >= 60 ? '#F5A623' : '#EF4444';

                return (
                  <div
                    key={goal.id}
                    className="bg-surface-1 border border-surface-3 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* Progress Ring */}
                        <div className="relative shrink-0">
                          <ProgressRing percent={pct} size={44} stroke={3} color={ringColor} />
                          <div className="absolute inset-0 flex items-center justify-center text-lg">
                            {goal.icon}
                          </div>
                        </div>
                        <div>
                          <div className="font-body font-bold text-sm text-white">{goal.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {inst.name} · {(inst.annualRate * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {goal.id === 'goal_emergency' && current >= target && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🛡️ 100%
                          </span>
                        )}
                        {goal.id === 'goal_emergency' && current < target && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ⚡ REFILL
                          </span>
                        )}
                        {goal.id !== 'goal_emergency' && current >= target && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🏆 FUNDED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">{formatINR(current)}</span>
                        <span className="text-slate-500">{formatINR(target)} · {pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-surface-0 overflow-hidden border border-surface-3">
                        <div
                          className="h-full transition-all duration-500 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: ringColor }}
                        />
                      </div>
                    </div>

                    {/* SIP Info */}
                    <div className="flex items-center justify-between pt-1 border-t border-surface-3 text-[10px] font-mono">
                      <div className="text-slate-500">
                        SIP: <strong className="text-white">{formatINR(effectiveSIP)}</strong>
                        {bonusSIP > 0 && (
                          <span className="text-emerald-400 ml-1">(+{formatINR(bonusSIP)} ↪)</span>
                        )}
                      </div>
                      {goal.redirectGoalId && (
                        <span className="text-slate-600">↪ redirect</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Tab: Career ─── */}
        {activeTab === 'career' && (
          <div className="bg-surface-1 border border-surface-3 p-5 space-y-4">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
              Career Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              <div className="space-y-2.5">
                {[
                  ['Job Title', character.jobTitle],
                  ['City', `${character.city} (${character.cityTier})`],
                  ['Field', character.careerField],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-surface-3/50">
                    <span className="text-slate-500">{label}</span>
                    <span className="text-white font-bold capitalize">{val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                {[
                  ['Gross CTC', formatINR(character.grossMonthlySalary), 'text-emerald-400'],
                  ['Take-Home', formatINR(character.monthlyTakeHome), 'text-emerald-400'],
                  ['Appraisal', '+5–8% / yr', 'text-slate-200'],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-surface-3/50">
                    <span className="text-slate-500">{label}</span>
                    <span className={`font-mono font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Loans ─── */}
        {activeTab === 'loans' && (
          <div className="bg-surface-1 border border-surface-3 p-5 space-y-4">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
              Active Debts
            </h3>
            {(!character.loans || character.loans.length === 0) ? (
              <p className="text-xs text-emerald-400 font-mono">🎉 DEBT FREE</p>
            ) : (
              <div className="space-y-3">
                {character.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-4 bg-surface-0 border border-surface-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 text-xs font-body">
                      <div className="font-bold text-white text-sm">{loan.name}</div>
                      <div className="text-slate-500">
                        Remaining: <strong className="text-emerald-400 font-mono">{formatINR(loan.principalRemaining)}</strong> at {formatPercent(loan.interestRateAnnual)} p.a.
                      </div>
                      <div className="text-slate-600 font-mono text-[10px]">
                        EMI: {formatINR(loan.emi)}/mo · {loan.tenureMonthsRemaining} mo left
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => prepayLoan(loan.id, 25000)}
                      disabled={character.liquidCash < 25000}
                      className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                        character.liquidCash >= 25000
                          ? 'bg-emerald-500 text-surface-0 btn-press cursor-pointer'
                          : 'bg-surface-2 text-slate-600 cursor-not-allowed'
                      }`}
                      {...(character.liquidCash >= 25000 ? hardPress : {})}
                    >
                      Prepay ₹25K
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Insurance ─── */}
        {activeTab === 'insurance' && (
          <div className="bg-surface-1 border border-surface-3 p-5 space-y-4">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
              Protection Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[insurance.health, insurance.termLife].map((ins) => (
                <div key={ins.name} className="p-4 bg-surface-0 border border-surface-3 space-y-2 text-xs font-body">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{ins.name}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 ${ins.isPurchased ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-2 text-slate-500 border border-surface-3'}`}>
                      {ins.isPurchased ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-slate-500">{ins.description}</p>
                  <div className="text-emerald-400 font-mono font-bold pt-1">
                    {formatINR(ins.monthlyPremium)}/mo · Cover: {formatINR(ins.sumInsured)}
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

      {/* ─── Allocation Adjustment Sheet ─── */}
      <AnimatePresence>
        {isAdjustingAllocations && (
          <motion.div
            className="fixed inset-0 z-50 bg-surface-0/90 backdrop-blur-sm flex items-end sm:items-center justify-center"
            {...backdropFade}
          >
            <motion.div
              className="w-full max-w-4xl max-h-[92vh] overflow-y-auto"
              {...sheetSlideUp}
            >
              <FinancialSetupScreen
                isModal={true}
                onClose={() => setIsAdjustingAllocations(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

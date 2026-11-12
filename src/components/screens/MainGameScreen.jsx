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
import ShockModal from '../game/ShockModal.jsx';
import UpskillingModal from '../game/UpskillingModal.jsx';
import JobMarketModal from '../game/JobMarketModal.jsx';
import OfferLetterModal from '../game/OfferLetterModal.jsx';
import CourseCompletedModal from '../game/CourseCompletedModal.jsx';
import UnemploymentRunwayToast from '../game/UnemploymentRunwayToast.jsx';
import VentureIncubatorModal from '../game/VentureIncubatorModal.jsx';
import LaunchVentureModal from '../game/LaunchVentureModal.jsx';
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
    toggleAutoVacation,
    dropActiveCourse,
    launchVenture,
    scaleVenture,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('goals');
  const [goalFilter, setGoalFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [isAdjustingAllocations, setIsAdjustingAllocations] = useState(false);
  const [isUpskillingModalOpen, setIsUpskillingModalOpen] = useState(false);
  const [isJobMarketModalOpen, setIsJobMarketModalOpen] = useState(false);
  const [isVentureModalOpen, setIsVentureModalOpen] = useState(false);

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

  const completedGoalsCount = goals.filter((g) => (g.currentAmount || 0) >= (g.targetAmount || 1)).length;
  const activeGoalsCount = goals.length - completedGoalsCount;

  const filteredGoals = goals.filter((g) => {
    const isDone = (g.currentAmount || 0) >= (g.targetAmount || 1);
    if (goalFilter === 'active') return !isDone;
    if (goalFilter === 'completed') return isDone;
    return true;
  });

  return (
    <motion.div
      className="min-h-screen bg-mesh-light text-slate-900 flex flex-col p-2.5 sm:p-5 lg:p-6 font-sans overflow-x-hidden"
      {...pageTransition}
    >
      <div className="w-full max-w-5xl mx-auto space-y-3 sm:space-y-4 flex-1">

        {/* ─── Simulation Finished Banner (Guarantee user is never stuck) ─── */}
        {isRetirementReached && (
          <div className="card-neopop p-3.5 sm:p-4 bg-amber-100 border-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <span className="font-display font-black text-base sm:text-lg text-slate-900 block">
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
              className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 bg-slate-900 text-white font-mono font-bold text-xs btn-press uppercase tracking-wider"
            >
              View Final Scorecard ➔
            </button>
          </div>
        )}

        {/* ─── Unemployment 3s Runway Reminder Toast (Non-blocking) ─── */}
        {character.employmentStatus === 'unemployed' && simulation.unemploymentReminder && (
          <UnemploymentRunwayToast
            reminder={simulation.unemploymentReminder}
            onOpenJobMarket={() => {
              pause();
              setIsJobMarketModalOpen(true);
            }}
          />
        )}

        {/* ─── Top Command Bar (Light CRED NeoPOP) ─── */}
        <div className="card-neopop p-3 sm:p-5 space-y-2.5 sm:space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Top row on mobile: Age Badge + Net Worth */}
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative">
                  <ProgressRing percent={progressToRetirement} size={44} stroke={3.5} color="#2563EB" />
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-base sm:text-lg text-slate-900">
                    {simulation.currentAge}
                  </div>
                </div>
                <div>
                  <div className="font-display font-black text-slate-900 text-sm sm:text-base leading-tight flex items-center gap-1.5 flex-wrap">
                    <span>Age {simulation.currentAge}</span>
                    {character.employmentStatus === 'unemployed' && (
                      <span className="px-1.5 py-0.5 bg-rose-100 border border-slate-900 text-rose-900 text-[9px] sm:text-[10px] font-mono font-bold animate-pulse inline-block">
                        ⚠️ Unemployed (Month {character.unemploymentDurationMonths || 1})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500">
                    Y{currentYear} · M{currentMonthInYear} · Target {retirementAge}
                  </div>
                </div>
              </div>

              {/* Net Worth Hero (compact on mobile) */}
              <div className="text-right sm:text-left bg-slate-50 border-2 border-slate-900 px-3 py-1.5 sm:px-5 sm:py-2.5">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Net Worth
                </span>
                <span className="text-lg sm:text-2xl font-mono font-black text-slate-900">
                  {formatINR(netWorth)}
                </span>
              </div>
            </div>

            {/* Simulation Controls & Auto-Vacation */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <button
                type="button"
                onClick={simulation.isPaused ? play : pause}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs font-mono font-bold tracking-wider uppercase btn-press text-center ${
                  simulation.isPaused
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-500'
                }`}
              >
                {simulation.isPaused ? '▶ PLAY' : '⏸ PAUSE'}
              </button>

              <div className="flex bg-white border-2 border-slate-900 p-0.5 shrink-0">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeed(spd)}
                    className={`px-2 sm:px-2.5 py-1 text-xs font-mono font-bold transition-all ${
                      simulation.gameSpeed === spd
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>

              {/* Auto-Vacation Toggle Badge */}
              <button
                type="button"
                onClick={() => toggleAutoVacation()}
                title="Toggle automatic annual vacation without stopping the simulation"
                className={`px-2 sm:px-2.5 py-1.5 sm:py-2 text-[10px] font-mono font-bold border-2 border-slate-900 btn-press-sm transition-colors shrink-0 ${
                  simulation.autoVacation
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                {simulation.autoVacation ? '✈️ AUTO: ON' : '✈️ AUTO: OFF'}
              </button>
            </div>
          </div>

          {/* Career Progress Line */}
          <div className="space-y-0.5 sm:space-y-1 pt-0.5">
            <div className="flex justify-between text-[10px] sm:text-[11px] font-mono font-bold text-slate-500">
              <span>Career Journey ({progressToRetirement}%)</span>
              <span>Retire @ {retirementAge}</span>
            </div>
            <div className="w-full h-2 sm:h-2.5 bg-slate-100 border-2 border-slate-900 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressToRetirement}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── Cashflow Ticker Strip ─── */}
        <div className="card-neopop-sm bg-white p-2.5 sm:p-3 grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono font-bold">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
            <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">Take-Home:</span>
            {character.employmentStatus === 'unemployed' ? (
              (character.ventureIncome || 0) > 0 ? (
                <span className="text-emerald-700 font-black truncate flex items-center gap-1">
                  +{formatINR(character.ventureIncome)}/mo
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 border border-emerald-800">Ventures</span>
                </span>
              ) : (
                <span className="text-rose-600 font-black truncate flex items-center gap-1">
                  <span className="line-through">{formatINR(character.preLayoffTakeHome || 0)}</span>
                  <span className="text-[9px] bg-rose-100 text-rose-800 px-1 border border-rose-800">₹0</span>
                </span>
              )
            ) : (
              <span className="text-emerald-700 font-black truncate">{formatINR(character.monthlyTakeHome)}</span>
            )}
          </div>
          {character.ventureIncome > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
              <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">Ventures:</span>
              <span className="text-emerald-700 font-black truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                +{formatINR(character.ventureIncome)}/mo
              </span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
            <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">Expenses:</span>
            <span className="text-slate-800 truncate">{formatINR(character.totalFixedExpenses)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
            <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">Bank Cash:</span>
            <span className="text-slate-900 font-black truncate">{formatINR(character.liquidCash)}</span>
          </div>
          {totalEMIs > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
              <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">EMIs:</span>
              <span className="text-rose-600 truncate">{formatINR(totalEMIs)}</span>
            </div>
          )}
          {totalInsurance > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
              <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">Insurance:</span>
              <span className="text-slate-800 truncate">{formatINR(totalInsurance)}</span>
            </div>
          )}
          {character.activeCourse && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
              <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">Course:</span>
              <span className="text-purple-700 font-black truncate">{formatINR(character.activeCourse.monthlyFee)}/mo</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 min-w-0">
            <span className="text-slate-500 uppercase text-[9px] sm:text-[10px]">Active SIPs:</span>
            <span className="text-blue-700 font-black truncate">{formatINR(totalSIPs)}/mo</span>
          </div>
        </div>

        {/* ─── Tabs Navigation (Strict Grid: Zero Overflow Guarantee) ─── */}
        <div className="grid grid-cols-4 border-b-2 border-slate-900 gap-0.5 sm:gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-tight sm:tracking-wider border-t-2 border-x-2 border-slate-900 transition-all text-center ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 -mb-[2px] shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Tab 1: Goals ─── */}
        {activeTab === 'goals' && (
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Quick Filter Bar */}
              <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold">
                {[
                  { id: 'all', label: `All (${goals.length})` },
                  { id: 'active', label: `Active (${activeGoalsCount})` },
                  { id: 'completed', label: `Done (${completedGoalsCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setGoalFilter(f.id)}
                    className={`px-2 py-1 border border-slate-900 transition-colors ${
                      goalFilter === f.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    pause();
                    setIsVentureModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white border-2 border-slate-900 text-[11px] sm:text-xs font-mono font-bold btn-press shadow-[2px_2px_0px_#0f172a] text-center"
                >
                  + New Venture / Side Hustle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    pause();
                    setIsAdjustingAllocations(true);
                  }}
                  className="flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 bg-white border-2 border-slate-900 text-[11px] sm:text-xs font-mono font-bold btn-press-sm hover:bg-slate-50 text-center"
                >
                  ⚙️ Adjust SIPs & Redirections
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {filteredGoals.map((goal) => {
                const target = goal.targetAmount || 1;
                const current = Math.min(target, goal.currentAmount || 0);
                const pct = Math.min(100, Math.round((current / target) * 100));
                const inst = INSTRUMENTS[goal.instrumentId] || INSTRUMENTS.savings;
                const effectiveSIP = goal.effectiveMonthlySIP || goal.baseMonthlySIP || 0;
                const bonusSIP = Math.max(0, effectiveSIP - (goal.baseMonthlySIP || 0));
                const ringColor = pct >= 100 ? '#059669' : pct >= 60 ? '#D97706' : '#2563EB';

                // ─── ACTIVE VENTURE ASSET CARD ───
                if (goal.category === 'venture' && goal.isLaunched) {
                  const netInflow = goal.lastMonthNetCashFlow || goal.netMonthlyCashFlow || (goal.monthlyRevenueBase - goal.monthlyOperationalCost);
                  const isRental = goal.ventureType === 'rental_property';
                  const isFranchise = goal.ventureType === 'franchise';
                  const isSideHustle = goal.ventureType === 'side_hustle';
                  const canScale = !goal.isScaledUp && (character.liquidCash >= (goal.scaleUpCost || 100000));

                  return (
                    <div
                      key={goal.id}
                      className="border-2 border-emerald-900 p-3.5 sm:p-4 space-y-3 bg-emerald-50/50 shadow-[3px_3px_0px_#065f46]"
                    >
                      {/* Active Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <span className="text-2xl p-2 bg-white border-2 border-emerald-900 shrink-0">
                            {goal.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="font-display font-black text-xs sm:text-sm text-slate-900 truncate">
                              {goal.name}
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-800 truncate">
                              {isRental
                                ? 'Real Estate Asset · 6.5% p.a. Compounding'
                                : isFranchise
                                ? 'Turnkey Retail · Net Passive Dividends'
                                : 'Digital Sweat Equity · Recurring Net Inflow'}
                            </div>
                          </div>
                        </div>

                        {/* Pulse Indicator */}
                        <div className="shrink-0">
                          <span className="text-[9px] sm:text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-200/90 border border-emerald-950 text-emerald-950 flex items-center gap-1.5 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>🟢 ACTIVE ASSET</span>
                          </span>
                        </div>
                      </div>

                      {/* Cashflow & Lifetime Stats Strip */}
                      <div className="grid grid-cols-2 gap-2 bg-white border-2 border-emerald-900 p-2 sm:p-2.5 text-xs font-mono">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                            Net Cash Flow
                          </span>
                          <span className="text-sm sm:text-base font-black text-emerald-700 block">
                            +{formatINR(netInflow)}/mo
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                            Lifetime Generated
                          </span>
                          <span className="text-sm sm:text-base font-black text-slate-900 block">
                            +{formatINR(goal.lifetimeEarnings || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Operational Details Breakdown */}
                      <div className="text-[10px] sm:text-[11px] font-mono space-y-1 bg-emerald-100/60 p-2 border border-emerald-800/40">
                        {isRental && (
                          <div className="space-y-0.5 text-emerald-950">
                            <div className="flex justify-between">
                              <span>Tenant Rent Inflow:</span>
                              <strong className="text-emerald-800">+{formatINR(netInflow)}/mo</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Property Equity Valuation:</span>
                              <strong>{formatINR(goal.currentAmount || 5000000)}</strong>
                            </div>
                          </div>
                        )}
                        {isFranchise && (
                          <div className="space-y-0.5 text-emerald-950">
                            <div className="flex justify-between">
                              <span>Gross Monthly Profit:</span>
                              <strong>+₹45,000/mo</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Manager Operational Cost:</span>
                              <span className="text-rose-700">-₹15,000/mo</span>
                            </div>
                          </div>
                        )}
                        {isSideHustle && (
                          <div className="flex justify-between text-emerald-950">
                            <span>Dynamic Market Variance:</span>
                            <span>±15% demand fluctuation</span>
                          </div>
                        )}
                      </div>

                      {/* Reinvest / Scale Up Button */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        {goal.isScaledUp ? (
                          <span className="text-[10px] font-mono font-bold text-purple-900 bg-purple-100 px-2 py-1 border border-purple-900 inline-block">
                            ⚡ Scaled Up (+30% Yield Boost Active)
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => scaleVenture(goal.id)}
                            disabled={!canScale}
                            className={`w-full py-1.5 px-3 text-[10px] sm:text-xs font-mono font-bold uppercase border border-slate-900 text-center transition-all ${
                              canScale
                                ? 'bg-purple-600 hover:bg-purple-700 text-white btn-press shadow-[2px_2px_0px_#0f172a]'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            ⚡ Reinvest & Scale Up (+30% Yield) · {formatINR(goal.scaleUpCost || 100000)}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                // ─── INCUBATING VENTURE CARD ───
                if (goal.category === 'venture' && !goal.isLaunched) {
                  const isReadyToLaunch = (goal.currentAmount || 0) >= (goal.targetAmount || 1);

                  return (
                    <div
                      key={goal.id}
                      className={`card-neopop-sm p-3 sm:p-4 space-y-2 sm:space-y-3 bg-white border-2 ${
                        isReadyToLaunch ? 'border-emerald-600 shadow-[3px_3px_0px_#059669]' : 'border-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <ProgressRing percent={pct} size={38} stroke={3} color={ringColor} />
                            <div className="absolute inset-0 flex items-center justify-center text-base sm:text-lg">
                              {goal.icon}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-display font-black text-xs sm:text-sm text-slate-900 truncate">
                              {goal.name}
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-mono font-bold text-purple-700 truncate">
                              {goal.projectedNetMonthly || 'Generates Recurring Cash Flow'}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isReadyToLaunch ? (
                            <button
                              type="button"
                              onClick={() => launchVenture(goal.id)}
                              className="text-[9px] sm:text-[10px] font-mono font-black px-2 py-0.5 bg-emerald-500 text-white border border-slate-900 animate-pulse uppercase tracking-wider btn-press"
                            >
                              🚀 LAUNCH NOW!
                            </button>
                          ) : (
                            <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-purple-100 border border-slate-900 text-purple-900">
                              🌱 INCUBATING ({pct}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount Progress Bar */}
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex justify-between text-[11px] sm:text-xs font-mono font-bold">
                          <span className="text-emerald-700">{formatINR(goal.currentAmount || 0)}</span>
                          <span className="text-slate-600">Target: {formatINR(target)}</span>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-slate-100 border border-slate-900 overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: ringColor }}
                          />
                        </div>
                      </div>

                      {/* Ready to launch button if funded */}
                      {isReadyToLaunch ? (
                        <button
                          type="button"
                          onClick={() => launchVenture(goal.id)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] btn-press text-center"
                        >
                          🚀 Launch Active Asset ({goal.projectedNetMonthly})
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 border-t border-slate-200 text-[10px] sm:text-xs font-mono gap-0.5 sm:gap-1">
                          <div className="text-slate-600 truncate">
                            SIP: <strong className="text-slate-900 font-bold">{formatINR(effectiveSIP)}</strong>
                            {bonusSIP > 0 && (
                              <span className="text-emerald-700 font-bold ml-1">(+{formatINR(bonusSIP)} ↪)</span>
                            )}
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-purple-700 font-bold">
                            Transitions to Cash-Flow Asset @ 100%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }

                // ─── STANDARD MILESTONE / RECURRING GOAL CARD ───

                return (
                  <div
                    key={goal.id}
                    className="card-neopop-sm p-3 sm:p-4 space-y-2 sm:space-y-3 bg-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <ProgressRing percent={pct} size={38} stroke={3} color={ringColor} />
                          <div className="absolute inset-0 flex items-center justify-center text-base sm:text-lg">
                            {goal.icon}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-display font-black text-xs sm:text-sm text-slate-900 truncate">{goal.name}</div>
                          <div className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 truncate">
                            {inst.name} · {(inst.annualRate * 100).toFixed(0)}% p.a.
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="shrink-0">
                        {goal.id === 'goal_emergency' && current >= target && (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-emerald-100 border border-slate-900 text-emerald-900 flex items-center gap-1">
                            <span>🟢</span> SHIELD INTACT (100%)
                          </span>
                        )}
                        {goal.id === 'goal_emergency' && current < target && (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-amber-100 border border-slate-900 text-amber-900 animate-pulse flex items-center gap-1">
                            <span>🟠</span> REFILL IN PROGRESS
                          </span>
                        )}
                        {goal.id !== 'goal_emergency' && current >= target && (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-emerald-100 border border-slate-900 text-emerald-900">
                            🏆 100% FUNDED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount Progress Bar */}
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="flex justify-between text-[11px] sm:text-xs font-mono font-bold">
                        <span className="text-emerald-700">{formatINR(current)}</span>
                        <span className="text-slate-600">
                          {goal.id === 'goal_emergency'
                            ? `Target: ${formatINR(target)} (6× outflows)`
                            : `${formatINR(target)} (${pct}%)`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 sm:h-2 bg-slate-100 border border-slate-900 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: ringColor }}
                        />
                      </div>
                    </div>

                    {/* SIP Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 border-t border-slate-200 text-[10px] sm:text-xs font-mono gap-0.5 sm:gap-1">
                      <div className="text-slate-600 truncate">
                        SIP: <strong className="text-slate-900 font-bold">{formatINR(effectiveSIP)}</strong>
                        {bonusSIP > 0 && (
                          <span className="text-emerald-700 font-bold ml-1">(+{formatINR(bonusSIP)} ↪)</span>
                        )}
                      </div>
                      {goal.redirectGoalId && (
                        <span className="text-[9px] sm:text-[10px] text-blue-700 font-bold truncate">
                          {current >= target ? `↪ ${goals.find(x => x.id === goal.redirectGoalId)?.name || 'Next Goal'}` : '↪ Redirection set'}
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
          <div className="card-neopop p-3.5 sm:p-5 space-y-4 bg-white">
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-3">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Current Career Profile
                </span>
                <h3 className="font-display font-black text-lg text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>{character.jobTitle}</span>
                  {character.employmentStatus === 'unemployed' ? (
                    <span className="px-2 py-0.5 bg-rose-100 border border-rose-900 text-rose-900 text-[10px] font-mono font-bold animate-pulse">
                      ⚠️ Laid Off (Month {character.unemploymentDurationMonths || 1})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-900 text-emerald-900 text-[10px] font-mono font-bold">
                      Tier {character.jobTier || 1} · Active
                    </span>
                  )}
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    pause();
                    setIsUpskillingModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]"
                >
                  🎓 Upskill Hub
                </button>
                <button
                  type="button"
                  onClick={() => {
                    pause();
                    setIsJobMarketModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]"
                >
                  💼 Job Market
                </button>
              </div>
            </div>

            {/* Experience Meter & Skill Rating Gauge Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Experience Meter */}
              <div className="p-3.5 bg-slate-50 border-2 border-slate-900 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Years of Experience</span>
                  <span className="text-sm font-black text-slate-900">
                    {character.yearsOfExperience || 0} Years
                  </span>
                </div>
                {/* Progress bar towards Senior (3y), Lead (6y), Principal (10y) */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-white border border-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, ((character.yearsOfExperience || 0) / 10) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 font-bold">
                    <span>Entry (0y)</span>
                    <span>Senior (3y)</span>
                    <span>Lead (6y)</span>
                    <span>Director (10y+)</span>
                  </div>
                </div>
              </div>

              {/* Skill Rating Gauge */}
              <div className="p-3.5 bg-slate-50 border-2 border-slate-900 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Skill Level Rating</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-slate-900">
                      {(character.skillLevel || 1.0).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500">/ 5.0</span>
                    <div className="flex text-amber-500 text-xs">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {(character.skillLevel || 1.0) >= star ? '★' : (character.skillLevel || 1.0) >= star - 0.5 ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                  <span className="px-1.5 py-0.5 bg-slate-900 text-white font-bold uppercase text-[9px]">
                    {(character.skillLevel || 1.0) >= 4.2
                      ? 'Tier 4: Principal / Director'
                      : (character.skillLevel || 1.0) >= 3.2
                      ? 'Tier 3: Lead / Manager'
                      : (character.skillLevel || 1.0) >= 2.0
                      ? 'Tier 2: Senior Specialist'
                      : 'Tier 1: Junior Specialist'}
                  </span>
                  <span className="text-purple-700 font-bold">
                    Boost via Courses ➔
                  </span>
                </div>
              </div>
            </div>

            {/* Active Course Banner */}
            {character.activeCourse ? (
              <div className="p-3.5 bg-purple-50 border-2 border-purple-900 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider">
                      Course In Progress
                    </span>
                    <h4 className="font-display font-black text-slate-900 text-sm pt-1">
                      {character.activeCourse.courseName}
                    </h4>
                    <div className="text-xs font-mono text-slate-600">
                      Month {character.activeCourse.monthsCompleted} of {character.activeCourse.totalDurationMonths} · Deduction:{' '}
                      <strong className="text-purple-900">{formatINR(character.activeCourse.monthlyFee)}/mo</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={dropActiveCourse}
                    className="px-2.5 py-1 text-[10px] font-mono font-bold text-rose-700 border border-rose-700 hover:bg-rose-100 btn-press-sm self-start sm:self-auto"
                  >
                    Drop Course
                  </button>
                </div>

                {/* Course progress */}
                <div className="space-y-0.5 pt-0.5">
                  <div className="w-full h-2 bg-white border border-purple-900 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (character.activeCourse.monthsCompleted / character.activeCourse.totalDurationMonths) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-purple-900 font-bold">
                    <span>
                      {Math.round((character.activeCourse.monthsCompleted / character.activeCourse.totalDurationMonths) * 100)}% Finished
                    </span>
                    <span>+{character.activeCourse.skillBoostReward} Skill Boost upon completion</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span className="text-slate-700 font-medium">
                    No active certification enrolled. Enroll in a course to boost your skill rating and unlock higher salary tiers.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    pause();
                    setIsUpskillingModalOpen(true);
                  }}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 border border-slate-900 font-bold text-[11px] btn-press-sm shrink-0"
                >
                  Browse Hub ➔
                </button>
              </div>
            )}

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs pt-1">
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  ['Status', character.employmentStatus === 'unemployed' ? `⚠️ Unemployed (Month ${character.unemploymentDurationMonths || 1})` : '✅ Active Employment'],
                  ['Current Role', character.jobTitle],
                  ['City & Tier', `${character.city} (${character.cityTier.toUpperCase()})`],
                  ['Field', character.careerField],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className="text-slate-900 font-bold capitalize truncate max-w-[180px] text-right">{val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  ['Gross CTC', formatINR(character.grossMonthlySalary), 'text-emerald-700 font-mono'],
                  ['Take-Home Pay', formatINR(character.monthlyTakeHome), 'text-emerald-700 font-mono'],
                  ['Course Outflow', character.activeCourse ? `${formatINR(character.activeCourse.monthlyFee)}/mo` : '₹0', 'text-purple-700 font-mono'],
                  ['Appraisal Cycle', '+5–7% Annual Hike', 'text-slate-800'],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className={`font-bold ${color}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab 3: Loans ─── */}
        {activeTab === 'loans' && (
          <div className="card-neopop p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-white">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">
              Active Debt & Liabilities
            </h3>
            {(!character.loans || character.loans.length === 0) ? (
              <p className="text-xs font-mono font-bold text-emerald-700">🎉 Congratulations! You are 100% debt-free!</p>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {character.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 sm:p-4 bg-slate-50 border-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs"
                  >
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{loan.name}</div>
                      <div className="text-slate-600 text-[11px] sm:text-xs">
                        Remaining: <strong className="text-slate-900 font-mono">{formatINR(loan.principalRemaining)}</strong> at {formatPercent(loan.interestRateAnnual)} p.a.
                      </div>
                      <div className="text-slate-500 font-mono text-[10px] sm:text-[11px]">
                        EMI: {formatINR(loan.emi)}/mo · {loan.tenureMonthsRemaining} mos left
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => prepayLoan(loan.id, 25000)}
                      disabled={character.liquidCash < 25000}
                      className={`w-full sm:w-auto px-4 py-2 text-xs font-mono font-bold uppercase btn-press-sm transition-all shrink-0 text-center ${
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
          <div className="card-neopop p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-white">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">
              Risk Protection Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {[insurance.health, insurance.termLife].map((ins) => (
                <div key={ins.name} className="p-3 sm:p-4 bg-slate-50 border-2 border-slate-900 space-y-1.5 sm:space-y-2 text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-slate-900 truncate">{ins.name}</span>
                    <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 border border-slate-900 shrink-0 ${
                      ins.isPurchased ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {ins.isPurchased ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] sm:text-xs leading-snug">{ins.description}</p>
                  <div className="text-slate-900 font-mono font-bold pt-1 text-[11px] sm:text-xs">
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
      {simulation.activeModal?.type === 'shock_event' && (
        <ShockModal
          data={simulation.activeModal}
          onReviewAllocations={() => setIsAdjustingAllocations(true)}
        />
      )}
      {simulation.activeModal?.type === 'job_offer' && (
        <OfferLetterModal
          offer={simulation.activeModal.offer}
          onAdjustAllocations={() => setIsAdjustingAllocations(true)}
        />
      )}
      {simulation.activeModal?.type === 'course_completed' && (
        <CourseCompletedModal data={simulation.activeModal} />
      )}
      {simulation.activeModal?.type === 'launch_venture' && (
        <LaunchVentureModal
          goal={simulation.activeModal.goal}
          onAdjustAllocations={() => setIsAdjustingAllocations(true)}
        />
      )}

      {/* ─── Upskilling & Job Market Hub Modals ─── */}
      {isUpskillingModalOpen && (
        <UpskillingModal onClose={() => setIsUpskillingModalOpen(false)} />
      )}
      {isJobMarketModalOpen && (
        <JobMarketModal onClose={() => setIsJobMarketModalOpen(false)} />
      )}
      {isVentureModalOpen && (
        <VentureIncubatorModal onClose={() => setIsVentureModalOpen(false)} />
      )}

      {/* ─── Allocation Adjustment Modal ─── */}
      {isAdjustingAllocations && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto card-neopop bg-white overflow-x-hidden">
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

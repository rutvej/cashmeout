import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useGameStore } from '../../engine/store.js';
import {
  INSTRUMENTS,
  calculateProjectedFV,
  evaluateGoalFeasibility,
} from '../../engine/compoundingEngine.js';
import { formatINR } from '../../utils/format.js';
import {
  pageTransition,
  fadeInUp,
  springPress,
  hardPress,
} from '../../utils/motion.js';

export default function FinancialSetupScreen({ isModal = false, onClose }) {
  const {
    character,
    goals,
    insurance,
    simulation,
    toggleInsurance,
    setGoalAllocation,
    setAllocationMode,
    addCustomGoal,
    navigateTo,
    play,
    closeModal,
  } = useGameStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [skippedGoals, setSkippedGoals] = useState(new Set());
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('2500000');
  const [newGoalInstrument, setNewGoalInstrument] = useState('equity');

  if (!character || !goals.length) {
    return (
      <div className="min-h-screen bg-surface-0 text-slate-900 flex flex-col items-center justify-center p-6">
        <p className="text-slate-600 mb-4 font-body font-bold">No character loaded.</p>
        <button
          onClick={() => navigateTo('landing')}
          className="px-6 py-3 bg-slate-900 text-white font-bold btn-press"
        >
          Return to Start
        </button>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, Math.max(0, goals.length - 1));
  const currentGoal = goals[safeIndex];

  // Insurance premiums
  const healthPremium = insurance.health.isPurchased ? insurance.health.monthlyPremium : 0;
  const termPremium = insurance.termLife.isPurchased ? insurance.termLife.monthlyPremium : 0;
  const totalInsurancePremiums = healthPremium + termPremium;

  // Monthly Surplus & Allocations
  // In mid-game, simulationEngine already accounts for insurance in character.monthlySurplus.
  // In Month 0 setup, we deduct purchased insurance to get the true investable surplus:
  const isMidGame = (simulation.currentMonthIndex || 0) > 0;
  const investableSurplus = isMidGame
    ? character.monthlySurplus
    : Math.max(0, character.monthlySurplus - totalInsurancePremiums);

  const totalAllocated = useMemo(() => {
    return goals.reduce((sum, g) => {
      if (skippedGoals.has(g.id)) return sum;
      if (g.isLaunched) return sum;
      return sum + (g.baseMonthlySIP || 0);
    }, 0);
  }, [goals, skippedGoals]);

  const remainingSurplus = investableSurplus - totalAllocated;
  const totalAllocatedPercent = investableSurplus > 0 ? Math.round((totalAllocated / investableSurplus) * 100) : 0;
  // Over-allocated only if strictly exceeding by more than rounding epsilon
  const isOverAllocated = remainingSurplus < -5 && totalAllocatedPercent > 100;
  const unallocatedSurplus = Math.max(0, remainingSurplus);
  const unallocatedPercent = investableSurplus > 0 ? Math.max(0, 100 - totalAllocatedPercent) : 0;
  const isBalanced = !isOverAllocated && (Math.abs(remainingSurplus) <= 5 || totalAllocatedPercent === 100);
  const isUnderAllocated = remainingSurplus > 5 && totalAllocatedPercent < 100;

  // Handlers
  const handleNext = () => {
    if (safeIndex < goals.length - 1) setCurrentIndex(safeIndex + 1);
  };

  const handlePrev = () => {
    if (safeIndex > 0) setCurrentIndex(safeIndex - 1);
  };

  const handleSkip = () => {
    if (!currentGoal) return;
    setGoalAllocation(currentGoal.id, { baseMonthlySIP: 0, allocationPercent: 0 });
    setSkippedGoals(new Set([...skippedGoals, currentGoal.id]));
    handleNext();
  };

  const handleModeChange = (mode) => {
    if (!currentGoal) return;
    setAllocationMode(currentGoal.id, mode);
  };

  const handleSIPChange = (val) => {
    const num = Math.max(0, Math.round(Number(val) || 0));
    const otherGoalsSIP = goals.reduce(
      (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.baseMonthlySIP || 0)),
      0
    );
    const otherGoalsPct = goals.reduce(
      (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.allocationPercent || 0)),
      0
    );

    let percent = 0;
    if (num > 0 && investableSurplus > 0) {
      if (num + otherGoalsSIP === investableSurplus) {
        percent = Math.max(0, 100 - otherGoalsPct);
      } else {
        percent = Math.round((num / investableSurplus) * 100);
      }
    }

    setGoalAllocation(currentGoal.id, {
      baseMonthlySIP: num,
      allocationPercent: percent,
    });
    if (skippedGoals.has(currentGoal.id)) {
      const nextSkipped = new Set(skippedGoals);
      nextSkipped.delete(currentGoal.id);
      setSkippedGoals(nextSkipped);
    }
  };

  const handlePercentChange = (val) => {
    const pct = Math.min(100, Math.max(0, Math.round(Number(val) || 0)));
    const otherGoalsPct = goals.reduce(
      (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.allocationPercent || 0)),
      0
    );
    const otherGoalsSIP = goals.reduce(
      (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.baseMonthlySIP || 0)),
      0
    );

    let sip = 0;
    if (pct > 0 && investableSurplus > 0) {
      if (pct + otherGoalsPct === 100) {
        // Exact balancing to ensure 0-rupee discrepancy at 100%
        sip = Math.max(0, investableSurplus - otherGoalsSIP);
      } else {
        sip = Math.round((pct / 100) * investableSurplus);
      }
    }

    setGoalAllocation(currentGoal.id, {
      allocationPercent: pct,
      baseMonthlySIP: sip,
    });
    if (skippedGoals.has(currentGoal.id)) {
      const nextSkipped = new Set(skippedGoals);
      nextSkipped.delete(currentGoal.id);
      setSkippedGoals(nextSkipped);
    }
  };

  const handlePreset = (delta) => {
    const current = currentGoal.baseMonthlySIP || 0;
    handleSIPChange(current + delta);
  };

  const handleFillRemaining = () => {
    if ((currentGoal?.allocationMode || 'fixed') === 'percentage') {
      const otherGoalsPct = goals.reduce(
        (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.allocationPercent || 0)),
        0
      );
      const remainingPct = Math.max(0, 100 - otherGoalsPct);
      const otherGoalsSIP = goals.reduce(
        (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.baseMonthlySIP || 0)),
        0
      );
      const remainingSIP = Math.max(0, investableSurplus - otherGoalsSIP);
      setGoalAllocation(currentGoal.id, {
        allocationPercent: remainingPct,
        baseMonthlySIP: remainingSIP,
      });
    } else {
      const current = currentGoal.baseMonthlySIP || 0;
      const maxAvailable = current + Math.max(0, remainingSurplus);
      handleSIPChange(maxAvailable);
    }
    if (skippedGoals.has(currentGoal.id)) {
      const nextSkipped = new Set(skippedGoals);
      nextSkipped.delete(currentGoal.id);
      setSkippedGoals(nextSkipped);
    }
  };

  const handleCreateCustomGoal = () => {
    if (!newGoalName.trim()) return;
    const goalId = addCustomGoal({
      name: newGoalName.trim(),
      targetAmount: Number(newGoalTarget) || 2500000,
      instrumentId: newGoalInstrument,
      icon: '💎',
    });
    setShowAddGoalModal(false);
    setNewGoalName('');
    setCurrentIndex(goals.length); // focus on newly added goal
  };

  const handleStartGame = () => {
    if (isOverAllocated) return;
    closeModal();
    if (isModal && onClose) {
      onClose();
    } else {
      navigateTo('main_game');
    }
    play();
  };

  // Projection math for active goal
  const currentInst = INSTRUMENTS[currentGoal?.instrumentId || 'savings'] || INSTRUMENTS.savings;
  const currentMode = currentGoal?.allocationMode || 'fixed';
  const currentSIP = currentGoal?.baseMonthlySIP || 0;
  const currentPercent = currentGoal?.allocationPercent ?? (investableSurplus > 0 ? Math.round((currentSIP / investableSurplus) * 100) : 0);
  const currentAmount = currentGoal?.currentAmount || 0;
  const targetAmount = currentGoal?.targetAmount || 1;
  const monthsAway = currentGoal?.targetMonthsRemaining || (currentGoal?.recurrenceIntervalMonths || 12);
  const targetAge = currentGoal?.targetAge || (simulation.currentAge + Math.ceil(monthsAway / 12));
  const isEmergency = currentGoal?.id === 'goal_emergency';
  const isGoalFull = currentAmount >= targetAmount;

  // Recommended monthly SIP to achieve target by deadline based on compounding math
  const recommendedSIP = useMemo(() => {
    if (!currentGoal) return 0;
    const r = (currentInst?.annualRate || 0.04) / 12;
    const n = Math.max(1, monthsAway);
    const pv = currentAmount || 0;
    const fv = targetAmount || 0;
    if (r <= 0) {
      return Math.round((Math.max(0, fv - pv) / n) / 500) * 500;
    }
    const compoundPV = pv * Math.pow(1 + r, n);
    const netNeeded = Math.max(0, fv - compoundPV);
    const pmt = netNeeded * (r / (Math.pow(1 + r, n) - 1));
    return Math.max(500, Math.round(pmt / 500) * 500);
  }, [currentGoal, currentInst, monthsAway, currentAmount, targetAmount]);

  const feasibility = evaluateGoalFeasibility(currentGoal, currentSIP, currentInst.id);

  // Dynamic 6-month buffer for emergency fund
  const sixMonthLivingBuffer = (character.totalFixedExpenses + (character.totalLoanEMIs || 0)) * 6;

  // Chart dataset
  const chartData = useMemo(() => {
    if (!currentGoal) return [];
    const data = [];
    const steps = Math.min(24, Math.max(6, monthsAway));
    const stepMonths = Math.max(1, Math.round(monthsAway / steps));

    for (let m = 0; m <= monthsAway; m += stepMonths) {
      const fv = calculateProjectedFV(currentAmount, currentSIP, currentInst.annualRate, m);
      data.push({
        month: m,
        monthLabel: m === 0 ? 'Now' : `M${m}`,
        projected: fv,
        target: targetAmount,
      });
    }

    if (data[data.length - 1].month !== monthsAway) {
      data.push({
        month: monthsAway,
        monthLabel: `M${monthsAway}`,
        projected: calculateProjectedFV(currentAmount, currentSIP, currentInst.annualRate, monthsAway),
        target: targetAmount,
      });
    }
    return data;
  }, [currentGoal, currentAmount, currentSIP, currentInst, monthsAway, targetAmount]);

  const chartColor =
    feasibility.status === 'on_track'
      ? '#059669'
      : feasibility.status === 'borderline'
      ? '#D97706'
      : '#DC2626';

  return (
    <div className={`min-h-screen bg-mesh-light text-slate-900 flex flex-col font-sans overflow-x-hidden ${isModal ? 'p-1 sm:p-2 min-h-0' : ''}`}>
      
      {/* ─── Persistent Top Bar ─── */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b-2 border-slate-900 z-40 p-2.5 sm:p-4 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
          
          {/* Top Row: Back to dashboard / Context */}
          {(isMidGame || isModal) && (
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  if (isModal && onClose) onClose();
                  else navigateTo('main_game');
                }}
                className="text-xs font-bold font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
              <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-300 px-2 py-0.5">
                Age {simulation.currentAge} · Month {simulation.currentMonthIndex}
              </span>
            </div>
          )}

          {/* Emergency Redesign Warning (if emergency fund low) */}
          {goals.find((g) => g.id === 'goal_emergency' && (g.currentAmount || 0) < (g.targetAmount || 1)) && (
            <div className="p-2 sm:p-2.5 bg-amber-50 border-2 border-amber-600 flex items-start gap-2 text-xs">
              <span className="text-base">⚠️</span>
              <div className="flex-1">
                <span className="font-bold text-amber-900 block">Emergency Safety Buffer Needs Refill!</span>
                <span className="text-[11px] text-amber-800">
                  Allocate surplus to your Emergency Fund to restore your 6-month safety buffer.
                </span>
              </div>
            </div>
          )}

          {/* Surplus Ledger Row */}
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Monthly Surplus
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black text-slate-900">
                {formatINR(investableSurplus)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Allocated
              </span>
              <span className={`text-xs sm:text-base font-mono font-black ${isOverAllocated ? 'text-rose-600' : 'text-emerald-700'}`}>
                {formatINR(totalAllocated)} / {formatINR(investableSurplus)}
              </span>
            </div>
          </div>

          {/* Allocation Progress Bar & Dynamic Status Banner */}
          <div className="space-y-1.5">
            <div
              className={`w-full h-2.5 sm:h-3 border-2 overflow-hidden relative transition-colors ${
                isOverAllocated
                  ? 'bg-rose-100 border-rose-600'
                  : isBalanced
                  ? 'bg-emerald-100 border-emerald-600'
                  : 'bg-amber-100 border-amber-500'
              }`}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  isOverAllocated
                    ? 'bg-rose-500'
                    : isBalanced
                    ? 'bg-emerald-500'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (totalAllocated / (investableSurplus || 1)) * 100)}%` }}
              />
            </div>

            {/* Dynamic Status Banner */}
            {isOverAllocated && (
              <div className="p-2 bg-rose-50 border-2 border-rose-600 text-rose-900 text-xs font-mono font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🔴</span>
                  <span>Over-Allocated (+{formatINR(Math.abs(remainingSurplus))}/mo · {totalAllocatedPercent - 100}%)</span>
                </span>
                <span className="text-[10px] text-rose-700 uppercase">Rebalance to start</span>
              </div>
            )}
            {isBalanced && (
              <div className="p-1.5 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 text-xs font-mono font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🟢</span>
                  <span>100% Allocated (Balanced)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700">100% of surplus deployed</span>
              </div>
            )}
            {isUnderAllocated && (
              <div className="p-1.5 bg-amber-50 border-2 border-amber-600 text-amber-900 text-xs font-mono font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🟡</span>
                  <span>{unallocatedPercent}% ({formatINR(unallocatedSurplus)}/mo) flowing to Bank Cash</span>
                </span>
                <span className="text-[10px] font-mono text-amber-700">Liquid buffer</span>
              </div>
            )}
          </div>

          {/* Goal Stepper Indicator Dots & New Goal Action */}
          <div className="flex justify-between items-center pt-0.5">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-1 overflow-x-auto py-1 no-scrollbar">
              {goals.map((g, idx) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 transition-all duration-200 border border-slate-900 shrink-0 ${
                    idx === safeIndex
                      ? 'w-6 sm:w-7 bg-blue-600'
                      : skippedGoals.has(g.id)
                      ? 'w-2 sm:w-2.5 bg-slate-300'
                      : (g.baseMonthlySIP || 0) > 0
                      ? 'w-2 sm:w-2.5 bg-emerald-500'
                      : 'w-2 sm:w-2.5 bg-white'
                  }`}
                  title={g.name}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddGoalModal(true)}
              className="text-[10px] sm:text-[11px] font-bold font-mono px-2.5 sm:px-3 py-1 bg-white border-2 border-slate-900 btn-press-sm hover:bg-slate-50 shrink-0 ml-2"
            >
              + New Goal
            </button>
          </div>

        </div>
      </div>

      {/* ─── Insurance Protection Quick Bar ─── */}
      <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 pt-2.5 sm:pt-4">
        <div className="card-neopop-sm p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 bg-blue-50/50">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">🛡️</span>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Health Cover Protection</span>
              <span className="text-[10px] sm:text-[11px] text-slate-600">Shields emergency fund against medical wipes</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleInsurance('health')}
            className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-slate-900 transition-colors btn-press-sm ${
              insurance.health.isPurchased
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {insurance.health.isPurchased ? '✓ ACTIVE (₹800/mo)' : '+ BUY COVER (₹800/mo)'}
          </button>
        </div>
      </div>

      {/* ─── Main Goal Allocation Card Carousel ─── */}
      <div className={`flex-1 max-w-2xl mx-auto w-full p-2.5 sm:p-4 ${isModal ? 'pb-4' : 'pb-28 sm:pb-36'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGoal.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="card-neopop p-3.5 sm:p-6 space-y-3.5 sm:space-y-5"
          >
            {/* Goal Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-3 sm:pb-4 gap-2 sm:gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl shrink-0">{currentGoal.icon}</span>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 truncate">{currentGoal.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-900 uppercase">
                    {currentGoal.isMandatory ? 'CORE MANDATORY' : currentGoal.kind === 'recurring' ? 'ANNUAL CYCLE' : 'LIFE MILESTONE'}
                  </span>
                  {currentGoal.isRefillPriority && (
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-200 border border-slate-900 uppercase">
                      ⚡ PRIORITY RECALL
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowHintModal(true)}
                    className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-slate-900 flex items-center gap-1 btn-press-sm cursor-pointer shadow-hard-xs transition-colors"
                  >
                    <span>💡</span>
                    <span>Strategy Hint</span>
                  </button>
                </div>
              </div>

              <div className="flex sm:flex-col justify-between sm:justify-start items-center sm:items-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  {isEmergency ? '6-Mo Safety Buffer' : 'Target Corpus'}
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-slate-900">
                  {formatINR(targetAmount)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-600 block">
                  {currentGoal.targetAge ? `By Age ${currentGoal.targetAge} (${monthsAway} mos)` : `${monthsAway} mos`}
                </span>
              </div>
            </div>

            {/* Active Launched Asset Banner */}
            {currentGoal?.isLaunched && (
              <div className="p-3 sm:p-3.5 bg-emerald-100 border-2 border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Active Cash Flow Asset (Launched)</span>
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    This venture is operational and delivers monthly recurring cash flow directly to your surplus. No monthly SIP required.
                  </p>
                </div>
              </div>
            )}

            {/* Goal 100% Full Banner with 1-Click Redirect */}
            {isGoalFull && !currentGoal?.isLaunched && (
              <div className="p-3 sm:p-3.5 bg-emerald-50 border-2 border-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                    <span>✓</span>
                    <span>{isEmergency ? 'Emergency Fund 100% Buffered!' : 'Target Fully Achieved (100%)!'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Saved: <strong>{formatINR(currentAmount)}</strong>. Free up your surplus or redirect to downstream goals!
                  </p>
                </div>
                {currentSIP > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSIPChange(0)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs border-2 border-slate-900 btn-press-sm shrink-0"
                  >
                    Set ₹0 (Redirect)
                  </button>
                )}
              </div>
            )}

            {/* Emergency Fund Benchmark Note */}
            {isEmergency && (
              <div className="p-2.5 sm:p-3 bg-blue-50 border-2 border-blue-600 text-xs space-y-1">
                <div className="flex justify-between items-center text-blue-950 font-bold">
                  <span>🛡️ 6-Month Living Expense Shield</span>
                  <span className="font-mono">{formatINR(sixMonthLivingBuffer)}</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-snug">
                  Covers housing, food, utilities & debt EMIs ({formatINR(character.totalFixedExpenses + (character.totalLoanEMIs || 0))}/mo × 6).
                </p>
                {currentAmount < targetAmount && (
                  <p className="text-[11px] font-bold text-amber-800 pt-0.5">
                    ⚠️ Current buffer: {formatINR(currentAmount)} ({Math.round((currentAmount / targetAmount) * 100)}%). Needs {formatINR(targetAmount - currentAmount)} to reach 100% security.
                  </p>
                )}
              </div>
            )}

            {/* Monthly SIP Input with Dual Mode Pill Toggle */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
                  Monthly Allocation
                </label>

                {/* Dual Allocation Mode Pill Toggle */}
                <div className="inline-flex bg-slate-100 border-2 border-slate-900 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleModeChange('fixed')}
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold transition-all ${
                      currentMode === 'fixed'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ₹ Amount
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('percentage')}
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold transition-all ${
                      currentMode === 'percentage'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    % Percentage
                  </button>
                </div>
              </div>

              {currentMode === 'fixed' ? (
                /* ── Fixed Rupee Mode ── */
                <div className="space-y-1.5">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg sm:text-xl font-black">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={currentSIP || ''}
                        onChange={(e) => handleSIPChange(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border-2 border-slate-900 py-2 sm:py-3 pl-8 sm:pl-10 pr-3 sm:pr-4 font-mono font-black text-slate-900 text-xl sm:text-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Sync footnote */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-0.5">
                    <span>≈ {currentPercent}% of monthly surplus</span>
                    <span>Step: ₹500</span>
                  </div>

                  {/* Quick Presets Row */}
                  <div className="grid grid-cols-4 sm:flex gap-1.5 pt-0.5">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePreset(amt)}
                        className="py-1.5 sm:py-2 px-1.5 sm:px-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm transition-colors text-slate-900 text-center"
                      >
                        +₹{amt}
                      </button>
                    ))}
                    {remainingSurplus > 0 && (
                      <button
                        type="button"
                        onClick={handleFillRemaining}
                        className="col-span-4 sm:col-auto py-1.5 sm:py-2 px-3 bg-emerald-100 hover:bg-emerald-200 border-2 border-slate-900 font-mono text-xs font-bold text-emerald-900 btn-press-sm transition-colors text-center"
                      >
                        Fill (+{formatINR(remainingSurplus)})
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* ── Percentage Mode ── */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative w-28 sm:w-36 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={currentPercent || ''}
                        onChange={(e) => handlePercentChange(e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border-2 border-slate-900 py-2 sm:py-2.5 pl-3 pr-7 font-mono font-black text-slate-900 text-xl sm:text-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base sm:text-lg font-black">
                        %
                      </span>
                    </div>

                    {/* Calculated ₹ Live Feedback Box */}
                    <div className="flex-1 bg-slate-100 p-2 sm:p-2.5 border-2 border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-600">Calculated SIP:</span>
                      <span className="font-mono font-black text-base sm:text-xl text-emerald-700">
                        {formatINR(currentSIP)}/mo
                      </span>
                    </div>
                  </div>

                  {/* Percentage Slider */}
                  <div className="space-y-1 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={currentPercent || 0}
                      onChange={(e) => handlePercentChange(e.target.value)}
                      className="w-full accent-blue-600 h-2 bg-slate-200 border border-slate-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Quick % Presets */}
                  <div className="grid grid-cols-4 sm:flex gap-1.5 pt-0.5">
                    {[5, 10, 20, 25, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePercentChange(pct)}
                        className={`py-1.5 sm:py-2 px-1.5 sm:px-2 border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm transition-colors text-center ${
                          currentPercent === pct
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    {remainingSurplus > 0 && (
                      <button
                        type="button"
                        onClick={handleFillRemaining}
                        className="col-span-4 sm:col-auto py-1.5 sm:py-2 px-3 bg-emerald-100 hover:bg-emerald-200 border-2 border-slate-900 font-mono text-xs font-bold text-emerald-900 btn-press-sm transition-colors text-center"
                      >
                        Fill Remaining %
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isOverAllocated && (
                <p className="text-xs font-bold text-rose-600 pt-1">
                  ⚠️ Total allocations exceed monthly surplus by {formatINR(Math.abs(remainingSurplus))}!
                </p>
              )}
            </div>

            {/* Investment Vehicle Selector */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
                Select Investment Vehicle
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {Object.values(INSTRUMENTS).map((inst) => {
                  const isSelected = (currentGoal.instrumentId || 'savings') === inst.id;
                  return (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => setGoalAllocation(currentGoal.id, { instrumentId: inst.id })}
                      className={`p-2.5 sm:p-3 border-2 text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-slate-900 shadow-hard-sm'
                          : 'bg-white text-slate-900 border-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs truncate">{inst.name}</div>
                        <div className={`text-[9px] sm:text-[10px] mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {inst.tag}
                        </div>
                      </div>
                      <div className={`text-xs font-mono font-black mt-1.5 sm:mt-2 ${isSelected ? 'text-emerald-200' : 'text-emerald-700'}`}>
                        {(inst.annualRate * 100).toFixed(1)}% p.a.
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Projection AreaChart */}
            <div className="bg-slate-50 border-2 border-slate-900 p-3 sm:p-4 space-y-2 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700 text-[10px] uppercase tracking-wider">
                  Compounding Growth Curve
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-600">
                  Target: {formatINR(targetAmount)}
                </span>
              </div>

              <div className="h-28 sm:h-36 w-full pt-1 min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="goalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="monthLabel"
                      stroke="#475569"
                      fontSize={10}
                      fontFamily="JetBrains Mono"
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      fontFamily="JetBrains Mono"
                      tickLine={false}
                      tickFormatter={(val) =>
                        val >= 10000000
                          ? `₹${(val / 10000000).toFixed(1)}Cr`
                          : val >= 100000
                          ? `₹${(val / 100000).toFixed(0)}L`
                          : `₹${val}`
                      }
                    />
                    <ReferenceLine
                      y={targetAmount}
                      stroke="#0F172A"
                      strokeDasharray="4 4"
                      label={{
                        value: `Target ${formatINR(targetAmount)}`,
                        fill: '#0F172A',
                        fontSize: 9,
                        fontFamily: 'JetBrains Mono',
                        position: 'top',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stroke={chartColor}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#goalAreaGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Feasibility Signal Banner */}
              {currentSIP === 0 ? (
                <div className="p-2 sm:p-2.5 bg-slate-100 border-2 border-slate-900 text-slate-800 text-xs font-mono font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🌱</span>
                    <span>Phase-in Target — Unallocated yet. Tap presets or [Strategy Hint] for plan</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHintModal(true)}
                    className="text-[10px] text-blue-700 underline font-bold hover:text-blue-900"
                  >
                    View Strategy ➔
                  </button>
                </div>
              ) : (
                <div className={`p-2 sm:p-2.5 border-2 text-xs font-bold ${
                  feasibility.status === 'on_track'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                    : feasibility.status === 'borderline'
                    ? 'bg-amber-50 border-amber-600 text-amber-900'
                    : 'bg-rose-50 border-rose-600 text-rose-900'
                }`}>
                  {feasibility.status === 'on_track' && (
                    <span>🟢 On Track — projected to accumulate {formatINR(feasibility.projectedAmount)} by deadline!</span>
                  )}
                  {feasibility.status === 'borderline' && (
                    <span>🟡 Borderline — short by {formatINR(feasibility.shortfall)}. Consider increasing SIP.</span>
                  )}
                  {feasibility.status === 'underfunded' && (
                    <span>🔴 Underfunded — short by {formatINR(feasibility.shortfall)}. Scale up with future raises or waterfall!</span>
                  )}
                </div>
              )}
            </div>

            {/* Cascading Waterfall Redirection Selector (Fixed-₹) or Auto-Redistribution Info (Percentage-%) */}
            {currentMode === 'percentage' ? (
              <div className="p-3 sm:p-3.5 bg-blue-50 border-2 border-slate-900 flex items-start gap-2.5 text-xs">
                <span className="text-base sm:text-lg">⚡</span>
                <div className="space-y-0.5">
                  <span className="font-bold text-blue-950 font-mono block">
                    Percentage Mode: Proportional Auto-Redistribution
                  </span>
                  <p className="text-[10px] sm:text-[11px] text-blue-900 leading-snug">
                    When this goal hits 100% capacity, its freed {currentPercent}% allocation automatically scales up all remaining active goals proportionally based on their weights (waterfall cascade is inactive in % mode).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-3.5 bg-slate-100 border-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <span>↪️</span> When 100% Full, Redirect Fixed SIP to:
                  </span>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
                    {isEmergency
                      ? '⚡ Auto-recalls immediately if life emergency drains the safety buffer.'
                      : 'Fixed SIP auto-cascades downstream to next goal when milestone is met.'}
                  </p>
                </div>
                <select
                  value={currentGoal.redirectGoalId || 'none'}
                  onChange={(e) =>
                    setGoalAllocation(currentGoal.id, {
                      redirectGoalId: e.target.value === 'none' ? null : e.target.value,
                    })
                  }
                  className="bg-white border-2 border-slate-900 text-slate-900 text-xs font-mono px-2.5 py-1.5 outline-none font-bold w-full sm:w-auto max-w-full truncate"
                >
                  <option value="none">-- None (Keep in Bank Cash) --</option>
                  {goals
                    .filter((g) => g.id !== currentGoal.id)
                    .map((og) => (
                      <option key={og.id} value={og.id}>
                        {og.icon} {og.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Stepper Navigation Controls */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                disabled={safeIndex === 0}
                onClick={handlePrev}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-mono font-bold bg-white border-2 border-slate-900 disabled:opacity-40 btn-press-sm text-slate-900"
              >
                ← PREV GOAL
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-mono font-bold text-slate-600 hover:text-slate-900 underline uppercase"
              >
                Skip Goal
              </button>

              <button
                type="button"
                disabled={safeIndex === goals.length - 1}
                onClick={handleNext}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-mono font-bold bg-white border-2 border-slate-900 disabled:opacity-40 btn-press-sm text-slate-900"
              >
                NEXT GOAL →
              </button>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Bottom Action Bar ─── */}
      <div className={`${isModal ? 'sticky bottom-0 mt-3' : 'fixed bottom-0 left-0 right-0'} bg-white/95 backdrop-blur-md border-t-2 border-slate-900 p-3 sm:p-4 z-40`}>
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <div className="flex justify-between items-center px-1 text-[11px] sm:text-xs font-mono font-bold">
            <span className="text-slate-600">
              {goals.length - skippedGoals.size} Planned · {skippedGoals.size} Skipped
            </span>
            {remainingSurplus > 0 ? (
              <span className="text-emerald-700">
                + {formatINR(remainingSurplus)}/mo Free Buffer
              </span>
            ) : isOverAllocated ? (
              <span className="text-rose-600">
                - {formatINR(Math.abs(remainingSurplus))}/mo Over-Allocated!
              </span>
            ) : (
              <span className="text-blue-700">
                100% Fully Allocated
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOverAllocated}
            onClick={handleStartGame}
            className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 font-display font-black text-base sm:text-lg tracking-wider uppercase text-white btn-press transition-all ${
              isOverAllocated
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-hard'
            }`}
          >
            {isMidGame || isModal
              ? 'Save Allocations & Resume Simulation ▶'
              : 'START LIFE SIMULATION 🚀'}
          </button>
        </div>
      </div>

      {/* ─── Add Custom Goal Modal ─── */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-neopop max-w-md w-full p-6 space-y-4 bg-white">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
              <h3 className="font-display font-black text-xl text-slate-900">Add Custom Life Goal</h3>
              <button
                type="button"
                onClick={() => setShowAddGoalModal(false)}
                className="font-mono text-base font-bold text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-mono font-bold uppercase block text-slate-700 mb-1">
                  Goal Name:
                </label>
                <input
                  type="text"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="e.g. Wealth Multiplier, Early Retirement..."
                  className="w-full bg-white border-2 border-slate-900 px-3 py-2 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold uppercase block text-slate-700 mb-1">
                  Target Corpus (₹):
                </label>
                <input
                  type="number"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 px-3 py-2 text-sm font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold uppercase block text-slate-700 mb-1">
                  Investment Vehicle:
                </label>
                <select
                  value={newGoalInstrument}
                  onChange={(e) => setNewGoalInstrument(e.target.value)}
                  className="w-full bg-white border-2 border-slate-900 px-3 py-2 text-sm font-bold outline-none"
                >
                  <option value="equity">Equity Mutual Funds (~12% p.a.)</option>
                  <option value="gold">Gold / SGB (~8.5% p.a.)</option>
                  <option value="fd">Fixed Deposit (~7% p.a.)</option>
                  <option value="savings">Liquid Savings (~4% p.a.)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddGoalModal(false)}
                className="flex-1 py-2.5 bg-slate-100 border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomGoal}
                className="flex-1 py-2.5 bg-blue-600 text-white border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm"
              >
                Create Goal ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Goal Strategy & Educational Guidance Modal ─── */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="card-neopop max-w-lg w-full p-4 sm:p-6 space-y-4 bg-white text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentGoal?.icon}</span>
                <div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-slate-900">
                    {currentGoal?.name} — Strategy Hint
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Target: {formatINR(targetAmount)} ({monthsAway} months away)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHintModal(false)}
                className="font-mono text-lg font-black text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Recommended Target Pill */}
            <div className="p-3 bg-blue-50 border-2 border-blue-600 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-900 block">
                  Recommended Monthly SIP (On-Time Target)
                </span>
                <span className="font-mono font-black text-xl text-blue-950">
                  {formatINR(recommendedSIP)}/mo
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleSIPChange(recommendedSIP);
                  setShowHintModal(false);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs border-2 border-slate-900 btn-press-sm"
              >
                Apply Recommended ➔
              </button>
            </div>

            {/* Strategic Reassurance Section */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-mono font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                Why it's completely okay if you can't fund this full amount yet:
              </h4>

              <div className="p-2.5 bg-slate-50 border-2 border-slate-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>📈</span>
                  <span>1. Annual Salary Appraisals</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your salary grows with annual appraisals (5–7%+) every single year. When surplus expands, <strong>Auto-Split</strong> will scale up this goal's contributions automatically without you needing to do manual math.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border-2 border-slate-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>↪️</span>
                  <span>2. Cascading Waterfall & Auto-Redistribution</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Shorter-term goals (like your Emergency Fund or Vacation) finish early! When they hit 100%, their freed surplus automatically redirects or scales into your active remaining goals.
                </p>
              </div>

              <div className="p-2.5 bg-slate-50 border-2 border-slate-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>⏳</span>
                  <span>3. Long-Term Compounding</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  In {currentInst.name} (yielding {(currentInst.annualRate * 100).toFixed(1)}% p.a.), even small early contributions multiply exponentially as time progresses.
                </p>
              </div>

              {isEmergency && (
                <div className="p-2.5 bg-amber-50 border-2 border-amber-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <span>🛡️</span>
                    <span>Safety First Recommendation</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    We recommend funding your 6-month Emergency Safety buffer first so sudden medical emergencies or shocks don't derail your other life goals.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowHintModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white font-mono font-bold text-xs uppercase btn-press hover:bg-slate-800"
              >
                Got It, Let's Plan! ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

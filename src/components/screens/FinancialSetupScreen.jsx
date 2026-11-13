import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useGameStore } from '../../engine/store.js';
import {
  INSTRUMENTS,
  calculateProjectedFV,
  evaluateGoalFeasibility,
} from '../../engine/compoundingEngine.js';
import { getActiveAllocatableGoals } from '../../engine/goalsGenerator.js';
import { formatINR } from '../../utils/format.js';

export { getActiveAllocatableGoals };

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
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('2500000');
  const [newGoalInstrument, setNewGoalInstrument] = useState('equity');

  // Filter active allocatable goals
  const allocatableGoals = useMemo(() => getActiveAllocatableGoals(goals), [goals]);

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

  const safeIndex = Math.min(currentIndex, Math.max(0, allocatableGoals.length - 1));
  const currentGoal = allocatableGoals[safeIndex];

  // Insurance premiums
  const healthPremium = insurance.health.isPurchased ? insurance.health.monthlyPremium : 0;
  const termPremium = insurance.termLife.isPurchased ? insurance.termLife.monthlyPremium : 0;
  const totalInsurancePremiums = healthPremium + termPremium;

  // Monthly Surplus & Allocations
  const isMidGame = isModal || (simulation.currentMonthIndex || 0) > 0;
  const investableSurplus = isMidGame
    ? character.monthlySurplus
    : Math.max(0, character.monthlySurplus - totalInsurancePremiums);

  const totalAllocated = useMemo(() => {
    return allocatableGoals.reduce((sum, g) => {
      if (skippedGoals.has(g.id)) return sum;
      return sum + (g.baseMonthlySIP || 0);
    }, 0);
  }, [allocatableGoals, skippedGoals]);

  const remainingSurplus = investableSurplus - totalAllocated;
  const totalAllocatedPercent = investableSurplus > 0 ? Math.round((totalAllocated / investableSurplus) * 100) : 0;
  const isOverAllocated = remainingSurplus < -5 && totalAllocatedPercent > 100;
  const isBalanced = !isOverAllocated && (Math.abs(remainingSurplus) <= 5 || totalAllocatedPercent === 100);

  // Stepper & Nav Handlers
  const handleNext = () => {
    if (safeIndex < allocatableGoals.length - 1) setCurrentIndex(safeIndex + 1);
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
    if (!currentGoal) return;
    const num = Math.max(0, Math.round(Number(val) || 0));
    const otherGoalsSIP = allocatableGoals.reduce(
      (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.baseMonthlySIP || 0)),
      0
    );
    const otherGoalsPct = allocatableGoals.reduce(
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
    if (!currentGoal) return;
    const pct = Math.min(100, Math.max(0, Math.round(Number(val) || 0)));
    const otherGoalsPct = allocatableGoals.reduce(
      (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.allocationPercent || 0)),
      0
    );
    const otherGoalsSIP = allocatableGoals.reduce(
      (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.baseMonthlySIP || 0)),
      0
    );

    let sip = 0;
    if (pct > 0 && investableSurplus > 0) {
      if (pct + otherGoalsPct === 100) {
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
    if (!currentGoal) return;
    const current = currentGoal.baseMonthlySIP || 0;
    handleSIPChange(Math.max(0, current + delta));
  };

  const handleFillRemaining = () => {
    if (!currentGoal) return;
    if ((currentGoal.allocationMode || 'fixed') === 'percentage') {
      const otherGoalsPct = allocatableGoals.reduce(
        (sum, g) => (g.id === currentGoal.id || skippedGoals.has(g.id) ? sum : sum + (g.allocationPercent || 0)),
        0
      );
      const remainingPct = Math.max(0, 100 - otherGoalsPct);
      const otherGoalsSIP = allocatableGoals.reduce(
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
    addCustomGoal({
      name: newGoalName.trim(),
      targetAmount: Number(newGoalTarget) || 2500000,
      instrumentId: newGoalInstrument,
      icon: '💎',
    });
    setShowAddGoalModal(false);
    setNewGoalName('');
    setCurrentIndex(allocatableGoals.length);
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

  // Chart dataset for active goal
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
    <div className={`min-h-screen bg-mesh-light text-slate-900 flex flex-col font-sans overflow-x-hidden ${isModal ? 'p-1 min-h-0' : ''}`}>
      
      {/* ─── Persistent Top Bar ─── */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b-2 border-slate-900 z-40 p-2 sm:p-3 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-2">
          
          {/* Top Row: Back to dashboard / Context (midgame only) */}
          {(isMidGame || isModal) && (
            <div className="flex justify-between items-center pb-1 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  if (isModal && onClose) onClose();
                  else navigateTo('main_game');
                }}
                className="text-xs font-bold font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
              <span className="text-[10px] font-mono font-bold bg-slate-100 border border-slate-300 px-2 py-0.5">
                Age {simulation.currentAge} · Month {simulation.currentMonthIndex}
              </span>
            </div>
          )}

          {/* Minimal 3-Column Surplus Stats */}
          <div className="grid grid-cols-3 gap-2 text-center items-center">
            <div className="text-left">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Monthly Surplus
              </span>
              <span className="text-base sm:text-xl font-mono font-black text-slate-900 truncate block">
                {formatINR(investableSurplus)}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Allocated
              </span>
              <span className={`text-base sm:text-xl font-mono font-black truncate block ${isOverAllocated ? 'text-rose-600' : 'text-slate-900'}`}>
                {formatINR(totalAllocated)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Remaining
              </span>
              <span className={`text-base sm:text-xl font-mono font-black truncate block ${
                remainingSurplus > 0
                  ? 'text-emerald-700'
                  : isOverAllocated
                  ? 'text-rose-600'
                  : 'text-blue-700'
              }`}>
                {remainingSurplus < 0 ? `-${formatINR(Math.abs(remainingSurplus))}` : formatINR(remainingSurplus)}
              </span>
            </div>
          </div>

          {/* Single Slim Allocation Progress Bar */}
          <div className="space-y-1">
            <div
              className={`w-full h-2.5 border-2 overflow-hidden relative transition-colors ${
                isOverAllocated
                  ? 'bg-rose-100 border-rose-600'
                  : isBalanced
                  ? 'bg-emerald-100 border-emerald-600'
                  : 'bg-blue-100 border-slate-900'
              }`}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  isOverAllocated
                    ? 'bg-rose-500'
                    : isBalanced
                    ? 'bg-emerald-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, (totalAllocated / (investableSurplus || 1)) * 100)}%` }}
              />
            </div>

            {/* Compact 1-line Alert ONLY when strictly over-allocated */}
            {isOverAllocated && (
              <div className="py-1 px-2.5 bg-rose-50 border-2 border-rose-600 text-rose-900 text-xs font-mono font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>🔴</span>
                  <span>Over-Allocated by +{formatINR(Math.abs(remainingSurplus))}/mo</span>
                </span>
                <span className="text-[10px] text-rose-700 uppercase">Rebalance to proceed</span>
              </div>
            )}
          </div>

          {/* ─── Slidable Goal Chips Switcher Track ─── */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
            {allocatableGoals.map((g, idx) => {
              const isSelected = idx === safeIndex;
              const isSkipped = skippedGoals.has(g.id);
              const sip = g.baseMonthlySIP || 0;
              const hasSIP = sip > 0;

              const displayName = g.name
                .replace(/Buy First Car/i, 'Car')
                .replace(/Emergency Fund \(6 Months\)/i, 'Emergency')
                .replace(/Annual Vacation \/ Trip/i, 'Vacation')
                .replace(/Home Down Payment/i, 'Home')
                .replace(/Wedding & Celebration/i, 'Wedding')
                .replace(/Child Higher Education/i, 'Child Edu')
                .replace(/Retirement Corpus \(FI\/RE\)/i, 'Retirement');

              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold border-2 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : isSkipped
                      ? 'bg-slate-100 text-slate-400 border-slate-300'
                      : hasSIP
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span className="truncate max-w-[85px] sm:max-w-[120px]">{displayName}</span>
                  <span className={`text-[10px] font-mono ${
                    isSelected
                      ? 'text-blue-200'
                      : isSkipped
                      ? 'text-slate-400'
                      : hasSIP
                      ? 'text-emerald-700 font-black'
                      : 'text-slate-400'
                  }`}>
                    {isSkipped ? 'Skip' : hasSIP ? (sip >= 1000 ? `₹${(sip / 1000).toFixed(sip % 1000 === 0 ? 0 : 1)}k` : `₹${sip}`) : '₹0'}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowAddGoalModal(true)}
              className="px-2 py-1 text-xs font-mono font-bold border-2 border-dashed border-slate-400 text-slate-600 hover:text-slate-900 hover:border-slate-900 shrink-0 ml-1 transition-colors"
            >
              + Goal
            </button>
          </div>

        </div>
      </div>

      {/* ─── Insurance Protection Quick Bar (Compact 1-Liner, Month 0) ─── */}
      {!isMidGame && (
        <div className="max-w-2xl mx-auto w-full px-2.5 sm:px-4 pt-2">
          <div className="card-neopop-sm p-2 sm:p-2.5 flex items-center justify-between gap-2 bg-blue-50/60">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base sm:text-lg shrink-0">🛡️</span>
              <div className="truncate">
                <span className="font-bold text-xs text-slate-900 block truncate">Health Insurance Cover</span>
                <span className="text-[10px] text-slate-600 block truncate">Shields emergency fund against medical wipes</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleInsurance('health')}
              className={`px-2.5 py-1 text-xs font-mono font-bold border-2 border-slate-900 transition-colors btn-press-sm shrink-0 ${
                insurance.health.isPurchased
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {insurance.health.isPurchased ? '✓ ACTIVE (₹800/mo)' : '+ BUY (₹800/mo)'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Slidable Goal Card Carousel ─── */}
      <div className={`flex-1 max-w-2xl mx-auto w-full p-2.5 sm:p-4 ${isModal ? 'pb-4' : 'pb-20 sm:pb-24'}`}>
        {allocatableGoals.length === 0 ? (
          <div className="card-neopop p-6 text-center space-y-3 bg-white">
            <div className="text-4xl">🎉</div>
            <h3 className="font-display font-black text-xl text-slate-900">All Goals Achieved!</h3>
            <p className="text-xs text-slate-600 font-mono">
              All your life milestone goals have been successfully completed. 100% of your surplus cash flows directly into your bank cash reserves.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentGoal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, { offset, velocity }) => {
                const swipeThreshold = 50;
                if ((offset.x > swipeThreshold || velocity.x > 300) && safeIndex > 0) {
                  handlePrev();
                } else if ((offset.x < -swipeThreshold || velocity.x < -300) && safeIndex < allocatableGoals.length - 1) {
                  handleNext();
                }
              }}
              className="card-neopop p-3 sm:p-5 space-y-3 sm:space-y-4 touch-pan-y bg-white"
            >
              {/* Minimal Card Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-2.5 gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl shrink-0">{currentGoal.icon}</span>
                    <h2 className="font-display text-lg sm:text-xl font-black text-slate-900 truncate">
                      {currentGoal.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-900 uppercase">
                      {currentGoal.isMandatory ? 'CORE MANDATORY' : currentGoal.kind === 'recurring' ? 'ANNUAL CYCLE' : 'LIFE MILESTONE'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHintModal(true)}
                      className="text-[9px] font-mono font-bold px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-slate-900 flex items-center gap-1 btn-press-sm cursor-pointer transition-colors"
                    >
                      <span>💡</span>
                      <span>Strategy Hint</span>
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    Target
                  </span>
                  <span className="text-base sm:text-lg font-mono font-black text-slate-900">
                    {formatINR(targetAmount)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 block">
                    {currentGoal.targetAge ? `By Age ${currentGoal.targetAge} (${monthsAway}m)` : `${monthsAway} mos`}
                  </span>
                </div>
              </div>

              {/* Monthly Allocation Input with Steppers & Dual Mode */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
                    Monthly Allocation
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-900 underline uppercase"
                    >
                      Skip
                    </button>

                    {/* Dual Mode Pill Toggle */}
                    <div className="inline-flex bg-slate-100 border-2 border-slate-900 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleModeChange('fixed')}
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold transition-all ${
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
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold transition-all ${
                          currentMode === 'percentage'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        % Percentage
                      </button>
                    </div>
                  </div>
                </div>

                {currentMode === 'fixed' ? (
                  /* ── Clean Fixed Rupee Mode with Steppers ── */
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePreset(-1000)}
                        className="w-10 h-10 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 font-mono text-lg font-black btn-press-sm flex items-center justify-center shrink-0 cursor-pointer"
                        title="Decrease by ₹1,000"
                      >
                        −
                      </button>
                      <div className="relative flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-lg font-black pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="500"
                          min="0"
                          value={currentSIP || ''}
                          onChange={(e) => handleSIPChange(e.target.value)}
                          placeholder="0"
                          className="w-full bg-white border-2 border-slate-900 py-2 pl-8 pr-3 font-mono font-black text-slate-900 text-lg sm:text-xl outline-none focus:ring-2 focus:ring-blue-600 text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePreset(1000)}
                        className="w-10 h-10 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 font-mono text-lg font-black btn-press-sm flex items-center justify-center shrink-0 cursor-pointer"
                        title="Increase by ₹1,000"
                      >
                        +
                      </button>
                    </div>

                    {/* Fast Presets Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-mono text-slate-500 mr-0.5">Quick:</span>
                      {[1000, 2000, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handlePreset(amt)}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm transition-colors text-slate-900 cursor-pointer"
                        >
                          +₹{amt.toLocaleString('en-IN')}
                        </button>
                      ))}
                      {remainingSurplus > 0 && (
                        <button
                          type="button"
                          onClick={handleFillRemaining}
                          className="py-1 px-2.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-slate-900 font-mono text-xs font-bold text-emerald-950 btn-press-sm transition-colors cursor-pointer"
                        >
                          Fill Leftover {formatINR(remainingSurplus)}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── Percentage Mode ── */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative w-28 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={currentPercent || ''}
                          onChange={(e) => handlePercentChange(e.target.value)}
                          placeholder="0"
                          className="w-full bg-white border-2 border-slate-900 py-1.5 pl-3 pr-7 font-mono font-black text-slate-900 text-lg outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base font-black">
                          %
                        </span>
                      </div>

                      {/* Calculated ₹ Live Feedback Box */}
                      <div className="flex-1 bg-slate-100 px-3 py-1.5 border-2 border-slate-900 flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-600">Calculated SIP:</span>
                        <span className="font-mono font-black text-base text-emerald-700">
                          {formatINR(currentSIP)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Percentage Slider */}
                    <div className="space-y-0.5">
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
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[5, 10, 20, 25, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handlePercentChange(pct)}
                          className={`py-1 px-2.5 border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm transition-colors text-center ${
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
                          className="py-1 px-2.5 bg-emerald-100 hover:bg-emerald-200 border-2 border-slate-900 font-mono text-xs font-bold text-emerald-950 btn-press-sm transition-colors"
                        >
                          Fill Remaining %
                        </button>
                      )}
                    </div>

                    <div className="p-2 bg-blue-50/70 border-2 border-slate-900 text-[11px] text-blue-950 font-mono">
                      <strong>Percentage Mode: Proportional Auto-Redistribution</strong>
                      <p className="text-[10px] text-blue-800 mt-0.5">
                        When this goal completes, its {currentPercent}% allocation automatically scales up remaining active goals.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Compact 4-Pill Instrument Selector ─── */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Investment Instrument
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'savings', label: 'Liquid Savings', rate: '4%' },
                    { id: 'fd', label: 'Fixed Deposit', rate: '7%' },
                    { id: 'gold', label: 'Gold / SGB', rate: '8.5%' },
                    { id: 'equity', label: '★ Mutual Funds', rate: '12%' },
                  ].map((inst) => {
                    const isSelected = (currentGoal.instrumentId || 'savings') === inst.id;
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => setGoalAllocation(currentGoal.id, { instrumentId: inst.id })}
                        className={`py-1.5 px-2 border-2 text-center transition-all flex flex-col items-center justify-center rounded-sm cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-800 border-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-bold text-xs truncate max-w-full">{inst.label}</span>
                        <span className={`text-[10px] font-mono font-black ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          {inst.rate} p.a.
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── Clear & Concise Status Pill ─── */}
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Status:</span>
                <div
                  className={`px-2.5 py-0.5 border-2 font-mono text-[11px] font-bold inline-flex items-center gap-1.5 ${
                    currentSIP === 0
                      ? 'bg-slate-100 border-slate-400 text-slate-700'
                      : feasibility.status === 'on_track'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                      : feasibility.status === 'borderline'
                      ? 'bg-amber-50 border-amber-600 text-amber-900'
                      : 'bg-rose-50 border-rose-600 text-rose-900'
                  }`}
                >
                  {currentSIP === 0 ? (
                    <span>⚪ Unallocated (₹0/mo)</span>
                  ) : feasibility.status === 'on_track' ? (
                    <span>🟢 On Track (Projected {formatINR(feasibility.projectedAmount)})</span>
                  ) : feasibility.status === 'borderline' ? (
                    <span>🟡 Borderline (Short by {formatINR(feasibility.shortfall)})</span>
                  ) : (
                    <span>🔴 Underfunded (Short by {formatINR(feasibility.shortfall)})</span>
                  )}
                </div>
              </div>

              {/* ─── Collapsible Projection Chart ─── */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsChartOpen((prev) => !prev)}
                  className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-900 font-mono text-xs font-bold flex items-center justify-between btn-press-sm text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📈</span>
                    <span>{isChartOpen ? 'Hide Growth Chart' : 'View Growth Chart'}</span>
                  </span>
                  <span className="text-slate-500">{isChartOpen ? '▴' : '▾'}</span>
                </button>

                {isChartOpen && (
                  <div className="bg-slate-50 border-2 border-slate-900 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-600">
                      <span>COMPOUNDING PROJECTION</span>
                      <span>Target: {formatINR(targetAmount)}</span>
                    </div>
                    <div className="h-28 sm:h-32 w-full pt-1 min-w-0 overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="goalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="monthLabel"
                            stroke="#475569"
                            fontSize={9}
                            fontFamily="JetBrains Mono"
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#475569"
                            fontSize={9}
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
                              fontSize: 8,
                              fontFamily: 'JetBrains Mono',
                              position: 'top',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="projected"
                            stroke={chartColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#goalAreaGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Mode: Waterfall Redirection Target */}
              {currentMode === 'fixed' && (
                <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-600 truncate">
                    ↪️ On Completion Redirect To:
                  </span>
                  <select
                    value={currentGoal.redirectGoalId || 'none'}
                    onChange={(e) =>
                      setGoalAllocation(currentGoal.id, {
                        redirectGoalId: e.target.value === 'none' ? null : e.target.value,
                      })
                    }
                    className="bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-mono px-2 py-1 outline-none font-bold shrink-0 max-w-[200px] truncate"
                  >
                    <option value="none">-- None (Bank Cash) --</option>
                    {allocatableGoals
                      .filter((og) => og.id !== currentGoal.id)
                      .map((og) => (
                        <option key={og.id} value={og.id}>
                          {og.icon} {og.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ─── Bottom Navigation Bar ─── */}
      <div className={`${isModal ? 'sticky bottom-0 mt-2 bg-white' : 'fixed bottom-0 left-0 right-0 bg-white/95'} backdrop-blur-md border-t-2 border-slate-900 p-2.5 sm:p-3 z-40 shadow-lg`}>
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button
            type="button"
            disabled={safeIndex === 0}
            onClick={handlePrev}
            className="px-3 sm:px-4 py-2.5 text-xs font-mono font-bold bg-white border-2 border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed btn-press-sm text-slate-900 shrink-0"
          >
            ◄ PREV
          </button>

          <button
            type="button"
            disabled={safeIndex >= allocatableGoals.length - 1}
            onClick={handleNext}
            className="px-3 sm:px-4 py-2.5 text-xs font-mono font-bold bg-white border-2 border-slate-900 disabled:opacity-40 disabled:cursor-not-allowed btn-press-sm text-slate-900 shrink-0"
          >
            NEXT ►
          </button>

          <button
            type="button"
            disabled={isOverAllocated}
            onClick={handleStartGame}
            className={`flex-1 py-2.5 px-3 sm:px-4 font-display font-black text-xs sm:text-sm tracking-wider uppercase text-white btn-press transition-all truncate ${
              isOverAllocated
                ? 'bg-slate-400 cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-hard'
            }`}
          >
            {isMidGame || isModal
              ? 'Resume Simulation ▶'
              : 'START LIFE SIMULATION 🚀'}
          </button>
        </div>
      </div>

      {/* ─── Add Custom Goal Modal ─── */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-neopop max-w-md w-full p-5 space-y-4 bg-white">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
              <h3 className="font-display font-black text-lg text-slate-900">Add Custom Life Goal</h3>
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
                  placeholder="e.g. Master's Degree, Dream Studio..."
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
                  <option value="equity">★ Equity Mutual Funds (~12% p.a.)</option>
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
                className="flex-1 py-2 bg-slate-100 border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomGoal}
                className="flex-1 py-2 bg-blue-600 text-white border-2 border-slate-900 font-mono text-xs font-bold btn-press-sm"
              >
                Create Goal ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Strategy Hint Modal ─── */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="card-neopop max-w-md w-full p-4 sm:p-5 space-y-3 bg-white text-slate-900">
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentGoal?.icon}</span>
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900">
                    {currentGoal?.name} — Strategy Hint
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                    Target: {formatINR(targetAmount)} ({monthsAway} mos)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHintModal(false)}
                className="font-mono text-lg font-black text-slate-500 hover:text-slate-900 px-2"
              >
                ✕
              </button>
            </div>

            {/* Recommended Target Pill */}
            <div className="p-2.5 bg-blue-50 border-2 border-blue-600 flex items-center justify-between gap-2">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-900 block">
                  Recommended Monthly SIP
                </span>
                <span className="font-mono font-black text-lg text-blue-950">
                  {formatINR(recommendedSIP)}/mo
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleSIPChange(recommendedSIP);
                  setShowHintModal(false);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs border-2 border-slate-900 btn-press-sm shrink-0"
              >
                Apply Recommended
              </button>
            </div>

            {/* Strategic Reassurance */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 bg-slate-50 border border-slate-300">
                <span className="font-bold text-slate-900 block">📈 Annual Appraisals</span>
                <p className="text-[11px] text-slate-600">
                  Salary raises automatically boost surplus. Auto-split scales up allocations seamlessly.
                </p>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-300">
                <span className="font-bold text-slate-900 block">↪️ Milestone Waterfall</span>
                <p className="text-[11px] text-slate-600">
                  When early goals complete, their freed surplus auto-cascades to remaining goals.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHintModal(false)}
              className="w-full py-2 bg-slate-900 text-white font-mono font-bold text-xs uppercase btn-press hover:bg-slate-800"
            >
              Got It ✓
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

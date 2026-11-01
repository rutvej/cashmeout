import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { useGameStore } from '../../engine/store.js';
import {
  INSTRUMENTS,
  calculateProjectedFV,
  evaluateGoalFeasibility,
} from '../../engine/compoundingEngine.js';
import { formatINR } from '../../utils/format.js';
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  fadeIn,
  scaleIn,
  springPress,
  hardPress,
} from '../../utils/motion.js';

export default function FinancialSetupScreen({ isModal = false, onClose }) {
  const {
    character,
    goals,
    insurance,
    toggleInsurance,
    setGoalAllocation,
    navigateTo,
  } = useGameStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState('carousel');

  if (!character || !goals.length) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-4 font-body">No character loaded.</p>
        <button
          onClick={() => navigateTo('landing')}
          className="px-5 py-2.5 bg-emerald-500 text-surface-0 font-bold btn-press"
        >
          Return to Start
        </button>
      </div>
    );
  }

  // Insurance premiums
  const healthPremium = insurance.health.isPurchased ? insurance.health.monthlyPremium : 0;
  const termPremium = insurance.termLife.isPurchased ? insurance.termLife.monthlyPremium : 0;
  const totalInsurancePremiums = healthPremium + termPremium;

  // Total allocated SIPs
  const totalAllocatedSIP = goals.reduce((sum, g) => sum + (g.baseMonthlySIP || 0), 0);
  const totalCommitted = totalInsurancePremiums + totalAllocatedSIP;
  const surplus = character.monthlySurplus;
  const remainingSurplus = surplus - totalCommitted;
  const isOverAllocated = remainingSurplus < 0;

  const safeIndex = Math.min(currentIndex, Math.max(0, goals.length - 1));
  const activeGoal = goals[safeIndex];

  // Allocation handlers
  const handleSIPChange = (goalId, value) => {
    const num = Math.max(0, Math.round(Number(value) || 0));
    setGoalAllocation(goalId, { baseMonthlySIP: num });
  };

  const handleStepSIP = (goalId, currentSIP, delta) => {
    const nextVal = Math.max(0, (currentSIP || 0) + delta);
    setGoalAllocation(goalId, { baseMonthlySIP: nextVal });
  };

  const handleFillRemaining = (goalId) => {
    const currentSIP = activeGoal.baseMonthlySIP || 0;
    const maxAvailable = currentSIP + Math.max(0, remainingSurplus);
    setGoalAllocation(goalId, { baseMonthlySIP: maxAvailable });
  };

  const handleInstrumentChange = (goalId, instrumentId) => {
    setGoalAllocation(goalId, { instrumentId });
  };

  const handleRedirectChange = (goalId, redirectGoalId) => {
    setGoalAllocation(goalId, { redirectGoalId: redirectGoalId === 'none' ? null : redirectGoalId });
  };

  const handleStartSim = () => {
    if (isOverAllocated) return;
    if (isModal && onClose) {
      onClose();
    } else {
      navigateTo('main_game');
    }
  };

  // Active goal chart projection
  const activeInstrument = INSTRUMENTS[activeGoal?.instrumentId || 'savings'] || INSTRUMENTS.savings;
  const activeSIP = activeGoal?.baseMonthlySIP || 0;
  const monthsAway = activeGoal?.targetMonthsRemaining || (activeGoal?.recurrenceIntervalMonths || 12);
  const activeFeasibility = evaluateGoalFeasibility(activeGoal, activeSIP, activeInstrument.id);

  const chartData = useMemo(() => {
    if (!activeGoal) return [];
    const data = [];
    const numPoints = Math.min(24, Math.max(6, monthsAway));
    const stepMonths = Math.max(1, Math.round(monthsAway / numPoints));

    for (let m = 0; m <= monthsAway; m += stepMonths) {
      const fv = calculateProjectedFV(
        activeGoal.currentAmount || 0,
        activeSIP,
        activeInstrument.annualRate,
        m
      );
      data.push({
        month: m,
        monthLabel: m === 0 ? 'Now' : m === monthsAway ? `M${m}` : `M${m}`,
        projectedValue: fv,
        target: activeGoal.targetAmount,
      });
    }

    if (data[data.length - 1].month !== monthsAway) {
      data.push({
        month: monthsAway,
        monthLabel: `M${monthsAway}`,
        projectedValue: calculateProjectedFV(
          activeGoal.currentAmount || 0,
          activeSIP,
          activeInstrument.annualRate,
          monthsAway
        ),
        target: activeGoal.targetAmount,
      });
    }

    return data;
  }, [activeGoal, activeSIP, activeInstrument, monthsAway]);

  const chartColor =
    activeFeasibility.status === 'on_track'
      ? '#10b981'
      : activeFeasibility.status === 'borderline'
      ? '#F5A623'
      : '#EF4444';

  const allocationPct = Math.min(100, (totalCommitted / surplus) * 100);

  const Wrapper = isModal ? 'div' : motion.div;
  const wrapperProps = isModal
    ? { className: 'bg-surface-0 text-slate-100 flex flex-col items-center p-4 sm:p-6 max-h-[92vh] overflow-y-auto' }
    : { className: 'min-h-screen bg-mesh noise-overlay relative text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8', ...pageTransition };

  return (
    <Wrapper {...wrapperProps}>
      <motion.div
        className="w-full max-w-4xl relative z-10 space-y-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header ─── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-3 gap-3"
          variants={fadeInUp}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                {isModal ? 'Adjust Allocations' : 'Financial Planning'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
              Allocate Surplus
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Surplus Meter */}
            <div className="bg-surface-1 border border-surface-3 px-4 py-2.5 flex items-center gap-4">
              <div className="text-right">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600">Surplus</div>
                <div className="text-base font-mono font-black text-white">{formatINR(surplus)}</div>
              </div>
              <div className="h-8 w-px bg-surface-3" />
              <div className="text-right">
                <div className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isOverAllocated ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isOverAllocated ? 'Over' : 'Free'}
                </div>
                <div className={`text-base font-mono font-black ${isOverAllocated ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatINR(Math.abs(remainingSurplus))}
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-surface-1 border border-surface-3 p-0.5">
              {['carousel', 'grid'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    viewMode === mode
                      ? 'bg-surface-3 text-emerald-400'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {mode === 'carousel' ? 'Focus' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Allocation Progress Bar ─── */}
        <motion.div className="space-y-1.5" variants={fadeInUp}>
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-500">
              Committed: <strong className="text-white">{formatINR(totalCommitted)}</strong> of {formatINR(surplus)}
            </span>
            <span className={`font-bold ${isOverAllocated ? 'text-rose-400' : 'text-emerald-400'}`}>
              {allocationPct.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-surface-1 overflow-hidden border border-surface-3">
            <motion.div
              className={`h-full ${isOverAllocated ? 'bg-rose-500' : 'bg-emerald-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, allocationPct)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* ─── Insurance Section ─── */}
        <motion.div className="bg-surface-1 border border-surface-3 p-4 space-y-3" variants={fadeInUp}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">
                Risk Protection
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-body">Shields from medical shocks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'health', data: insurance.health },
              { key: 'termLife', data: insurance.termLife },
            ].map(({ key, data }) => (
              <motion.div
                key={key}
                onClick={() => toggleInsurance(key)}
                className={`p-3.5 border cursor-pointer transition-all flex items-start justify-between ${
                  data.isPurchased
                    ? 'bg-emerald-500/8 border-emerald-500/40'
                    : 'bg-surface-2 border-surface-3 hover:border-surface-3/80'
                }`}
                {...springPress}
              >
                <div className="space-y-1">
                  <div className="font-body font-bold text-xs text-white">
                    {key === 'health' ? 'Health Cover' : 'Term Life Cover'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-body">
                    {key === 'health' ? '₹10L medical bills • ₹5k deductible' : '₹50L pure death benefit'}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-bold pt-0.5">
                    {formatINR(data.monthlyPremium)} / mo
                  </div>
                </div>
                <div
                  className={`w-5 h-5 border-2 flex items-center justify-center text-[10px] ${
                    data.isPurchased
                      ? 'bg-emerald-500 border-emerald-500 text-surface-0'
                      : 'border-surface-3 text-transparent'
                  }`}
                >
                  ✓
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── CAROUSEL VIEW ─── */}
        {viewMode === 'carousel' && activeGoal && (
          <motion.div className="space-y-4" variants={fadeInUp}>
            {/* Goal Stepper Pills */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                Goal {safeIndex + 1} / {goals.length}
              </span>
              <div className="flex items-center gap-1">
                {goals.map((g, idx) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 transition-all duration-300 ${
                      idx === safeIndex
                        ? 'w-8 bg-emerald-400'
                        : (g.baseMonthlySIP || 0) > 0
                        ? 'w-3 bg-emerald-700'
                        : 'w-3 bg-surface-3'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Active Goal Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGoal.id}
                className="bg-surface-1 border border-surface-3 p-5 sm:p-6 space-y-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* Goal Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeGoal.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display text-xl font-black text-white">{activeGoal.name}</h2>
                        {activeGoal.isMandatory && (
                          <span className="text-[8px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            MANDATORY
                          </span>
                        )}
                        {activeGoal.isRefillPriority && (
                          <span className="text-[8px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ⚡ RECALL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-body">{activeGoal.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600">Target</div>
                    <div className="text-xl font-mono font-black text-white">{formatINR(activeGoal.targetAmount)}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {activeGoal.targetAge ? `Age ${activeGoal.targetAge} · ${monthsAway} mo` : `${monthsAway} mo`}
                    </div>
                  </div>
                </div>

                {/* ─── Chart ─── */}
                <div className="bg-surface-0 border border-surface-3 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                      Growth Projection
                    </span>
                    <div>
                      {activeFeasibility.status === 'on_track' && (
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          🟢 ON TRACK · {formatINR(activeFeasibility.projectedAmount)}
                        </span>
                      )}
                      {activeFeasibility.status === 'borderline' && (
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          🟡 SHORT {formatINR(activeFeasibility.shortfall)}
                        </span>
                      )}
                      {activeFeasibility.status === 'underfunded' && (
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          🔴 SHORT {formatINR(activeFeasibility.shortfall)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-48 w-full pt-1">
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
                          stroke="#374151"
                          fontSize={9}
                          fontFamily="JetBrains Mono"
                          tickLine={false}
                          axisLine={{ stroke: '#1f2937' }}
                        />
                        <YAxis
                          stroke="#374151"
                          fontSize={9}
                          fontFamily="JetBrains Mono"
                          tickLine={false}
                          axisLine={{ stroke: '#1f2937' }}
                          tickFormatter={(val) =>
                            val >= 10000000
                              ? `${(val / 10000000).toFixed(1)}Cr`
                              : val >= 100000
                              ? `${(val / 100000).toFixed(0)}L`
                              : `${val}`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0a0f1a',
                            borderColor: '#1f2937',
                            borderRadius: 0,
                            fontSize: '11px',
                            fontFamily: 'JetBrains Mono',
                            color: '#e2e8f0',
                          }}
                          formatter={(val) => [formatINR(val), 'Projected']}
                          labelFormatter={(label) => `Timeline: ${label}`}
                        />
                        <ReferenceLine
                          y={activeGoal.targetAmount}
                          stroke="#64748b"
                          strokeDasharray="4 4"
                          label={{
                            value: `Target ${formatINR(activeGoal.targetAmount)}`,
                            fill: '#64748b',
                            fontSize: 9,
                            fontFamily: 'JetBrains Mono',
                            position: 'top',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="projectedValue"
                          stroke={chartColor}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#goalAreaGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ─── Instrument Selector ─── */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 block">
                    Investment Vehicle
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.values(INSTRUMENTS).map((inst) => {
                      const isSelected = (activeGoal.instrumentId || 'savings') === inst.id;
                      return (
                        <motion.button
                          key={inst.id}
                          type="button"
                          onClick={() => handleInstrumentChange(activeGoal.id, inst.id)}
                          className={`p-3 border text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-500/8 border-emerald-500/50 shadow-glow'
                              : 'bg-surface-2 border-surface-3 hover:border-surface-3/80'
                          }`}
                          {...springPress}
                        >
                          <div className="font-body font-bold text-xs text-white">{inst.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-body">{inst.tag}</div>
                          <div className="text-xs font-mono font-bold text-emerald-400 mt-2">
                            {(inst.annualRate * 100).toFixed(1)}% p.a.
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ─── SIP Input ─── */}
                <div className="p-4 bg-surface-0 border border-surface-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                      Monthly SIP
                    </span>

                    <div className="flex items-center gap-0 bg-surface-1 border border-surface-3">
                      <button
                        type="button"
                        onClick={() => handleStepSIP(activeGoal.id, activeSIP, -500)}
                        className="px-3 py-2 hover:bg-surface-3 text-sm font-mono font-bold text-slate-300 transition-colors border-r border-surface-3"
                      >
                        −500
                      </button>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={activeSIP}
                        onChange={(e) => handleSIPChange(activeGoal.id, e.target.value)}
                        className="w-28 bg-transparent text-center font-mono font-black text-emerald-400 text-lg outline-none py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepSIP(activeGoal.id, activeSIP, 500)}
                        className="px-3 py-2 hover:bg-surface-3 text-sm font-mono font-bold text-slate-300 transition-colors border-l border-surface-3"
                      >
                        +500
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-600 mr-1">Quick:</span>
                    {[1000, 2000, 5000].map((amt) => (
                      <motion.button
                        key={amt}
                        type="button"
                        onClick={() => handleStepSIP(activeGoal.id, activeSIP, amt)}
                        className="px-2.5 py-1 bg-surface-2 border border-surface-3 text-slate-400 hover:text-white text-[10px] font-mono font-bold transition-colors"
                        {...springPress}
                      >
                        +{formatINR(amt)}
                      </motion.button>
                    ))}
                    {remainingSurplus > 0 && (
                      <motion.button
                        type="button"
                        onClick={() => handleFillRemaining(activeGoal.id)}
                        className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold transition-colors ml-auto hover:bg-emerald-500/20"
                        {...springPress}
                      >
                        Fill +{formatINR(remainingSurplus)}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* ─── Waterfall Redirect ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-0 border border-surface-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-400 text-[10px] flex items-center gap-1">
                      <span>↪️</span> Redirect When Full
                    </span>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-body">
                      {activeGoal.id === 'goal_emergency'
                        ? '⚡ Auto-recalls if emergency fund is depleted.'
                        : 'SIP auto-flows to next goal when target is met.'}
                    </p>
                  </div>
                  <select
                    value={activeGoal.redirectGoalId || 'none'}
                    onChange={(e) => handleRedirectChange(activeGoal.id, e.target.value)}
                    className="bg-surface-1 border border-surface-3 text-slate-200 text-xs font-mono px-3 py-1.5 outline-none focus:border-emerald-500"
                  >
                    <option value="none">-- None --</option>
                    {goals
                      .filter((g) => g.id !== activeGoal.id)
                      .map((og) => (
                        <option key={og.id} value={og.id}>
                          {og.icon} {og.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* ─── Carousel Nav ─── */}
                <div className="flex justify-between items-center pt-2">
                  <motion.button
                    type="button"
                    disabled={safeIndex === 0}
                    onClick={() => setCurrentIndex(safeIndex - 1)}
                    className={`px-4 py-2.5 text-xs font-mono font-bold border transition-colors ${
                      safeIndex === 0
                        ? 'opacity-30 border-surface-3 text-slate-600 cursor-not-allowed'
                        : 'border-surface-3 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                    {...(safeIndex > 0 ? springPress : {})}
                  >
                    ← PREV
                  </motion.button>
                  <motion.button
                    type="button"
                    disabled={safeIndex === goals.length - 1}
                    onClick={() => setCurrentIndex(safeIndex + 1)}
                    className={`px-4 py-2.5 text-xs font-mono font-bold border transition-colors ${
                      safeIndex === goals.length - 1
                        ? 'opacity-30 border-surface-3 text-slate-600 cursor-not-allowed'
                        : 'border-surface-3 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                    {...(safeIndex < goals.length - 1 ? springPress : {})}
                  >
                    NEXT →
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── GRID VIEW ─── */}
        {viewMode === 'grid' && (
          <motion.div className="space-y-3" variants={fadeInUp}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
              All Goals
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((g, idx) => {
                const sip = g.baseMonthlySIP || 0;

                return (
                  <div
                    key={g.id}
                    className="p-4 bg-surface-1 border border-surface-3 space-y-2.5 hover:border-surface-3/80 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{g.icon}</span>
                        <div>
                          <div className="font-body font-bold text-xs text-white">{g.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Target: {formatINR(g.targetAmount)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setViewMode('carousel');
                        }}
                        className="text-[9px] font-mono font-bold text-emerald-400 hover:underline"
                      >
                        EDIT →
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-3">
                      <span className="text-slate-500 font-mono text-[10px]">SIP:</span>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={sip}
                        onChange={(e) => handleSIPChange(g.id, e.target.value)}
                        className="w-24 bg-surface-0 border border-surface-3 px-2 py-1 font-mono font-bold text-emerald-400 text-right outline-none text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── Over-Allocation Warning ─── */}
        {isOverAllocated && (
          <motion.div
            className="p-3.5 bg-rose-500/8 border-l-[3px] border-l-rose-500 border-y border-r border-rose-500/20 text-xs text-rose-300 flex items-center gap-2 font-body"
            variants={fadeInUp}
          >
            <span>⚠️</span>
            <span>
              Over-allocated by <strong className="font-mono">{formatINR(Math.abs(remainingSurplus))}</strong>. Reduce SIPs to proceed.
            </span>
          </motion.div>
        )}

        {/* ─── Action Footer ─── */}
        <motion.div className="pt-2 flex flex-col sm:flex-row gap-3 items-center" variants={fadeInUp}>
          {!isModal && (
            <motion.button
              type="button"
              onClick={() => navigateTo('goal_setup')}
              className="w-full sm:w-auto px-6 py-3.5 border border-surface-3 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-body font-semibold transition-colors"
              {...springPress}
            >
              ← Back
            </motion.button>
          )}
          <motion.button
            type="button"
            disabled={isOverAllocated}
            onClick={handleStartSim}
            className={`w-full flex-1 py-4 px-8 font-body font-black text-base tracking-wider uppercase flex items-center justify-center gap-3 transition-all ${
              isOverAllocated
                ? 'bg-surface-2 text-slate-600 cursor-not-allowed'
                : 'bg-emerald-500 text-surface-0 btn-press cursor-pointer hover:bg-emerald-400'
            }`}
            {...(isOverAllocated ? {} : hardPress)}
          >
            <span>{isModal ? 'Save Allocations' : 'START SIMULATION'}</span>
            {!isModal && <span className="text-lg">🚀</span>}
          </motion.button>
        </motion.div>
      </motion.div>
    </Wrapper>
  );
}

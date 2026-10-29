import React, { useState, useMemo } from 'react';
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
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'

  if (!character || !goals.length) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-4">No character loaded.</p>
        <button
          onClick={() => navigateTo('landing')}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl"
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
        monthLabel: m === 0 ? 'Start' : m === monthsAway ? `Mo ${m}` : `M${m}`,
        projectedValue: fv,
        target: activeGoal.targetAmount,
      });
    }

    // Ensure last point is exactly at target month
    if (data[data.length - 1].month !== monthsAway) {
      data.push({
        month: monthsAway,
        monthLabel: `Mo ${monthsAway}`,
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
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div
      className={`bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 ${
        isModal ? 'max-h-[92vh] overflow-y-auto' : 'min-h-screen justify-center'
      }`}
    >
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
        
        {/* Top Header & Sticky Surplus Meter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isModal ? 'Adjust Allocations' : 'Screen 4: Financial Planning & Allocations'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Allocate Monthly Surplus
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly Surplus</div>
                <div className="text-base font-black text-white font-mono">{formatINR(surplus)}</div>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <div
                  className={`text-[10px] font-bold uppercase ${
                    isOverAllocated ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isOverAllocated ? 'Over-Allocated' : 'Unallocated'}
                </div>
                <div
                  className={`text-base font-black font-mono ${
                    isOverAllocated ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatINR(Math.abs(remainingSurplus))}
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === 'carousel'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Focus
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Goals
              </button>
            </div>
          </div>
        </div>

        {/* Surplus Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              Committed: <strong className="text-white font-mono">{formatINR(totalCommitted)}</strong> of {formatINR(surplus)}
            </span>
            <span className={isOverAllocated ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {((totalCommitted / surplus) * 100).toFixed(0)}% Allocated
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isOverAllocated ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(100, (totalCommitted / surplus) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Risk Protection (Health & Term Insurance) */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Risk Protection First (Insurance)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Shields emergency fund from medical shocks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => toggleInsurance('health')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                insurance.health.isPurchased
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-bold text-xs">Comprehensive Health Cover</div>
                <div className="text-[10px] text-slate-400">Covers ₹10L medical bills • Deductible: ₹5k</div>
                <div className="text-xs font-mono text-emerald-400 font-semibold pt-0.5">
                  {formatINR(insurance.health.monthlyPremium)} / mo
                </div>
              </div>
              <input
                type="checkbox"
                checked={insurance.health.isPurchased}
                readOnly
                className="mt-1 accent-emerald-500 rounded"
              />
            </div>

            <div
              onClick={() => toggleInsurance('termLife')}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                insurance.termLife.isPurchased
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-bold text-xs">Term Life Cover</div>
                <div className="text-[10px] text-slate-400">Covers ₹50L pure death benefit for dependants</div>
                <div className="text-xs font-mono text-emerald-400 font-semibold pt-0.5">
                  {formatINR(insurance.termLife.monthlyPremium)} / mo
                </div>
              </div>
              <input
                type="checkbox"
                checked={insurance.termLife.isPurchased}
                readOnly
                className="mt-1 accent-emerald-500 rounded"
              />
            </div>
          </div>
        </div>

        {/* VIEW MODE 1: STEP-BY-STEP CAROUSEL (INSPIRED BY OLD GAME) */}
        {viewMode === 'carousel' && activeGoal && (
          <div className="space-y-4">
            
            {/* Carousel Stepper Dots */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Goal {safeIndex + 1} of {goals.length}
              </span>
              <div className="flex items-center gap-1.5">
                {goals.map((g, idx) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === safeIndex
                        ? 'w-7 bg-emerald-400'
                        : (g.baseMonthlySIP || 0) > 0
                        ? 'w-2.5 bg-emerald-600'
                        : 'w-2.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Active Goal Main Focus Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
              
              {/* Goal Title & Target */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 bg-slate-900 rounded-2xl shadow-inner">
                    {activeGoal.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{activeGoal.name}</h2>
                      {activeGoal.isMandatory && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          MANDATORY
                        </span>
                      )}
                      {activeGoal.isRefillPriority && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⚡ RECALL GUARANTEE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                      {activeGoal.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Target Corpus</div>
                  <div className="text-xl font-black text-white font-mono">
                    {formatINR(activeGoal.targetAmount)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {activeGoal.targetAge ? `By Age ${activeGoal.targetAge} (${monthsAway} mos)` : `${monthsAway} mos`}
                  </div>
                </div>
              </div>

              {/* Dynamic Projection AreaChart */}
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span>📈</span> Growth Trajectory vs Target
                  </span>

                  {/* Feasibility Signal */}
                  <div>
                    {activeFeasibility.status === 'on_track' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🟢 On Track (Projected {formatINR(activeFeasibility.projectedAmount)})
                      </span>
                    )}
                    {activeFeasibility.status === 'borderline' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        🟡 Borderline (Short by {formatINR(activeFeasibility.shortfall)})
                      </span>
                    )}
                    {activeFeasibility.status === 'underfunded' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🔴 Underfunded (Short by {formatINR(activeFeasibility.shortfall)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Recharts Area Component */}
                <div className="h-44 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="monthLabel"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(val) =>
                          val >= 10000000
                            ? `₹${(val / 10000000).toFixed(1)}Cr`
                            : val >= 100000
                            ? `₹${(val / 100000).toFixed(0)}L`
                            : `₹${val}`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#020617',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                          color: '#f8fafc',
                        }}
                        formatter={(val) => [formatINR(val), 'Projected Corpus']}
                        labelFormatter={(label) => `Timeline: ${label}`}
                      />
                      <ReferenceLine
                        y={activeGoal.targetAmount}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        label={{
                          value: `Target ${formatINR(activeGoal.targetAmount)}`,
                          fill: '#94a3b8',
                          fontSize: 10,
                          position: 'top',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="projectedValue"
                        stroke={chartColor}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#goalAreaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Instrument Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Select Investment Vehicle:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(INSTRUMENTS).map((inst) => {
                    const isSelected = (activeGoal.instrumentId || 'savings') === inst.id;
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => handleInstrumentChange(activeGoal.id, inst.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-xs">{inst.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{inst.tag}</div>
                        </div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-2">
                          {(inst.annualRate * 100).toFixed(1)}% p.a.
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly SIP Input & Quick Presets */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-300 uppercase">
                    Monthly SIP Allocation:
                  </span>
                  
                  {/* Stepper & Numeric Input */}
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => handleStepSIP(activeGoal.id, activeSIP, -500)}
                      className="px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-300 transition"
                    >
                      -500
                    </button>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={activeSIP}
                      onChange={(e) => handleSIPChange(activeGoal.id, e.target.value)}
                      className="w-28 bg-transparent text-center font-mono font-black text-emerald-400 text-base outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepSIP(activeGoal.id, activeSIP, 500)}
                      className="px-2.5 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-300 transition"
                    >
                      +500
                    </button>
                  </div>
                </div>

                {/* Quick Preset Buttons (Inspired by Old Game) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 mr-1">Quick Add:</span>
                  {[1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleStepSIP(activeGoal.id, activeSIP, amt)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
                    >
                      +{formatINR(amt)}
                    </button>
                  ))}
                  {remainingSurplus > 0 && (
                    <button
                      type="button"
                      onClick={() => handleFillRemaining(activeGoal.id)}
                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition ml-auto"
                    >
                      Fill Remaining (+{formatINR(remainingSurplus)})
                    </button>
                  )}
                </div>
              </div>

              {/* Waterfall Redirection Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-850 text-xs">
                <div>
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <span>↪️</span> When Full, Redirect SIP to:
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {activeGoal.id === 'goal_emergency'
                      ? '⚡ Auto-recalls SIP immediately if emergency expenses drain the fund.'
                      : 'Automatically flows into next goal when target is met.'}
                  </p>
                </div>
                <select
                  value={activeGoal.redirectGoalId || 'none'}
                  onChange={(e) => handleRedirectChange(activeGoal.id, e.target.value)}
                  className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500"
                >
                  <option value="none">-- None (Stop SIP) --</option>
                  {goals
                    .filter((g) => g.id !== activeGoal.id)
                    .map((og) => (
                      <option key={og.id} value={og.id}>
                        {og.icon} {og.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Carousel Next / Prev Controls */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  disabled={safeIndex === 0}
                  onClick={() => setCurrentIndex(safeIndex - 1)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                    safeIndex === 0
                      ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  ← Prev Goal
                </button>

                <button
                  type="button"
                  disabled={safeIndex === goals.length - 1}
                  onClick={() => setCurrentIndex(safeIndex + 1)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                    safeIndex === goals.length - 1
                      ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  Next Goal →
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW MODE 2: ALL GOALS GRID */}
        {viewMode === 'grid' && (
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              All Goals Summary & Allocations
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((g, idx) => {
                const inst = INSTRUMENTS[g.instrumentId || 'savings'] || INSTRUMENTS.savings;
                const sip = g.baseMonthlySIP || 0;
                const feas = evaluateGoalFeasibility(g, sip, inst.id);

                return (
                  <div
                    key={g.id}
                    className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-750 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl p-1 bg-slate-900 rounded-lg">{g.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-white">{g.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Target: <strong className="text-slate-200 font-mono">{formatINR(g.targetAmount)}</strong>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setViewMode('carousel');
                        }}
                        className="text-[10px] text-emerald-400 hover:underline font-semibold"
                      >
                        Inspect Chart ➔
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850">
                      <span className="text-slate-400">Monthly SIP:</span>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={sip}
                        onChange={(e) => handleSIPChange(g.id, e.target.value)}
                        className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 font-mono font-bold text-emerald-400 text-right outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Validation Error Banner */}
        {isOverAllocated && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Your total allocations exceed monthly surplus by {formatINR(Math.abs(remainingSurplus))}. Please reduce SIPs to proceed.
            </span>
          </div>
        )}

        {/* Action Footer */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
          {!isModal && (
            <button
              type="button"
              onClick={() => navigateTo('goal_setup')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition"
            >
              ← Back to Goals
            </button>
          )}

          <button
            type="button"
            disabled={isOverAllocated}
            onClick={handleStartSim}
            className={`w-full flex-1 py-3.5 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition ${
              isOverAllocated
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99] cursor-pointer'
            }`}
          >
            <span>{isModal ? 'Save Allocations' : 'START LIFE SIMULATION 🚀'}</span>
            {!isModal && <span className="text-lg">➔</span>}
          </button>
        </div>

      </div>
    </div>
  );
}

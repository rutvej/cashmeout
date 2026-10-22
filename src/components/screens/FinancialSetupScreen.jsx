import React from 'react';
import { useGameStore } from '../../engine/store.js';
import { INSTRUMENTS, evaluateGoalFeasibility } from '../../engine/compoundingEngine.js';
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

  const handleSIPChange = (goalId, value) => {
    const num = Math.max(0, Math.round(Number(value) || 0));
    setGoalAllocation(goalId, { baseMonthlySIP: num });
  };

  const handleStepSIP = (goalId, currentSIP, delta) => {
    const nextVal = Math.max(0, (currentSIP || 0) + delta);
    setGoalAllocation(goalId, { baseMonthlySIP: nextVal });
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

  return (
    <div className={`bg-slate-950 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 ${isModal ? 'max-h-[90vh] overflow-y-auto' : 'min-h-screen justify-center'}`}>
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
        
        {/* Header Bar */}
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

          <div className="bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly Surplus</div>
              <div className="text-lg font-black text-white font-mono">{formatINR(surplus)}</div>
            </div>
            <div className="h-7 w-px bg-slate-800"></div>
            <div>
              <div className={`text-[10px] font-bold uppercase ${isOverAllocated ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isOverAllocated ? 'Over-Allocated' : 'Unallocated'}
              </div>
              <div className={`text-lg font-black font-mono ${isOverAllocated ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatINR(Math.abs(remainingSurplus))}
              </div>
            </div>
          </div>
        </div>

        {/* Protection / Insurance Banner */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Risk Protection First (Insurance)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Paid directly from monthly surplus</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Health Insurance */}
            <div
              onClick={() => toggleInsurance('health')}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                insurance.health.isPurchased
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>Comprehensive Health Cover</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Covers ₹10L medical bills • Deductible: ₹5k
                </div>
                <div className="text-xs font-mono text-emerald-400 font-semibold pt-1">
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

            {/* Term Life Insurance */}
            <div
              onClick={() => toggleInsurance('termLife')}
              className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                insurance.termLife.isPurchased
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>Term Life Cover</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Covers ₹50L death benefit for family
                </div>
                <div className="text-xs font-mono text-emerald-400 font-semibold pt-1">
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

        {/* Goals Allocation & Waterfall List */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Goal SIPs & Automated Waterfall Redirections</span>
            <span className="text-[11px] text-slate-500 font-normal">
              When a goal finishes, its SIP cascades forward
            </span>
          </div>

          <div className="space-y-3">
            {goals.map((goal) => {
              const currentInstrument = goal.instrumentId || 'savings';
              const sip = goal.baseMonthlySIP || 0;
              const feasibility = evaluateGoalFeasibility(goal, sip, currentInstrument);
              const otherGoals = goals.filter((g) => g.id !== goal.id);

              return (
                <div
                  key={goal.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700/80 transition"
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1.5 bg-slate-900 rounded-lg">{goal.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{goal.name}</span>
                          {goal.isMandatory && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                              CORE
                            </span>
                          )}
                          {goal.isRefillPriority && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                              ⚡ SHIELD RECALL
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Target: <strong className="text-slate-200 font-mono">{formatINR(goal.targetAmount)}</strong>
                          {goal.targetAge && ` • at Age ${goal.targetAge}`}
                        </div>
                      </div>
                    </div>

                    {/* Feasibility Badge */}
                    <div className="text-right">
                      {feasibility.status === 'on_track' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          🟢 On Track ({formatINR(feasibility.projectedAmount)})
                        </span>
                      )}
                      {feasibility.status === 'borderline' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🟡 Borderline ({formatINR(feasibility.projectedAmount)})
                        </span>
                      )}
                      {feasibility.status === 'underfunded' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          🔴 Underfunded (Short by {formatINR(feasibility.shortfall)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Instrument Selector */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 mr-1">Instrument:</span>
                    {Object.values(INSTRUMENTS).map((inst) => {
                      const isSelected = currentInstrument === inst.id;
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={() => handleInstrumentChange(goal.id, inst.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {inst.name} ({(inst.annualRate * 100).toFixed(1)}%)
                        </button>
                      );
                    })}
                  </div>

                  {/* Monthly SIP Input & Steppers */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Monthly SIP:</span>
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => handleStepSIP(goal.id, sip, -500)}
                          className="px-2 py-1 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-300"
                        >
                          -500
                        </button>
                        <input
                          type="number"
                          step="500"
                          min="0"
                          value={sip}
                          onChange={(e) => handleSIPChange(goal.id, e.target.value)}
                          className="w-24 bg-transparent text-center font-mono font-bold text-emerald-400 text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepSIP(goal.id, sip, 500)}
                          className="px-2 py-1 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-300"
                        >
                          +500
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepSIP(goal.id, sip, 2000)}
                          className="px-2 py-1 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-emerald-400"
                        >
                          +2k
                        </button>
                      </div>
                    </div>

                    {/* Waterfall Redirect Selector */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">↪️ When Full, Redirect to:</span>
                      <select
                        value={goal.redirectGoalId || 'none'}
                        onChange={(e) => handleRedirectChange(goal.id, e.target.value)}
                        className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-500"
                      >
                        <option value="none">-- None (Stop SIP) --</option>
                        {otherGoals.map((og) => (
                          <option key={og.id} value={og.id}>
                            {og.icon} {og.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Warning */}
        {isOverAllocated && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Your total allocations ({formatINR(totalCommitted)}) exceed your monthly surplus ({formatINR(surplus)}) by {formatINR(Math.abs(remainingSurplus))}. Please reduce SIPs to proceed.
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

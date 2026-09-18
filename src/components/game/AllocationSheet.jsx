import React, { useState, useEffect } from 'react';
import useGameStore from '../../engine/store';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';
import { FUND_PRESETS, createFund } from '../../engine/goals';

const AllocationSheet = ({ isOpen, goals = [], onConfirm }) => {
  const store = useGameStore();
  const [goalAllocs, setGoalAllocs] = useState({});
  const [fundAllocs, setFundAllocs] = useState({});

  useEffect(() => {
    if (isOpen) {
      setGoalAllocs({ ...(store.buckets || {}) });
      setFundAllocs({ ...(store.fundAllocations || {}) });
    }
  }, [isOpen, store.buckets, store.fundAllocations]);

  // Cashflow calculations
  const totalIncome =
    (store.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0) +
    (store.businessIncome || 0);

  const totalDeductions =
    (store.fixedDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0) +
    (store.loans?.reduce((sum, l) => sum + l.emi, 0) || 0) +
    (store.hasHealthInsurance ? store.healthInsuranceCost : 0) +
    (store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0) +
    (store.homeMaintenanceCost || 0) +
    (store.carMaintenanceCost || 0);

  const monthlySurplus = Math.max(0, totalIncome - totalDeductions);
  const activeGoals = goals || [];
  const activeFunds = store.funds || [];

  const handleGoalUpdate = (goalId, value) => {
    const val = Math.max(0, Math.min(100, parseInt(value) || 0));
    setGoalAllocs(prev => ({ ...prev, [goalId]: val }));
  };

  const handleFundUpdate = (fundId, value) => {
    const val = Math.max(0, Math.min(100, parseInt(value) || 0));
    setFundAllocs(prev => ({ ...prev, [fundId]: val }));
  };

  const handleAddPresetFund = (preset) => {
    const targetAmt = preset.type === 'emergency' 
      ? Math.max(100000, totalDeductions * 6)
      : (preset.suggestedAmount || 200000);
    const newFundObj = createFund(preset.type, preset.name, targetAmt, preset.defaultInstruments);
    store.createFund(newFundObj);
    // Give it a default 10% allocation if room exists
    const currentTotal = Object.values(goalAllocs).reduce((s, v) => s + v, 0) +
                         Object.values(fundAllocs).reduce((s, v) => s + v, 0);
    const free = Math.max(0, 100 - currentTotal);
    const alloc = Math.min(15, free || 10);
    setFundAllocs(prev => ({ ...prev, [newFundObj.id]: alloc }));
  };

  const handleEqualSplit = () => {
    const totalItems = activeGoals.length + activeFunds.length;
    if (totalItems === 0) return;
    const evenPct = Math.floor(100 / totalItems);
    const rem = 100 - (evenPct * totalItems);
    
    const newGoals = {};
    activeGoals.forEach((g, idx) => {
      newGoals[g.id] = idx === 0 ? evenPct + rem : evenPct;
    });

    const newFunds = {};
    activeFunds.forEach(f => {
      newFunds[f.id] = evenPct;
    });

    setGoalAllocs(newGoals);
    setFundAllocs(newFunds);
  };

  const handleBalancedPreset = () => {
    // 60% to Goals, 30% to Funds, 10% Unallocated cash buffer
    const newGoals = {};
    if (activeGoals.length > 0) {
      const perGoal = Math.floor(60 / activeGoals.length);
      activeGoals.forEach(g => { newGoals[g.id] = perGoal; });
    }

    const newFunds = {};
    if (activeFunds.length > 0) {
      const perFund = Math.floor(30 / activeFunds.length);
      activeFunds.forEach(f => { newFunds[f.id] = perFund; });
    }

    setGoalAllocs(newGoals);
    setFundAllocs(newFunds);
  };

  const totalGoalAllocated = Object.values(goalAllocs).reduce((sum, val) => sum + (val || 0), 0);
  const totalFundAllocated = Object.values(fundAllocs).reduce((sum, val) => sum + (val || 0), 0);
  const totalAllocated = totalGoalAllocated + totalFundAllocated;
  const remaining = 100 - totalAllocated;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({ goalAllocations: goalAllocs, fundAllocations: fundAllocs });
    } else {
      store.confirmAllocation({ goalAllocations: goalAllocs, fundAllocations: fundAllocs });
    }
  };

  return (
    <BottomSheet isOpen={isOpen} title="Monthly Surplus & Capital Allocation">
      <div className="space-y-4 mb-4">
        {/* Real Cashflow Overview Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/70 p-3.5 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Monthly Inflow</span>
              <span className="text-xs font-bold text-text-primary">{formatCurrency(totalIncome)}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Fixed Outflow</span>
              <span className="text-xs font-bold text-red-600">-{formatCurrency(totalDeductions)}</span>
            </div>
            <div>
              <span className="text-[10px] text-accent-action-dark uppercase font-extrabold block">Savings Surplus</span>
              <span className="text-sm font-black text-green-700">+{formatCurrency(monthlySurplus)}/mo</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 mt-2 text-center border-t border-blue-100/80 pt-2">
            Decide what percentage of your monthly surplus fuels your <strong>Life Goals</strong> and <strong>Safety Funds</strong>.
          </p>
        </div>

        {/* Action Preset Buttons */}
        <div className="flex gap-2 justify-between items-center">
          <span className="text-[11px] text-text-muted font-bold">Quick Presets:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleBalancedPreset}
              className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-lg border border-indigo-200 transition"
            >
              60/30 Balanced
            </button>
            <button
              type="button"
              onClick={handleEqualSplit}
              className="text-[10px] bg-gray-100 hover:bg-gray-200 text-text-muted font-bold px-2 py-1 rounded-lg transition"
            >
              Split Equally
            </button>
          </div>
        </div>

        {/* Section 1: Safety Funds */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🛡️</span>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Safety Funds & Reserves ({activeFunds.length})
              </h4>
            </div>
            <span className="text-[11px] font-extrabold text-blue-800">
              {totalFundAllocated}% ({formatCurrency(Math.round((totalFundAllocated / 100) * monthlySurplus))}/mo)
            </span>
          </div>

          {activeFunds.length === 0 ? (
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-base">⚠️</span>
                <div className="text-[11px] text-amber-900 leading-snug">
                  <strong>No Safety Funds Active!</strong> Without an Emergency or Medical buffer, sudden hospital bills or repairs will hit your cash directly.
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {FUND_PRESETS.slice(0, 3).map(preset => (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleAddPresetFund(preset)}
                    className="text-[10px] font-bold px-2 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-lg shadow-2xs transition"
                  >
                    + Add {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {activeFunds.map(f => {
                const pct = fundAllocs[f.id] || 0;
                const monthlyRupees = Math.round((pct / 100) * monthlySurplus);
                const progressPct = f.targetAmount > 0 ? Math.min(100, Math.round(((f.currentAmount || 0) / f.targetAmount) * 100)) : 0;

                return (
                  <div
                    key={f.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs">{f.icon || '🛡️'}</span>
                        <span className="text-xs font-bold text-text-primary truncate">
                          {f.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-text-muted mt-0.5">
                        <span>{formatCurrency(f.currentAmount || 0)} / {formatCurrency(f.targetAmount)} ({progressPct}%)</span>
                        <span className="text-emerald-700 font-bold">+{formatCurrency(monthlyRupees)}/mo</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleFundUpdate(f.id, Math.max(0, pct - 5))}
                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <div className="flex items-center bg-gray-50 rounded-lg px-2 py-0.5 border border-gray-200">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-9 text-right bg-transparent outline-none font-bold text-xs"
                          value={pct}
                          onChange={(e) => handleFundUpdate(f.id, e.target.value)}
                        />
                        <span className="text-text-muted text-xs ml-0.5 font-bold">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFundUpdate(f.id, Math.min(100, pct + 5))}
                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Life Goals */}
        <div className="space-y-2.5 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🎯</span>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Life Goals Allocation ({activeGoals.length})
              </h4>
            </div>
            <span className="text-[11px] font-extrabold text-indigo-800">
              {totalGoalAllocated}% ({formatCurrency(Math.round((totalGoalAllocated / 100) * monthlySurplus))}/mo)
            </span>
          </div>

          <div className="space-y-2">
            {activeGoals.map(g => {
              const pct = goalAllocs[g.id] || 0;
              const monthlyRupees = Math.round((pct / 100) * monthlySurplus);

              return (
                <div
                  key={g.id}
                  className="p-3 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="text-xs font-bold text-text-primary truncate block">
                      {g.name}
                    </span>
                    <div className="flex items-center space-x-2 text-[10px] text-text-muted mt-0.5">
                      <span>Target: {formatCurrency(g.currentTarget)}</span>
                      <span className="text-emerald-700 font-bold">+{formatCurrency(monthlyRupees)}/mo</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleGoalUpdate(g.id, Math.max(0, pct - 5))}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                    >
                      -
                    </button>
                    <div className="flex items-center bg-gray-50 rounded-lg px-2 py-0.5 border border-gray-200">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-9 text-right bg-transparent outline-none font-bold text-xs"
                        value={pct}
                        onChange={(e) => handleGoalUpdate(g.id, e.target.value)}
                      />
                      <span className="text-text-muted text-xs ml-0.5 font-bold">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGoalUpdate(g.id, Math.min(100, pct + 5))}
                      className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unallocated Status & Summary */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span>Total Committed:</span>
            <span className={totalAllocated > 100 ? 'text-red-600' : totalAllocated === 100 ? 'text-green-700' : 'text-slate-800'}>
              {totalAllocated}% of surplus ({formatCurrency(Math.round((totalAllocated / 100) * monthlySurplus))}/mo)
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-text-muted">
            <span>Unallocated Cash Buffer:</span>
            <span className={remaining < 0 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
              {remaining}% ({formatCurrency(Math.max(0, Math.round((remaining / 100) * monthlySurplus)))}/mo)
            </span>
          </div>
          <p className="text-[10px] text-text-muted pt-0.5 leading-snug">
            {remaining > 0
              ? '💡 Any unallocated percentage flows directly into your compounding liquid savings portfolio.'
              : remaining === 0
              ? '✓ 100% of your surplus is deployed across goals and safety buffers.'
              : '⚠️ Total allocation exceeds 100%. Please reduce percentage claims.'}
          </p>
        </div>

        {/* Sticky Confirm Button */}
        <div className="sticky bottom-0 left-0 right-0 pt-3 pb-safe bg-white border-t border-gray-100 mt-4">
          <Button
            fullWidth
            onClick={handleConfirm}
            disabled={totalAllocated > 100}
            className="font-bold text-sm"
          >
            {totalAllocated > 100
              ? `Reduce Allocations (Over by ${totalAllocated - 100}%)`
              : remaining > 0
              ? `Save Allocation (${remaining}% to Liquid Savings) →`
              : 'Confirm Monthly Allocation (100% Deployed) →'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default AllocationSheet;

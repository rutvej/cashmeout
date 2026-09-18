import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../engine/store';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { formatCurrency, formatCurrencyFull } from '../../utils/format';
import { FUND_PRESETS, createFund, getSuggestedGoal } from '../../engine/goals';
import { CITY_TIERS } from '../../engine/constants';
import { getBlendedReturn } from '../../engine/instruments';
import { getCareerRole, CITY_TIER_SALARY_CAPS } from '../../engine/careers';

const STEPS = [
  { id: 'goals', title: 'Life Goals & Safety Funds', icon: '🎯' },
  { id: 'allocation', title: 'Monthly Surplus Allocation', icon: '⚖️' },
  { id: 'investments', title: 'Portfolio & Instruments', icon: '📈' },
  { id: 'loans', title: 'Debt & Banking', icon: '💳' },
  { id: 'insurance', title: 'Risk & Insurance Moat', icon: '🛡️' },
  { id: 'expenses', title: 'Income & Expense Levers', icon: '💼' },
  { id: 'review', title: 'Review Blueprint & Launch', icon: '🚀' },
];

const FinancialSetup = () => {
  const store = useGameStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const player = store.player;
  const cityTier = player?.cityTier || 2;
  const cityMeta = CITY_TIERS[cityTier] || CITY_TIERS[2];

  // Calculations for step 2
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

  // Suggested emergency fund size = 6x monthly expenses
  const suggestedEmergencyFund = Math.max(100000, Math.round(totalDeductions * 6));

  const currentStep = STEPS[currentStepIndex];

  // Helper to move between steps
  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLaunchGame = () => {
    store.setScreen('game');
  };

  // --- Step 1 Handlers: Goals & Funds ---
  const handleUpdateGoalAmount = (goalId, newAmount) => {
    const valid = Math.max(50000, Number(newAmount) || 0);
    store.setGoals(
      store.goals.map(g => (g.id === goalId ? { ...g, currentTarget: valid, originalTarget: valid } : g))
    );
  };

  const handleCreatePresetFund = (preset) => {
    const existing = store.funds.find(f => f.type === preset.type);
    if (existing) return;
    const target = preset.suggestedMonths
      ? suggestedEmergencyFund
      : preset.suggestedAmount;
    const newFund = createFund(preset.type, preset.name, target, preset.defaultInstruments);
    store.createFund(newFund);
  };

  // --- Step 2 Handlers: Surplus Allocations ---
  const activeGoals = store.goals.filter(g => !g.achieved && !g.sacrificed);
  const activeFunds = store.funds || [];

  const handleUpdateBucketPercent = (goalId, percent) => {
    const val = Math.max(0, Math.min(100, Number(percent) || 0));
    store.updateBucketAllocations({
      ...store.buckets,
      [goalId]: val,
    });
  };

  const handleUpdateFundPercent = (fundId, percent) => {
    const val = Math.max(0, Math.min(100, Number(percent) || 0));
    store.updateFundAllocations({
      ...store.fundAllocations,
      [fundId]: val,
    });
  };

  const handleSetZeroAllocations = () => {
    const newBuckets = {};
    activeGoals.forEach(g => { newBuckets[g.id] = 0; });
    store.updateBucketAllocations(newBuckets);
    const newFunds = {};
    activeFunds.forEach(f => { newFunds[f.id] = 0; });
    store.updateFundAllocations(newFunds);
  };

  const handleBalancedSetupPreset = () => {
    const newBuckets = {};
    const perGoal = activeGoals.length > 0 ? Math.floor(50 / activeGoals.length) : 0;
    activeGoals.forEach(g => { newBuckets[g.id] = perGoal; });
    store.updateBucketAllocations(newBuckets);

    const newFunds = {};
    const perFund = activeFunds.length > 0 ? Math.floor(25 / activeFunds.length) : 0;
    activeFunds.forEach(f => { newFunds[f.id] = perFund; });
    store.updateFundAllocations(newFunds);
  };

  const totalAllocatedPct =
    Object.values(store.buckets || {}).reduce((s, v) => s + v, 0) +
    Object.values(store.fundAllocations || {}).reduce((s, v) => s + v, 0);

  // --- Step 3 Handlers: Instruments ---
  const handleAssetChange = (key, rawNewVal) => {
    const targetVal = Math.max(0, Math.min(100, Number(rawNewVal) || 0));
    const currentVal = store.instruments[key] || 0;
    const delta = targetVal - currentVal;
    if (delta === 0 || key === 'savings') return;

    const currentSavings = store.instruments.savings || 0;
    if (delta > 0) {
      const actualDelta = Math.min(delta, currentSavings);
      if (actualDelta <= 0) return;
      store.updateInstrumentAllocations({
        ...store.instruments,
        [key]: currentVal + actualDelta,
        savings: currentSavings - actualDelta,
      });
    } else {
      const freedAmount = Math.abs(delta);
      store.updateInstrumentAllocations({
        ...store.instruments,
        [key]: currentVal - freedAmount,
        savings: currentSavings + freedAmount,
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg text-text-primary p-4 pb-28">
      <div className="max-w-md mx-auto mt-2">
        {/* Step Indicator Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-accent-action-dark">
              Financial Planning Phase · Step {currentStepIndex + 1} of {STEPS.length}
            </span>
            <span className="text-xs font-bold text-text-muted">
              {currentStep.icon} {currentStep.title}
            </span>
          </div>
          <ProgressBar value={((currentStepIndex + 1) / STEPS.length) * 100} color="bg-accent-action" />
        </div>

        {/* Dynamic Wizard Steps */}
        <AnimatePresence mode="wait">
          {currentStep.id === 'goals' && (
            <motion.div
              key="step-goals"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              {/* Character Context Banner */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-100 p-3.5">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">👤</span>
                  <div>
                    <h3 className="text-xs font-black text-text-primary">
                      {player.characterName || 'Rahul Sharma'} (Age {player.characterAge || 22})
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      Starting in {cityMeta.name} with {formatCurrency(player.startingSalary)}/mo salary & {formatCurrency(player.startingSavings)} savings.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Seed Goals (Locked) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
                    Character Life Goals (Commitments)
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    🔒 Fixed Dreams
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mb-3 leading-snug">
                  These represent your core life milestones. You cannot remove them, but you can adjust targets.
                </p>

                <div className="space-y-2.5">
                  {store.goals.map(goal => (
                    <div
                      key={goal.id}
                      className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-text-primary">{goal.name}</h4>
                            <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">🔒 Locked</span>
                          </div>
                          <span className="text-[10px] text-text-muted block mt-0.5">
                            Inflation: ~{(goal.inflationRate * 100).toFixed(0)}%/yr
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-text-primary block">
                            {formatCurrency(goal.currentTarget)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Adjust Buttons */}
                      <div className="flex space-x-2 pt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleUpdateGoalAmount(goal.id, goal.currentTarget - 100000)}
                          className="flex-1 py-1 text-[10px] font-bold bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 text-stone-600 transition"
                        >
                          -₹1.0L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateGoalAmount(goal.id, goal.currentTarget + 100000)}
                          className="flex-1 py-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700 transition"
                        >
                          +₹1.0L
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Funds Section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">
                    Safety & Defense Funds (Reserves)
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Defensive Moat
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mb-3 leading-snug">
                  Unlike goals you spend, <strong>Funds</strong> protect you when life shocks hit. Skip them, and emergencies will force debt!
                </p>

                {/* Active Created Funds */}
                {store.funds.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {store.funds.map(fund => (
                      <div key={fund.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">{fund.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-emerald-950 block">{fund.name}</span>
                            <span className="text-[10px] text-emerald-800">Target: {formatCurrency(fund.targetAmount)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => store.deleteFund(fund.id)}
                          className="text-[11px] text-red-500 hover:text-red-700 font-bold px-2 py-1"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preset Fund Creation Buttons */}
                <div className="grid grid-cols-1 gap-2">
                  {FUND_PRESETS.map(preset => {
                    const alreadyCreated = store.funds.some(f => f.type === preset.type);
                    return (
                      <button
                        key={preset.type}
                        type="button"
                        disabled={alreadyCreated}
                        onClick={() => handleCreatePresetFund(preset)}
                        className={`p-2.5 text-left rounded-xl border transition flex items-start space-x-2.5 ${
                          alreadyCreated
                            ? 'bg-stone-50 border-stone-200 opacity-60'
                            : 'bg-white hover:border-emerald-400 border-stone-200 shadow-xs'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{preset.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-text-primary">{preset.name}</span>
                            <span className="text-[10px] font-bold text-emerald-700">
                              {alreadyCreated ? '✓ Created' : '+ Add Fund'}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-muted leading-relaxed block mt-0.5">
                            {preset.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep.id === 'allocation' && (
            <motion.div
              key="step-allocation"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              {/* Cashflow Summary Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-3.5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Inflow</span>
                    <span className="text-xs font-bold text-text-primary">+{formatCurrency(totalIncome)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Bills & Debt</span>
                    <span className="text-xs font-bold text-red-600">-{formatCurrency(totalDeductions)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase font-extrabold block">Net Surplus</span>
                    <span className="text-sm font-black text-emerald-700">+{formatCurrency(monthlySurplus)}/mo</span>
                  </div>
                </div>
              </Card>

              {/* Quick Presets */}
              <div className="flex justify-between items-center bg-stone-100/80 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-text-muted uppercase">Quick Presets:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleSetZeroAllocations}
                    className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 transition"
                    title="Leave 100% of surplus unassigned to flow into cash savings"
                  >
                    100% Cash (0% Assigned)
                  </button>
                  <button
                    type="button"
                    onClick={handleBalancedSetupPreset}
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-200 transition"
                  >
                    50/25 Balanced
                  </button>
                </div>
              </div>

              {/* Allocation Guidance */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Distribute Monthly Surplus
                </span>
                <span className={`text-xs font-black ${totalAllocatedPct > 100 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {totalAllocatedPct > 100
                    ? `⚠️ Over-allocated: ${totalAllocatedPct}% / 100%`
                    : `Allocated: ${totalAllocatedPct}% (Unassigned: ${100 - totalAllocatedPct}%)`}
                </span>
              </div>

              {/* Active Goals Allocation Sliders */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  Goal Buckets (Wealth Goals)
                </span>
                {activeGoals.map(goal => {
                  const pct = store.buckets[goal.id] || 0;
                  const rupees = Math.round((pct / 100) * monthlySurplus);
                  return (
                    <div key={goal.id} className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-text-primary truncate">{goal.name}</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-text-primary">{pct}%</span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            ({formatCurrency(rupees)}/mo)
                          </span>
                          {pct > 0 && (
                            <button
                              type="button"
                              onClick={() => handleUpdateBucketPercent(goal.id, 0)}
                              className="text-[10px] font-bold text-gray-400 hover:text-red-600 px-1 py-0.5 rounded hover:bg-gray-100 transition"
                              title="Unassign this goal (set to 0%)"
                            >
                              0%
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={pct}
                        onChange={(e) => handleUpdateBucketPercent(goal.id, e.target.value)}
                        className="w-full accent-blue-600 h-1.5 bg-stone-100 rounded-lg cursor-pointer"
                      />
                    </div>
                  );
                })}

                {/* Safety Funds Allocation Sliders */}
                {activeFunds.length > 0 && (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block pt-2">
                      Safety Funds (Buffer & Reserves)
                    </span>
                    {activeFunds.map(fund => {
                      const pct = store.fundAllocations[fund.id] || 0;
                      const rupees = Math.round((pct / 100) * monthlySurplus);
                      return (
                        <div key={fund.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 shadow-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-emerald-950 truncate">
                              {fund.icon} {fund.name}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-black text-emerald-900">{pct}%</span>
                              <span className="text-[10px] text-emerald-700 font-bold">
                                ({formatCurrency(rupees)}/mo)
                              </span>
                              {pct > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateFundPercent(fund.id, 0)}
                                  className="text-[10px] font-bold text-gray-400 hover:text-red-600 px-1 py-0.5 rounded hover:bg-gray-100 transition"
                                  title="Unassign this fund (set to 0%)"
                                >
                                  0%
                                </button>
                              )}
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={pct}
                            onChange={(e) => handleUpdateFundPercent(fund.id, e.target.value)}
                            className="w-full accent-emerald-600 h-1.5 bg-emerald-100 rounded-lg cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {totalAllocatedPct <= 100 && (
                <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs border border-blue-100 leading-snug">
                  💡 <strong>Unassigned {100 - totalAllocatedPct}%</strong> (+{formatCurrency(Math.round(((100 - totalAllocatedPct) / 100) * monthlySurplus))}/mo) stays as unallocated liquid savings buffer in your compounding cash pool. You do not need to assign 100%!
                </div>
              )}
            </motion.div>
          )}

          {currentStep.id === 'investments' && (
            <motion.div
              key="step-investments"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              <Card className="p-3.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-teal-50 border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase block">
                      Initial Liquid Savings Buffer
                    </span>
                    <span className="text-xl font-black text-text-primary">
                      {formatCurrency(player.startingSavings)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-text-muted uppercase block">
                      Expected Portfolio Return
                    </span>
                    <span className="text-sm font-black text-emerald-700">
                      ~{(getBlendedReturn(store.instruments) * 100).toFixed(1)}% p.a.
                    </span>
                  </div>
                </div>
              </Card>

              <div>
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                  Asset Allocation Strategy (100% Total)
                </h3>
                <p className="text-[11px] text-text-muted mb-3">
                  Increasing investments automatically draws from your instant savings buffer. Total always equals 100%.
                </p>

                <div className="space-y-2.5">
                  {[
                    { key: 'savings', name: 'Savings Account (Liquid Buffer)', icon: '🏦', return: '3.5% p.a.', risk: 'Instant Liquidity' },
                    { key: 'fd', name: 'Fixed Deposits (Locked)', icon: '🔒', return: '7.0% p.a.', risk: 'Guaranteed' },
                    { key: 'gold', name: 'Gold / Sovereign Gold', icon: '🪙', return: '8.0% p.a.', risk: 'Inflation Hedge' },
                    { key: 'mf', name: 'Mutual Funds / Index SIP', icon: '📊', return: '11.5% p.a.', risk: 'Medium Risk' },
                    { key: 'stocks', name: 'Direct Equities / Stocks', icon: '📈', return: '15.0% p.a.', risk: 'High Volatility' },
                  ].map(item => {
                    const pct = store.instruments[item.key] || 0;
                    const val = Math.round((pct / 100) * player.startingSavings);
                    return (
                      <div key={item.key} className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs">
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-base">{item.icon}</span>
                              <span className="text-xs font-bold text-text-primary">{item.name}</span>
                            </div>
                            <span className="text-[10px] text-text-muted block mt-0.5">
                              Avg Return: {item.return} · {item.risk}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-text-primary">{pct}%</span>
                            <span className="text-[10px] text-text-muted block">({formatCurrency(val)})</span>
                          </div>
                        </div>

                        {item.key !== 'savings' && (
                          <div className="flex space-x-2 pt-1 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => handleAssetChange(item.key, pct - 10)}
                              className="flex-1 py-1 text-[10px] font-bold bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 text-stone-600 transition"
                            >
                              -10% to Cash
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAssetChange(item.key, pct + 10)}
                              className="flex-1 py-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700 transition"
                            >
                              +10% from Cash
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep.id === 'loans' && (
            <motion.div
              key="step-loans"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              {/* Existing Loans */}
              <Card className="p-3.5 border border-stone-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  Initial Debt Burden & EMIs
                </span>
                {store.loans.length > 0 ? (
                  store.loans.map(loan => (
                    <div key={loan.id} className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200 flex justify-between items-center mb-2">
                      <div>
                        <span className="text-xs font-bold text-rose-950 block">{loan.name}</span>
                        <span className="text-[10px] text-rose-800">Principal: {formatCurrency(loan.principal)} · {loan.rate}% p.a.</span>
                      </div>
                      <span className="text-xs font-black text-rose-700">{formatCurrency(loan.emi)}/mo</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <span className="text-xs font-bold text-emerald-900 block">✓ Zero Debt Starting Position!</span>
                    <span className="text-[10px] text-emerald-800">You begin without any existing personal or education loans.</span>
                  </div>
                )}
              </Card>

              {/* Future Specialized Loans */}
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                  Specialized Credit Instruments
                </span>
                <div className="space-y-2">
                  <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🏡</span>
                      <div>
                        <span className="text-xs font-bold text-stone-700 block">Home Loan Mortgage (8.5% p.a.)</span>
                        <span className="text-[10px] text-stone-500">
                          Accessible during the game inside the Goals tab when purchasing real estate.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🚗</span>
                      <div>
                        <span className="text-xs font-bold text-stone-700 block">Auto Financing Loan (9.5% p.a.)</span>
                        <span className="text-[10px] text-stone-500">
                          Accessible during the game when achieving your Car goal with down-payment.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep.id === 'insurance' && (
            <motion.div
              key="step-insurance"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Day 1 Risk Protection
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Defensive Shield
                </span>
              </div>

              {/* Health Insurance Toggle */}
              <div
                onClick={() => {
                  if (store.hasHealthInsurance) {
                    useGameStore.setState({ hasHealthInsurance: false, healthInsuranceCost: 0 });
                  } else {
                    store.buyInsurance('health');
                  }
                }}
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex justify-between items-center ${
                  store.hasHealthInsurance ? 'border-green-400 bg-green-50/40 shadow-xs' : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Comprehensive Health Insurance</h4>
                    <span className="text-[10px] text-text-muted block">₹750/mo · Shields against hospitalizations</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${store.hasHealthInsurance ? 'bg-green-600 border-green-600 text-white text-xs font-bold' : 'border-gray-300'}`}>
                  {store.hasHealthInsurance ? '✓' : ''}
                </div>
              </div>

              {/* Vehicle Insurance */}
              {player.carOwned ? (
                <div
                  onClick={() => {
                    if (store.hasVehicleInsurance) {
                      useGameStore.setState({ hasVehicleInsurance: false, vehicleInsuranceCost: 0 });
                    } else {
                      store.buyInsurance('vehicle');
                    }
                  }}
                  className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex justify-between items-center ${
                    store.hasVehicleInsurance ? 'border-green-400 bg-green-50/40 shadow-xs' : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">Mandatory Vehicle Collision Cover</h4>
                      <span className="text-[10px] text-text-muted block">₹350/mo · 90% repair cost coverage</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${store.hasVehicleInsurance ? 'bg-green-600 border-green-600 text-white text-xs font-bold' : 'border-gray-300'}`}>
                    {store.hasVehicleInsurance ? '✓' : ''}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200 opacity-70 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl grayscale">🚗</span>
                    <span className="text-xs font-bold text-stone-500">Auto Insurance (Locked · No vehicle owned)</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold">🔒 Locked</span>
                </div>
              )}

              {/* Family Policies (Future) */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Family Coverage Policies
                </span>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex justify-between items-center opacity-75">
                  <span className="text-xs text-stone-600 font-medium">💍 Spouse Floater Policy</span>
                  <span className="text-[10px] text-stone-400 font-bold">Unlocks at Marriage</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex justify-between items-center opacity-75">
                  <span className="text-xs text-stone-600 font-medium">👴 Senior Citizen Parent Care</span>
                  <span className="text-[10px] text-stone-500 font-bold">Recommended: Medical Reserve</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex justify-between items-center opacity-75">
                  <span className="text-xs text-stone-600 font-medium">👶 Child Pediatric Plan</span>
                  <span className="text-[10px] text-stone-400 font-bold">Unlocks post-family</span>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep.id === 'expenses' && (
            <motion.div
              key="step-expenses"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              {/* Career & Ceiling Hub */}
              <Card className="p-3.5 border border-blue-100 bg-blue-50/30">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      Career Progression Trajectory
                    </span>
                    <h4 className="text-xs font-black text-text-primary mt-0.5">
                      {getCareerRole(0, player.startingSalary)}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted uppercase block">City Ceiling</span>
                    <span className="text-xs font-black text-text-primary">
                      {formatCurrency(CITY_TIER_SALARY_CAPS[cityTier])}/mo
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  Corporate base pay is bounded by Tier {cityTier} limits ({formatCurrency(CITY_TIER_SALARY_CAPS[cityTier])}/mo). Wealth beyond this comes from equity compounding or venture profits.
                </p>
              </Card>

              {/* Expense Levers Preview */}
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                  Tactical Financial Levers (Available In-Game)
                </span>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-text-primary block">Austerity Consumption Mode</span>
                      <span className="text-[10px] text-text-muted">Instantly cuts 25% of living costs during cashflow distress</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Ready</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-text-primary block">Rental Housing Downsizing</span>
                      <span className="text-[10px] text-text-muted">Move to budget housing to save ~35% on rent</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Ready</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-text-primary block">Resign from 9-to-5 Job</span>
                      <span className="text-[10px] text-text-muted">Quit corporate work once business/rental covers ≥80% expenses</span>
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">🔒 FI Only</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep.id === 'review' && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4 text-center"
            >
              <div className="py-2">
                <span className="text-4xl block mb-2">📜</span>
                <h3 className="text-lg font-black text-text-primary">
                  Your 20-Year Financial Blueprint
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
                  You are prepared to navigate ages 22 through 42 as <strong>{player.characterName}</strong>.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3 text-left">
                <div className="flex justify-between items-center text-xs py-1 border-b border-stone-100">
                  <span className="text-text-muted">Net Monthly Surplus:</span>
                  <span className="font-bold text-emerald-700">+{formatCurrency(monthlySurplus)}/mo</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-stone-100">
                  <span className="text-text-muted">Life Goals Committed:</span>
                  <span className="font-bold text-text-primary">{store.goals.length} Major Milestones</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-stone-100">
                  <span className="text-text-muted">Safety Funds Active:</span>
                  <span className="font-bold text-emerald-700">{store.funds.length} Reserves Created</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-stone-100">
                  <span className="text-text-muted">Blended Expected Return:</span>
                  <span className="font-bold text-blue-700">~{(getBlendedReturn(store.instruments) * 100).toFixed(1)}% p.a.</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-text-muted">Defensive Health Insurance:</span>
                  <span className={`font-bold ${store.hasHealthInsurance ? 'text-green-700' : 'text-amber-700'}`}>
                    {store.hasHealthInsurance ? '✓ Protected' : '⚠️ Uninsured'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed px-4">
                During the simulation, you will encounter economic shocks, career opportunities, and life choices. Your plan will be tested!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Wizard Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30">
        <div className="max-w-md mx-auto flex space-x-2.5">
          {currentStepIndex > 0 && (
            <Button
              size="lg"
              variant="secondary"
              className="flex-1 text-xs font-bold"
              onClick={prevStep}
            >
              ← Back
            </Button>
          )}

          {currentStepIndex < STEPS.length - 1 ? (
            <Button
              size="lg"
              disabled={currentStep.id === 'allocation' && totalAllocatedPct > 100}
              className="flex-1 text-xs font-black shadow-md"
              onClick={nextStep}
            >
              {currentStep.id === 'allocation' && totalAllocatedPct > 100
                ? `Reduce Allocations (Over by ${totalAllocatedPct - 100}%)`
                : `Continue to ${STEPS[currentStepIndex + 1].title.split(' ')[0]} →`}
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              onClick={handleLaunchGame}
            >
              🚀 Launch 20-Year Simulation →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialSetup;

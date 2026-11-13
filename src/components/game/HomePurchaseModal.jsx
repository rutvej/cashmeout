import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';
import {
  calculateMortgageDetails,
  getPropertyTierData,
  getDownsizedTierData,
  MORTGAGE_ANNUAL_RATE,
  DEFAULT_MORTGAGE_TENURE_MONTHS,
} from '../../engine/realEstateEngine.js';

export default function HomePurchaseModal({ goal: propGoal, isEarly = false }) {
  const {
    character,
    goals,
    simulation,
    finalizeHomePurchase,
    resolveUnderfundedHome,
    closeModal,
  } = useGameStore();

  const goal = propGoal || goals.find((g) => g.id === 'goal_home');
  const cityTier = character?.cityTier || 'tier1';
  const tierData = getPropertyTierData(cityTier);
  const downsizedData = getDownsizedTierData(cityTier);

  // Property & Down Payment baseline
  const basePropertyCost = goal?.propertyCost || tierData.propertyCost || 7500000;
  const currentSaved = goal?.currentAmount || 0;
  const targetDP = goal?.targetAmount || Math.round(basePropertyCost * 0.20);
  const minRequiredDP = Math.round(basePropertyCost * 0.20);
  const isFunded = currentSaved >= minRequiredDP;
  const shortfall = Math.max(0, minRequiredDP - currentSaved);

  // Buffer check for dipping into other funds
  const liquidCashAvailable = character?.liquidCash || 0;
  const emergencyGoal = (goals || []).find((g) => g.id === 'goal_emergency');
  const emergencyAvailable = emergencyGoal?.currentAmount || 0;
  const totalReservesAvailable = liquidCashAvailable + emergencyAvailable;
  const canCoverShortfall = totalReservesAvailable >= shortfall;

  // Selected property (standard vs downsized)
  const [selectedPropertyTier, setSelectedPropertyTier] = useState('standard');
  const activePropertyCost = selectedPropertyTier === 'downsized'
    ? downsizedData.propertyCost
    : basePropertyCost;
  const activeMinDP = Math.round(activePropertyCost * 0.20);

  // Underfunded resolution mode: 'postpone' | 'dip_funds' | 'downsize'
  const [underfundedChoice, setUnderfundedChoice] = useState('postpone');
  const [postponeYears, setPostponeYears] = useState(2);

  // Initial slider percent calculation
  const defaultSliderPct = Math.max(
    20,
    Math.min(50, Math.round((currentSaved / activePropertyCost) * 100))
  );
  const [downPaymentPct, setDownPaymentPct] = useState(defaultSliderPct);

  // Recalculate dynamic mortgage metrics
  const activeDownPayment = Math.round(activePropertyCost * (downPaymentPct / 100));
  const mortgageMetrics = calculateMortgageDetails({
    propertyCost: activePropertyCost,
    downPayment: activeDownPayment,
    tenureMonths: DEFAULT_MORTGAGE_TENURE_MONTHS,
    annualRate: MORTGAGE_ANNUAL_RATE,
  });

  // Outflow delta comparison
  const currentRent = character?.expenses?.rent || 0;
  const homeMaintenance = 5500;
  const netMonthlyDelta = mortgageMetrics.emi + homeMaintenance - currentRent;

  const handleFinalize = () => {
    if (isFunded || selectedPropertyTier === 'downsized') {
      finalizeHomePurchase({
        goalId: goal?.id || 'goal_home',
        downPaymentAmount: activeDownPayment,
        propertyCost: activePropertyCost,
        tenureMonths: DEFAULT_MORTGAGE_TENURE_MONTHS,
      });
    } else {
      if (underfundedChoice === 'postpone') {
        resolveUnderfundedHome({
          goalId: goal?.id || 'goal_home',
          resolution: 'postpone',
          postponeYears,
        });
      } else if (underfundedChoice === 'dip_funds') {
        resolveUnderfundedHome({
          goalId: goal?.id || 'goal_home',
          resolution: 'dip_funds',
        });
      } else if (underfundedChoice === 'downsize') {
        resolveUnderfundedHome({
          goalId: goal?.id || 'goal_home',
          resolution: 'downsize',
          downsizedPropertyCost: downsizedData.propertyCost,
        });
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 text-left space-y-4 bg-white text-slate-900 border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a]"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
          <div className="w-12 h-12 bg-amber-100 border-2 border-slate-900 flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#0f172a]">
            🏡
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {isEarly ? 'Early Milestone Unlock' : 'Life Milestone Acquisition'}
              </span>
              {isEarly && (
                <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 bg-emerald-100 border border-emerald-700 text-emerald-800">
                  Early Buyer Advantage
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 truncate">
              Real Estate Financing &amp; Purchase
            </h2>
            <p className="text-xs text-slate-600 font-mono">
              Target Age {goal?.targetAge || simulation.currentAge} · {tierData.label}
            </p>
          </div>
        </div>

        {/* Property Valuation Hero Card */}
        <div className="p-3 bg-slate-50 border-2 border-slate-900 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 font-bold uppercase text-[10px]">Property Valuation (V_home)</span>
            <span className="text-slate-900 font-black text-sm">{formatINR(activePropertyCost)}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600">Current Accumulated Down Payment:</span>
            <span className="text-emerald-700 font-black">{formatINR(currentSaved)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span>City Location:</span>
            <span>{character?.city || 'Metro City'} ({cityTier.toUpperCase()})</span>
          </div>
        </div>

        {/* ── UNDERFUNDED DILEMMA SECTION (If not funded & not early) ── */}
        {!isFunded && !isEarly && (
          <div className="p-3.5 bg-amber-50 border-2 border-amber-500 space-y-3 font-mono">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <span>⚠️</span>
              <span>Down Payment Shortfall: {formatINR(shortfall)}</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              You reached your planned purchase age of {goal?.targetAge}, but accumulated {formatINR(currentSaved)} of the required {formatINR(minRequiredDP)} (20% minimum). Choose how to proceed:
            </p>

            <div className="space-y-2 pt-1">
              {/* Choice 1: Postpone */}
              <label
                onClick={() => {
                  setUnderfundedChoice('postpone');
                  setSelectedPropertyTier('standard');
                }}
                className={`block p-2.5 border-2 cursor-pointer transition-all ${
                  underfundedChoice === 'postpone'
                    ? 'border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a]'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="underfundedChoice"
                    checked={underfundedChoice === 'postpone'}
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">Decision 1: Postpone Purchase (Recommended)</div>
                    <div className="text-[10px] text-slate-600">
                      Delay home purchase by 2–3 years to continue saving down payment via regular monthly SIP.
                    </div>
                    {underfundedChoice === 'postpone' && (
                      <div className="pt-2 flex items-center gap-2 text-[11px]">
                        <span>Delay by:</span>
                        {[2, 3].map((yrs) => (
                          <button
                            key={yrs}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostponeYears(yrs);
                            }}
                            className={`px-2 py-0.5 text-[10px] font-bold border ${
                              postponeYears === yrs
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-slate-100 text-slate-800 border-slate-400'
                            }`}
                          >
                            +{yrs} Years (Age {(goal?.targetAge || simulation.currentAge) + yrs})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {/* Choice 2: Dip into Other Funds */}
              <label
                onClick={() => {
                  if (canCoverShortfall) {
                    setUnderfundedChoice('dip_funds');
                    setSelectedPropertyTier('standard');
                  }
                }}
                className={`block p-2.5 border-2 transition-all ${
                  canCoverShortfall ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                } ${
                  underfundedChoice === 'dip_funds'
                    ? 'border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a]'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="underfundedChoice"
                    checked={underfundedChoice === 'dip_funds'}
                    disabled={!canCoverShortfall}
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">Decision 2: Dip into Other Funds</div>
                    <div className="text-[10px] text-slate-600">
                      Transfer shortfall of {formatINR(shortfall)} from Bank Cash ({formatINR(liquidCashAvailable)}) and Emergency Fund ({formatINR(emergencyAvailable)}).
                    </div>
                    {!canCoverShortfall && (
                      <div className="text-[10px] text-rose-700 font-bold">
                        Insufficient liquid + emergency reserves ({formatINR(totalReservesAvailable)}) to bridge shortfall.
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {/* Choice 3: Downsize Budget */}
              <label
                onClick={() => {
                  setUnderfundedChoice('downsize');
                  setSelectedPropertyTier('downsized');
                  setDownPaymentPct(20);
                }}
                className={`block p-2.5 border-2 cursor-pointer transition-all ${
                  underfundedChoice === 'downsize'
                    ? 'border-slate-900 bg-white shadow-[3px_3px_0px_#0f172a]'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="underfundedChoice"
                    checked={underfundedChoice === 'downsize'}
                    onChange={() => {}}
                    className="mt-0.5"
                  />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-900">
                      Decision 3: Downsize Property ({downsizedData.label})
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Purchase a compact 2BHK/starter home for {formatINR(downsizedData.propertyCost)}. 20% down payment is only {formatINR(downsizedData.targetDownPayment)}!
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ── INTERACTIVE FINANCING CALCULATOR ── */}
        {(isFunded || isEarly || underfundedChoice !== 'postpone') && (
          <div className="space-y-3.5 border-2 border-slate-900 p-3.5 bg-white shadow-[3px_3px_0px_#0f172a]">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                Down Payment Allocation Slider
              </span>
              <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 border border-indigo-500">
                {downPaymentPct}% ({formatINR(activeDownPayment)})
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="20"
                max="50"
                step="1"
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 border border-slate-900 rounded-none appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>20% (Minimum: {formatINR(Math.round(activePropertyCost * 0.20))})</span>
                <span>35% (Smart)</span>
                <span>50% (Max: {formatINR(Math.round(activePropertyCost * 0.50))})</span>
              </div>
            </div>

            {/* Live Recalculation Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2.5 bg-slate-50 border border-slate-900">
                <span className="text-[9px] uppercase text-slate-500 block">Mortgage Loan (80%–50%)</span>
                <span className="text-sm font-black text-slate-900">{formatINR(mortgageMetrics.loanPrincipal)}</span>
                <span className="text-[10px] text-slate-500 block">20 Yrs @ 8.5% p.a.</span>
              </div>

              <div className="p-2.5 bg-indigo-50 border border-indigo-900">
                <span className="text-[9px] uppercase text-indigo-700 block font-bold">Monthly Mortgage EMI</span>
                <span className="text-sm font-black text-indigo-900">{formatINR(mortgageMetrics.emi)}/mo</span>
                {mortgageMetrics.monthlyEMISaved > 0 && (
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    Saves {formatINR(mortgageMetrics.monthlyEMISaved)}/mo!
                  </span>
                )}
              </div>
            </div>

            {/* 20-Year Lifelong Interest Saved Highlight Card */}
            <div className="p-2.5 bg-emerald-50 border-2 border-emerald-600 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  Total 20-Year Interest Saved vs 20% Baseline:
                </span>
                <span className="text-base font-black text-emerald-900">
                  {mortgageMetrics.totalInterestSaved > 0
                    ? `+${formatINR(mortgageMetrics.totalInterestSaved)} Saved!`
                    : '₹0 (Standard 20% baseline)'}
                </span>
              </div>
              <span className="text-2xl">💰</span>
            </div>

            {/* Monthly Cash Flow Ledger Delta */}
            <div className="p-2.5 bg-slate-50 border border-slate-900 text-[11px] font-mono space-y-1">
              <span className="text-[9px] font-bold uppercase text-slate-500 block">Monthly Outflow Impact</span>
              <div className="flex justify-between text-slate-600">
                <span>• Eliminated Rent:</span>
                <span className="text-emerald-700 font-bold">-{formatINR(currentRent)}/mo</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Property Maintenance:</span>
                <span className="text-slate-800 font-bold">+{formatINR(homeMaintenance)}/mo</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Mortgage EMI:</span>
                <span className="text-indigo-800 font-bold">+{formatINR(mortgageMetrics.emi)}/mo</span>
              </div>
              <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-slate-900">
                <span>Net Monthly Outflow Delta:</span>
                <span className={netMonthlyDelta > 0 ? 'text-amber-800' : 'text-emerald-800'}>
                  {netMonthlyDelta > 0 ? `+${formatINR(netMonthlyDelta)}/mo` : `${formatINR(netMonthlyDelta)}/mo`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="pt-2 space-y-2">
          {!isFunded && !isEarly && underfundedChoice === 'postpone' ? (
            <button
              type="button"
              onClick={handleFinalize}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all"
            >
              Postpone Purchase by {postponeYears} Years ⏳
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalize}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer transition-all"
            >
              Finalize Home Purchase &amp; Mortgage ➔
            </button>
          )}

          <button
            type="button"
            onClick={closeModal}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-900 text-slate-700 font-mono font-bold text-xs cursor-pointer transition-colors"
          >
            Review Later / Dismiss
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

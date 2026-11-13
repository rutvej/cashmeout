import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

const SHOCK_META = {
  shock_medical: {
    icon: '🏥',
    iconBg: 'bg-rose-100',
    label: 'MEDICAL EMERGENCY',
    labelColor: 'text-rose-800',
    borderColor: 'border-rose-600',
    accentBg: 'bg-rose-50',
  },
  shock_job_loss: {
    icon: '⚡',
    iconBg: 'bg-amber-100',
    label: 'COMPANY LAYOFF',
    labelColor: 'text-amber-800',
    borderColor: 'border-amber-500',
    accentBg: 'bg-amber-50',
  },
  shock_home_repair: {
    icon: '🔧',
    iconBg: 'bg-blue-100',
    label: 'CRITICAL BREAKDOWN',
    labelColor: 'text-blue-800',
    borderColor: 'border-blue-500',
    accentBg: 'bg-blue-50',
  },
  shock_landlord_eviction: {
    icon: '🚨',
    iconBg: 'bg-rose-100',
    label: 'LANDLORD EVICTION & RENT SPIKE',
    labelColor: 'text-rose-800',
    borderColor: 'border-rose-600',
    accentBg: 'bg-rose-50',
  },
};

function BarMeter({ value, max, color = 'bg-emerald-500' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-2.5 bg-slate-100 border border-slate-900 overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ShockModal({ data, onReviewAllocations }) {
  const {
    acknowledgeShock,
    resolveHousingEvictionShock,
    pause,
    goals,
    character,
  } = useGameStore();
  const meta = SHOCK_META[data?.shockId] || SHOCK_META.shock_home_repair;

  const handleReview = () => {
    acknowledgeShock();
    pause();
    if (onReviewAllocations) {
      onReviewAllocations();
    }
  };

  const isJobLoss = data?.shockId === 'shock_job_loss';
  const isMedical = data?.shockId === 'shock_medical';
  const isEviction = data?.shockId === 'shock_landlord_eviction';

  const homeGoal = (goals || []).find((g) => g.id === 'goal_home');
  const propertyCost = homeGoal?.propertyCost || 7500000;
  const targetDP = homeGoal?.targetAmount || Math.round(propertyCost * 0.20);
  const currentSavedDP = homeGoal?.currentAmount || 0;
  const savedDPPct = targetDP > 0 ? Math.round((currentSavedDP / targetDP) * 100) : 0;
  const isEmergencyBuyEligible = savedDPPct >= 70;
  const bridgeCashNeeded = Math.max(0, targetDP - currentSavedDP);

  const emergencyTarget = data?.emergencyFundTarget || 0;
  const emergencyBefore = data?.emergencyFundBefore ?? (data?.drawnFromEmergency !== undefined
    ? (data.drawnFromEmergency + (emergencyTarget - data.drawnFromEmergency))
    : 0);
  // For non-job-loss shocks: emergency AFTER = before minus drawn
  const emergencyAfter = isJobLoss
    ? emergencyBefore
    : Math.max(0, emergencyBefore - (data?.drawnFromEmergency || 0));

  const displayEmergencyMax = Math.max(emergencyTarget, emergencyBefore, 1);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className={`card-neopop max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white text-slate-900 border-2 ${meta.borderColor}`}
        {...sheetSlideUp}
      >
        {/* ── Warning Header Banner ── */}
        <div className={`${meta.accentBg} border-b-2 ${meta.borderColor} px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3`}>
          <div className={`w-12 h-12 sm:w-14 sm:h-14 ${meta.iconBg} border-2 border-slate-900 flex items-center justify-center text-2xl sm:text-3xl shrink-0`}>
            {meta.icon}
          </div>
          <div className="min-w-0">
            <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest block ${meta.labelColor}`}>
              Life Shock Event · {meta.label}
            </span>
            <h2 className="font-display text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
              {data?.title}
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Description */}
          <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-body">
            {data?.description}
          </p>

          {isEviction ? (
            /* ── Housing Eviction Shock Choices ── */
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-rose-50 border-2 border-rose-500 space-y-1 text-xs">
                <span className="text-[10px] font-black uppercase text-rose-800 block">
                  🚨 Eviction &amp; Steep Rent Spike
                </span>
                <p className="text-slate-800 leading-snug">
                  Your landlord is selling the flat. You must vacate within 30 days or relocate to a new rental at higher market rates!
                </p>
              </div>

              {/* Choice 1: Emergency Home Purchase */}
              <div
                className={`p-3.5 border-2 transition-all ${
                  isEmergencyBuyEligible
                    ? 'border-emerald-600 bg-emerald-50 hover:shadow-[3px_3px_0px_#059669]'
                    : 'border-slate-300 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-emerald-200 border border-emerald-700 text-emerald-900">
                    Choice 1 · Emergency Buy
                  </span>
                  <span className="text-xs font-bold text-emerald-900">
                    {savedDPPct}% DP Ready
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-snug">
                  Execute emergency home purchase for {formatINR(propertyCost)} flat. Uses your accumulated {formatINR(currentSavedDP)}, bridges shortfall ({formatINR(bridgeCashNeeded)}) from liquid cash, takes 80% mortgage, and eliminates rent immediately!
                </p>
                {isEmergencyBuyEligible ? (
                  <button
                    type="button"
                    onClick={() => resolveHousingEvictionShock({ decision: 'emergency_buy' })}
                    className="w-full mt-2.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-xs uppercase tracking-wider border border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                  >
                    Choice 1: Emergency Home Purchase 🏠
                  </button>
                ) : (
                  <div className="mt-2 p-1.5 bg-slate-200 border border-slate-400 text-[10px] text-slate-700 font-bold">
                    🔒 Locked: Requires at least 70% down payment saved (currently {savedDPPct}%).
                  </div>
                )}
              </div>

              {/* Choice 2: Relocate to New Rental */}
              <div className="p-3.5 border-2 border-slate-900 bg-white space-y-2 hover:shadow-[3px_3px_0px_#0f172a] transition-all">
                <div className="flex justify-between items-center pb-1">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-slate-100 border border-slate-700 text-slate-900">
                    Choice 2 · Relocate
                  </span>
                  <span className="text-xs font-bold text-slate-900">New Rental</span>
                </div>
                <p className="text-xs text-slate-800 leading-snug">
                  Move to a new rental apartment. Incurs a -₹60,000 moving, brokerage &amp; security deposit hit, and permanently raises monthly fixed rent by +₹3,000/month.
                </p>
                <div className="text-[10px] text-slate-600 space-y-0.5 pt-0.5">
                  <div>• One-time moving fee: -₹60,000 (from liquid/emergency)</div>
                  <div>• Ongoing market rent hike: +₹3,000/mo</div>
                </div>
                <button
                  type="button"
                  onClick={() => resolveHousingEvictionShock({ decision: 'relocate' })}
                  className="w-full mt-2.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs uppercase tracking-wider border border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                >
                  Choice 2: Relocate to New Rental (-₹60k &amp; +₹3k/mo) 🚚
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── Damage Assessment Card ── */}
              <div className="p-3 sm:p-4 bg-slate-50 border-2 border-slate-900 space-y-2 font-mono text-xs">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Damage Assessment
            </span>

            {isJobLoss ? (
              <>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-sans">Duration</span>
                  <span className="font-black text-amber-700">{data?.unemploymentDuration} months at ₹0/mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-sans">Severance Credited</span>
                  <span className="font-black text-emerald-700">+{formatINR(data?.severancePaid)}</span>
                </div>
                <div className="pt-1.5 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 font-sans">Income Loss (est.)</span>
                  <span className="font-black text-rose-700 text-sm">
                    −{formatINR(data?.grossAmount)}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug pt-1">
                  Your fixed expenses and EMIs continue deducting from liquid cash and emergency fund each month until you're rehired.
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-sans">Gross Invoice</span>
                  <span className="font-bold text-slate-800">{formatINR(data?.grossAmount)}</span>
                </div>
                {isMedical && data?.usedInsurance && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-emerald-800 font-sans font-bold flex items-center gap-1">
                      🛡️ Insurance Covered
                    </span>
                    <span className="font-black text-emerald-700">−{formatINR(data?.insuranceCoveredAmount)}</span>
                  </div>
                )}
                {isMedical && !data?.usedInsurance && (
                  <div className="flex justify-between py-1 border-b border-slate-200 text-rose-600">
                    <span className="font-sans font-bold">⚠️ No Health Insurance</span>
                    <span className="font-black">Full bill applies</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-sans">Drawn from Bank Cash</span>
                  <span className="font-bold text-slate-700">−{formatINR(data?.drawnFromCash)}</span>
                </div>
                {(data?.drawnFromEmergency || 0) > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-amber-700 font-sans font-bold">Drawn from Emergency Fund</span>
                    <span className="font-black text-amber-700">−{formatINR(data?.drawnFromEmergency)}</span>
                  </div>
                )}
                {(data?.unfundedDeficit || 0) > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-rose-700 font-sans font-bold">⚠️ Unfunded Deficit</span>
                    <span className="font-black text-rose-700">−{formatINR(data?.unfundedDeficit)}</span>
                  </div>
                )}
                <div className="pt-2 flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 font-sans">Net Out-of-Pocket</span>
                  <span className="font-black text-rose-700 text-sm">{formatINR(data?.netOutflow)}</span>
                </div>
                {isMedical && data?.usedInsurance && (
                  <p className="text-[10px] sm:text-[11px] text-emerald-800 font-bold leading-snug pt-1">
                    ✓ Health insurance saved you {formatINR(data?.insuranceCoveredAmount)}! You only paid the ₹5,000 deductible.
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Emergency Fund Status Bar ── */}
          {!isJobLoss && (
            <div className="space-y-2">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Emergency Fund Status
              </span>
              <div className="p-3 bg-slate-50 border-2 border-slate-900 space-y-2">
                <div className="flex justify-between text-[10px] sm:text-xs font-mono font-bold">
                  <span className="text-slate-600">Before shock</span>
                  <span className="text-slate-800">{formatINR(emergencyBefore)}</span>
                </div>
                <BarMeter
                  value={emergencyBefore}
                  max={displayEmergencyMax}
                  color="bg-slate-400"
                />
                <div className="flex justify-between text-[10px] sm:text-xs font-mono font-bold pt-1">
                  <span className="text-slate-600">After shock</span>
                  <span className={emergencyAfter < emergencyTarget ? 'text-amber-700' : 'text-emerald-700'}>
                    {formatINR(emergencyAfter)}
                  </span>
                </div>
                <BarMeter
                  value={emergencyAfter}
                  max={displayEmergencyMax}
                  color={emergencyAfter >= emergencyTarget ? 'bg-emerald-500' : 'bg-amber-500'}
                />
                {emergencyAfter < emergencyTarget && (
                  <p className="text-[10px] text-amber-800 font-bold pt-0.5">
                    ⚠️ Buffer below target — SIP will auto-refill before redirecting to other goals.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Job Loss Monthly Burn Preview ── */}
          {isJobLoss && (
            <div className="p-3 bg-amber-50 border-2 border-amber-500 space-y-1.5 text-xs font-mono">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block">Monthly Burn During Layoff</span>
              <p className="text-slate-700 leading-snug">
                Each month you remain unemployed, all fixed outflows will be drawn from your liquid bank cash, then emergency fund. SIPs are paused when cash runs dry.
              </p>
              <p className="font-bold text-amber-900 bg-amber-100 p-1.5 border border-amber-600">
                ⚠️ No automatic rehire: You must actively apply on the Job Market to restore your salary and stop fund burn!
              </p>
            </div>
          )}

              {/* ── Action Buttons ── */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={acknowledgeShock}
                  className="w-full py-3 sm:py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase btn-press cursor-pointer transition-colors"
                >
                  Acknowledge &amp; Mobilize Funds ➔
                </button>
                <button
                  type="button"
                  onClick={handleReview}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-slate-700 font-mono font-bold text-xs btn-press-sm transition-colors cursor-pointer"
                >
                  Review Allocations ⚙️
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  const { acknowledgeShock, pause } = useGameStore();
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
              <p className="font-bold text-amber-800">
                Rehire in: {data?.unemploymentDuration} months
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
        </div>
      </motion.div>
    </motion.div>
  );
}

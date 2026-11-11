import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR, formatPercent } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function OfferLetterModal({ offer, onAdjustAllocations }) {
  const { character, acceptJobOffer, declineJobOffer } = useGameStore();

  if (!offer || !character) return null;

  const currentTakeHome = character.employmentStatus === 'unemployed'
    ? 0
    : character.monthlyTakeHome;

  const hikeRupees = offer.monthlyTakeHome - currentTakeHome;
  const hikePercent = currentTakeHome > 0
    ? Math.round((hikeRupees / currentTakeHome) * 100)
    : 100;

  const isUnemployed = character.employmentStatus === 'unemployed';

  const handleAcceptAndAdjust = () => {
    acceptJobOffer(offer);
    if (onAdjustAllocations) {
      onAdjustAllocations();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      {...backdropFade}
    >
      <motion.div
        className="w-full max-w-lg bg-white border-3 border-slate-900 shadow-[8px_8px_0px_#0f172a] p-4 sm:p-6 space-y-4 my-auto"
        {...sheetSlideUp}
      >
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-900 font-mono font-bold text-[9px] uppercase tracking-wider inline-block">
              Official Offer Letter
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              {offer.companyName}
            </h2>
            <div className="text-xs font-mono font-bold text-slate-600 flex items-center gap-2">
              <span>{offer.city}</span>
              <span>·</span>
              <span className="uppercase">{offer.cityTier}</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-2xl shadow-[2px_2px_0px_#0f172a] shrink-0">
            🤝
          </div>
        </div>

        {/* Layoff Recovery Callout */}
        {isUnemployed && (
          <div className="p-3 bg-emerald-50 border-2 border-emerald-900 text-xs font-mono text-emerald-900 space-y-0.5">
            <div className="font-bold flex items-center gap-1.5">
              <span>🎉</span>
              <span>Immediate Employment Restoration!</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Accepting this offer immediately terminates your layoff period and re-establishes your monthly income.
            </p>
          </div>
        )}

        {/* Role & Position Details */}
        <div className="p-3.5 bg-slate-50 border-2 border-slate-900 space-y-1.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Offered Position
          </span>
          <div className="flex justify-between items-center">
            <h3 className="font-display font-black text-base sm:text-lg text-slate-900">
              {offer.title}
            </h3>
            <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] uppercase">
              {offer.tierName || `Tier ${offer.tier}`}
            </span>
          </div>
        </div>

        {/* Compensation Breakdown */}
        <div className="border-2 border-slate-900 p-3.5 space-y-2.5 bg-white">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Compensation Package
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="space-y-0.5">
              <span className="text-slate-500 text-[10px] uppercase">Annual CTC</span>
              <div className="text-base font-black text-slate-900">
                {formatINR(offer.annualCTC || offer.grossMonthlySalary * 12)}
              </div>
              <span className="text-[10px] text-slate-500 font-bold">
                {formatINR(offer.grossMonthlySalary)}/mo Gross
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-500 text-[10px] uppercase">Monthly Take-Home</span>
              <div className="text-base font-black text-emerald-700">
                {formatINR(offer.monthlyTakeHome)}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">
                +{formatINR(Math.max(0, hikeRupees))}/mo ({hikePercent >= 0 ? `+${hikePercent}%` : `${hikePercent}%`})
              </span>
            </div>
          </div>

          {offer.signingBonus > 0 && (
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-mono">
              <span className="text-purple-800 font-bold flex items-center gap-1">
                <span>🎁</span> Signing / Relocation Bonus:
              </span>
              <span className="font-black text-purple-900 bg-purple-100 px-2 py-0.5 border border-purple-900">
                +{formatINR(offer.signingBonus)} credited upfront
              </span>
            </div>
          )}
        </div>

        {/* Current vs New Comparison Strip */}
        <div className="p-2.5 bg-slate-100 border border-slate-900 text-[11px] font-mono flex justify-between items-center">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Current Take-Home</span>
            <span className="font-bold text-slate-800 line-through">
              {formatINR(currentTakeHome)}/mo
            </span>
          </div>
          <div className="text-center font-bold text-slate-400">➔</div>
          <div className="text-right">
            <span className="text-slate-500 block text-[9px] uppercase">New Take-Home</span>
            <span className="font-black text-emerald-700">
              {formatINR(offer.monthlyTakeHome)}/mo
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => acceptJobOffer(offer)}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]"
            >
              🎉 Accept & Join
            </button>
            <button
              type="button"
              onClick={handleAcceptAndAdjust}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]"
            >
              ⚙️ Accept & Rebalance SIPs
            </button>
          </div>
          <button
            type="button"
            onClick={declineJobOffer}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs uppercase tracking-wider btn-press-sm border border-slate-900"
          >
            Decline Offer & Stay at Current Firm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

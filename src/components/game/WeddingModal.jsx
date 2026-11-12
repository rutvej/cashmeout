import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function WeddingModal({ data, goal }) {
  const { confirmWedding, character, goals, insurance } = useGameStore();

  // Extract goal and spouse profile from prop data or goal
  const modalGoal = goal || data?.goal;
  const spouseProfile = data?.spouseProfile || modalGoal?.spouseProfile;

  if (!spouseProfile) return null;

  // Individual baseline numbers
  const personalTakeHome = character.employmentStatus === 'unemployed' ? 0 : (character.monthlyTakeHome || 0);
  const ventureIncome = character.ventureIncome || 0;
  const totalPersonalInflow = personalTakeHome + ventureIncome;
  const personalFixedExpenses = character.totalFixedExpenses || 0;
  const currentSurplus = character.monthlySurplus || 0;

  // Combined Household calculations
  const spouseTakeHome = spouseProfile.monthlyTakeHome || 0;
  const combinedHouseholdInflow = totalPersonalInflow + spouseTakeHome;

  const spouseAddedExpenses = spouseProfile.addedHouseholdExpenses || 0;
  const combinedHouseholdFixedExpenses = personalFixedExpenses + spouseAddedExpenses;

  const newSurplus = currentSurplus + spouseProfile.netSurplusDelta;

  // Dynamic Emergency Fund comparison
  const totalLoanEMIs = (character.loans || []).reduce((s, l) => s + (l.emi || 0), 0);
  const totalInsurance =
    ((insurance?.health?.isPurchased ? insurance.health.monthlyPremium : 0) || 0) +
    ((insurance?.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0) || 0);

  const currentEmergencyTarget = Math.round(6 * (personalFixedExpenses + totalInsurance + totalLoanEMIs));
  const newEmergencyTarget = Math.round(6 * (combinedHouseholdFixedExpenses + totalInsurance + totalLoanEMIs));
  const emergencyDelta = newEmergencyTarget - currentEmergencyTarget;

  const weddingCorpus = modalGoal?.targetAmount || 1000000;

  const handleConfirm = () => {
    confirmWedding(spouseProfile);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-7 text-left space-y-4 sm:space-y-5 bg-white text-slate-900"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
          <div className="w-13 h-13 sm:w-16 sm:h-16 bg-rose-100 border-2 border-slate-900 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-hard-sm">
            💍
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 block truncate">
              Major Life Milestone · Wedding Ceremony (Age {modalGoal?.targetAge || 29})
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 truncate">
              Just Married! Congratulations!
            </h2>
          </div>
        </div>

        {/* Narrative & Corpus Disbursement */}
        <div className="space-y-1.5">
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-body">
            You celebrated your wedding ceremony surrounded by loved ones! Your planned wedding corpus of{' '}
            <strong className="text-slate-900 font-mono">{formatINR(weddingCorpus)}</strong> has been spent to cover the venue, reception, and ceremonies debt-free.
          </p>
        </div>

        {/* Meet Your Partner NeoPOP Card */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-2 border-slate-900 shadow-hard-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-300 pb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">💐</span>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Life Partner</span>
                <h3 className="font-display font-black text-base sm:text-lg text-slate-900">{spouseProfile.name}</h3>
              </div>
            </div>
            <span className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 border ${spouseProfile.badgeBg || 'bg-slate-100 text-slate-900 border-slate-800'} self-start sm:self-auto`}>
              {spouseProfile.archetype}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Career & Role</span>
              <span className="font-bold text-slate-900">{spouseProfile.profession}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Monthly Take-Home</span>
              <span className={`font-black ${spouseProfile.monthlyTakeHome > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                {spouseProfile.monthlyTakeHome > 0 ? `+${formatINR(spouseProfile.monthlyTakeHome)}/mo` : '₹0 (Homemaker)'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 italic">
            "{spouseProfile.tagline}"
          </p>
        </div>

        {/* Side-by-Side Financial Comparison Table */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
            Household Cash Flow Economics (Before vs After Wedding):
          </span>

          <div className="border-2 border-slate-900 overflow-hidden text-xs font-mono">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-slate-900 text-white font-bold text-[10px] p-2 text-center uppercase tracking-wider">
              <span className="text-left">Cash Flow Metric</span>
              <span>Individual</span>
              <span>Joint Household</span>
            </div>

            {/* Row 1: Monthly Inflow */}
            <div className="grid grid-cols-3 p-2.5 border-b border-slate-200 bg-white items-center text-center">
              <span className="text-left font-bold text-slate-800">Monthly Inflow</span>
              <span className="text-slate-600">{formatINR(totalPersonalInflow)}</span>
              <span className="text-emerald-700 font-black">
                {formatINR(combinedHouseholdInflow)}
                {spouseTakeHome > 0 && <span className="text-[9px] block text-emerald-600 font-normal">+{formatINR(spouseTakeHome)} spouse</span>}
              </span>
            </div>

            {/* Row 2: Fixed Living Costs */}
            <div className="grid grid-cols-3 p-2.5 border-b border-slate-200 bg-slate-50 items-center text-center">
              <span className="text-left font-bold text-slate-800">Fixed Living Outflows</span>
              <span className="text-slate-600">{formatINR(personalFixedExpenses)}</span>
              <span className="text-rose-700 font-bold">
                {formatINR(combinedHouseholdFixedExpenses)}
                <span className="text-[9px] block text-rose-600 font-normal">+{formatINR(spouseAddedExpenses)} addon</span>
              </span>
            </div>

            {/* Row 3: Net Monthly Surplus */}
            <div className="grid grid-cols-3 p-2.5 border-b border-slate-200 bg-white items-center text-center">
              <span className="text-left font-bold text-slate-800">Net Monthly Surplus</span>
              <span className="text-slate-600">{formatINR(currentSurplus)}</span>
              <span className={`font-black ${spouseProfile.netSurplusDelta >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {formatINR(newSurplus)}
                <span className={`text-[9px] block font-bold ${spouseProfile.netSurplusDelta >= 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                  {spouseProfile.netSurplusDelta >= 0 ? `+${formatINR(spouseProfile.netSurplusDelta)}/mo` : `-${formatINR(Math.abs(spouseProfile.netSurplusDelta))}/mo`}
                </span>
              </span>
            </div>

            {/* Row 4: 6-Month Emergency Buffer */}
            <div className="grid grid-cols-3 p-2.5 bg-blue-50/60 items-center text-center">
              <span className="text-left font-bold text-blue-950">6-Month Safety Shield</span>
              <span className="text-slate-600">{formatINR(currentEmergencyTarget)}</span>
              <span className="text-blue-900 font-black">
                {formatINR(newEmergencyTarget)}
                <span className="text-[9px] block text-blue-700 font-normal">+{formatINR(emergencyDelta)} target</span>
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-slate-900 shadow-hard btn-press cursor-pointer transition-colors"
        >
          Embark on Married Life Together ➔
        </button>
      </motion.div>
    </motion.div>
  );
}

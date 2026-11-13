import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';
import HomePurchaseModal from './HomePurchaseModal.jsx';

export default function MilestoneModal({ goal }) {
  if (goal?.id === 'goal_home') {
    return <HomePurchaseModal goal={goal} />;
  }

  const { resolveMilestoneShortfall, finalizeMilestone, closeModal, character, simulation, goals } = useGameStore();

  const current = goal?.currentAmount || 0;
  const target = goal?.targetAmount || 1;
  const isFunded = current >= target;
  const shortfall = Math.max(0, target - current);

  // Safety buffer calculation for shortfall preview
  const emergencyGoal = (goals || []).find((g) => g.id === 'goal_emergency');
  const liquidCashAvailable = character?.liquidCash || 0;
  const emergencyAvailable = emergencyGoal?.currentAmount || 0;
  const totalBufferAvailable = liquidCashAvailable + emergencyAvailable;
  const deductCash = Math.min(liquidCashAvailable, shortfall);
  const neededFromEmergency = Math.max(0, shortfall - deductCash);
  const deductEmergency = Math.min(emergencyAvailable, neededFromEmergency);
  const remainingEmergencyAfter = emergencyAvailable - deductEmergency;
  const isBufferSufficient = totalBufferAvailable >= shortfall;

  // Resolution option for shortfall: 'postpone' | 'other_fund' | 'loan'
  const [selectedResolution, setSelectedResolution] = useState(
    isBufferSufficient ? 'other_fund' : 'postpone'
  );
  const [postponeYears, setPostponeYears] = useState(2);

  // Compute estimated loan terms for preview
  let loanName = 'Personal Loan';
  let tenureMonths = 36;
  let interestRate = 0.12;

  if (goal?.id === 'goal_car') {
    loanName = 'Auto / Car Loan';
    tenureMonths = 48;
    interestRate = 0.095;
  } else if (goal?.id === 'goal_home') {
    loanName = 'Home Mortgage Loan';
    tenureMonths = 180;
    interestRate = 0.085;
  }

  const r = interestRate / 12;
  const estEMI = Math.round(
    (shortfall * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1)
  );

  const handleConfirm = () => {
    if (isFunded) {
      finalizeMilestone(goal.id);
    } else {
      resolveMilestoneShortfall({
        goalId: goal.id,
        resolutionType: selectedResolution,
        postponeYears,
      });
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-lg w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-7 text-left space-y-3.5 sm:space-y-5 bg-white text-slate-900"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 border-b-2 border-slate-900 pb-2.5 sm:pb-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 border-2 border-slate-900 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
            {goal?.icon || '🎯'}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block truncate">
              Life Milestone · Target Reached (Age {goal?.targetAge || simulation.currentAge})
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 truncate">
              {goal?.name}
            </h2>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-body">
          {isFunded
            ? `Congratulations! You successfully accumulated the full corpus for ${goal?.name}. Your disciplined monthly contributions paid off!`
            : `The target deadline has arrived, but you have a shortfall of ${formatINR(shortfall)}. Choose how you wish to handle this milestone below:`}
        </p>

        {/* Financial Numbers Bar */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2 sm:p-3 bg-slate-100 border-2 border-slate-900 text-center font-mono">
          <div>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 block">Target Corpus</span>
            <span className="text-xs sm:text-sm font-black text-slate-900">{formatINR(target)}</span>
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 block">Accumulated</span>
            <span className="text-xs sm:text-sm font-black text-emerald-700">{formatINR(current)}</span>
          </div>
          <div>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500 block">Status</span>
            <span className={`text-xs sm:text-sm font-black ${isFunded ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isFunded ? '100% FUNDED 🎉' : `- ${formatINR(shortfall)}`}
            </span>
          </div>
        </div>

        {/* Phase 5: Life Event Ongoing Outflow Notices */}
        {goal?.id === 'goal_car' && (
          <div className="p-2.5 sm:p-3 bg-blue-50 border-2 border-blue-900 text-[11px] space-y-1">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <span>🚗</span>
              <span>Recurring Vehicle Upkeep Impact (+₹3,500/mo)</span>
            </div>
            <p className="text-blue-900 text-[10px] sm:text-[11px] leading-relaxed">
              Completing vehicle purchase permanently adds <strong>+₹3,500/mo</strong> to monthly fixed expenses (Fuel ₹2,200 + Servicing Reserve ₹800 + Motor Insurance ₹500).
              Your 6-month Emergency Fund target will automatically expand by <strong>+₹21,000</strong>.
            </p>
          </div>
        )}

        {goal?.id === 'goal_home' && (
          <div className="p-2.5 sm:p-3 bg-amber-50 border-2 border-amber-900 text-[11px] space-y-1">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <span>🏠</span>
              <span>Property Maintenance Charges (+₹5,500/mo)</span>
            </div>
            <p className="text-amber-900 text-[10px] sm:text-[11px] leading-relaxed">
              Finalizing homeownership introduces <strong>+₹5,500/mo</strong> in fixed expenses for apartment society maintenance, civic taxes, and utility charges (combined with any mortgage loan EMI).
            </p>
          </div>
        )}

        {goal?.id === 'goal_marriage' && (
          <div className="p-2.5 sm:p-3 bg-rose-50 border-2 border-rose-900 text-[11px] space-y-1">
            <div className="font-bold text-rose-950 flex items-center gap-1.5">
              <span>💍</span>
              <span>Marriage Ceremony & Household Economics</span>
            </div>
            <p className="text-rose-900 text-[10px] sm:text-[11px] leading-relaxed">
              Achieving this milestone celebrates your wedding and reveals your partner's career archetype, transitioning to combined dual-income household cashflows.
            </p>
          </div>
        )}

        {/* Shortfall Resolution Options (Requested by User) */}
        {!isFunded && (
          <div className="space-y-1.5 sm:space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
              Select Decision:
            </span>

            <div className="space-y-2 text-xs">
              {/* Option 1: Postpone the Event */}
              <button
                type="button"
                onClick={() => setSelectedResolution('postpone')}
                className={`w-full p-2.5 sm:p-3 border-2 text-left transition-all ${
                  selectedResolution === 'postpone'
                    ? 'bg-blue-50 border-blue-600 shadow-hard-sm'
                    : 'bg-white border-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold gap-1">
                  <span className="text-slate-900 flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">⏳</span>
                    <span className="truncate">Postpone the Event (+2 Years)</span>
                  </span>
                  <span className="font-mono text-blue-700 shrink-0 text-[11px] sm:text-xs">Target: Age {simulation.currentAge + 2}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Delay milestone by 2 years. Keeps your monthly SIP compounding toward the goal naturally without debt or safety fund drains.
                </p>
              </button>

              {/* Option 2: Pay from Bank & Emergency Buffer */}
              <button
                type="button"
                onClick={() => setSelectedResolution('other_fund')}
                className={`w-full p-2.5 sm:p-3 border-2 text-left transition-all ${
                  selectedResolution === 'other_fund'
                    ? 'bg-blue-50 border-blue-600 shadow-hard-sm'
                    : 'bg-white border-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold gap-1">
                  <span className="text-slate-900 flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">🛡️</span>
                    <span className="truncate">Pay from Bank Cash & Emergency Buffer</span>
                  </span>
                  <span className={`font-mono shrink-0 text-[11px] sm:text-xs ${isBufferSufficient ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isBufferSufficient ? 'Covered by Buffer' : 'Buffer Shortfall'}
                  </span>
                </div>
                {isBufferSufficient ? (
                  <p className="text-[11px] text-slate-600 mt-1">
                    Deducts {formatINR(deductCash)} from bank cash and {formatINR(deductEmergency)} from emergency buffer. Leaves <strong className="text-slate-800">{formatINR(remainingEmergencyAfter)}</strong> in emergency buffer. Milestone completes debt-free!
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-800 font-bold mt-1">
                    ⚠️ Total buffer available is {formatINR(totalBufferAvailable)} (Bank: {formatINR(liquidCashAvailable)}, Emergency: {formatINR(emergencyAvailable)}), which cannot fully cover the {formatINR(shortfall)} shortfall. Option 1 (Postpone) or Option 3 (Loan) is recommended!
                  </p>
                )}
              </button>

              {/* Option 3: Take a Loan */}
              <button
                type="button"
                onClick={() => setSelectedResolution('loan')}
                className={`w-full p-2.5 sm:p-3 border-2 text-left transition-all ${
                  selectedResolution === 'loan'
                    ? 'bg-blue-50 border-blue-600 shadow-hard-sm'
                    : 'bg-white border-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold gap-1">
                  <span className="text-slate-900 flex items-center gap-1.5 min-w-0">
                    <span className="shrink-0">💳</span>
                    <span className="truncate">Take a Loan ({loanName})</span>
                  </span>
                  <span className="font-mono text-rose-700 shrink-0 text-[11px] sm:text-xs">~{formatINR(estEMI)}/mo EMI</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Finance {formatINR(shortfall)} via {tenureMonths}-month loan at {(interestRate * 100).toFixed(1)}% p.a. Adds an EMI to your monthly outflow. Milestone completed immediately!
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className={`w-full py-3 sm:py-3.5 px-6 font-display font-black text-xs sm:text-sm tracking-wider uppercase btn-press cursor-pointer transition-colors ${
            isFunded
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-500'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isFunded ? 'Celebrate & Continue Simulation ➔' : 'Confirm Decision & Continue ➔'}
        </button>

      </motion.div>
    </motion.div>
  );
}

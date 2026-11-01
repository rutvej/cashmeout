import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function MilestoneModal({ goal }) {
  const { resolveMilestoneShortfall, closeModal, character, simulation } = useGameStore();

  const current = goal?.currentAmount || 0;
  const target = goal?.targetAmount || 1;
  const isFunded = current >= target;
  const shortfall = Math.max(0, target - current);

  // Resolution option for shortfall: 'postpone' | 'other_fund' | 'loan'
  const [selectedResolution, setSelectedResolution] = useState('postpone');
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
      closeModal();
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
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-lg w-full p-6 sm:p-7 text-left space-y-5 bg-white text-slate-900"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
          <div className="w-14 h-14 bg-amber-100 border-2 border-slate-900 flex items-center justify-center text-3xl shrink-0">
            {goal?.icon || '🎯'}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Life Milestone · Target Deadline Reached (Age {goal?.targetAge || simulation.currentAge})
            </span>
            <h2 className="font-display text-2xl font-black text-slate-900">
              {goal?.name}
            </h2>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-xs text-slate-700 leading-relaxed font-body">
          {isFunded
            ? `Congratulations! You successfully accumulated the full corpus for ${goal?.name}. Your disciplined monthly contributions paid off!`
            : `The target deadline has arrived, but you have a shortfall of ${formatINR(shortfall)}. Choose how you wish to handle this milestone below:`}
        </p>

        {/* Financial Numbers Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100 border-2 border-slate-900 text-center font-mono">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Target Corpus</span>
            <span className="text-sm font-black text-slate-900">{formatINR(target)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Accumulated</span>
            <span className="text-sm font-black text-emerald-700">{formatINR(current)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Status</span>
            <span className={`text-sm font-black ${isFunded ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isFunded ? '100% FUNDED 🎉' : `- ${formatINR(shortfall)}`}
            </span>
          </div>
        </div>

        {/* Shortfall Resolution Options (Requested by User) */}
        {!isFunded && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
              Select Decision:
            </span>

            <div className="space-y-2 text-xs">
              {/* Option 1: Postpone the Event */}
              <button
                type="button"
                onClick={() => setSelectedResolution('postpone')}
                className={`w-full p-3 border-2 text-left transition-all ${
                  selectedResolution === 'postpone'
                    ? 'bg-blue-50 border-blue-600 shadow-hard-sm'
                    : 'bg-white border-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    <span>⏳</span> Postpone the Event (+2 Years)
                  </span>
                  <span className="font-mono text-blue-700">New Target: Age {simulation.currentAge + 2}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Delay milestone by 2 years. Keeps your monthly SIP compounding toward the goal naturally without debt or safety fund drains.
                </p>
              </button>

              {/* Option 2: Borrow / Pay from Other Funds */}
              <button
                type="button"
                onClick={() => setSelectedResolution('other_fund')}
                className={`w-full p-3 border-2 text-left transition-all ${
                  selectedResolution === 'other_fund'
                    ? 'bg-blue-50 border-blue-600 shadow-hard-sm'
                    : 'bg-white border-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    <span>🛡️</span> Borrow / Pay from Bank & Emergency Buffer
                  </span>
                  <span className="font-mono text-emerald-700">One-Time Draw</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Pay {formatINR(shortfall)} directly from your bank cash and safety buffer. Milestone completes immediately with ₹0 debt!
                </p>
              </button>

              {/* Option 3: Take a Loan */}
              <button
                type="button"
                onClick={() => setSelectedResolution('loan')}
                className={`w-full p-3 border-2 text-left transition-all ${
                  selectedResolution === 'loan'
                    ? 'bg-blue-50 border-blue-600 shadow-hard-sm'
                    : 'bg-white border-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    <span>💳</span> Take a Loan for Shortfall ({loanName})
                  </span>
                  <span className="font-mono text-rose-700">~{formatINR(estEMI)}/mo EMI</span>
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
          className={`w-full py-3.5 px-6 font-display font-black text-sm tracking-wider uppercase btn-press cursor-pointer transition-colors ${
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

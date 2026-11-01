import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function VacationModal({ data }) {
  const { resolveVacationShortfall, simulation } = useGameStore();

  const wasSuccessful = data?.wasSuccessful;
  const shortfall = data?.shortfall || 0;
  const savedAmount = data?.savedAmount || 0;
  const targetAmount = data?.targetAmount || 50000;
  const currentYear = data?.currentYear || 1;

  // Selected resolution option when shortfall > 0: 'loan' | 'other_fund' | 'acquired_only'
  const [selectedResolution, setSelectedResolution] = useState('acquired_only');
  // Selected upcoming package: 'domestic' | 'international'
  const [nextYearTrip, setNextYearTrip] = useState(data?.selectedTierOption || 'domestic');
  // Automated vacation toggle requested by user
  const [dontShowAgain, setDontShowAgain] = useState(simulation?.autoVacation || false);

  const handleConfirm = () => {
    resolveVacationShortfall({
      resolutionType: wasSuccessful ? 'none' : selectedResolution,
      nextYearTripOption: nextYearTrip,
      autoVacation: dontShowAgain,
    });
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
          <span className="text-4xl p-2 bg-blue-100 border-2 border-slate-900">✈️</span>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Annual Vacation Milestone · Year {currentYear}
            </span>
            <h2 className="font-display text-2xl font-black text-slate-900">
              {wasSuccessful ? 'Vacation Fully Funded! 🎉' : 'Vacation Fund Shortfall'}
            </h2>
          </div>
        </div>

        {/* Narrative */}
        <p className="text-xs text-slate-700 leading-relaxed font-body">
          {wasSuccessful
            ? 'Congratulations! Your vacation corpus was 100% funded. You took time off to recharge your mental health, preventing career burnout.'
            : `The vacation deadline has arrived, but your corpus is short by ${formatINR(shortfall)}. Choose how you wish to handle the shortfall below:`}
        </p>

        {/* Financial Numbers Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100 border-2 border-slate-900 text-center font-mono">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Target Cost</span>
            <span className="text-sm font-black text-slate-900">{formatINR(targetAmount)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Accumulated</span>
            <span className="text-sm font-black text-emerald-700">{formatINR(savedAmount)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Shortfall</span>
            <span className={`text-sm font-black ${shortfall > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {shortfall > 0 ? formatINR(shortfall) : '₹0 (FULL)'}
            </span>
          </div>
        </div>

        {/* Shortfall Options */}
        {!wasSuccessful && shortfall > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
              Select Shortfall Resolution:
            </span>

            <div className="space-y-2 text-xs">
              {/* Option 1: Budget trip with acquired funds */}
              <button
                type="button"
                onClick={() => setSelectedResolution('acquired_only')}
                className={`w-full p-3 border-2 text-left transition-all ${
                  selectedResolution === 'acquired_only'
                    ? 'bg-blue-50 border-blue-600 shadow-hard-sm'
                    : 'bg-white border-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    <span>🎒</span> Budget Trip with Acquired Funds Only (Recommended)
                  </span>
                  <span className="font-mono text-emerald-700">₹0 Extra Spent</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Enjoy a cozy local staycation / road trip within your saved {formatINR(savedAmount)}. Zero extra debt or savings withdrawals.
                </p>
              </button>

              {/* Option 2: Pay from Bank / Emergency Fund */}
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
                    <span>🛡️</span> Pay from Bank / Emergency Fund
                  </span>
                  <span className="font-mono text-blue-700">One-Time Draw</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Withdraw {formatINR(shortfall)} directly from your liquid bank cash and safety buffer. No loan debt incurred.
                </p>
              </button>

              {/* Option 3: Travel Loan */}
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
                    <span>💳</span> Take a Travel Loan
                  </span>
                  <span className="font-mono text-rose-700">12 Mos @ 12% p.a.</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Borrow the {formatINR(shortfall)} shortfall via personal travel loan. Adds a small monthly EMI to your cashflow. Full trip taken!
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Plan Next Year's Vacation */}
        <div className="p-3.5 bg-slate-50 border-2 border-slate-900 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
            Plan Upcoming Year Trip Package:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setNextYearTrip('domestic')}
              className={`p-2.5 border-2 text-left transition-all ${
                nextYearTrip === 'domestic'
                  ? 'bg-blue-600 text-white border-slate-900 font-bold shadow-hard-sm'
                  : 'bg-white border-slate-900 text-slate-900'
              }`}
            >
              <div className="font-bold">Domestic Trip</div>
              <div className={`text-[10px] font-mono ${nextYearTrip === 'domestic' ? 'text-blue-100' : 'text-slate-500'}`}>
                Target: ~₹50,000 (~₹4.2k/mo)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setNextYearTrip('international')}
              className={`p-2.5 border-2 text-left transition-all ${
                nextYearTrip === 'international'
                  ? 'bg-blue-600 text-white border-slate-900 font-bold shadow-hard-sm'
                  : 'bg-white border-slate-900 text-slate-900'
              }`}
            >
              <div className="font-bold">Global Vacation</div>
              <div className={`text-[10px] font-mono ${nextYearTrip === 'international' ? 'text-blue-100' : 'text-slate-500'}`}>
                Target: ~₹1,50,000 (~₹12.5k/mo)
              </div>
            </button>
          </div>
        </div>

        {/* ─── Automation Toggle (Requested by User) ─── */}
        <div className="p-3 bg-amber-50 border-2 border-amber-600 flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            id="dontShowVacation"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-slate-900 cursor-pointer"
          />
          <label htmlFor="dontShowVacation" className="text-xs font-bold text-amber-950 cursor-pointer select-none">
            Don't show this card again
            <span className="block font-normal text-[11px] text-amber-900 mt-0.5">
              Automatically take annual vacations with default domestic package and continue simulation without stopping.
            </span>
          </label>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 px-6 bg-slate-900 text-white font-display font-black text-sm tracking-wider uppercase btn-press hover:bg-slate-800 transition-colors"
        >
          {wasSuccessful ? 'Celebrate & Continue Simulation ➔' : 'Confirm Decision & Continue ➔'}
        </button>

      </motion.div>
    </motion.div>
  );
}

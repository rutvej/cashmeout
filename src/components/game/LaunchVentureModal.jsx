import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp, hardPress } from '../../utils/motion.js';

export default function LaunchVentureModal({ goal, onAdjustAllocations }) {
  const { launchVenture, dismissLaunchVentureModal } = useGameStore();

  if (!goal) return null;

  const isRental = goal.ventureType === 'rental_property';
  const isFranchise = goal.ventureType === 'franchise';
  const isSideHustle = goal.ventureType === 'side_hustle';

  const handleLaunch = () => {
    launchVenture(goal.id);
  };

  const handleLater = () => {
    dismissLaunchVentureModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          {...backdropFade}
          onClick={handleLater}
        />

        {/* Modal Dialog */}
        <motion.div
          className="relative w-full max-w-xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] my-auto overflow-hidden z-10"
          {...sheetSlideUp}
        >
          {/* Top Banner */}
          <div className="bg-emerald-500 text-slate-950 p-4 border-b-2 border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{goal.icon || '🚀'}</span>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] block text-emerald-950">
                  🎉 Capital Target Reached (100%)
                </span>
                <h3 className="font-display font-black text-lg sm:text-xl text-slate-950">
                  Ready to Launch: {goal.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-4 font-sans">
            <div className="p-3 bg-emerald-50 border-2 border-emerald-900 space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-900 block">
                Accumulation Phase Complete
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed">
                You have successfully accumulated <strong>{formatINR(goal.targetAmount)}</strong>. Launching this venture now transitions it from a savings goal into an <strong>Active Cash-Flow Asset</strong> producing recurring monthly income.
              </p>
            </div>

            {/* Operational Cashflow Breakdown */}
            <div className="border-2 border-slate-900 p-3.5 space-y-2 bg-slate-50">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Operational Stage Cash Flows
              </div>

              {isSideHustle && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Recurring Monthly Inflow:</span>
                    <strong className="text-emerald-700 font-black">+₹12,000 to +₹25,000 / mo</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Operating Outflow:</span>
                    <span className="text-slate-900">₹0 (Sweat equity / micro-SaaS)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600">Market Variance:</span>
                    <span className="text-slate-700">±15% dynamic monthly demand</span>
                  </div>
                </div>
              )}

              {isFranchise && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Gross Monthly Profit:</span>
                    <span className="text-slate-900 font-bold">+₹45,000 / mo</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Store Manager Salary:</span>
                    <span className="text-rose-600 font-bold">-₹15,000 / mo</span>
                  </div>
                  <div className="flex justify-between items-center py-1 bg-emerald-100 px-2 border border-emerald-900">
                    <span className="text-emerald-950 font-bold">Net Monthly Cash Flow:</span>
                    <strong className="text-emerald-800 font-black">+₹30,000 / mo</strong>
                  </div>
                </div>
              )}

              {isRental && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Down Payment Funded:</span>
                    <span className="text-slate-900 font-bold">{formatINR(goal.targetAmount)} (20%)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Mortgage Loan Added:</span>
                    <span className="text-slate-900 font-bold">₹40,00,000 @ 8.5% (15 yrs)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Monthly Mortgage EMI:</span>
                    <span className="text-rose-600 font-bold">~₹39,400 / mo</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Tenant Rental Inflow:</span>
                    <span className="text-emerald-700 font-bold">+₹28,000 / mo</span>
                  </div>
                  <div className="flex justify-between items-center py-1 bg-amber-100 px-2 border border-amber-900">
                    <span className="text-amber-950 font-bold">Asset Compounding:</span>
                    <strong className="text-amber-900 font-black">₹50L property compounding @ 6.5% p.a.</strong>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              SIP deductions for this venture will stop immediately. Net profits will be credited directly to your take-home cash flow each month!
            </p>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleLater}
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 border-2 border-slate-900 text-slate-700 font-mono font-bold text-xs uppercase btn-press-sm text-center"
            >
              Decide Later
            </button>
            <motion.button
              type="button"
              onClick={handleLaunch}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] btn-press text-center"
              {...hardPress}
            >
              🚀 Launch Venture & Start Cash Flow
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

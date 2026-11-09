import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function RaiseModal({ data, onAdjustAllocations }) {
  const { closeModal, pause, applyRaiseStrategy, setSurplusAllocation, surplusAllocation } = useGameStore();
  const [autoApplyFuture, setAutoApplyFuture] = useState(surplusAllocation?.autoSplitOnRaise || false);

  const delta = data?.deltaSurplus || 0;

  const handleAutoSplit = () => {
    if (autoApplyFuture) {
      setSurplusAllocation({ autoSplitOnRaise: true, raiseRoutingStrategy: 'proportional_split' });
    }
    applyRaiseStrategy('proportional_split');
  };

  const handleRetirement = () => {
    if (autoApplyFuture) {
      setSurplusAllocation({ autoSplitOnRaise: true, raiseRoutingStrategy: 'all_to_retirement' });
    }
    applyRaiseStrategy('all_to_retirement');
  };

  const handleCustom = () => {
    closeModal();
    pause();
    onAdjustAllocations();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-md w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 text-center space-y-3.5 sm:space-y-4 bg-white text-slate-900"
        {...sheetSlideUp}
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-emerald-100 border-2 border-slate-900 flex items-center justify-center text-2xl sm:text-3xl">
          📈
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
            Annual Performance Appraisal
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Salary Hike +{(((data?.hikeRate) ?? 0.06) * 100).toFixed(0)}%!
          </h2>
          <p className="text-xs text-slate-600 font-body leading-relaxed">
            Your compensation increased! How would you like to route your new monthly surplus?
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="p-3 sm:p-3.5 bg-slate-100 border-2 border-slate-900 space-y-1.5 text-xs text-left font-mono">
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-slate-600 font-sans">Previous Take-Home:</span>
            <span className="font-bold text-slate-800">{formatINR(data?.oldTakeHome)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-emerald-800 font-sans font-bold">New Take-Home:</span>
            <span className="font-black text-emerald-700">{formatINR(data?.newTakeHome)}</span>
          </div>
          <div className="pt-1.5 flex justify-between items-baseline text-sm">
            <span className="font-bold text-slate-900 font-sans">Surplus Expansion:</span>
            <span className="font-black text-emerald-700 text-base">
              +{formatINR(delta)}/mo
            </span>
          </div>
        </div>

        {/* 3 One-Click Actions */}
        <div className="space-y-2 pt-1 text-left">
          {/* Action 1: Auto-Split */}
          <button
            type="button"
            onClick={handleAutoSplit}
            className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-slate-900 font-sans font-bold btn-press cursor-pointer transition-colors block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                ⚡ Auto-Split (+{formatINR(delta)})
              </span>
              <span className="text-[10px] font-mono bg-emerald-700 px-1.5 py-0.5 rounded text-white">INSTANT ▶</span>
            </div>
            <p className="text-[11px] font-normal text-emerald-100 mt-1">
              Scales all active goal SIPs proportionally by their current % weights.
            </p>
          </button>

          {/* Action 2: 100% to Retirement */}
          <button
            type="button"
            onClick={handleRetirement}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white border-2 border-slate-900 font-sans font-bold btn-press cursor-pointer transition-colors block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                🌴 100% to Retirement
              </span>
              <span className="text-[10px] font-mono bg-blue-700 px-1.5 py-0.5 rounded text-white">INSTANT ▶</span>
            </div>
            <p className="text-[11px] font-normal text-blue-100 mt-1">
              Keeps existing SIPs unchanged, funnels entire +{formatINR(delta)} into FI/RE equity compounding.
            </p>
          </button>

          {/* Action 3: Custom Rebalance */}
          <button
            type="button"
            onClick={handleCustom}
            className="w-full p-3 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 font-sans font-bold btn-press-sm cursor-pointer transition-colors block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                ⚙️ Custom Rebalance
              </span>
              <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 text-slate-800">PAUSE ⏸</span>
            </div>
            <p className="text-[11px] font-normal text-slate-600 mt-1">
              Pauses simulation and opens the Allocation Sheet for interactive adjustments.
            </p>
          </button>
        </div>

        {/* Future Auto-Split Checkbox */}
        <label className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoApplyFuture}
            onChange={(e) => setAutoApplyFuture(e.target.checked)}
            className="accent-slate-900 h-4 w-4 rounded cursor-pointer"
          />
          <span className="text-[11px] font-mono">Remember choice for future annual raises</span>
        </label>
      </motion.div>
    </motion.div>
  );
}

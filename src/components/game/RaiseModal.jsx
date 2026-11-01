import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { springPress, hardPress, backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function RaiseModal({ data, onAdjustAllocations }) {
  const { closeModal } = useGameStore();

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-surface-0/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      {...backdropFade}
    >
      <motion.div
        className="max-w-md w-full bg-surface-1 border border-surface-3 p-6 sm:p-8 text-center space-y-5"
        {...sheetSlideUp}
      >
        <div className="text-4xl">📈</div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-[0.2em]">
            Annual Appraisal
          </div>
          <h2 className="font-display text-2xl font-black text-white">
            +{(data?.hikeRate * 100).toFixed(0)}% Salary Hike
          </h2>
          <p className="text-xs text-slate-500 font-body leading-relaxed pt-1">
            Your performance was recognized. Monthly take-home has increased.
          </p>
        </div>

        <div className="p-4 bg-surface-0 border border-surface-3 space-y-2 text-xs text-left">
          <div className="flex justify-between py-1.5 border-b border-surface-3/50">
            <span className="text-slate-500 font-body">Previous Take-Home</span>
            <span className="font-mono text-slate-300">{formatINR(data?.oldTakeHome)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-surface-3/50">
            <span className="text-emerald-400 font-body font-bold">New Take-Home</span>
            <span className="font-mono text-emerald-400 font-bold">{formatINR(data?.newTakeHome)}</span>
          </div>
          <div className="pt-2 flex justify-between items-baseline text-sm">
            <span className="font-body font-bold text-white">Surplus Delta</span>
            <span className="font-mono font-black text-emerald-400">
              +{formatINR(data?.deltaSurplus)}/mo
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <motion.button
            type="button"
            onClick={onAdjustAllocations}
            className="w-full py-3.5 px-4 bg-emerald-500 text-surface-0 font-body font-black text-sm tracking-wider uppercase btn-press cursor-pointer hover:bg-emerald-400 transition-colors"
            {...hardPress}
          >
            Allocate Extra Surplus →
          </motion.button>
          <motion.button
            type="button"
            onClick={closeModal}
            className="w-full py-2.5 px-4 bg-surface-2 border border-surface-3 text-slate-400 hover:text-white font-body font-semibold text-xs transition-colors"
            {...springPress}
          >
            Keep as Liquid Cash
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

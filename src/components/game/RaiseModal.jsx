import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function RaiseModal({ data, onAdjustAllocations }) {
  const { closeModal } = useGameStore();

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-md w-full p-6 sm:p-7 text-center space-y-5 bg-white text-slate-900"
        {...sheetSlideUp}
      >
        <div className="w-16 h-16 mx-auto bg-emerald-100 border-2 border-slate-900 flex items-center justify-center text-3xl">
          📈
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
            Annual Performance Appraisal
          </span>
          <h2 className="font-display text-2xl font-black text-slate-900">
            Salary Hike +{(data?.hikeRate * 100).toFixed(0)}%!
          </h2>
          <p className="text-xs text-slate-600 font-body leading-relaxed pt-1">
            Your skills and dedication were recognized. Your monthly take-home salary has increased.
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 bg-slate-100 border-2 border-slate-900 space-y-2 text-xs text-left font-mono">
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-slate-600 font-sans">Previous Take-Home:</span>
            <span className="font-bold text-slate-800">{formatINR(data?.oldTakeHome)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-emerald-800 font-sans font-bold">New Take-Home:</span>
            <span className="font-black text-emerald-700">{formatINR(data?.newTakeHome)}</span>
          </div>
          <div className="pt-2 flex justify-between items-baseline text-sm">
            <span className="font-bold text-slate-900 font-sans">Monthly Surplus Delta:</span>
            <span className="font-black text-emerald-700 text-base">
              +{formatINR(data?.deltaSurplus)}/mo
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onAdjustAllocations}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-sm tracking-wider uppercase btn-press cursor-pointer transition-colors"
          >
            Allocate Extra Surplus ➔
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-slate-700 font-mono font-bold text-xs btn-press-sm transition-colors"
          >
            Keep in Liquid Bank Cash
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

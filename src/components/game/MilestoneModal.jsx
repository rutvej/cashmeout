import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function MilestoneModal({ goal }) {
  const { closeModal } = useGameStore();
  const current = goal?.currentAmount || 0;
  const target = goal?.targetAmount || 1;
  const isFunded = current >= target;
  const shortfall = Math.max(0, target - current);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-md w-full p-6 sm:p-7 text-center space-y-5 bg-white text-slate-900"
        {...sheetSlideUp}
      >
        <div className="w-16 h-16 mx-auto bg-amber-100 border-2 border-slate-900 flex items-center justify-center text-3xl">
          {goal?.icon || '🎯'}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider block">
            Target Deadline Reached
          </span>
          <h2 className="font-display text-2xl font-black text-slate-900">{goal?.name}</h2>
          <p className="text-xs text-slate-600 font-body leading-relaxed pt-1">
            {isFunded
              ? `Congratulations! You successfully accumulated the full corpus for ${goal?.name}.`
              : `The target deadline has arrived, with a shortfall of ${formatINR(shortfall)}.`}
          </p>
        </div>

        {/* Milestone Breakdown */}
        <div className="p-4 bg-slate-100 border-2 border-slate-900 space-y-2 text-xs text-left font-mono">
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-slate-600 font-sans">Target Corpus:</span>
            <span className="font-bold text-slate-800">{formatINR(target)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-emerald-800 font-sans font-bold">Accumulated:</span>
            <span className="font-bold text-emerald-700">{formatINR(current)}</span>
          </div>
          <div className="pt-2 flex justify-between items-baseline text-sm">
            <span className="font-bold text-slate-900 font-sans">Milestone Status:</span>
            <span className={`font-black ${isFunded ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isFunded ? '100% ACHIEVED 🎉' : `${((current / target) * 100).toFixed(0)}% Funded`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={closeModal}
          className={`w-full py-3.5 px-4 font-display font-black text-sm tracking-wider uppercase btn-press cursor-pointer transition-colors ${
            isFunded
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {isFunded ? 'Celebrate & Continue Simulation ➔' : 'Acknowledge & Continue'}
        </button>
      </motion.div>
    </motion.div>
  );
}

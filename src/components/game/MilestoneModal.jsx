import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { hardPress, backdropFade, sheetSlideUp, popIn } from '../../utils/motion.js';

export default function MilestoneModal({ goal }) {
  const { closeModal } = useGameStore();
  const current = goal?.currentAmount || 0;
  const target = goal?.targetAmount || 1;
  const isFunded = current >= target;
  const shortfall = Math.max(0, target - current);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-surface-0/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      {...backdropFade}
    >
      <motion.div
        className="max-w-md w-full bg-surface-1 border border-surface-3 p-6 sm:p-8 text-center space-y-5"
        {...sheetSlideUp}
      >
        <motion.div className="text-5xl" {...popIn}>
          {goal?.icon || '🎯'}
        </motion.div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-[0.2em]">
            Target Deadline
          </div>
          <h2 className="font-display text-2xl font-black text-white">{goal?.name}</h2>
          <p className="text-xs text-slate-500 font-body leading-relaxed pt-1">
            {isFunded
              ? `Congratulations! Full corpus accumulated for ${goal?.name}.`
              : `Deadline reached with a shortfall of ${formatINR(shortfall)}.`}
          </p>
        </div>

        <div className="p-4 bg-surface-0 border border-surface-3 space-y-2 text-xs text-left">
          <div className="flex justify-between py-1.5 border-b border-surface-3/50">
            <span className="text-slate-500 font-body">Target Corpus</span>
            <span className="font-mono text-slate-300">{formatINR(target)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-surface-3/50">
            <span className="text-emerald-400 font-body font-bold">Accumulated</span>
            <span className="font-mono text-emerald-400 font-bold">{formatINR(current)}</span>
          </div>
          <div className="pt-2 flex justify-between items-baseline text-sm">
            <span className="font-body font-bold text-white">Status</span>
            <span className={`font-mono font-black ${isFunded ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isFunded ? '100% ACHIEVED 🎉' : `${((current / target) * 100).toFixed(0)}% Funded`}
            </span>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={closeModal}
          className={`w-full py-3.5 px-4 font-body font-black text-sm tracking-wider uppercase btn-press cursor-pointer transition-colors ${
            isFunded
              ? 'bg-accent-gold text-surface-0 hover:brightness-110'
              : 'bg-emerald-500 text-surface-0 hover:bg-emerald-400'
          }`}
          {...hardPress}
        >
          {isFunded ? 'Celebrate & Continue →' : 'Acknowledge & Continue'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

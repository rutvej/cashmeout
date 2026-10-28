import React from 'react';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';

export default function MilestoneModal({ goal }) {
  const { closeModal } = useGameStore();
  const current = goal?.currentAmount || 0;
  const target = goal?.targetAmount || 1;
  const isFunded = current >= target;
  const shortfall = Math.max(0, target - current);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        <div className="text-4xl p-3 bg-emerald-500/10 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
          {goal?.icon || '🎯'}
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Target Deadline Reached
          </div>
          <h2 className="text-2xl font-black text-white">
            {goal?.name}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            {isFunded
              ? `Congratulations! You successfully accumulated the full corpus for ${goal?.name}.`
              : `The target deadline has arrived, but you have a shortfall of ${formatINR(shortfall)}.`}
          </p>
        </div>

        {/* Financial Numbers */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Target Corpus:</span>
            <span className="font-mono text-slate-200">{formatINR(target)}</span>
          </div>
          <div className="flex justify-between text-emerald-400 font-bold">
            <span>Accumulated Balance:</span>
            <span className="font-mono">{formatINR(current)}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm">
            <span className="font-bold text-white">Milestone Status:</span>
            <span className={`font-black font-mono ${isFunded ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isFunded ? '100% ACHIEVED 🎉' : `Underfunded (${((current / target) * 100).toFixed(0)}%)`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={closeModal}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          {isFunded ? 'Celebrate & Continue Simulation ➔' : 'Acknowledge & Continue'}
        </button>

      </div>
    </div>
  );
}

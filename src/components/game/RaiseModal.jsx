import React from 'react';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';

export default function RaiseModal({ data, onAdjustAllocations }) {
  const { closeModal } = useGameStore();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        <div className="text-4xl p-3 bg-emerald-500/10 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
          📈
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Annual Performance Appraisal
          </div>
          <h2 className="text-2xl font-black text-white">
            Salary Hike +{(data?.hikeRate * 100).toFixed(0)}%!
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Your hard work was recognized with an annual raise. Your monthly take-home salary has increased.
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Previous Take-Home:</span>
            <span className="font-mono text-slate-200">{formatINR(data?.oldTakeHome)}</span>
          </div>
          <div className="flex justify-between text-emerald-400 font-bold">
            <span>New Take-Home:</span>
            <span className="font-mono">{formatINR(data?.newTakeHome)}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm">
            <span className="font-bold text-white">New Surplus Delta:</span>
            <span className="font-black text-emerald-400 font-mono">
              +{formatINR(data?.deltaSurplus)} / mo
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onAdjustAllocations}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            Review & Allocate Extra Surplus ➔
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 transition"
          >
            Deposit Delta into Liquid Bank Cash
          </button>
        </div>

      </div>
    </div>
  );
}

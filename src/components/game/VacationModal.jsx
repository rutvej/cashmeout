import React from 'react';
import { useGameStore } from '../../engine/store.js';

export default function VacationModal({ data }) {
  const { executeVacationSelection } = useGameStore();
  const wasSuccessful = data?.wasSuccessful;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
        <div className="text-4xl p-3 bg-emerald-500/10 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
          ✈️
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Year {data?.currentYear} Complete
          </div>
          <h2 className="text-2xl font-black text-white">
            {wasSuccessful ? 'Annual Vacation Executed! 🎉' : 'Vacation Fund Shortfall'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            {wasSuccessful
              ? 'Your vacation was 100% funded! You took time off, recharged your mental energy, and avoided burnout.'
              : 'The vacation fund was partially funded. You enjoyed a cozy local staycation instead.'}
          </p>
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3 text-left">
          <div className="text-xs font-bold text-slate-300 uppercase">Plan Upcoming Year Trip:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => executeVacationSelection('domestic')}
              className="p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900 hover:bg-emerald-500/10 text-left transition"
            >
              <div className="font-bold text-xs text-white">Domestic Trip</div>
              <div className="text-[11px] text-slate-400">~₹50,000 / yr</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">₹4,200/mo</div>
            </button>

            <button
              type="button"
              onClick={() => executeVacationSelection('international')}
              className="p-3 rounded-xl border border-slate-800 hover:border-emerald-500/50 bg-slate-900 hover:bg-emerald-500/10 text-left transition"
            >
              <div className="font-bold text-xs text-white">Global Vacation</div>
              <div className="text-[11px] text-slate-400">~₹1,50,000 / yr</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">₹12,500/mo</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

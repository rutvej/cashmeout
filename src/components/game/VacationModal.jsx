import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { springPress, hardPress, backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function VacationModal({ data }) {
  const { executeVacationSelection } = useGameStore();
  const wasSuccessful = data?.wasSuccessful;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-surface-0/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      {...backdropFade}
    >
      <motion.div
        className="max-w-md w-full bg-surface-1 border border-surface-3 p-6 sm:p-8 text-center space-y-5"
        {...sheetSlideUp}
      >
        <div className="text-4xl">✈️</div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-[0.2em]">
            Year {data?.currentYear} Complete
          </div>
          <h2 className="font-display text-2xl font-black text-white">
            {wasSuccessful ? 'Vacation Executed! 🎉' : 'Fund Shortfall'}
          </h2>
          <p className="text-xs text-slate-500 font-body leading-relaxed pt-1">
            {wasSuccessful
              ? 'Your vacation was 100% funded. You recharged and avoided burnout.'
              : 'Partially funded — you enjoyed a cozy local staycation instead.'}
          </p>
        </div>

        <div className="p-4 bg-surface-0 border border-surface-3 space-y-3 text-left">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">
            Next Year's Trip
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'domestic', label: 'Domestic', cost: '~₹50K/yr', sip: '₹4,200/mo' },
              { id: 'international', label: 'International', cost: '~₹1.5L/yr', sip: '₹12,500/mo' },
            ].map((opt) => (
              <motion.button
                key={opt.id}
                type="button"
                onClick={() => executeVacationSelection(opt.id)}
                className="p-3 border border-surface-3 bg-surface-1 hover:bg-surface-2 hover:border-emerald-500/40 text-left transition-all"
                {...springPress}
              >
                <div className="font-body font-bold text-xs text-white">{opt.label}</div>
                <div className="text-[10px] text-slate-500 font-mono">{opt.cost}</div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">{opt.sip}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function MarketCrashModal({ data }) {
  const { closeModal, simulation } = useGameStore();

  const headline = data?.headline || 'SENSEX PLUNGES AMID GLOBAL MACROECONOMIC SQUEEZE';
  const depthPercent = data?.depthPercent || -0.38;
  const depthDisplay = Math.round(Math.abs(depthPercent) * 100);
  const crashAge = data?.crashAge || simulation?.currentAge || 38;

  const handleDismiss = () => {
    closeModal();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-lg w-full p-4 sm:p-7 text-left space-y-4 sm:space-y-5 bg-white text-slate-900 border-2 border-rose-600 shadow-[4px_4px_0px_#e11d48]"
        {...sheetSlideUp}
      >
        {/* Header Strip */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-100 border-2 border-slate-900 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-hard-sm">
            📉
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider text-rose-700 block truncate">
              FINANCIAL TIMES BREAKING NEWS · AGE {crashAge}
            </span>
            <h2 className="font-display text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {headline}
            </h2>
          </div>
        </div>

        {/* Depth Badge */}
        <div className="p-3 bg-rose-50 border-2 border-rose-800 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between font-bold text-rose-900">
            <span>Market Benchmark Drawdown:</span>
            <span className="text-base font-black text-rose-700">-{depthDisplay}%</span>
          </div>
          <p className="text-[11px] text-rose-800 font-body">
            Equities have entered an official bear correction triggered by systemic liquidity tightening.
          </p>
        </div>

        {/* Asset Class Impact Table */}
        <div className="space-y-1.5 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Current Asset Class Behavior:
          </span>
          <div className="space-y-1 bg-slate-50 border border-slate-300 p-2.5">
            <div className="flex justify-between items-center text-slate-700">
              <span>★ Equity Mutual Funds:</span>
              <span className="font-bold text-rose-700">Severe Monthly Drawdown</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>🛡️ Liquid Savings & FDs:</span>
              <span className="font-bold text-emerald-700">100% Unaffected (0% Drop)</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>🟡 Gold / SGB:</span>
              <span className="font-bold text-amber-700">Resilient Safe Haven</span>
            </div>
          </div>
        </div>

        {/* Historical Context */}
        <p className="text-[11px] sm:text-xs text-slate-600 font-body leading-relaxed">
          Economic panics occur periodically across generational careers. Historically, diversified equity recoveries take 18–30 months to retrace prior peaks.
        </p>

        {/* Non-Directive Single Action CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] btn-press text-center cursor-pointer transition-colors"
          >
            UNDERSTOOD / CONTINUE SIMULATION ▶
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function EarlyHomeDecisionModal({ goal, currentAge }) {
  const { chooseEarlyHomeDecision, closeModal } = useGameStore();

  const savedDP = goal?.currentAmount || 1500000;
  const targetAge = goal?.targetAge || 34;
  const age = currentAge || 29;
  const propertyCost = goal?.propertyCost || 7500000;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 text-left space-y-4 bg-white text-slate-900 border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a]"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3">
          <div className="w-12 h-12 bg-emerald-100 border-2 border-slate-900 flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#0f172a]">
            🎯
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 border border-emerald-600 inline-block mb-1">
              Early Down Payment Achieved!
            </span>
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 truncate">
              Early Down Payment Dilemma
            </h2>
            <p className="text-xs text-slate-600 font-mono">
              Age {age} · Target Was Age {targetAge} ({targetAge - age} Years Ahead of Schedule)
            </p>
          </div>
        </div>

        {/* Narrative / Context Card */}
        <div className="p-3 bg-slate-50 border-2 border-slate-900 text-xs font-mono space-y-1.5 leading-snug">
          <p className="text-slate-800">
            Congratulations! You've achieved your 20% down payment target of{' '}
            <strong className="text-slate-950 font-black">{formatINR(savedDP)}</strong> ahead of schedule for your{' '}
            <strong className="text-slate-950 font-black">{formatINR(propertyCost)}</strong> home.
          </p>
          <p className="text-slate-600 text-[11px]">
            Hitting this milestone early unlocks a pivotal three-way strategic choice for your cash flow and net worth:
          </p>
        </div>

        {/* 3-Way Strategic Decision Grid */}
        <div className="space-y-3 font-mono">
          {/* OPTION A: Buy Immediately */}
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-600 space-y-2 hover:shadow-[3px_3px_0px_#059669] transition-all">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-emerald-900 bg-emerald-200 px-1.5 py-0.5 border border-emerald-700">
                Option A · Rapid Equity
              </span>
              <span className="text-xs font-bold text-emerald-900">Buy Immediately</span>
            </div>
            <p className="text-xs text-slate-800 leading-snug">
              Purchase the home right now at age {age}. Stop paying rent permanently, start living in your own home, and begin +6.5% p.a. property equity compounding today!
            </p>
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <div>• Rent eliminated immediately</div>
              <div>• 20-Year Mortgage EMI begins now</div>
              <div>• Property compounds at +6.5% p.a.</div>
            </div>
            <button
              type="button"
              onClick={() => chooseEarlyHomeDecision({ goalId: goal?.id || 'goal_home', decision: 'buy_now' })}
              className="w-full mt-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-xs uppercase tracking-wider border border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Option A: Buy Immediately Now ➔
            </button>
          </div>

          {/* OPTION B: Scale Down Payment */}
          <div className="p-3.5 bg-indigo-50 border-2 border-indigo-600 space-y-2 hover:shadow-[3px_3px_0px_#4338ca] transition-all">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-indigo-900 bg-indigo-200 px-1.5 py-0.5 border border-indigo-700">
                Option B · Smart Leverage
              </span>
              <span className="text-xs font-bold text-indigo-900">Scale Down Payment (35%–40%)</span>
            </div>
            <p className="text-xs text-slate-800 leading-snug">
              Keep contributing your monthly SIP until planned age {targetAge}. By putting down ₹25L–₹30L instead of ₹15L, your loan principal shrinks from ₹60L to ₹50L—saving over ₹8,600/month in lifelong EMI and over ₹10 Lakhs in interest!
            </p>
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <div>• Down payment scales to ~40% (₹30L)</div>
              <div>• Lifelong EMI drops drastically</div>
              <div>• Saves lakhs in 20-year bank interest</div>
            </div>
            <button
              type="button"
              onClick={() => chooseEarlyHomeDecision({ goalId: goal?.id || 'goal_home', decision: 'scale_dp' })}
              className="w-full mt-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-display font-black text-xs uppercase tracking-wider border border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Option B: Keep Saving &amp; Scale Down Payment ➔
            </button>
          </div>

          {/* OPTION C: Lock & Redirect */}
          <div className="p-3.5 bg-amber-50 border-2 border-amber-500 space-y-2 hover:shadow-[3px_3px_0px_#b45309] transition-all">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-1.5 py-0.5 border border-amber-700">
                Option C · Safe Diversification
              </span>
              <span className="text-xs font-bold text-amber-900">Lock DP &amp; Redirect to Retirement</span>
            </div>
            <p className="text-xs text-slate-800 leading-snug">
              Freeze the {formatINR(savedDP)} down payment in a safe, liquid yield instrument with zero downside. Waterfall redirects your monthly SIP directly to high-growth investments (like Retirement FI/RE) until age {targetAge}.
            </p>
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <div>• Safe capital preservation on accumulated ₹15L</div>
              <div>• Ongoing monthly SIP waterfalls to Retirement</div>
              <div>• Buy at planned target age {targetAge}</div>
            </div>
            <button
              type="button"
              onClick={() => chooseEarlyHomeDecision({ goalId: goal?.id || 'goal_home', decision: 'lock_redirect' })}
              className="w-full mt-2 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider border border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              Option C: Lock DP &amp; Redirect SIP ➔
            </button>
          </div>
        </div>

        {/* Footer Dismiss */}
        <div className="pt-1">
          <button
            type="button"
            onClick={closeModal}
            className="w-full py-2 px-3 text-center text-xs font-mono font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Decide Later / Dismiss
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

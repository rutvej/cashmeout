import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';
import JobMarketModal from './JobMarketModal.jsx';

export default function RaiseModal({ data, onAdjustAllocations, onOpenJobMarket }) {
  const { closeModal, pause, applyRaiseStrategy, setSurplusAllocation, surplusAllocation } = useGameStore();

  const [showLocalJobMarket, setShowLocalJobMarket] = useState(false);

  const isAutoSplitPreferred = surplusAllocation?.autoSplitOnRaise || false;
  const timerDuration = surplusAllocation?.autoSplitTimerSeconds || 3;

  const [autoTimerEnabled, setAutoTimerEnabled] = useState(isAutoSplitPreferred);
  const [secondsLeft, setSecondsLeft] = useState(isAutoSplitPreferred ? timerDuration : null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const delta = data?.deltaSurplus || 0;
  const hikeRate = data?.hikeRate ?? 0.06;
  const hikePercent = (hikeRate * 100).toFixed(1).replace(/\.0$/, '');
  const isStagnated = Boolean(data?.isStagnated);

  const category = data?.category || (
    hikeRate <= 0.02 ? 'freeze' : (hikeRate >= 0.10 ? 'boom' : 'normal')
  );

  const headline = data?.headline || (
    category === 'freeze'
      ? (isStagnated ? 'Company Salary Freeze / Minimal Raise' : 'Modest Raise / Cost-of-Living Adjustment')
      : category === 'boom'
      ? 'Top-Tier Performance Hike & Bonus'
      : 'Standard Performance Appraisal'
  );

  const reason = data?.reason || (
    category === 'freeze'
      ? (isStagnated
          ? 'Tenure Stagnation: Staying at the same company without switching has plateaued your pay.'
          : 'Company-wide budget tightening. Market rates are significantly higher on the Job Market!')
      : category === 'boom'
      ? 'Outstanding contribution and high skill execution rewarded with top-bracket appraisal!'
      : 'Solid corporate contribution meeting standard expectations.'
  );

  let categoryBadgeLabel = 'ANNUAL PERFORMANCE APPRAISAL';
  let categoryBadgeClass = 'bg-blue-100 text-blue-900 border-2 border-blue-900';
  let categoryIcon = '📈';
  let categoryIconBg = 'bg-emerald-100';

  if (category === 'freeze') {
    categoryBadgeLabel = 'COMPANY SALARY FREEZE / MINIMAL';
    categoryBadgeClass = 'bg-rose-100 text-rose-900 border-2 border-rose-900 shadow-[1px_1px_0px_#9f1239]';
    categoryIcon = '🧊';
    categoryIconBg = 'bg-rose-100';
  } else if (category === 'boom') {
    categoryBadgeLabel = 'TOP-TIER BOOM & PROMOTION';
    categoryBadgeClass = 'bg-amber-100 text-amber-900 border-2 border-amber-800 shadow-[1px_1px_0px_#92400e]';
    categoryIcon = '🚀';
    categoryIconBg = 'bg-amber-100';
  }

  const handleOpenJobMarket = () => {
    closeModal();
    pause();
    if (onOpenJobMarket) {
      onOpenJobMarket();
    } else {
      setShowLocalJobMarket(true);
    }
  };

  const handleAutoSplit = () => {
    if (autoTimerEnabled) {
      setSurplusAllocation({ autoSplitOnRaise: true, raiseRoutingStrategy: 'proportional_split' });
    }
    applyRaiseStrategy('proportional_split');
  };

  const handleKeepInBank = () => {
    if (autoTimerEnabled) {
      setSurplusAllocation({ autoSplitOnRaise: false });
    }
    applyRaiseStrategy('bank_cash');
  };

  const handleCustom = () => {
    closeModal();
    pause();
    onAdjustAllocations();
  };

  const toggleAutoTimerPreference = (enabled) => {
    setAutoTimerEnabled(enabled);
    setSurplusAllocation({ autoSplitOnRaise: enabled, raiseRoutingStrategy: 'proportional_split' });
    if (enabled) {
      setSecondsLeft(timerDuration);
      setIsTimerPaused(false);
    } else {
      setSecondsLeft(null);
    }
  };

  // 3-second countdown auto-timer for Auto-Split
  useEffect(() => {
    if (!autoTimerEnabled || isTimerPaused || secondsLeft === null) return;

    if (secondsLeft <= 0) {
      handleAutoSplit();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((s) => (s !== null ? s - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoTimerEnabled, isTimerPaused, secondsLeft]);

  if (showLocalJobMarket) {
    return <JobMarketModal onClose={() => setShowLocalJobMarket(false)} />;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-md w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 text-center space-y-3.5 sm:space-y-4 bg-white text-slate-900"
        {...sheetSlideUp}
      >
        <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto ${categoryIconBg} border-2 border-slate-900 flex items-center justify-center text-2xl sm:text-3xl shadow-[3px_3px_0px_#0f172a]`}>
          {categoryIcon}
        </div>

        <div className="space-y-1.5">
          <span className={`px-2.5 py-1 font-mono font-bold text-[9px] sm:text-[10px] uppercase tracking-wider inline-block ${categoryBadgeClass}`}>
            {categoryBadgeLabel}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Salary Hike +{hikePercent}%!
          </h2>
          <div className="p-3 bg-slate-50 border-2 border-slate-900 space-y-1 text-left">
            <h4 className="font-sans font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <span>{category === 'freeze' ? '🧊' : category === 'boom' ? '✨' : '📋'}</span>
              <span>{headline}</span>
            </h4>
            {reason && (
              <p className="text-xs text-slate-600 font-body leading-relaxed">
                {reason}
              </p>
            )}
          </div>
        </div>

        {/* Stagnation / Below-Market Job Hop Callout */}
        {(hikeRate <= 0.02 || isStagnated) && (
          <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-slate-900 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{isStagnated ? 'Tenure Stagnation Push' : 'Below-Market Appraisal'}</span>
              </span>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 border border-rose-300">
                +30% Market Target
              </span>
            </div>
            <p className="text-[11px] text-slate-700 font-sans leading-snug">
              {isStagnated
                ? 'Tenure Stagnation: Staying at the same company without switching has plateaued your pay. Switch employers to leap ahead!'
                : 'Your compensation raise is minimal. Explore external openings on the Job Board to target higher market compensation.'}
            </p>
            <button
              type="button"
              onClick={handleOpenJobMarket}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center justify-center gap-2"
            >
              <span>💼 Explore Job Market (+30% Target)</span>
            </button>
          </div>
        )}

        {/* Breakdown Card */}
        <div className="p-3 sm:p-3.5 bg-slate-100 border-2 border-slate-900 space-y-1.5 text-xs text-left font-mono">
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-slate-600 font-sans">Previous Take-Home:</span>
            <span className="font-bold text-slate-800">{formatINR(data?.oldTakeHome)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-300">
            <span className="text-emerald-800 font-sans font-bold">New Take-Home:</span>
            <span className="font-black text-emerald-700">{formatINR(data?.newTakeHome)}</span>
          </div>
          <div className="pt-1.5 flex justify-between items-baseline text-sm">
            <span className="font-bold text-slate-900 font-sans">Surplus Expansion:</span>
            <span className="font-black text-emerald-700 text-base">
              +{formatINR(delta)}/mo
            </span>
          </div>
        </div>

        {/* 3 Actions */}
        <div className="space-y-2 pt-1 text-left">
          {/* Action 1: Auto-Split with 3s Countdown Timer */}
          <div className="relative">
            <button
              type="button"
              onClick={handleAutoSplit}
              className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-slate-900 font-sans font-bold btn-press cursor-pointer transition-colors block text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                  ⚡ Auto-Split (+{formatINR(delta)})
                </span>
                {autoTimerEnabled && secondsLeft !== null ? (
                  <span className="text-[10px] font-mono bg-emerald-800 px-2 py-0.5 rounded text-white flex items-center gap-1">
                    <span>⏱ {secondsLeft}s</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-emerald-700 px-1.5 py-0.5 rounded text-white">INSTANT ▶</span>
                )}
              </div>
              <p className="text-[11px] font-normal text-emerald-100 mt-1">
                Scales all active goal SIPs proportionally by their current % weights.
              </p>

              {/* Visual Countdown Progress Bar when timer active */}
              {autoTimerEnabled && secondsLeft !== null && (
                <div className="w-full h-1.5 bg-emerald-800/80 mt-2 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-amber-300 transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.max(0, (secondsLeft / timerDuration) * 100)}%` }}
                  />
                </div>
              )}
            </button>

            {/* Timer Pause / Resume button if active */}
            {autoTimerEnabled && secondsLeft !== null && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-900 underline cursor-pointer"
                >
                  {isTimerPaused ? '▶ Resume 3s timer' : '⏸ Pause countdown'}
                </button>
              </div>
            )}
          </div>

          {/* Action 2: Keep in Liquid Bank Cash & Resume */}
          <button
            type="button"
            onClick={handleKeepInBank}
            className="w-full p-3 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-slate-900 font-sans font-bold btn-press-sm cursor-pointer transition-colors block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                💵 Keep in Bank Cash (+{formatINR(delta)})
              </span>
              <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 text-slate-800">RESUME ▶</span>
            </div>
            <p className="text-[11px] font-normal text-slate-600 mt-1">
              Keeps existing SIPs unchanged. The entire extra +{formatINR(delta)} flows into your liquid bank savings every month.
            </p>
          </button>

          {/* Action 3: Custom Rebalance */}
          <button
            type="button"
            onClick={handleCustom}
            className="w-full p-3 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 font-sans font-bold btn-press-sm cursor-pointer transition-colors block text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                ⚙️ Custom Rebalance
              </span>
              <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 text-slate-800">PAUSE ⏸</span>
            </div>
            <p className="text-[11px] font-normal text-slate-600 mt-1">
              Pauses simulation and opens the Allocation Sheet for manual adjustment.
            </p>
          </button>
        </div>

        {/* 3-Second Auto-Select Preference Checkbox */}
        <label className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoTimerEnabled}
            onChange={(e) => toggleAutoTimerPreference(e.target.checked)}
            className="accent-slate-900 h-4 w-4 rounded cursor-pointer"
          />
          <span className="text-[11px] font-mono">
            Auto-select Auto-Split in 3s on future raises (still shows appraisal screen)
          </span>
        </label>
      </motion.div>
    </motion.div>
  );
}

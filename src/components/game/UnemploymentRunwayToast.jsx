import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '../../utils/format.js';

export default function UnemploymentRunwayToast({ reminder, onOpenJobMarket }) {
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!reminder) return;
    setSecondsLeft(3);
    setIsDismissed(false);

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setIsDismissed(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminder?.id]);

  if (!reminder || isDismissed || secondsLeft <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        className="card-neopop p-2.5 sm:p-3 bg-amber-50 border-2 border-amber-900 shadow-[4px_4px_0px_#78350f] text-slate-900 space-y-1.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg animate-pulse">⚠️</span>
            <div>
              <div className="font-bold text-amber-950 flex items-center gap-1.5 flex-wrap">
                <span>Month {reminder.unemploymentMonth} of Unemployment</span>
                <span className="text-[10px] text-amber-800 font-normal">
                  (−{formatINR(reminder.monthlyBurn)} from reserves)
                </span>
              </div>
              <div className="text-[10px] text-amber-800 font-semibold">
                Reserves: <strong>{formatINR(reminder.remainingReserves)}</strong> · ~<strong>{reminder.runwayMonths} mos</strong> runway left
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onOpenJobMarket}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-[11px] uppercase tracking-wider btn-press-sm border border-slate-900 shrink-0"
            >
              💼 Open Job Market
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold text-xs"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 3s Auto-dismiss progress timer */}
        <div className="w-full h-1 bg-amber-200 overflow-hidden">
          <div
            className="h-full bg-amber-600 transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 3) * 100}%` }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

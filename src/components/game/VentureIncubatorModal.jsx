import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { VENTURE_CATALOG } from '../../engine/ventureEngine.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp, hardPress } from '../../utils/motion.js';

export default function VentureIncubatorModal({ onClose }) {
  const { goals, addVentureGoal, character } = useGameStore();
  const [justAddedId, setJustAddedId] = useState(null);

  const handleAddVenture = (catalogId) => {
    addVentureGoal(catalogId);
    setJustAddedId(catalogId);
    setTimeout(() => setJustAddedId(null), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          {...backdropFade}
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-3xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] my-auto max-h-[92vh] flex flex-col z-10"
          {...sheetSlideUp}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b-2 border-slate-900 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                  Expansion Engine · Phase 4
                </span>
              </div>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
                <span>🚀 Venture Incubator & Side Hustles</span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Seed income-generating assets via monthly SIPs. Once 100% funded, each venture transitions into an active asset generating recurring monthly cash flow.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border-2 border-slate-900 bg-white hover:bg-slate-100 font-mono font-bold text-slate-900 btn-press-sm shrink-0"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Catalog Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {VENTURE_CATALOG.map((venture) => {
              const existingGoal = goals.find((g) => g.ventureCatalogId === venture.id);
              const isAdded = !!existingGoal;
              const isLaunched = existingGoal?.isLaunched;
              const progressPct = existingGoal
                ? Math.min(100, Math.round(((existingGoal.currentAmount || 0) / (existingGoal.targetAmount || 1)) * 100))
                : 0;

              return (
                <div
                  key={venture.id}
                  className={`border-2 border-slate-900 p-4 transition-all ${
                    isLaunched
                      ? 'bg-emerald-50/70 border-emerald-900 shadow-[3px_3px_0px_#065f46]'
                      : isAdded
                      ? 'bg-blue-50/70 border-blue-900 shadow-[3px_3px_0px_#1e3a8a]'
                      : 'bg-white shadow-[3px_3px_0px_#0f172a] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-2xl p-1.5 bg-white border border-slate-900 shrink-0">
                          {venture.icon}
                        </span>
                        <div>
                          <h3 className="font-display font-black text-base sm:text-lg text-slate-900">
                            {venture.name}
                          </h3>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 border border-slate-900 text-slate-700 inline-block">
                            {venture.riskProfile}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {venture.description}
                      </p>

                      {/* Financial Key Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs font-mono">
                        <div className="p-2 bg-white border border-slate-300">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                            {venture.ventureType === 'rental_property' ? 'Down Payment Target' : 'Capital Target'}
                          </span>
                          <span className="font-black text-slate-900">
                            {formatINR(venture.targetAmount)}
                          </span>
                        </div>
                        <div className="p-2 bg-white border border-slate-300">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                            Est. Monthly Inflow
                          </span>
                          <span className="font-black text-emerald-700">
                            {venture.projectedNetMonthly}
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1 p-2 bg-white border border-slate-300">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 block">
                            Key Mechanism
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 block truncate" title={venture.volatilityNote}>
                            {venture.volatilityNote}
                          </span>
                        </div>
                      </div>

                      {/* Mortgage Callout for Rental */}
                      {venture.ventureType === 'rental_property' && (
                        <div className="p-2 bg-amber-50 border border-amber-300 text-[11px] text-amber-900 font-mono">
                          🏦 Mortgage: ₹40L financed for 15 yrs @ 8.5% (EMI ~₹39,400/mo). Asset initial valuation: ₹50 Lakh.
                        </div>
                      )}
                    </div>

                    {/* Right Action & Progress */}
                    <div className="sm:w-52 flex flex-col justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      {isLaunched ? (
                        <div className="p-3 bg-emerald-100 border-2 border-emerald-900 text-center space-y-1">
                          <span className="text-[10px] font-mono font-black text-emerald-950 uppercase tracking-wider block">
                            🟢 ACTIVE ASSET
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-800 block">
                            Generating Cash Flow
                          </span>
                        </div>
                      ) : isAdded ? (
                        <div className="p-3 bg-blue-100 border-2 border-blue-900 space-y-1.5 text-center">
                          <div className="flex justify-between text-[10px] font-mono font-bold text-blue-900">
                            <span>Incubating</span>
                            <span>{progressPct}% Funded</span>
                          </div>
                          <div className="w-full h-2 bg-white border border-blue-900 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-blue-800 block font-bold">
                            {formatINR(existingGoal.currentAmount || 0)} / {formatINR(existingGoal.targetAmount)}
                          </span>
                        </div>
                      ) : (
                        <motion.button
                          type="button"
                          onClick={() => handleAddVenture(venture.id)}
                          className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] btn-press text-center"
                          {...hardPress}
                        >
                          {justAddedId === venture.id ? '✓ Added to Goals!' : '+ Incubate Venture'}
                        </motion.button>
                      )}

                      {!isLaunched && (
                        <p className="text-[10px] font-mono text-slate-500 text-center leading-tight">
                          {isAdded
                            ? 'Allocating via monthly SIP in Goals tab'
                            : 'Adds milestone goal to your financial roadmap'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] font-mono text-slate-600">
              Monthly surplus available: <strong className="text-emerald-700">{formatINR(character?.monthlySurplus || 0)}/mo</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white hover:bg-slate-100 border-2 border-slate-900 text-slate-900 font-mono font-bold text-xs uppercase btn-press-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '../../utils/format.js';

export default function FinancialCommandDrawer({
  isOpen,
  onClose,
  character,
  simulation,
  setSpeed,
  toggleAutoVacation,
  onOpenUpskilling,
  onOpenJobMarket,
  onOpenVenture,
  onOpenAllocations,
  onOpenVoiceoverTour,
  onSelectTab,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-screen max-w-md bg-white border-l-4 border-slate-900 shadow-2xl flex flex-col font-mono text-slate-900 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b-4 border-slate-900">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚙️</span>
              <div>
                <h3 className="font-display font-black text-base sm:text-lg leading-tight">
                  Life Hub & Decisions
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Financial command center
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center border border-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Quick Voiceover Tour Callout Banner */}
          <div className="p-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-b-2 border-slate-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <div>
                <span className="font-display font-bold text-xs block text-blue-200">
                  New to CashMeOut?
                </span>
                <span className="text-[11px] text-white">
                  Listen to the guided Mobile Screen Tour
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVoiceoverTour();
              }}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded btn-press shrink-0"
            >
              Start Tour ➔
            </button>
          </div>

          {/* Drawer Body Sections */}
          <div className="p-4 sm:p-5 space-y-5 flex-1 text-xs">

            {/* Section 1: Career & Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-display font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>💼</span> Career & Upskilling
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {character.jobTitle}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpskilling();
                  }}
                  className="p-3 bg-purple-50 hover:bg-purple-100 border-2 border-slate-900 text-left space-y-1 btn-press transition-colors"
                >
                  <span className="text-base block">🎓</span>
                  <span className="font-bold text-slate-900 block text-[11px]">Upskill Hub</span>
                  <span className="text-[9px] text-purple-900 block leading-tight">Boost skill score & unlocks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenJobMarket();
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-900 text-left space-y-1 btn-press transition-colors"
                >
                  <span className="text-base block">💼</span>
                  <span className="font-bold text-slate-900 block text-[11px]">Job Market</span>
                  <span className="text-[9px] text-emerald-800 block leading-tight">Explore +30% salary offers</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('career');
                  onClose();
                }}
                className="w-full py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-900 text-[10px] font-bold text-slate-700 flex items-center justify-between"
              >
                <span>View Full CTC & Experience Details</span>
                <span>➔</span>
              </button>
            </div>

            {/* Section 2: Wealth Engines & Investments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-display font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>🚀</span> Wealth Engines & Allocation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVenture();
                  }}
                  className="p-3 bg-purple-600 hover:bg-purple-700 text-white border-2 border-slate-900 text-left space-y-1 btn-press transition-colors shadow-sm"
                >
                  <span className="text-base block">➕</span>
                  <span className="font-bold text-white block text-[11px]">+ New Venture</span>
                  <span className="text-[9px] text-purple-200 block leading-tight">Side hustle & real estate</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAllocations();
                  }}
                  className="p-3 bg-white hover:bg-slate-50 border-2 border-slate-900 text-left space-y-1 btn-press transition-colors"
                >
                  <span className="text-base block">⚙️</span>
                  <span className="font-bold text-slate-900 block text-[11px]">Adjust SIPs</span>
                  <span className="text-[9px] text-slate-600 block leading-tight">Rebalance monthly flows</span>
                </button>
              </div>
            </div>

            {/* Section 3: Risk Protection & Liabilities */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-display font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>🛡️</span> Debts & Protection
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('loans');
                    onClose();
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-900 text-left space-y-0.5"
                >
                  <div className="flex items-center gap-1">
                    <span>💳</span>
                    <span className="font-bold text-[11px]">Loans ({character.loans?.length || 0})</span>
                  </div>
                  <span className="text-[9px] text-slate-600 block">Prepay or view tenure</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('insurance');
                    onClose();
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-900 text-left space-y-0.5"
                >
                  <div className="flex items-center gap-1">
                    <span>🛡️</span>
                    <span className="font-bold text-[11px]">Insurance</span>
                  </div>
                  <span className="text-[9px] text-slate-600 block">Health & term life</span>
                </button>
              </div>
            </div>

            {/* Section 4: Simulation Controls & Preferences */}
            <div className="p-3 bg-slate-50 border-2 border-slate-900 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800">
                  ⚡ Simulation Preferences
                </span>
                <span className="text-[9px] text-emerald-700 font-bold">● Auto-Saved</span>
              </div>

              {/* Auto-Vacation Setting */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Annual Vacation:</span>
                <button
                  type="button"
                  onClick={() => toggleAutoVacation()}
                  className={`px-3 py-1 font-bold text-[10px] border border-slate-900 btn-press-sm ${
                    simulation.autoVacation
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {simulation.autoVacation ? '✈️ AUTO: ON' : '✈️ AUTO: OFF'}
                </button>
              </div>

              {/* Speed Control in Drawer */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Simulation Speed:</span>
                <div className="flex bg-white border border-slate-900 p-0.5">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSpeed(spd)}
                      className={`px-2 py-0.5 text-[10px] font-bold ${
                        simulation.gameSpeed === spd
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {spd}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-3.5 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
            <span>CashMeOut v1.2</span>
            <span>Single-Player Career Sim</span>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

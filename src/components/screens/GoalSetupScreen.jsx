import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
  scaleIn,
  springPress,
  hardPress,
} from '../../utils/motion.js';

export default function GoalSetupScreen() {
  const { character, goals, updateGoal, navigateTo } = useGameStore();

  if (!character || !goals.length) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-4 font-body">No goals loaded.</p>
        <button
          onClick={() => navigateTo('landing')}
          className="px-5 py-2.5 bg-emerald-500 text-surface-0 font-bold btn-press"
        >
          Return to Start
        </button>
      </div>
    );
  }

  const recurringGoals = goals.filter((g) => g.kind === 'recurring');
  const milestoneGoals = goals.filter((g) => g.kind === 'milestone');

  const handleTripOption = (option) => {
    const isDomestic = option === 'domestic';
    const amount = isDomestic ? 50000 : 150000;
    updateGoal('goal_vacation', {
      selectedTierOption: option,
      targetAmount: amount,
    });
  };

  return (
    <motion.div
      className="min-h-screen bg-mesh noise-overlay relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8"
      {...pageTransition}
    >
      <motion.div
        className="w-full max-w-3xl relative z-10 space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header ─── */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-3 gap-3"
          variants={fadeInUp}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                Life Goals Roadmap
              </span>
            </div>
            <h1 className="font-display text-3xl font-black text-white">
              Your Milestones
            </h1>
          </div>

          <div className="bg-surface-1 px-5 py-3 border border-emerald-500/30 text-right">
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
              Available Surplus
            </div>
            <div className="text-xl font-mono font-black text-emerald-400">
              {formatINR(character.monthlySurplus)}
              <span className="text-xs font-normal text-slate-500 ml-1">/ mo</span>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-xs text-slate-500 font-body leading-relaxed"
          variants={fadeInUp}
        >
          Review your life roadmap. On the next screen you will allocate monthly surplus into
          investment instruments to fund each milestone.
        </motion.p>

        {/* ─── Recurring & Dynamic Goals (Timeline) ─── */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-2">
            <span>🔄</span> Recurring & Dynamic Goals
          </div>

          <div className="relative space-y-3">
            {/* Timeline connector */}
            <div className="absolute left-[22px] top-4 bottom-4 w-px bg-surface-3" />

            {recurringGoals.map((goal, idx) => {
              const isVacation = goal.id === 'goal_vacation';

              return (
                <motion.div
                  key={goal.id}
                  className="relative pl-12"
                  variants={fadeInUp}
                >
                  {/* Timeline node */}
                  <div className="absolute left-3 top-4 w-4 h-4 rounded-full border-2 border-emerald-500 bg-surface-0 z-10" />

                  <div className="bg-surface-1 border border-surface-3 p-5 space-y-3 hover:border-surface-3/80 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-body font-bold text-base text-white">
                              {goal.name}
                            </span>
                            {goal.isMandatory ? (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                MANDATORY
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-surface-2 text-slate-400 border border-surface-3">
                                ANNUAL
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 font-body">
                            {goal.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600">
                          Target
                        </div>
                        <div className="text-lg font-mono font-black text-white">
                          {formatINR(goal.targetAmount)}
                        </div>
                      </div>
                    </div>

                    {/* Vacation Package Selector */}
                    {isVacation && (
                      <div className="pt-3 border-t border-surface-3 flex items-center justify-between gap-3">
                        <span className="text-[11px] text-slate-500 font-body">Trip Package:</span>
                        <div className="flex gap-2">
                          {[
                            { id: 'domestic', label: 'Domestic', amount: '₹50K' },
                            { id: 'international', label: 'International', amount: '₹1.5L' },
                          ].map((opt) => (
                            <motion.button
                              key={opt.id}
                              type="button"
                              onClick={() => handleTripOption(opt.id)}
                              className={`px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                                goal.selectedTierOption === opt.id
                                  ? 'bg-emerald-500 text-surface-0'
                                  : 'bg-surface-2 text-slate-400 border border-surface-3 hover:text-white'
                              }`}
                              {...springPress}
                            >
                              {opt.label} (~{opt.amount})
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── One-Time Milestones ─── */}
        <motion.div className="space-y-4" variants={fadeInUp}>
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2">
            <span>🎯</span> One-Time Milestones
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {milestoneGoals.map((goal) => {
              const yearsAway = (goal.targetAge || 60) - character.age;

              return (
                <motion.div
                  key={goal.id}
                  className={`bg-surface-1 border p-5 flex flex-col justify-between transition-colors ${
                    goal.isMandatory
                      ? 'border-l-[3px] border-l-emerald-500 border-y-surface-3 border-r-surface-3'
                      : 'border-surface-3 hover:border-surface-3/80'
                  }`}
                  variants={fadeInUp}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-surface-2 text-slate-400 border border-surface-3">
                        AGE {goal.targetAge} · {yearsAway} YRS
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-body font-bold text-sm text-white">{goal.name}</span>
                        {goal.isMandatory && (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400">
                            CORE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug font-body">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-3 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-600">
                      Target Corpus
                    </span>
                    <span className="text-base font-mono font-black text-white">
                      {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Action Footer ─── */}
        <motion.div
          className="pt-2 flex flex-col sm:flex-row gap-3 items-center"
          variants={fadeInUp}
        >
          <motion.button
            type="button"
            onClick={() => navigateTo('spawn_reveal')}
            className="w-full sm:w-auto px-6 py-3.5 border border-surface-3 text-slate-400 hover:text-white hover:border-slate-500 text-sm font-body font-semibold transition-colors"
            {...springPress}
          >
            ← Back to Profile
          </motion.button>
          <motion.button
            type="button"
            onClick={() => navigateTo('financial_setup')}
            className="w-full flex-1 py-4 px-8 bg-emerald-500 text-surface-0 font-body font-black text-base tracking-wider uppercase flex items-center justify-center gap-3 btn-press cursor-pointer hover:bg-emerald-400 transition-colors"
            {...hardPress}
          >
            <span>Plan Allocations</span>
            <span className="text-lg">→</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';
import {
  pageTransition,
  staggerContainer,
  fadeInUp,
} from '../../utils/motion.js';

export default function GoalSetupScreen() {
  const { character, goals, updateGoal, navigateTo } = useGameStore();

  if (!character || !goals.length) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-6 text-slate-900">
        <p className="text-slate-600 mb-4 font-bold">No goals loaded.</p>
        <button
          onClick={() => navigateTo('landing')}
          className="px-6 py-3 bg-slate-900 text-white font-bold btn-press"
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
      className="min-h-screen bg-mesh-light text-slate-900 relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans"
      {...pageTransition}
    >
      <motion.div
        className="w-full max-w-3xl space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-900 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                Screen 3: Life Goals Roadmap
              </span>
            </div>
            <h1 className="font-display text-3xl font-black text-slate-900">
              Your Milestones & Targets
            </h1>
          </div>

          <div className="bg-white px-5 py-2.5 border-2 border-slate-900 shadow-hard-sm text-right">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Monthly Surplus
            </span>
            <span className="text-xl font-mono font-black text-emerald-700">
              {formatINR(character.monthlySurplus)}
              <span className="text-xs font-normal text-slate-500 ml-1">/ mo</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-body leading-relaxed">
          Review your life roadmap below. On the next screen, you will allocate your monthly surplus into specific investment instruments to fund these targets.
        </p>

        {/* ─── Recurring & Dynamic Goals ─── */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-700 flex items-center gap-2">
            <span>🔄</span> Recurring & Dynamic Goals
          </div>

          <div className="grid grid-cols-1 gap-3">
            {recurringGoals.map((goal) => {
              const isVacation = goal.id === 'goal_vacation';

              return (
                <div
                  key={goal.id}
                  className="card-neopop-sm p-4 space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-slate-100 border border-slate-900">
                        {goal.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-lg text-slate-900">
                            {goal.name}
                          </span>
                          {goal.isMandatory ? (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-slate-900">
                              MANDATORY
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-900">
                              ANNUAL CYCLE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 font-body">
                          {goal.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        Target Corpus
                      </span>
                      <span className="text-lg font-mono font-black text-slate-900">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Vacation Package Switcher */}
                  {isVacation && (
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-600 font-bold">Select Trip Package:</span>
                      <div className="flex gap-2 font-mono">
                        {[
                          { id: 'domestic', label: 'Domestic (~₹50,000)' },
                          { id: 'international', label: 'Global (~₹1,50,000)' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleTripOption(opt.id)}
                            className={`px-3 py-1.5 text-xs font-bold border-2 border-slate-900 transition-all btn-press-sm ${
                              goal.selectedTierOption === opt.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── One-Time Milestones ─── */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-700 flex items-center gap-2">
            <span>🎯</span> One-Time Milestones (Target Dates)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {milestoneGoals.map((goal) => {
              const yearsAway = (goal.targetAge || 60) - character.age;

              return (
                <div
                  key={goal.id}
                  className="card-neopop-sm p-4 flex flex-col justify-between bg-white space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{goal.icon}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-900 text-slate-800">
                        Target: Age {goal.targetAge} ({yearsAway} yrs)
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-base text-slate-900">{goal.name}</span>
                        {goal.isMandatory && (
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-slate-900">
                            CORE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-snug font-body">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      Target Corpus
                    </span>
                    <span className="text-base font-mono font-black text-slate-900">
                      {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Action Footer ─── */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={() => navigateTo('spawn_reveal')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-slate-900 text-slate-700 font-mono font-bold text-xs uppercase btn-press hover:bg-slate-50 transition-colors"
          >
            ← Back to Profile
          </button>
          <button
            type="button"
            onClick={() => navigateTo('financial_setup')}
            className="w-full flex-1 py-4 px-8 bg-slate-900 text-white font-display font-black text-base uppercase tracking-wider btn-press hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>Plan Monthly Allocations</span>
            <span className="ml-2">➔</span>
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}

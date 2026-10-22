import React from 'react';
import { useGameStore } from '../../engine/store.js';
import { formatINR } from '../../utils/format.js';

export default function GoalSetupScreen() {
  const { character, goals, updateGoal, navigateTo } = useGameStore();

  if (!character || !goals.length) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <p className="text-slate-400 mb-4">No goals loaded.</p>
        <button
          onClick={() => navigateTo('landing')}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Screen 3: Life Goals Roadmap
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Your Milestones & Financial Targets
            </h1>
          </div>

          <div className="bg-slate-950/80 px-4 py-2 rounded-2xl border border-emerald-500/30 text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Available Surplus</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {formatINR(character.monthlySurplus)} <span className="text-xs font-normal text-slate-400">/ mo</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Review your life roadmap below. On the next screen, you will allocate your monthly surplus into specific investment instruments to fund these milestones.
        </p>

        {/* Section 1: Recurring & Dynamic Goals */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span>🔄</span> Recurring & Dynamic Goals
          </div>

          <div className="grid grid-cols-1 gap-3">
            {recurringGoals.map((goal) => {
              const isVacation = goal.id === 'goal_vacation';

              return (
                <div
                  key={goal.id}
                  className="bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-slate-900 rounded-xl">{goal.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white">{goal.name}</span>
                          {goal.isMandatory ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              MANDATORY
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              ANNUAL CYCLE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{goal.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Target</div>
                      <div className="text-base font-black text-white font-mono">
                        {formatINR(goal.targetAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Vacation package switcher */}
                  {isVacation && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400">Select Trip Package:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleTripOption('domestic')}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                            goal.selectedTierOption === 'domestic'
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          Domestic (~₹50,000)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTripOption('international')}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                            goal.selectedTierOption === 'international'
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          International (~₹1,50,000)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: One-Time Life Milestones */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>🎯</span> One-Time Milestones (Target Dates)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {milestoneGoals.map((goal) => {
              const yearsAway = (goal.targetAge || 60) - character.age;

              return (
                <div
                  key={goal.id}
                  className={`bg-slate-950/60 border rounded-2xl p-4 flex flex-col justify-between transition ${
                    goal.isMandatory
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{goal.icon}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        Target: Age {goal.targetAge} ({yearsAway} yrs)
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{goal.name}</span>
                        {goal.isMandatory && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            CORE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Target Corpus</span>
                    <span className="text-base font-black text-white font-mono">
                      {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={() => navigateTo('spawn_reveal')}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition"
          >
            ← Back to Profile
          </button>
          <button
            type="button"
            onClick={() => navigateTo('financial_setup')}
            className="w-full flex-1 py-3.5 px-6 rounded-2xl font-bold text-base bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Plan Monthly Allocations</span>
            <span className="text-lg">➔</span>
          </button>
        </div>

      </div>
    </div>
  );
}

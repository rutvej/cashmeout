import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import {
  generateJobMarket,
  calculateOfferProbability,
  JOB_TIERS,
} from '../../engine/careerEngine.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function JobMarketModal({ onClose }) {
  const { character, simulation, applyForJob } = useGameStore();
  const [selectedTierFilter, setSelectedTierFilter] = useState('all'); // 'all' | '1' | '2' | '3' | '4'
  const [applicationFeedback, setApplicationFeedback] = useState(null); // { jobId, message, type: 'error' | 'success' }
  const [isSubmittingId, setIsSubmittingId] = useState(null);

  if (!character) return null;

  const currentExp = character.yearsOfExperience || 0;
  const currentSkill = character.skillLevel || 1.0;
  const currentTakeHome = character.employmentStatus === 'unemployed' ? 0 : character.monthlyTakeHome;
  const isUnemployed = character.employmentStatus === 'unemployed';
  const cooldowns = character.jobApplicationCooldowns || {};
  const currentMonth = simulation.currentMonthIndex || 0;

  // Generate dynamic market for current cycle
  const marketListings = generateJobMarket(
    character.careerField,
    character.seed,
    simulation.currentMonthIndex
  );

  const filteredListings = marketListings.filter((job) => {
    if (selectedTierFilter === 'all') return true;
    return String(job.tier) === selectedTierFilter;
  });

  const handleApply = (job) => {
    setIsSubmittingId(job.id);
    setApplicationFeedback(null);

    setTimeout(() => {
      const result = applyForJob(job);
      setIsSubmittingId(null);

      if (result.isAccepted) {
        // Offer modal will pop up via store activeModal
        onClose();
      } else {
        setApplicationFeedback({
          jobId: job.id,
          type: 'error',
          message: `Application declined by ${job.companyName}. A 3-month cooldown has been set.`,
        });
      }
    }, 400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      {...backdropFade}
    >
      <motion.div
        className="w-full max-w-3xl bg-white border-3 border-slate-900 shadow-[8px_8px_0px_#0f172a] p-4 sm:p-6 space-y-4 my-auto max-h-[92vh] flex flex-col"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">💼</span>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
                Dynamic Job Market
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 font-mono">
                Explore openings across tiers in {character.careerField}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono font-black text-sm btn-press-sm"
          >
            ✕
          </button>
        </div>

        {/* Candidate Profile Bar */}
        <div className="p-3 bg-slate-50 border-2 border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">Experience</span>
              <strong className="text-slate-900 font-bold">{currentExp} Years</strong>
            </div>
            <div className="h-6 w-px bg-slate-300" />
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">Skill Rating</span>
              <strong className="text-slate-900 font-bold">{currentSkill.toFixed(1)} / 5.0</strong>
            </div>
            <div className="h-6 w-px bg-slate-300" />
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">Current Role</span>
              <strong className="text-slate-900 font-bold truncate max-w-[150px] inline-block">
                {character.jobTitle}
              </strong>
            </div>
          </div>

          <div className="text-right">
            <span className="text-slate-500 text-[9px] uppercase block">Current Take-Home</span>
            {isUnemployed ? (
              <span className="text-rose-700 font-black">₹0 (Laid off)</span>
            ) : (
              <span className="text-emerald-700 font-black">{formatINR(currentTakeHome)}/mo</span>
            )}
          </div>
        </div>

        {/* Layoff Alert Banner */}
        {isUnemployed && (
          <div className="p-3 bg-rose-50 border-2 border-rose-900 text-xs font-mono text-rose-900 space-y-1 shrink-0 animate-pulse">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Currently Unemployed — Immediate Rehire Available!</span>
            </div>
            <p className="text-[11px] text-rose-800">
              Applying for an open role matching your qualification will immediately re-hire you and stop your emergency fund burn.
            </p>
          </div>
        )}

        {/* Application Feedback Toast if any */}
        <AnimatePresence>
          {applicationFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-2.5 border-2 text-xs font-mono font-bold shrink-0 flex items-center justify-between ${
                applicationFeedback.type === 'error'
                  ? 'bg-rose-100 border-rose-900 text-rose-900'
                  : 'bg-emerald-100 border-emerald-900 text-emerald-900'
              }`}
            >
              <span>{applicationFeedback.message}</span>
              <button
                type="button"
                onClick={() => setApplicationFeedback(null)}
                className="text-xs px-1.5 py-0.5 border border-current ml-2"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tier Filters */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-bold overflow-x-auto pb-1 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedTierFilter('all')}
            className={`px-3 py-1.5 border-2 border-slate-900 transition-colors shrink-0 ${
              selectedTierFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Openings ({marketListings.length})
          </button>
          {[1, 2, 3, 4].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTierFilter(String(tier))}
              className={`px-3 py-1.5 border-2 border-slate-900 transition-colors shrink-0 ${
                selectedTierFilter === String(tier)
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tier {tier}: {JOB_TIERS[tier].label}
            </button>
          ))}
        </div>

        {/* Job Listings Scrollable Container */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {filteredListings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs border-2 border-dashed border-slate-300">
              No positions open in this tier for the current market cycle.
            </div>
          ) : (
            filteredListings.map((job) => {
              const meetsExp = currentExp >= job.requiredExperienceYears;
              const meetsSkill = currentSkill >= job.requiredSkillLevel;
              const isQualified = meetsExp && meetsSkill;

              const isCurrentRole =
                character.jobTitle === job.title && !isUnemployed;

              const cooldownEnd = cooldowns[job.id] || 0;
              const isCooldownActive = cooldownEnd > currentMonth;
              const cooldownLeft = Math.max(0, cooldownEnd - currentMonth);

              const odds = calculateOfferProbability(
                currentExp,
                currentSkill,
                job.requiredExperienceYears,
                job.requiredSkillLevel
              );
              const oddsPercent = Math.round(odds * 100);

              const hikeRupees = job.monthlyTakeHome - currentTakeHome;
              const hikePercent =
                currentTakeHome > 0
                  ? Math.round((hikeRupees / currentTakeHome) * 100)
                  : 100;

              return (
                <div
                  key={job.id}
                  className="p-3.5 sm:p-4 bg-white border-2 border-slate-900 space-y-3 hover:shadow-[3px_3px_0px_#0f172a] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-display font-black text-slate-900 text-sm sm:text-base">
                          {job.title}
                        </h4>
                        <span className="px-1.5 py-0.5 bg-slate-900 text-white font-mono text-[9px] font-bold uppercase">
                          Tier {job.tier}: {job.tierName}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-2 flex-wrap">
                        <span className="text-slate-900 font-black">{job.companyName}</span>
                        <span>·</span>
                        <span>{job.city} ({job.cityTier.toUpperCase()})</span>
                        {job.signingBonus > 0 && (
                          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 border border-purple-800 text-[10px]">
                            +{formatINR(job.signingBonus)} Signing Bonus
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compensation Badge */}
                    <div className="text-left sm:text-right font-mono shrink-0">
                      <span className="text-slate-500 text-[9px] uppercase block">Monthly Take-Home</span>
                      <span className="text-base sm:text-lg font-black text-emerald-700 block">
                        {formatINR(job.monthlyTakeHome)}/mo
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold block">
                        CTC: {formatINR(job.annualCTC)}
                      </span>
                      {hikeRupees > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 border border-emerald-300 inline-block mt-0.5">
                          +{formatINR(hikeRupees)}/mo ({hikePercent >= 0 ? `+${hikePercent}%` : `${hikePercent}%`})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Requirements & Probability Strip */}
                  <div className="p-2.5 bg-slate-50 border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[10px]">Exp Req:</span>
                        <span className={meetsExp ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {job.requiredExperienceYears}+ yrs ({currentExp} yrs)
                        </span>
                        <span>{meetsExp ? '🟢' : '🔴'}</span>
                      </div>
                      <div className="h-3 w-px bg-slate-300 hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 text-[10px]">Skill Req:</span>
                        <span className={meetsSkill ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {job.requiredSkillLevel.toFixed(1)}+ ({currentSkill.toFixed(1)})
                        </span>
                        <span>{meetsSkill ? '🟢' : '🔴'}</span>
                      </div>
                    </div>

                    {/* Acceptance Odds */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px] uppercase">Acceptance Odds:</span>
                      <div className="w-16 h-2 bg-slate-200 border border-slate-900 overflow-hidden">
                        <div
                          className={`h-full ${
                            oddsPercent >= 60 ? 'bg-emerald-500' : oddsPercent >= 35 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${oddsPercent}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900">{oddsPercent}%</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[10px] font-mono text-slate-500">
                      {!isQualified ? (
                        <span className="text-rose-700 font-bold">
                          Requirements not met: needs {!meetsExp ? `${job.requiredExperienceYears}+ yrs exp` : ''}{' '}
                          {!meetsExp && !meetsSkill ? '& ' : ''}
                          {!meetsSkill ? `${job.requiredSkillLevel.toFixed(1)}+ skill` : ''}
                        </span>
                      ) : isCooldownActive ? (
                        <span className="text-amber-800 font-bold">
                          Cooldown active: available in {cooldownLeft} month{cooldownLeft > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          ✓ Qualified candidate — ready for interview
                        </span>
                      )}
                    </div>

                    {isCurrentRole ? (
                      <span className="px-3 py-1.5 bg-slate-200 text-slate-700 font-mono text-xs font-bold border border-slate-900">
                        Current Role
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(job)}
                        disabled={!isQualified || isCooldownActive || isSubmittingId === job.id}
                        className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider border-2 border-slate-900 transition-all ${
                          !isQualified || isCooldownActive
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-300'
                            : 'bg-slate-900 hover:bg-slate-800 text-white btn-press shadow-[2px_2px_0px_#0f172a]'
                        }`}
                      >
                        {isSubmittingId === job.id
                          ? 'Interviewing...'
                          : isCooldownActive
                          ? `Cooldown (${cooldownLeft}m)`
                          : !isQualified
                          ? 'Locked'
                          : '💼 Apply for Role'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-[10px] font-mono text-slate-500">
            Market refreshes automatically every 6 simulation months.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press"
          >
            Close Market
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

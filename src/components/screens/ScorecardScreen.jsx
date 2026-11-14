import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { evaluateScorecard } from '../../engine/scoringEngine.js';
import { formatINR } from '../../utils/format.js';
import {
  pageSlideUp,
  staggerContainer,
  fadeInUp,
  scaleIn,
  popIn,
} from '../../utils/motion.js';

/* ─── Animated Counter ─── */
function useAnimatedCounter(target, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

/* ─── Pillar Bar ─── */
function PillarBar({ label, score, maxScore, delay = 0 }) {
  const pct = Math.min(100, Math.round((score / maxScore) * 100));
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 sm:gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-[11px] sm:text-xs font-mono font-bold text-slate-900">
        {score}/{maxScore}
      </div>
      <div className="w-8 sm:w-11 h-20 sm:h-28 bg-slate-100 border-2 border-slate-900 relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-emerald-500"
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <div className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-700 text-center leading-tight max-w-[65px] sm:max-w-[70px]">
        {label}
      </div>
    </motion.div>
  );
}

export default function ScorecardScreen() {
  const store = useGameStore();
  const { character, goals, resetGame, setConfig } = store;
  const [activeTab, setActiveTab] = useState('milestones'); // 'milestones' | 'career' | 'assets'

  if (!character) return null;

  const result = evaluateScorecard(store);
  const {
    finalAge,
    grade,
    title,
    breakdown,
    totalNetWorth,
    totalInvestments,
    homePropertyAssetValue = 0,
    liquidBankBalance,
    outstandingDebt,
    monthlyPassiveIncome,
    annualLivingExpenses,
    fiRatio,
    isFinanciallyIndependent,
    milestoneAudits = [],
    assetAudit = {},
    careerAudit = {},
    topCounterfactuals = [],
  } = result;

  const animatedScore = useAnimatedCounter(breakdown.totalScore, 1500);
  const animatedNetWorth = useAnimatedCounter(totalNetWorth, 1500);

  const handlePlayAgainSameSeed = () => {
    const seed = character.seed;
    resetGame();
    setConfig({ seed });
  };

  const handleRollNewLife = () => {
    resetGame();
  };

  return (
    <motion.div
      className="min-h-screen bg-mesh-light text-slate-900 flex flex-col justify-start items-center p-3 sm:p-6 lg:p-8 overflow-x-hidden"
      {...pageSlideUp}
    >
      <motion.div
        className="w-full max-w-4xl space-y-4 sm:space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 sm:pb-3 border-b-2 border-slate-900 gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Financial Life Retrospective (Age {finalAge || 60})
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black text-slate-900">
              {character.name}'s Strategic Debrief
            </h1>
          </div>
          <div className="text-xs font-mono font-bold text-slate-600 sm:text-right">
            Age 23 to {finalAge || 60} • 37 Years Simulated • Seed <span className="text-blue-700">#{character.seed}</span>
          </div>
        </div>

        {/* ─── Grade Hero Banner ─── */}
        <motion.div
          className="card-neopop p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
          variants={scaleIn}
        >
          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <motion.div
              className="w-20 h-20 sm:w-24 sm:h-24 border-3 border-slate-900 bg-amber-400 text-slate-950 flex items-center justify-center font-display font-black text-4xl sm:text-5xl shadow-hard shrink-0"
              {...popIn}
            >
              {grade}
            </motion.div>

            <div className="space-y-1 min-w-0">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Lifetime Financial Assessment
              </span>
              <h2 className="font-display text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                🌟 Grade {grade} ({animatedScore} / 100) — {title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-700">
                <span>Net Worth: <strong>{formatINR(animatedNetWorth)}</strong></span>
                <span>•</span>
                <span>Passive: <strong className="text-emerald-700">{formatINR(monthlyPassiveIncome)}/mo</strong></span>
                <span>•</span>
                <span>
                  Debt: <strong className={outstandingDebt === 0 ? 'text-emerald-700' : 'text-rose-600'}>
                    {outstandingDebt === 0 ? '₹0 (Free)' : formatINR(outstandingDebt)}
                  </strong>
                </span>
                {homePropertyAssetValue > 0 && (
                  <>
                    <span>•</span>
                    <span>Real Estate: <strong className="text-blue-700">{formatINR(homePropertyAssetValue)}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right bg-slate-50 border-2 border-slate-900 p-3 sm:p-4 shrink-0 font-mono flex sm:flex-col justify-between items-center sm:items-end">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 block">FI/RE Ratio (4% Rule)</span>
              <div className={`text-xs sm:text-sm font-black ${isFinanciallyIndependent ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isFinanciallyIndependent ? '100% SELF-SUSTAINING' : 'PARTIAL COVERAGE'}
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-600 sm:mt-1">
              Covers <strong>{(fiRatio * 100).toFixed(0)}%</strong> of living costs ({formatINR(Math.round(annualLivingExpenses / 12))}/mo)
            </div>
          </div>
        </motion.div>

        {/* ─── Quantitative Scoring Pillars ─── */}
        <div className="card-neopop bg-white p-3.5 sm:p-5 space-y-3">
          <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            5 Quantitative Pillars Breakdown
          </span>
          <div className="flex items-end justify-around py-1">
            <PillarBar label="FI/RE 4%" score={breakdown.financialIndependenceScore} maxScore={35} delay={0.1} />
            <PillarBar label="Milestones" score={breakdown.milestoneCompletionScore} maxScore={25} delay={0.2} />
            <PillarBar label="Decisions" score={breakdown.decisionQualityScore} maxScore={20} delay={0.3} />
            <PillarBar label="Assets" score={breakdown.assetSuitabilityScore} maxScore={10} delay={0.4} />
            <PillarBar label="Debt Free" score={breakdown.debtFreeScore} maxScore={10} delay={0.5} />
          </div>
        </div>

        {/* ─── Retrospective Navigation Tabs ─── */}
        <div className="flex border-b-2 border-slate-900 gap-1 sm:gap-2">
          <button
            type="button"
            data-tab="milestones"
            onClick={() => setActiveTab('milestones')}
            className={`py-2.5 px-3 sm:px-5 font-mono font-bold text-xs sm:text-sm border-t-2 border-x-2 border-slate-900 transition-colors ${
              activeTab === 'milestones'
                ? 'bg-amber-400 text-slate-950 font-black -mb-[2px] pb-[12px]'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            🎯 Milestones & Decisions
          </button>
          <button
            type="button"
            data-tab="career"
            onClick={() => setActiveTab('career')}
            className={`py-2.5 px-3 sm:px-5 font-mono font-bold text-xs sm:text-sm border-t-2 border-x-2 border-slate-900 transition-colors ${
              activeTab === 'career'
                ? 'bg-amber-400 text-slate-950 font-black -mb-[2px] pb-[12px]'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            💼 Career & What-Ifs
          </button>
          <button
            type="button"
            data-tab="assets"
            onClick={() => setActiveTab('assets')}
            className={`py-2.5 px-3 sm:px-5 font-mono font-bold text-xs sm:text-sm border-t-2 border-x-2 border-slate-900 transition-colors ${
              activeTab === 'assets'
                ? 'bg-amber-400 text-slate-950 font-black -mb-[2px] pb-[12px]'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            📊 Asset Audit
          </button>
        </div>

        {/* ─── TAB 1: Milestones & Decisions ─── */}
        {activeTab === 'milestones' && (
          <div className="space-y-3" data-testid="tab-content-milestones">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                Section 1: Milestones & Shortfall Decision Audit
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {milestoneAudits.filter((m) => m.status !== 'shortfall').length} of {milestoneAudits.length} Funded
              </span>
            </div>

            <div className="space-y-3">
              {milestoneAudits.map((item) => {
                const isEarly = item.status === 'filled_early';
                const isOnTime = item.status === 'filled_on_time';
                const isShortfall = item.status === 'shortfall';

                return (
                  <div
                    key={item.goalId}
                    data-milestone-id={item.goalId}
                    className="card-neopop bg-white p-3.5 sm:p-5 space-y-3"
                  >
                    {/* Header line: Icon, Name, Target, Outcome Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div>
                          <h3 className="font-display font-bold text-base sm:text-lg text-slate-900">
                            {item.name}
                          </h3>
                          <div className="text-xs font-mono text-slate-600">
                            Target: <strong>{formatINR(item.targetAmount)}</strong> • Accumulated: {formatINR(item.finalAccumulated)}
                          </div>
                        </div>
                      </div>

                      {/* Outcome Badge */}
                      <div className="shrink-0">
                        {isEarly && (
                          <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 border-2 border-slate-900 font-mono font-bold text-xs">
                            Filled Early (+{item.monthsDifference} mos)
                          </span>
                        )}
                        {isOnTime && (
                          <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 border-2 border-slate-900 font-mono font-bold text-xs">
                            ✓ Funded 100% On-Time
                          </span>
                        )}
                        {isShortfall && (
                          <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-800 border-2 border-slate-900 font-mono font-bold text-xs">
                            Shortfall (-{formatINR(item.shortfallAmount)})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Decision Details & Resolution Taken */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-none space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Resolution Taken</span>
                        <div className="font-bold text-slate-900">
                          {item.resolutionTaken === 'postpone' && (
                            <span className="text-amber-700">
                              Postponed by +{Math.round(Math.abs(item.monthsDifference) / 12) || 2} Years
                            </span>
                          )}
                          {item.resolutionTaken === 'loan' && (
                            <span className="text-rose-700">
                              Financed via Loan ({formatINR(item.shortfallAmount)})
                            </span>
                          )}
                          {item.resolutionTaken === 'other_fund' && (
                            <span className="text-blue-700">
                              Funded from Liquid Cash / Emergency Buffer
                            </span>
                          )}
                          {item.resolutionTaken === 'none' && (
                            <span className="text-emerald-700">
                              {isEarly ? 'Self-Funded Ahead of Schedule' : (isOnTime ? 'Self-Funded Fully On-Time' : 'Unfunded Shortfall')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-none space-y-1">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Instrument Suitability</span>
                        <div className="text-slate-800">
                          <strong className="uppercase">{item.instrumentUsed}</strong> —{' '}
                          <span
                            className={`font-bold ${
                              item.instrumentSuitability?.verdict === 'optimal'
                                ? 'text-emerald-700'
                                : (item.instrumentSuitability?.verdict === 'dangerous' ? 'text-rose-700' : 'text-amber-700')
                            }`}
                          >
                            [{item.instrumentSuitability?.verdict?.toUpperCase()}]
                          </span>{' '}
                          {item.instrumentSuitability?.critique}
                        </div>
                      </div>
                    </div>

                    {/* Educational Verdict Callout */}
                    <div className="p-3 bg-amber-50/70 border-2 border-slate-900 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        {item.postponeEvaluation ? (
                          <>
                            {item.postponeEvaluation.rating === 'excellent' && (
                              <span className="font-bold text-emerald-800 font-sans text-xs">🟢 Smart Move!</span>
                            )}
                            {item.postponeEvaluation.rating === 'acceptable' && (
                              <span className="font-bold text-blue-800 font-sans text-xs">🔵 Prudent Defense</span>
                            )}
                            {item.postponeEvaluation.rating === 'poor' && (
                              <span className="font-bold text-rose-800 font-sans text-xs">🔴 Unnecessary Delay</span>
                            )}
                          </>
                        ) : isEarly ? (
                          <span className="font-bold text-emerald-800 font-sans text-xs">🌟 Outstanding Execution!</span>
                        ) : isOnTime ? (
                          <span className="font-bold text-emerald-800 font-sans text-xs">🟢 Perfect Execution!</span>
                        ) : (
                          <span className="font-bold text-amber-800 font-sans text-xs">⚠️ Milestone Shortfall</span>
                        )}
                      </div>
                      <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
                        {item.postponeEvaluation
                          ? item.postponeEvaluation.reason
                          : isEarly
                          ? 'Early milestone completion unlocked lower lifetime financing costs and compound growth acceleration.'
                          : isOnTime
                          ? 'Funded 100% on schedule debt-free without compromising long-term wealth compounding.'
                          : item.resolutionTaken === 'loan'
                          ? 'Financed milestone deficit with debt; monthly EMI interest charges created an ongoing surplus drag.'
                          : 'Milestone reached target age underfunded; capital gap required draining liquid reserves.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB 2: Career & What-Ifs ─── */}
        {activeTab === 'career' && (
          <div className="space-y-4" data-testid="tab-content-career">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
              Section 2: Career Progression & Strategic What-If Engine
            </span>

            {/* Career Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="card-neopop-sm bg-white p-3 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Upskilling Courses</span>
                <div className="text-xl font-mono font-black text-slate-900">
                  {careerAudit.totalUpskillingCoursesCompleted || 0} Completed
                </div>
                <div className="text-[10px] font-mono text-slate-600">Bootcamps & Certifications</div>
              </div>

              <div className="card-neopop-sm bg-white p-3 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Job Market Switches</span>
                <div className="text-xl font-mono font-black text-blue-700">
                  {careerAudit.totalJobSwitches || 0} Switches
                </div>
                <div className="text-[10px] font-mono text-slate-600">Dynamic Market Transitions</div>
              </div>

              <div className="card-neopop-sm bg-white p-3 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Junior Tier Tenure</span>
                <div className="text-xl font-mono font-black text-slate-900">
                  {careerAudit.yearsInTier1 || 0} Years
                </div>
                <div className="text-[10px] font-mono text-slate-600">Entry/Junior Role Duration</div>
              </div>
            </div>

            {/* Stagnation Banner */}
            {careerAudit.careerStagnationDetected ? (
              <div className="card-neopop p-4 bg-rose-50 border-rose-900 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <h4 className="font-display font-black text-base text-rose-900">
                    Career Stagnation Detected (≥ 6 Years in Junior Tier)
                  </h4>
                </div>
                <p className="text-xs font-mono text-rose-800 leading-relaxed">
                  You remained in entry/junior roles for {careerAudit.yearsInTier1} years without completing an upskilling course or switching employers.
                  Stagnating in early roles cost an estimated{' '}
                  <strong className="text-rose-950 font-black">{formatINR(careerAudit.estimatedMissedEarnings)}</strong> in missed lifetime take-home income!
                </p>
              </div>
            ) : (
              <div className="card-neopop p-4 bg-emerald-50 border-emerald-900 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <h4 className="font-display font-black text-base text-emerald-900">
                    Proactive Career Trajectory & Pacing
                  </h4>
                </div>
                <p className="text-xs font-mono text-emerald-800 leading-relaxed">
                  Regular upskilling and timely job hopping kept your salary compounding ahead of inflation, avoiding entry-level tenure stagnation.
                </p>
              </div>
            )}

            {/* Career Advice Box */}
            <div className="card-neopop-sm bg-white p-3.5 space-y-1 text-xs">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Strategic Career Advice</span>
              <p className="font-mono text-slate-800 leading-relaxed">{careerAudit.advice}</p>
            </div>

            {/* Counterfactual Cards Grid */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                Top Counterfactual Insights ("What You Could Have Done")
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topCounterfactuals.map((card, idx) => {
                  const isOpp = card.impactType === 'opportunity';
                  const isPos = card.impactType === 'positive';
                  const isNeg = card.impactType === 'negative';

                  return (
                    <div
                      key={idx}
                      className={`card-neopop p-3.5 space-y-2 flex flex-col justify-between ${
                        isPos ? 'bg-emerald-50/50' : (isNeg ? 'bg-rose-50/50' : 'bg-amber-50/50')
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 border border-slate-900 bg-white">
                            {isPos ? '🟢 Strength' : (isNeg ? '⚠️ Cost Drag' : '💡 Opportunity')}
                          </span>
                          <span
                            className={`text-xs font-mono font-black ${
                              isNeg ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {card.potentialNetWorthDelta >= 0
                              ? `+${formatINR(card.potentialNetWorthDelta)}`
                              : `-${formatINR(Math.abs(card.potentialNetWorthDelta))}`}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-slate-900">{card.title}</h4>
                        <p className="text-[11px] font-mono text-slate-700 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Asset Audit ─── */}
        {activeTab === 'assets' && (
          <div className="space-y-4" data-testid="tab-content-assets">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
              Section 3: Asset Allocation & Horizon Suitability Audit
            </span>

            {/* Emergency Fund Placement */}
            <div className="card-neopop bg-white p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Emergency Reserve Placement
                    </h3>
                    <div className="text-xs font-mono text-slate-600">
                      Instrument Chosen: <strong className="uppercase">{assetAudit.emergencyFundInstrument}</strong>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 font-mono font-bold text-xs border-2 border-slate-900 self-start sm:self-auto ${
                    assetAudit.emergencyFundCritique?.status === 'optimal'
                      ? 'bg-emerald-100 text-emerald-900'
                      : (assetAudit.emergencyFundCritique?.status === 'dangerous' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900')
                  }`}
                >
                  Verdict: {assetAudit.emergencyFundCritique?.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-800 leading-relaxed">
                {assetAudit.emergencyFundCritique?.message}
              </p>
            </div>

            {/* Long-Term & Retirement Corpus */}
            <div className="card-neopop bg-white p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌴</span>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      Long-Term & Retirement Equity Ratio
                    </h3>
                    <div className="text-xs font-mono text-slate-600">
                      Horizon: 10 to 37 Years
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-base font-black text-slate-900">
                    {assetAudit.longTermEquityRatio}% Equity Allocation
                  </div>
                  <div className="text-[10px] text-slate-500">Mutual Funds / Index Funds</div>
                </div>
              </div>

              <p className="text-xs font-mono text-slate-800 leading-relaxed">
                {assetAudit.longTermEquityRatio >= 50
                  ? '🟢 Optimal! Long horizon absorbed equity market volatility and captured ~12% p.a. multi-decade compounding.'
                  : '⚠️ Sub-Optimal: Heavy placement of multi-decade retirement funds in low-yield cash or FDs allowed inflation to erode purchasing power.'}
              </p>
            </div>

            {/* Early Exit Penalties & Market Losses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="card-neopop-sm bg-white p-3.5 space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">
                  Fixed Deposit Premature Exit Penalties
                </span>
                <div
                  className={`text-xl font-mono font-black ${
                    assetAudit.penaltiesPaidFD > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {formatINR(assetAudit.penaltiesPaidFD || 0)}
                </div>
                <p className="text-[11px] font-mono text-slate-600 leading-tight">
                  {assetAudit.penaltiesPaidFD > 0
                    ? `Premature emergency liquidations triggered ₹${(assetAudit.penaltiesPaidFD).toLocaleString('en-IN')} in 1.5% bank early exit penalty deductions.`
                    : 'Zero early exit penalty fees incurred on fixed deposits.'}
                </p>
              </div>

              <div className="card-neopop-sm bg-white p-3.5 space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">
                  Realized Market Losses in Drawdowns
                </span>
                <div
                  className={`text-xl font-mono font-black ${
                    assetAudit.marketLossesRealized > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {formatINR(assetAudit.marketLossesRealized || 0)}
                </div>
                <p className="text-[11px] font-mono text-slate-600 leading-tight">
                  {assetAudit.marketLossesRealized > 0
                    ? `Forced liquidation of equity funds during market dips locked in ₹${(assetAudit.marketLossesRealized).toLocaleString('en-IN')} in permanent capital losses.`
                    : 'Zero forced panic sales during market corrections.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Bottom Action Controls ─── */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={handlePlayAgainSameSeed}
            className="w-full sm:flex-1 py-3.5 px-6 bg-white border-2 border-slate-900 font-mono font-bold text-xs uppercase btn-press text-slate-900 shadow-hard hover:bg-slate-50 transition-colors"
          >
            🔁 Play Again (Same Seed)
          </button>

          <button
            type="button"
            onClick={handleRollNewLife}
            className="w-full sm:flex-1 py-3.5 px-6 bg-slate-900 text-white font-display font-black text-sm uppercase tracking-wider btn-press hover:bg-slate-800 transition-colors shadow-hard"
          >
            🎲 Roll New Life
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}

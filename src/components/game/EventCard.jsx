import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../engine/store';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const EventCard = ({ event, onChoice }) => {
  const store = useGameStore();
  const [optInInsurance, setOptInInsurance] = useState(true);
  const [weddingContributionAmount, setWeddingContributionAmount] = useState(25000);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Typewriter effect state for suspenseful reveal
  const fullText = event?.description || '';
  const [displayedChars, setDisplayedChars] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayedChars(0);
    setIsTypingComplete(false);

    if (!fullText) {
      setIsTypingComplete(true);
      return;
    }

    let index = 0;
    const speedMs = 18; // ~18ms per character
    const timer = setInterval(() => {
      index += 1;
      setDisplayedChars(index);
      if (index >= fullText.length) {
        clearInterval(timer);
        setIsTypingComplete(true);
      }
    }, speedMs);

    return () => clearInterval(timer);
  }, [event?.id, event?.name, fullText]);

  const handleFastReveal = () => {
    setDisplayedChars(fullText.length);
    setIsTypingComplete(true);
  };

  if (!event) return null;

  const impact = event.financialImpact || {};
  const isGood = event.type === 'good' || event.type === 'bonus' || impact.type === 'gain' || impact.type === 'gain_recurring';
  const isBad = event.type === 'bad' || impact.type === 'loss' || impact.type === 'income_loss' || impact.type === 'inflation';
  const isBusiness = impact.type === 'business';
  const isMedical = event.id === 'medical_emergency' || event.id === 'uninsured_illness';
  const isWedding = event.id === 'family_wedding';

  let borderColor = 'border-accent-action';
  let badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
  if (isGood) {
    borderColor = 'border-accent-stable-dark';
    badgeBg = 'bg-accent-stable/30 text-accent-stable-dark border-accent-stable';
  } else if (isBad) {
    borderColor = 'border-accent-caution-dark';
    badgeBg = 'bg-accent-caution/20 text-accent-caution-dark border-accent-caution';
  } else if (isBusiness) {
    borderColor = 'border-indigo-400';
    badgeBg = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  }

  const weddingSelectedAmount = Math.max(0, Number(weddingContributionAmount) || 0);
  const expenseAmt = isWedding ? weddingSelectedAmount : (impact.outOfPocket || impact.amount || 0);

  const handleChoiceClick = (choiceIdx) => {
    const extraData = { isAuto: false };
    if (isMedical && optInInsurance) {
      extraData.optInHealthInsurance = true;
    }
    if (isWedding) {
      extraData.contributionAmount = weddingSelectedAmount;
      onChoice(0, extraData);
    } else {
      onChoice(choiceIdx, extraData);
    }
  };

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full my-2 p-3 bg-white rounded-2xl shadow-md border-2 ${borderColor} cursor-pointer hover:bg-gray-50 transition`}
        onClick={() => setIsCollapsed(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
            <span className="text-2xl shrink-0">{event.icon || '⚡'}</span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                ⚡ Decision Pending (Sim Paused)
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary truncate">
                {event.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsCollapsed(false); }}
            className="text-xs font-bold text-accent-action bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full shrink-0 transition"
          >
            Expand Details ↓
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      className={`w-full my-2 p-3.5 sm:p-4 bg-white rounded-2xl shadow-lg border-2 ${borderColor} relative overflow-hidden box-border`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
          <span className="text-2xl shrink-0">{event.icon || '⚡'}</span>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              {event.type === 'choice' ? 'Decision Required' : 'Life Event'}
            </span>
            <h3 className="text-base font-extrabold text-text-primary leading-tight truncate">
              {event.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
          {!isTypingComplete ? (
            <button
              type="button"
              onClick={handleFastReveal}
              className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200 transition"
              title="Skip typing animation and reveal options"
            >
              Skip ⏩
            </button>
          ) : (
            <span className="text-[10px] font-semibold bg-gray-100 text-text-muted px-2 py-0.5 rounded-full">
              Sim Paused
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="text-[10px] text-text-muted hover:text-text-primary px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-100 transition font-medium"
            title="Minimize event card to inspect accounts"
          >
            Minimize ⤡
          </button>
        </div>
      </div>

      {/* Typewriter Event Narrative */}
      <div
        className="text-xs text-text-muted mb-3.5 leading-relaxed cursor-pointer select-none bg-slate-50/80 p-3 rounded-xl border border-slate-100 min-h-[52px]"
        onClick={handleFastReveal}
        title={!isTypingComplete ? "Tap to reveal instantly" : undefined}
      >
        <span>{fullText.slice(0, displayedChars)}</span>
        {!isTypingComplete && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-indigo-600 animate-pulse align-middle" />
        )}
      </div>

      {!isTypingComplete && (
        <div 
          onClick={handleFastReveal}
          className="text-center py-1 mb-2 text-[10px] text-indigo-600 font-bold cursor-pointer hover:underline"
        >
          Tap anywhere to reveal choices ⏩
        </div>
      )}

      {/* Financial Impact & Decision Section (Appears after typing completes) */}
      {isTypingComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Financial Impact Box */}
          {impact.type && (
            <div className={`p-3 rounded-xl border mb-3.5 ${badgeBg}`}>
              {/* Annual Tax Assessment */}
              {event.id === 'annual_tax' && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block">Annual Tax Due (New Regime)</span>
                    <span className="text-[10px] text-text-muted">Assessed on past 12 monthly statements</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-red-600">
                      -{formatCurrency(impact.amount || 0)}
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      Total Earned: {formatCurrency(impact.annualIncome || 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Annual Inflation Adjustment */}
              {event.id === 'annual_inflation' && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block">Annual Review</span>
                    <span className="text-[10px] text-text-muted">
                      {impact.hikeAmount > 0 ? `Raise: +${formatCurrency(impact.hikeAmount)}/mo` : 'Cost of Living Adjustment'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-extrabold ${(impact.hikeAmount || 0) >= (impact.increaseAmount || 0) ? 'text-green-700' : 'text-red-600'}`}>
                      {(impact.hikeAmount || 0) >= (impact.increaseAmount || 0) ? '+' : '-'}
                      {formatCurrency(Math.abs((impact.hikeAmount || 0) - (impact.increaseAmount || 0)))}/mo
                    </span>
                    <span className="text-[10px] text-text-muted block">
                      Living cost: +{formatCurrency(impact.increaseAmount || 0)}/mo
                    </span>
                  </div>
                </div>
              )}

              {/* Business Opportunity ROI */}
              {impact.type === 'business' && (
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span>VENTURE INVESTMENT</span>
                    <span className="text-indigo-700">~{impact.annualRoi}% Annual ROI</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center bg-white/80 p-2 rounded-lg text-text-primary">
                    <div>
                      <span className="text-[10px] text-text-muted block">Upfront Capital</span>
                      <span className="font-bold text-xs text-red-600">-{formatCurrency(impact.investmentCost)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Monthly Cashflow</span>
                      <span className="font-bold text-xs text-green-700">+{formatCurrency(impact.monthlyReturn)}/mo</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Payback Period</span>
                      <span className="font-bold text-xs">~{impact.paybackMonths} Mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Cash Loss / Wedding */}
              {(impact.type === 'loss' || isWedding) && event.id !== 'annual_tax' && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block">
                      {isWedding ? 'Wedding Contribution' : 'Financial Deduction'}
                    </span>
                    {impact.insured && (
                      <span className="text-[11px] text-green-700 font-medium">
                        🛡️ Protected: Insurance covers 80-90%
                      </span>
                    )}
                    {isWedding && (
                      <span className="text-[10px] text-amber-800 font-medium">
                        Chosen: {formatCurrency(weddingSelectedAmount)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-accent-caution-dark">
                      -{formatCurrency(expenseAmt)}
                    </span>
                    {impact.billAmount && impact.insured && (
                      <span className="text-[10px] text-text-muted block line-through">
                        {formatCurrency(impact.billAmount)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Recurring Salary Hike */}
              {impact.type === 'gain_recurring' && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block text-accent-stable-dark">Monthly Cashflow Boost</span>
                    {impact.hikePercent && (
                      <span className="text-[11px] text-text-muted">+{impact.hikePercent}% raise</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-accent-stable-dark">
                      +{formatCurrency(impact.hikeAmount)}/mo
                    </span>
                  </div>
                </div>
              )}

              {/* Job Loss with Severance */}
              {impact.type === 'income_loss' && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block text-rose-800">Employment Transition</span>
                    <span className="text-[11px] text-text-muted">
                      {impact.severance > 0 ? '2-month severance package included' : 'Salaried role discontinued'}
                    </span>
                  </div>
                  <div className="text-right">
                    {impact.severance > 0 ? (
                      <div>
                        <span className="text-base font-extrabold text-emerald-700 block">
                          +{formatCurrency(impact.severance)}
                        </span>
                        <span className="text-[9px] text-text-muted">Severance (Upfront)</span>
                      </div>
                    ) : (
                      <span className="text-xs font-black text-rose-700">₹0/mo Salary</span>
                    )}
                  </div>
                </div>
              )}

              {/* Job Switch or Senior Role */}
              {impact.type === 'job_switch' && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block text-blue-900">Leadership Compensation</span>
                    <span className="text-[11px] text-text-muted">
                      From {formatCurrency(impact.currentSalary)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-green-700">
                      Corporate Offers Below
                    </span>
                  </div>
                </div>
              )}

              {/* Lump Sum Gain */}
              {impact.type === 'gain' && (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold block text-accent-stable-dark">Cash Inflow</span>
                    <span className="text-[11px] text-text-muted">Credited directly to liquid savings</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-accent-stable-dark">
                      +{formatCurrency(impact.amount || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flexible Wedding Contribution Tiers */}
          {isWedding && (
            <div className="mb-3.5 p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900 block">
                  Choose or Enter Contribution Amount:
                </span>
                <span className="text-xs font-extrabold text-amber-800">
                  ₹{weddingSelectedAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Modest', amt: 10000 },
                  { label: 'Standard', amt: 25000 },
                  { label: 'Generous', amt: 50000 },
                ].map(tier => (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => setWeddingContributionAmount(tier.amt)}
                    className={`p-2 rounded-lg text-center border transition ${
                      weddingSelectedAmount === tier.amt
                        ? 'bg-amber-500 text-white font-bold border-amber-600 shadow-sm ring-2 ring-amber-300'
                        : 'bg-white text-text-primary border-amber-200 font-medium hover:bg-amber-50'
                    }`}
                  >
                    <span className="text-[10px] block opacity-80">{tier.label}</span>
                    <span className="text-xs font-bold">{formatCurrency(tier.amt)}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 pt-1 border-t border-amber-200/60">
                <span className="text-xs text-amber-900 font-bold whitespace-nowrap">Custom Amount: ₹</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={weddingContributionAmount}
                  onChange={(e) => setWeddingContributionAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs font-bold p-1.5 rounded-lg border border-amber-300 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Enter amount"
                />
              </div>
            </div>
          )}

          {/* Medical Insurance Opt-In Prompt */}
          {isMedical && !store.hasHealthInsurance && (
            <div className="mb-3.5 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="optInInsurance"
                  checked={optInInsurance}
                  onChange={(e) => setOptInInsurance(e.target.checked)}
                  className="rounded text-accent-action focus:ring-accent-action h-4 w-4"
                />
                <label htmlFor="optInInsurance" className="text-xs text-blue-950 font-medium cursor-pointer">
                  Auto-enroll in Health Insurance (+₹750/mo premium)
                </label>
              </div>
              <span className="text-[10px] text-blue-700 font-bold">Recommended</span>
            </div>
          )}

          {/* Choice Buttons */}
          <div className="space-y-2">
            {isWedding ? (
              <Button
                fullWidth
                variant="primary"
                className="!py-2.5 !px-3 text-left justify-start"
                onClick={() => handleChoiceClick(0)}
              >
                <div className="flex flex-col text-left w-full">
                  <span className="font-bold text-xs sm:text-sm text-text-primary">
                    Contribute {formatCurrency(weddingSelectedAmount)} to Wedding
                  </span>
                  <span className="text-[11px] text-text-muted mt-0.5 font-normal leading-snug">
                    Deducts strictly from your liquid savings buffer.
                  </span>
                </div>
              </Button>
            ) : (
              event.options?.map((opt, i) => (
                <Button
                  key={i}
                  fullWidth
                  variant={i === 0 ? 'primary' : 'secondary'}
                  className="!py-2.5 !px-3 text-left justify-start"
                  onClick={() => handleChoiceClick(i)}
                >
                  <div className="flex flex-col text-left w-full">
                    <span className="font-bold text-xs sm:text-sm text-text-primary">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="text-[11px] text-text-muted mt-0.5 font-normal leading-snug">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </Button>
              ))
            )}

            {(!event.options || event.options.length === 0) && !isWedding && (
              <Button
                fullWidth
                variant="primary"
                className="!py-2.5 !px-3 text-left justify-start"
                onClick={() => handleChoiceClick(0)}
              >
                <span className="font-bold text-xs sm:text-sm text-text-primary">
                  Acknowledge & Continue
                </span>
              </Button>
            )}
          </div>

          <div className="mt-2.5 text-center">
            <span className="text-[10px] text-text-muted">
              💡 You can browse Bank, Investments, Loans, and Income tabs below before deciding.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EventCard;

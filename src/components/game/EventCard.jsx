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

  if (!event) return null;

  const impact = event.financialImpact || {};
  const isGood = event.type === 'good' || event.type === 'bonus' || impact.type === 'gain' || impact.type === 'gain_recurring';
  const isBad = event.type === 'bad' || impact.type === 'loss' || impact.type === 'income_loss' || impact.type === 'inflation';
  const isBusiness = impact.type === 'business';
  const isMedical = event.id === 'medical_emergency' || event.id === 'uninsured_illness';
  const isWedding = event.id === 'family_wedding';
  const isSingleOption = !event.options || event.options.length <= 1;

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
  const isDeficit = expenseAmt > 0 && expenseAmt > store.pool;

  const [countdown, setCountdown] = useState(5.0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Reset timer on new event
  useEffect(() => {
    setCountdown(5.0);
    setIsTimerPaused(false);
  }, [event?.id, event?.name]);

  const handleChoiceClick = (choiceIdx, isAuto = false) => {
    const extraData = { isAuto };
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

  // 5-second auto-select countdown for single-option cards
  useEffect(() => {
    if (!isSingleOption || isWedding) return;
    if (isTimerPaused || isCollapsed || store.activeTab) return;

    const interval = 100;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0.15) {
          clearInterval(timer);
          handleChoiceClick(0, true);
          return 0;
        }
        return Math.max(0, +(prev - 0.1).toFixed(1));
      });
    }, interval);

    return () => clearInterval(timer);
  }, [event?.id, isSingleOption, isWedding, isTimerPaused, isCollapsed, store.activeTab, optInInsurance, weddingSelectedAmount]);

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
          {isSingleOption && !isWedding ? (
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition flex items-center gap-1 ${
                isTimerPaused
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              title={isTimerPaused ? "Click to resume 5-second countdown" : "Click to pause timer and read"}
            >
              <span>{isTimerPaused ? '▶️ Resume' : '⏸️'}</span>
              <span>{isTimerPaused ? 'Paused' : `${Math.ceil(countdown)}s`}</span>
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
            title="Minimize event card to view dashboard"
          >
            Minimize ⤡
          </button>
        </div>
      </div>

      <p className="text-xs text-text-muted mb-3 leading-relaxed">
        {event.description}
      </p>

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

          {/* Job Switch or Senior Role */}
          {impact.type === 'job_switch' && (
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold block text-blue-900">Leadership Compensation</span>
                <span className="text-[11px] text-text-muted">
                  From {formatCurrency(impact.currentSalary)} ➔ {formatCurrency(impact.newSalary)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-green-700">
                  +{formatCurrency(impact.diff)}/mo
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

      {/* Flexible Wedding Contribution Tiers & Custom Amount */}
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
              step="1000"
              value={weddingContributionAmount}
              onChange={(e) => setWeddingContributionAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="min-w-0 flex-1 px-2.5 py-1 text-xs border border-amber-300 rounded-lg bg-white font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="e.g. 15000"
            />
          </div>
        </div>
      )}

      {/* Immediate Health Insurance Opt-in during Illness */}
      {isMedical && !store.hasHealthInsurance && (
        <div className="mb-3.5 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-900 block">
              🛡️ Activate Health Insurance Now?
            </span>
            <span className="text-[10px] text-blue-700">
              ₹750/mo premium · Protects future medical bills up to 80%
            </span>
          </div>
          <input
            type="checkbox"
            checked={optInInsurance}
            onChange={e => setOptInInsurance(e.target.checked)}
            className="w-5 h-5 accent-accent-action rounded cursor-pointer ml-2"
          />
        </div>
      )}

      {/* Deficit / Safety Warning */}
      {isDeficit && (
        <div className="mb-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-200 text-[11px] text-yellow-900 leading-snug">
          ⚠️ <strong>Pool Floor Protected:</strong> Expense ({formatCurrency(expenseAmt)}) exceeds your liquid cash ({formatCurrency(store.pool)}). The remaining deficit will trigger the <strong>Investment Liquidation Dialog</strong> or an <strong>Emergency Loan</strong> so your pool never drops below ₹0.
        </div>
      )}

      {/* 5-Second Auto-Select Countdown Progress Bar */}
      {isSingleOption && !isWedding && (
        <div className="mb-2.5 p-2 bg-indigo-50/70 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center text-[11px] font-bold mb-1">
            <span className="flex items-center gap-1.5 text-indigo-700">
              <span className={isTimerPaused ? '' : 'animate-spin'}>{isTimerPaused ? '⏸️' : '⏳'}</span>
              <span>
                {isTimerPaused
                  ? 'Auto-advance paused — take your time'
                  : `Auto-selecting option in ${Math.ceil(countdown)}s...`}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
            >
              {isTimerPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
          <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ease-linear rounded-full ${
                isTimerPaused ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (countdown / 5) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Choice Buttons */}
      <div className="space-y-2">
        {isWedding ? (
          <Button
            fullWidth
            variant="primary"
            className="!py-2.5 !px-3 text-left justify-start"
            onClick={() => handleChoiceClick(0, false)}
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
              onClick={() => handleChoiceClick(i, false)}
            >
              <div className="flex flex-col text-left w-full">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs sm:text-sm text-text-primary">
                    {opt.label}
                  </span>
                  {isSingleOption && (
                    <span className="text-[10px] bg-white/80 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200 ml-2 shrink-0">
                      {isTimerPaused ? 'Paused' : `${Math.ceil(countdown)}s`}
                    </span>
                  )}
                </div>
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
            onClick={() => handleChoiceClick(0, false)}
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-bold text-xs sm:text-sm text-text-primary">
                Acknowledge & Continue
              </span>
              <span className="text-[10px] bg-white/80 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-200 ml-2 shrink-0">
                {isTimerPaused ? 'Paused' : `${Math.ceil(countdown)}s`}
              </span>
            </div>
          </Button>
        )}
      </div>

      <div className="mt-2 text-center">
        <span className="text-[10px] text-text-muted">
          💡 You can browse Bank, Investments, Loans, and Income tabs below before deciding.
        </span>
      </div>
    </motion.div>
  );
};

export default EventCard;

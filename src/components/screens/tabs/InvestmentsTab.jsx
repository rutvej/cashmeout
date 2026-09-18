import React, { useState } from 'react';
import useGameStore from '../../../engine/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { formatCurrency, formatPercent } from '../../../utils/format';
import { INSTRUMENTS } from '../../../engine/constants';
import { getBlendedReturn } from '../../../engine/instruments';

const ASSET_ORDER = ['stocks', 'mf', 'gold', 'fd', 'savings'];

const ASSET_META = {
  stocks: { name: 'Direct Equity / Stocks', icon: '📈', color: 'text-blue-600', bg: 'bg-blue-500', avg: '15% p.a.', risk: 'High Volatility' },
  mf: { name: 'Mutual Funds (SIP)', icon: '📊', color: 'text-purple-600', bg: 'bg-purple-500', avg: '11.5% p.a.', risk: 'Moderate Volatility' },
  gold: { name: 'Gold / Sovereign Gold', icon: '🪙', color: 'text-amber-600', bg: 'bg-amber-500', avg: '8.0% p.a.', risk: 'Inflation Hedge' },
  fd: { name: 'Fixed Deposits (Locked)', icon: '🔒', color: 'text-emerald-600', bg: 'bg-emerald-500', avg: '7.0% p.a.', risk: 'Guaranteed' },
  savings: { name: 'Instant Savings A/C (Buffer)', icon: '🏦', color: 'text-gray-700', bg: 'bg-gray-500', avg: '3.5% p.a.', risk: 'Liquid Cash' },
};

const InvestmentsTab = () => {
  const store = useGameStore();
  const [allocations, setAllocations] = useState({ ...store.instruments });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Portfolio metrics
  const blendedReturn = getBlendedReturn(allocations);
  const investedInGrowth = store.pool - (allocations.savings / 100) * store.pool;
  const estimatedAnnualGrowth = Math.round(store.pool * blendedReturn);
  const estimatedMonthlyGrowth = Math.round(estimatedAnnualGrowth / 12);

  /**
   * Smart Auto-Balancing Rule:
   * 1. Total must equal 100%.
   * 2. `savings` acts as the cash buffer.
   * 3. When any non-savings asset is increased by X, X is deducted from savings.
   * 4. If savings doesn't have enough buffer (savings < X), the increase is capped to available savings!
   * 5. When any asset is decreased by X, X is returned to savings.
   * 6. Savings will only increase if you reduce an asset!
   */
  const handleAssetChange = (key, rawNewVal) => {
    const targetVal = Math.max(0, Math.min(100, Number(rawNewVal) || 0));
    const currentVal = allocations[key] || 0;
    const delta = targetVal - currentVal;

    if (delta === 0) return;

    if (key === 'savings') {
      // User directly modifying savings:
      // If user wants to reduce savings, we don't know where to put it automatically, so let them adjust investments instead.
      return;
    }

    const currentSavings = allocations.savings || 0;

    if (delta > 0) {
      // Increasing an investment: deduct from savings
      const availableFromSavings = currentSavings;
      const actualDelta = Math.min(delta, availableFromSavings);

      if (actualDelta <= 0) return; // No savings left to fund this investment!

      setAllocations(prev => ({
        ...prev,
        [key]: currentVal + actualDelta,
        savings: currentSavings - actualDelta,
      }));
    } else {
      // Decreasing an investment: add back to savings
      const freedAmount = Math.abs(delta);
      setAllocations(prev => ({
        ...prev,
        [key]: currentVal - freedAmount,
        savings: currentSavings + freedAmount,
      }));
    }

    setSavedSuccess(false);
  };

  const handleQuickStep = (key, step) => {
    const curr = allocations[key] || 0;
    handleAssetChange(key, curr + step);
  };

  const handleSave = () => {
    store.updateInstrumentAllocations(allocations);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Portfolio Performance Banner */}
      <Card className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-100">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">
              Active Investment Wealth
            </span>
            <div className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {formatCurrency(Math.max(0, investedInGrowth))}
            </div>
            <span className="text-[11px] text-text-muted">
              Out of {formatCurrency(store.pool)} Total Pool
            </span>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
              ~{(blendedReturn * 100).toFixed(1)}% Blended Return
            </span>
            <div className="text-xs font-bold text-emerald-700">
              +{formatCurrency(estimatedMonthlyGrowth)}/mo
            </div>
            <span className="text-[10px] text-text-muted">Estimated Passive Cashflow</span>
          </div>
        </div>
      </Card>

      {/* Macro Economic Cycle & Market Sentiment */}
      {(() => {
        const cycle = store.economicCycle || 'normal';
        return (
          <div className={`p-3 rounded-2xl border flex items-center justify-between shadow-xs ${
            cycle === 'bull'
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
              : cycle === 'recession'
              ? 'bg-gradient-to-r from-rose-50 to-amber-50 border-rose-200'
              : 'bg-slate-50/90 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">
                {cycle === 'bull' ? '🐂' : cycle === 'recession' ? '🐻' : '⚖️'}
              </span>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                    cycle === 'bull'
                      ? 'bg-emerald-100 text-emerald-800'
                      : cycle === 'recession'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cycle === 'bull' ? 'Bull Market Surge' : cycle === 'recession' ? 'Economic Contraction' : 'Steady Growth Cycle'}
                  </span>
                  <span className="text-[10px] text-text-muted font-medium">
                    ~{store.cycleMonthsRemaining || 12}m remaining
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5 leading-tight">
                  {cycle === 'bull'
                    ? 'Equities outperforming benchmarks. High corporate hiring velocity & active recruiter offers.'
                    : cycle === 'recession'
                    ? 'Market drawdown active. Corporate hiring freeze & defensive flight to gold/liquid cash.'
                    : 'Balanced macroeconomic conditions and steady baseline returns across all asset classes.'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Asset Allocation Form with Smart Balancing */}
      <Card className="p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-extrabold text-sm text-text-primary">Asset Allocation (Auto-Balanced)</h3>
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            100% Allocated
          </span>
        </div>

        <p className="text-[11px] text-text-muted mb-4 leading-relaxed">
          ⚡ <strong>Smart Balancing:</strong> Increasing any investment draws automatically from your <strong>Savings Buffer</strong>. Reducing an investment returns cash back to Savings.
        </p>

        {/* Multi-segment visual bar */}
        <div className="h-3 w-full bg-gray-100 rounded-full flex overflow-hidden mb-5">
          {ASSET_ORDER.map(key => {
            const pct = allocations[key] || 0;
            if (pct <= 0) return null;
            return (
              <div
                key={key}
                style={{ width: `${pct}%` }}
                className={`${ASSET_META[key].bg} transition-all duration-300`}
                title={`${ASSET_META[key].name}: ${pct}%`}
              />
            );
          })}
        </div>

        {/* Asset Rows */}
        <div className="space-y-3.5">
          {ASSET_ORDER.map(key => {
            const meta = ASSET_META[key];
            const pct = allocations[key] || 0;
            const amountVal = Math.round((pct / 100) * store.pool);
            const isSavings = key === 'savings';
            const canIncrease = isSavings ? false : (allocations.savings || 0) >= 5;

            return (
              <div
                key={key}
                className={`p-3 rounded-xl border transition ${
                  isSavings ? 'bg-gray-50/80 border-dashed border-gray-300' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{meta.icon}</span>
                    <div>
                      <span className="text-xs font-bold text-text-primary block">
                        {meta.name}
                      </span>
                      <span className="text-[10px] text-text-muted font-medium">
                        {meta.avg} · {meta.risk}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-text-primary block">
                      {pct}%
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {formatCurrency(amountVal)}
                    </span>
                  </div>
                </div>

                {/* Adjuster controls */}
                {!isSavings ? (
                  <div className="flex items-center space-x-1 sm:space-x-2 pt-1 border-t border-gray-50 mt-1">
                    <div className="flex-1 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => handleQuickStep(key, -10)}
                        disabled={pct < 10}
                        className="flex-1 text-[9px] sm:text-[10px] py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded font-bold transition"
                      >
                        -10%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStep(key, -5)}
                        disabled={pct < 5}
                        className="flex-1 text-[9px] sm:text-[10px] py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded font-bold transition"
                      >
                        -5%
                      </button>
                    </div>

                    <div className="w-14 sm:w-16 shrink-0">
                      <input
                        type="range"
                        min="0"
                        max={pct + (allocations.savings || 0)}
                        step="1"
                        value={pct}
                        onChange={e => handleAssetChange(key, e.target.value)}
                        className="w-full accent-accent-action cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 flex space-x-1">
                      <button
                        type="button"
                        onClick={() => handleQuickStep(key, 5)}
                        disabled={!canIncrease || (allocations.savings || 0) < 5}
                        className="flex-1 text-[9px] sm:text-[10px] py-1 bg-blue-50 text-accent-action-dark hover:bg-blue-100 disabled:opacity-30 rounded font-bold transition"
                      >
                        +5%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStep(key, 10)}
                        disabled={!canIncrease || (allocations.savings || 0) < 10}
                        className="flex-1 text-[9px] sm:text-[10px] py-1 bg-blue-50 text-accent-action-dark hover:bg-blue-100 disabled:opacity-30 rounded font-bold transition"
                      >
                        +10%
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 border-t border-gray-200 text-[10px] text-text-muted flex justify-between">
                    <span>Cash buffer available to deploy:</span>
                    <span className="font-bold text-text-primary">{pct}% ({formatCurrency(amountVal)})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Confirm Rebalance Button */}
        <div className="mt-5">
          <Button fullWidth onClick={handleSave}>
            Confirm & Save Portfolio Allocation
          </Button>
          {savedSuccess && (
            <p className="text-xs text-center text-green-600 font-bold mt-2">
              ✓ Portfolio rebalanced successfully!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InvestmentsTab;

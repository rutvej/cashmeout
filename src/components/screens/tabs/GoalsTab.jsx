import React, { useState } from 'react';
import useGameStore from '../../../engine/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import BottomSheet from '../../ui/BottomSheet';
import { formatCurrency } from '../../../utils/format';
import { getSuggestedGoal } from '../../../engine/goals';

const GoalsTab = () => {
  const store = useGameStore();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', type: 'custom', inflationRate: 0.06 });
  const [loanGoal, setLoanGoal] = useState(null);
  const [loanDownPayment, setLoanDownPayment] = useState(0);

  const handleOpenLoanSheet = (goal) => {
    setLoanGoal(goal);
    const defaultPct = goal.type === 'home' ? 0.20 : goal.type === 'car' ? 0.15 : 0.10;
    const recommendedDown = Math.min(store.pool, Math.round(goal.currentTarget * defaultPct));
    setLoanDownPayment(recommendedDown);
  };

  const handleSelectSuggested = (type, customLabel, fallbackTarget) => {
    const tier = store.player?.cityTier || 2;
    if (type === 'custom') {
      setNewGoal({
        name: customLabel || 'Luxury Vacation 🏖️',
        target: fallbackTarget || 250000,
        type: 'custom',
        inflationRate: 0.06,
      });
      return;
    }

    const suggested = getSuggestedGoal(type, tier);
    setNewGoal({
      name: customLabel || suggested.name,
      target: suggested.suggestedAmount,
      type,
      inflationRate: suggested.inflationRate || 0.06,
    });
  };

  const handleAddGoal = (mode) => {
    const targetAmt = Number(newGoal.target);
    if (newGoal.name.trim() && targetAmt > 0) {
      store.addGoalMidGame({
        id: `goal_${Date.now()}`,
        type: newGoal.type || 'custom',
        name: newGoal.name.trim(),
        originalTarget: targetAmt,
        currentTarget: targetAmt,
        inflationRate: newGoal.inflationRate || 0.06,
        achieved: false,
        sacrificed: false,
        addedDay: store.currentDay,
        bucketPercent: 0,
      }, mode);
      setShowAddSheet(false);
      setNewGoal({ name: '', target: '', type: 'custom', inflationRate: 0.06 });
      useGameStore.setState({ showAllocation: true });
    }
  };

  const handleBuyEarly = (goalId) => {
    const goal = store.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (confirm(`Achieve "${goal.name}" right now for ${formatCurrency(goal.currentTarget)} from your total liquid pool?`)) {
      store.achieveGoalEarly(goalId);
    }
  };

  const allGoalsAchieved = store.goals.length > 0 && store.goals.every(g => g.achieved || g.sacrificed);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-sm text-text-primary">Life Goals & Buckets</h3>
          <p className="text-[11px] text-text-muted truncate">Targets adjust yearly with actual category inflation</p>
        </div>
        <Button size="sm" onClick={() => setShowAddSheet(true)} className="text-xs shrink-0">
          + Add Goal
        </Button>
      </div>

      {allGoalsAchieved && (
        <div className="p-3.5 bg-green-50 rounded-2xl border border-green-200 text-center">
          <span className="text-2xl block mb-1">🏆</span>
          <h4 className="font-extrabold text-xs text-green-900">All Major Life Milestones Achieved!</h4>
          <p className="text-[11px] text-green-800 mt-0.5">
            You've completed your planned goals. Add new mid-game ambitions below, or indulge in lifestyle upgrades.
          </p>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        {store.goals.map(goal => {
          const bucketAmount = Math.round((store.buckets[goal.id] / 100) * store.pool || 0);
          const progress = Math.min(100, Math.round((bucketAmount / goal.currentTarget) * 100));
          const canBuyFromTotalPool = store.pool >= goal.currentTarget;

          return (
            <Card
              key={goal.id}
              className={`p-3.5 border transition ${
                goal.achieved
                  ? 'border-green-200 bg-green-50/20'
                  : goal.sacrificed
                  ? 'border-gray-200 bg-gray-50/40 opacity-60'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-xs text-text-primary">{goal.name}</h4>
                  {goal.bonus && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded inline-block mt-0.5">
                      Bonus Mid-Game Goal
                    </span>
                  )}
                </div>

                {goal.achieved ? (
                  <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-black">
                    ✓ ACHIEVED
                  </span>
                ) : goal.sacrificed ? (
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-black">
                    SACRIFICED
                  </span>
                ) : (
                  <span className="text-xs font-black text-text-primary">
                    {progress}%
                  </span>
                )}
              </div>

              {!goal.achieved && !goal.sacrificed && (
                <>
                  <div className="flex justify-between text-xs mb-1 mt-2">
                    <div>
                      <span className="text-[10px] text-text-muted block">Bucket Allocation Value:</span>
                      <span className="font-black text-sm text-accent-action-dark">
                        {formatCurrency(bucketAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-muted block">Target (Inflation Adjusted):</span>
                      <span className="font-extrabold text-xs">
                        {formatCurrency(goal.currentTarget)}
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={progress} />

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5 justify-between items-center text-xs">
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-text-muted font-bold">
                      Claim: {store.buckets[goal.id] || 0}% of Cash Pool
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {canBuyFromTotalPool && (
                        <button
                          type="button"
                          onClick={() => handleBuyEarly(goal.id)}
                          className="text-[10px] text-green-700 hover:text-green-900 font-bold bg-green-50 px-2 py-1 rounded border border-green-200"
                        >
                          Achieve (Full Cash)
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenLoanSheet(goal)}
                        className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50 px-2 py-1 rounded border border-indigo-200 flex items-center space-x-1"
                      >
                        <span>💳</span>
                        <span>Achieve with Loan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Abandon "${goal.name}"? Its % bucket claim will be redistributed to your remaining goals.`)) {
                            store.removeGoal(goal.id);
                          }
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 font-semibold px-1 py-1"
                      >
                        Sacrifice
                      </button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Lifestyle & Luxury Spending Card */}
      <Card className="p-3.5 bg-amber-50/50 border border-amber-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌟</span>
            <div>
              <h4 className="font-extrabold text-xs text-amber-950">Lifestyle & Living Tier</h4>
              <p className="text-[10px] text-amber-800">
                City: Tier {store.player?.cityTier || 2} · Upgrade your lifestyle standards
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {store.player?.cityTier > 1 && (
            <button
              type="button"
              onClick={() => store.upgradeLifestyle({ type: 'city_tier', name: `Tier ${store.player.cityTier - 1} Locality` })}
              className="p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100/50 flex justify-between items-center text-xs font-bold transition shadow-2xs"
            >
              <span className="truncate pr-1">Move to Tier {store.player.cityTier - 1} City</span>
              <span className="text-amber-900 shrink-0">+₹20k/mo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => store.upgradeLifestyle({ type: 'luxury', name: 'Fine Dining & Lifestyle', costDelta: 10000 })}
            className="p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100/50 flex justify-between items-center text-xs font-bold transition shadow-2xs"
          >
            <span className="truncate pr-1">Fine Dining & Leisure</span>
            <span className="text-amber-900 shrink-0">+₹10k/mo</span>
          </button>
          <button
            type="button"
            onClick={() => store.upgradeLifestyle({ type: 'luxury', name: 'Travel & Wellness Club', costDelta: 20000 })}
            className="p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100/50 flex justify-between items-center text-xs font-bold transition shadow-2xs"
          >
            <span className="truncate pr-1">Travel & Wellness Club</span>
            <span className="text-amber-900 shrink-0">+₹20k/mo</span>
          </button>
        </div>
      </Card>

      {/* Add Mid-Game Goal Sheet */}
      <BottomSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} title="Add Mid-Game Goal">
        <div className="space-y-3 mb-6">
          {/* Quick Suggested Fixed Goals */}
          <div>
            <label className="text-[10px] text-text-muted font-bold block mb-1.5">
              Quick Pick: Suggested Fixed Goals
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectSuggested('car', 'Upgrade / 2nd Car 🚗')}
                className="p-2 bg-white border border-gray-200 hover:border-accent-action rounded-lg text-left transition"
              >
                <span className="text-xs font-bold block text-text-primary">🚗 Upgrade Car</span>
                <span className="text-[10px] text-text-muted">City Tier suggested</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSuggested('home', 'Vacation Home / Villa 🏠')}
                className="p-2 bg-white border border-gray-200 hover:border-accent-action rounded-lg text-left transition"
              >
                <span className="text-xs font-bold block text-text-primary">🏠 2nd Property</span>
                <span className="text-[10px] text-text-muted">Vacation / Rental Home</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSuggested('business', 'New Franchise / Venture 💼')}
                className="p-2 bg-white border border-gray-200 hover:border-accent-action rounded-lg text-left transition"
              >
                <span className="text-xs font-bold block text-text-primary">💼 Business Venture</span>
                <span className="text-[10px] text-text-muted">Generates cashflow</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSuggested('marriage', 'Milestone Celebration 💍')}
                className="p-2 bg-white border border-gray-200 hover:border-accent-action rounded-lg text-left transition"
              >
                <span className="text-xs font-bold block text-text-primary">💍 Celebration</span>
                <span className="text-[10px] text-text-muted">Anniversary / Wedding</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSuggested('custom', 'Luxury World Tour 🏖️', 350000)}
                className="p-2 bg-white border border-gray-200 hover:border-accent-action rounded-lg text-left transition col-span-2"
              >
                <span className="text-xs font-bold block text-text-primary">🏖️ Luxury World Tour (₹3.5 Lakh)</span>
                <span className="text-[10px] text-text-muted">Experiential luxury milestone</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="text-[10px] text-text-muted font-bold block mb-1">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Luxury Car, Farmhouse..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-semibold outline-none"
              value={newGoal.name}
              onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-text-muted font-bold block mb-1">Target Amount (₹)</label>
            <input
              type="number"
              placeholder="500000"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-bold outline-none"
              value={newGoal.target}
              onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-text-muted block mb-1">Choose Allocation Funding:</span>
            <Button
              fullWidth
              variant="primary"
              className="text-left"
              onClick={() => handleAddGoal('retroactive')}
              disabled={!newGoal.name.trim() || !newGoal.target || Number(newGoal.target) <= 0}
            >
              <div className="flex flex-col text-left py-0.5">
                <span className="font-bold text-xs">Retroactive Split</span>
                <span className="text-[10px] font-normal opacity-80">
                  Re-split existing savings pool evenly to fund this immediately
                </span>
              </div>
            </Button>
            <Button
              fullWidth
              variant="secondary"
              className="text-left"
              onClick={() => handleAddGoal('fresh')}
              disabled={!newGoal.name.trim() || !newGoal.target || Number(newGoal.target) <= 0}
            >
              <div className="flex flex-col text-left py-0.5">
                <span className="font-bold text-xs text-text-primary">Fresh Start</span>
                <span className="text-[10px] font-normal text-text-muted">
                  Keep existing buckets intact; starts at ₹0 from today's future surplus
                </span>
              </div>
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Loan Financing Sheet to Achieve Goal Early */}
      {loanGoal && (
        <BottomSheet
          isOpen={!!loanGoal}
          title={`Fund "${loanGoal.name}" via Loan`}
        >
          {(() => {
            const isHome = loanGoal.type === 'home';
            const isCar = loanGoal.type === 'car';
            const tenure = isHome ? 180 : isCar ? 60 : 36;
            const rate = isHome ? 0.085 : isCar ? 0.095 : 0.115;
            const maxDown = Math.min(store.pool, loanGoal.currentTarget);
            const currentDown = Math.min(maxDown, Math.max(0, Number(loanDownPayment) || 0));
            const loanPrincipal = Math.max(0, loanGoal.currentTarget - currentDown);
            const monthlyRate = rate / 12;
            const emi = loanPrincipal > 0
              ? Math.round(
                  (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                  (Math.pow(1 + monthlyRate, tenure) - 1)
                )
              : 0;

            const totalMonthlyIncome = store.incomes.reduce((s, i) => s + i.amount, 0) + (store.businessIncome || 0);
            const currentDeductions = store.fixedDeductions.reduce((s, d) => s + d.amount, 0) +
              store.loans.reduce((s, l) => s + l.emi, 0) +
              (store.hasHealthInsurance ? store.healthInsuranceCost : 0) +
              (store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0) +
              (store.homeMaintenanceCost || 0) +
              (store.carMaintenanceCost || 0);
            const currentSurplus = totalMonthlyIncome - currentDeductions;
            const projectedSurplus = currentSurplus - emi;

            return (
              <div className="space-y-3.5 pb-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-text-muted">Target Purchase Cost:</span>
                    <span className="font-extrabold">{formatCurrency(loanGoal.currentTarget)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-text-muted">Available Cash in Pool:</span>
                    <span className="font-bold text-green-700">{formatCurrency(store.pool)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-muted">Loan Type:</span>
                    <span className="font-semibold text-indigo-900">
                      {isHome ? 'Home Loan (8.5%, 15 Yrs)' : isCar ? 'Auto Loan (9.5%, 5 Yrs)' : 'Personal Loan (11.5%, 3 Yrs)'}
                    </span>
                  </div>
                </div>

                {/* Down payment control */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-text-primary">
                      Down Payment (from Liquid Cash):
                    </label>
                    <span className="text-xs font-black text-indigo-700">
                      {formatCurrency(currentDown)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxDown}
                    step={Math.max(1000, Math.floor(maxDown / 100))}
                    value={currentDown}
                    onChange={e => setLoanDownPayment(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                    <span>₹0 (100% Loan)</span>
                    <span>Max {formatCurrency(maxDown)}</span>
                  </div>
                </div>

                {/* Loan & EMI Summary */}
                <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Loan Principal Borrowed:</span>
                    <span className="font-extrabold text-indigo-950">{formatCurrency(loanPrincipal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Estimated Monthly EMI:</span>
                    <span className="font-black text-red-600 text-sm">-{formatCurrency(emi)}/mo</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-indigo-200/60 text-[11px]">
                    <span className="text-text-muted">Monthly Cashflow Impact:</span>
                    <span className={`font-bold ${projectedSurplus >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {formatCurrency(currentSurplus)} → {formatCurrency(projectedSurplus)}/mo
                    </span>
                  </div>
                </div>

                {projectedSurplus < 0 && (
                  <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 leading-snug">
                    ⚠️ Warning: This loan will put you in a monthly deficit of {formatCurrency(Math.abs(projectedSurplus))}/mo. Make sure you have emergency savings!
                  </p>
                )}

                <div className="flex space-x-2 pt-1">
                  <Button
                    variant="secondary"
                    className="flex-1 text-xs"
                    onClick={() => setLoanGoal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                      store.achieveGoalWithLoan(loanGoal.id, currentDown, tenure, rate);
                      setLoanGoal(null);
                    }}
                  >
                    Disburse & Achieve 🎉
                  </Button>
                </div>
              </div>
            );
          })()}
        </BottomSheet>
      )}
    </div>
  );
};

export default GoalsTab;

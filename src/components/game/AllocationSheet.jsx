import React, { useState, useEffect } from 'react';
import useGameStore from '../../engine/store';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const AllocationSheet = ({ isOpen, goals, onConfirm }) => {
  const store = useGameStore();
  const [allocations, setAllocations] = useState({});

  useEffect(() => {
    if (isOpen) {
      setAllocations({ ...store.buckets });
    }
  }, [isOpen, store.buckets]);

  // Cashflow calculations
  const totalIncome =
    (store.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0) +
    (store.businessIncome || 0);

  const totalDeductions =
    (store.fixedDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0) +
    (store.loans?.reduce((sum, l) => sum + l.emi, 0) || 0) +
    (store.hasHealthInsurance ? store.healthInsuranceCost : 0) +
    (store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0) +
    (store.homeMaintenanceCost || 0) +
    (store.carMaintenanceCost || 0);

  const monthlySurplus = Math.max(0, totalIncome - totalDeductions);
  const hasNoActiveGoals = !goals || goals.length === 0;

  const handleUpdate = (goalId, value) => {
    const val = Math.max(0, Math.min(100, parseInt(value) || 0));
    setAllocations(prev => ({ ...prev, [goalId]: val }));
  };

  const handleEqualSplit = () => {
    if (!goals || goals.length === 0) return;
    const evenPct = Math.floor(100 / goals.length);
    const rem = 100 - (evenPct * goals.length);
    const newAlloc = {};
    goals.forEach((g, idx) => {
      newAlloc[g.id] = idx === 0 ? evenPct + rem : evenPct;
    });
    setAllocations(newAlloc);
  };

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const remaining = 100 - totalAllocated;

  return (
    <BottomSheet isOpen={isOpen} title={hasNoActiveGoals ? "Surplus Cashflow Management" : "Allocate Monthly Savings Surplus"}>
      <div className="space-y-4 mb-24">
        {/* Real Cashflow Overview Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3.5 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Monthly Inflow</span>
              <span className="text-xs font-bold text-text-primary">{formatCurrency(totalIncome)}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">Mandatory Outflow</span>
              <span className="text-xs font-bold text-red-600">-{formatCurrency(totalDeductions)}</span>
            </div>
            <div>
              <span className="text-[10px] text-accent-action-dark uppercase font-extrabold block">Savings Surplus</span>
              <span className="text-sm font-black text-green-700">+{formatCurrency(monthlySurplus)}/mo</span>
            </div>
          </div>
        </div>

        {hasNoActiveGoals ? (
          /* All Goals Achieved State */
          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-center">
              <span className="text-3xl block mb-1">🎉</span>
              <h4 className="font-extrabold text-sm text-green-900 mb-1">All Life Goals Achieved!</h4>
              <p className="text-xs text-green-800 leading-relaxed">
                You have fulfilled all your planned milestones. Your monthly surplus of <strong>{formatCurrency(monthlySurplus)}</strong> now goes 100% into <strong>compounding wealth</strong> in your investment portfolio!
              </p>
            </div>

            {/* Lifestyle Upgrade Section */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span className="text-xs font-bold text-amber-900 block mb-1">
                🌟 Optional: Upgrade Lifestyle & Spending
              </span>
              <p className="text-[11px] text-amber-800 mb-3">
                Live more comfortably by upgrading to a higher city tier or adding fine dining and leisure.
              </p>
              <div className="space-y-2">
                {store.player?.cityTier > 1 && (
                  <button
                    type="button"
                    onClick={() => store.upgradeLifestyle({ type: 'city_tier', name: 'Tier 1 Prime Living' })}
                    className="w-full p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100/50 flex justify-between items-center text-left text-xs font-bold transition"
                  >
                    <span>Upgrade to Tier {store.player.cityTier - 1} City / Prime Locality</span>
                    <span className="text-amber-900 font-extrabold">+₹20,000/mo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => store.upgradeLifestyle({ type: 'luxury', name: 'Fine Dining & Leisure', costDelta: 10000 })}
                  className="w-full p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-100/50 flex justify-between items-center text-left text-xs font-bold transition"
                >
                  <span>Gourmet Dining & Lifestyle Leisure</span>
                  <span className="text-amber-900 font-extrabold">+₹10,000/mo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Regular Goal Buckets with Rupee Distribution Preview */
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Goal Allocation ({goals.length} active)
              </h4>
              <button
                type="button"
                onClick={handleEqualSplit}
                className="text-[10px] bg-gray-100 hover:bg-gray-200 text-text-muted font-bold px-2 py-0.5 rounded transition"
              >
                Split Equally
              </button>
            </div>

            <div className="space-y-2.5">
              {goals.map(g => {
                const pct = allocations[g.id] || 0;
                const monthlyRupees = Math.round((pct / 100) * monthlySurplus);

                return (
                  <div
                    key={g.id}
                    className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <span className="text-xs font-bold text-text-primary truncate block">
                        {g.name}
                      </span>
                      <span className="text-[11px] font-extrabold text-green-700">
                        +{formatCurrency(monthlyRupees)}/month
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdate(g.id, Math.max(0, pct - 5))}
                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          className="w-10 text-right bg-transparent outline-none font-bold text-xs"
                          value={pct}
                          onChange={(e) => handleUpdate(g.id, e.target.value)}
                        />
                        <span className="text-text-muted text-xs ml-0.5 font-bold">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdate(g.id, Math.min(100, pct + 5))}
                        className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unallocated Status */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs font-bold">
              <span>Total Split:</span>
              <span className={remaining === 0 ? 'text-green-600' : remaining > 0 ? 'text-amber-600' : 'text-red-600'}>
                {totalAllocated}% {remaining === 0 ? '✓ (100% Perfect)' : remaining > 0 ? `(${remaining}% unallocated)` : `(${Math.abs(remaining)}% over allocated)`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Confirm Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
        <div className="max-w-md mx-auto">
          {hasNoActiveGoals ? (
            <Button 
              fullWidth 
              onClick={() => onConfirm({})}
            >
              Continue Compounding (100% to Wealth) →
            </Button>
          ) : (
            <Button 
              fullWidth 
              onClick={() => onConfirm(allocations)}
              disabled={remaining !== 0}
            >
              {remaining === 0 ? 'Confirm Monthly Surplus Split' : `Allocate exactly 100% (remaining: ${remaining}%)`}
            </Button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

export default AllocationSheet;

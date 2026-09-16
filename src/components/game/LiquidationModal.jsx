import React from 'react';
import useGameStore from '../../engine/store';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const LiquidationModal = ({ deficitInfo, onResolve }) => {
  const store = useGameStore();

  if (!deficitInfo) return null;

  const { shortfall, reason } = deficitInfo;

  // Compute available liquidation amounts for liquid holdings
  const stockVal = Math.round(((store.instruments?.stocks || 0) / 100) * store.pool);
  const mfVal = Math.round(((store.instruments?.mf || 0) / 100) * store.pool);
  const goldVal = Math.round(((store.instruments?.gold || 0) / 100) * store.pool);
  const fdVal = Math.round(((store.instruments?.fd || 0) / 100) * store.pool);

  const hasInvestments = (stockVal + mfVal + goldVal + fdVal) > 0;

  // Physical Assets
  const hasCar = (store.carsOwned || []).length > 0;
  const carValue = 280000;

  const hasHome = (store.homesOwned || []).length > 0;
  const homeValue = hasHome ? (store.homesOwned[0].value || 0) : 0;

  const hasBusiness = store.hasActiveBusiness && (store.businessIncome || 0) > 0;
  const businessVal = hasBusiness ? Math.round(store.businessIncome * 22) : 0;

  const hasPhysicalAssets = hasCar || hasHome || hasBusiness;

  // Emergency Loan Calculation & Underwriting
  const monthlyRate = 0.12 / 12;
  const tenure = 24;
  const emi = Math.max(500, Math.round(
    (shortfall * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  ));
  const canAffordLoan = store.canAffordLoan(emi);

  // Total surplus calculation for display
  const totalIncome = (store.incomes?.reduce((s, i) => s + i.amount, 0) || 0)
    + (store.businessIncome || 0)
    + (store.homesOwned || []).filter(h => h.isRentedOut).reduce((s, h) => s + (h.rentalIncome || 0), 0);
  const totalDeductions = (store.fixedDeductions?.reduce((s, d) => s + d.amount, 0) || 0)
    + (store.loans?.reduce((s, l) => s + l.emi, 0) || 0)
    + (store.hasHealthInsurance ? (store.healthInsuranceCost || 0) : 0)
    + (store.hasVehicleInsurance ? (store.vehicleInsuranceCost || 0) : 0)
    + (store.homeMaintenanceCost || 0)
    + (store.carMaintenanceCost || 0);
  const currentSurplus = totalIncome - totalDeductions;

  const isCompletelyInsolvent = !hasPhysicalAssets && !hasInvestments && !canAffordLoan;

  return (
    <BottomSheet isOpen={!!deficitInfo} title="Financial Crisis: Shortfall Resolution">
      <div className="space-y-4 mb-8">
        {/* Warning Banner */}
        <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">🚨</span>
            <span className="text-xs font-black text-red-900 uppercase tracking-wider">
              Cash Buffer Depleted (₹0 Balance)
            </span>
          </div>
          <p className="text-xs text-red-800 leading-snug">
            Your liquid cash cannot cover <strong>{reason}</strong>. Shortfall due: <strong className="text-red-700 font-extrabold text-sm">{formatCurrency(shortfall)}</strong>.
          </p>
          <span className="text-[10px] text-red-700 block mt-1.5 font-medium">
            Choose an asset to liquidate or apply for an emergency bank facility to avoid insolvency:
          </span>
        </div>

        {/* 1. Physical Assets (Cars, Real Estate, Business) */}
        {hasPhysicalAssets && (
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider block">
              Physical & Business Assets
            </span>

            {/* Sell Car */}
            {hasCar && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-text-primary block">🚗 Sell Personal Vehicle</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Market resale: {formatCurrency(carValue)} · Eliminates car maintenance & insurance
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shrink-0"
                  onClick={() => onResolve({ action: 'sell_car' })}
                >
                  Sell Car (+{formatCurrency(carValue)})
                </Button>
              </div>
            )}

            {/* Sell Home */}
            {hasHome && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-text-primary block">🏠 Sell Real Estate Property</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Property value: {formatCurrency(homeValue)} · Returns to rental apartment
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shrink-0"
                  onClick={() => onResolve({ action: 'sell_home' })}
                >
                  Sell Property (+{formatCurrency(homeValue)})
                </Button>
              </div>
            )}

            {/* Sell Business */}
            {hasBusiness && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-text-primary block">💼 Liquidate Business Venture</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    22× monthly earnings valuation: {formatCurrency(businessVal)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shrink-0"
                  onClick={() => onResolve({ action: 'sell_business' })}
                >
                  Exit Business (+{formatCurrency(businessVal)})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 2. Financial Holdings (Stocks, MF, Gold, FD) */}
        {hasInvestments && (
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider block">
              Liquid Financial Holdings
            </span>

            {/* Stocks */}
            {stockVal > 0 && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-text-primary block">📈 Direct Stocks</span>
                  <span className="text-[10px] text-text-muted">Available: {formatCurrency(stockVal)}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs shrink-0"
                  onClick={() => onResolve({ action: 'liquidate', assetKey: 'stocks', amount: Math.min(shortfall, stockVal) })}
                >
                  Sell Stocks ({formatCurrency(Math.min(shortfall, stockVal))})
                </Button>
              </div>
            )}

            {/* Mutual Funds */}
            {mfVal > 0 && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-text-primary block">📊 Mutual Funds</span>
                  <span className="text-[10px] text-text-muted">Available: {formatCurrency(mfVal)}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs shrink-0"
                  onClick={() => onResolve({ action: 'liquidate', assetKey: 'mf', amount: Math.min(shortfall, mfVal) })}
                >
                  Redeem MF ({formatCurrency(Math.min(shortfall, mfVal))})
                </Button>
              </div>
            )}

            {/* Gold */}
            {goldVal > 0 && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-text-primary block">🪙 Gold Holdings</span>
                  <span className="text-[10px] text-text-muted">Available: {formatCurrency(goldVal)}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs shrink-0"
                  onClick={() => onResolve({ action: 'liquidate', assetKey: 'gold', amount: Math.min(shortfall, goldVal) })}
                >
                  Sell Gold ({formatCurrency(Math.min(shortfall, goldVal))})
                </Button>
              </div>
            )}

            {/* Fixed Deposit */}
            {fdVal > 0 && (
              <div className="p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-bold text-text-primary block">🔒 Break Fixed Deposit</span>
                  <span className="text-[10px] text-text-muted">Available: {formatCurrency(fdVal)} (1% fee)</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs text-amber-700 shrink-0"
                  onClick={() => onResolve({ action: 'liquidate', assetKey: 'fd', amount: Math.min(shortfall, fdVal) })}
                >
                  Break FD ({formatCurrency(Math.min(shortfall, fdVal))})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 3. Emergency Loan Facility */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-black text-slate-800 block">
                💳 Bank Emergency Personal Loan (24 Months @ 12% p.a.)
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Principal: {formatCurrency(shortfall)} · EMI: <strong className="text-slate-900">{formatCurrency(emi)}/mo</strong>
              </span>
            </div>
            {canAffordLoan ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                Eligible
              </span>
            ) : (
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                Denied
              </span>
            )}
          </div>

          {canAffordLoan ? (
            <Button
              fullWidth
              size="sm"
              onClick={() => onResolve({ action: 'emergency_loan', amount: shortfall })}
            >
              Borrow {formatCurrency(shortfall)} (EMI: {formatCurrency(emi)}/mo)
            </Button>
          ) : (
            <div className="p-2.5 bg-red-50/80 rounded-lg border border-red-200 text-[11px] text-red-800">
              ❌ <strong>Underwriting Rejection:</strong> Your monthly surplus is {formatCurrency(currentSurplus)}/mo, which cannot support the required {formatCurrency(emi)}/mo EMI. You must liquidate physical or financial assets to proceed.
            </div>
          )}
        </div>

        {/* 4. Complete Insolvency Option */}
        {isCompletelyInsolvent && (
          <div className="p-3 bg-red-100 rounded-xl border-2 border-red-400 text-center space-y-2">
            <span className="text-xs font-bold text-red-900 block">
              No Assets Remaining & Debt Capacity Exhausted
            </span>
            <p className="text-[11px] text-red-700">
              You have exhausted all liquid cash, have no physical assets to sell, and do not qualify for credit.
            </p>
            <Button
              fullWidth
              size="sm"
              className="!bg-red-600 hover:!bg-red-700 text-white font-bold"
              onClick={() => onResolve({ action: 'declare_insolvency' })}
            >
              Declare Insolvency (End Simulation)
            </Button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};

export default LiquidationModal;

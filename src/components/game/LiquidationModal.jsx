import React from 'react';
import useGameStore from '../../engine/store';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const LiquidationModal = ({ deficitInfo, onResolve }) => {
  const store = useGameStore();

  if (!deficitInfo) return null;

  const { shortfall, reason } = deficitInfo;

  // Compute available liquidation amounts
  const stockVal = Math.round(((store.instruments.stocks || 0) / 100) * store.pool);
  const mfVal = Math.round(((store.instruments.mf || 0) / 100) * store.pool);
  const goldVal = Math.round(((store.instruments.gold || 0) / 100) * store.pool);
  const fdVal = Math.round(((store.instruments.fd / 100) * store.pool));

  const handleSellAsset = (assetKey, availableAmt) => {
    onResolve({
      action: 'liquidate',
      assetKey,
      amount: Math.min(shortfall, availableAmt),
    });
  };

  const handleTakeEmergencyLoan = () => {
    onResolve({
      action: 'emergency_loan',
      amount: shortfall,
    });
  };

  return (
    <BottomSheet isOpen={!!deficitInfo} title="Choose Liquidation Asset">
      <div className="space-y-4 mb-8">
        {/* Warning Banner */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">⚠️</span>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Savings Depleted (₹0 Buffer)
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-snug">
            Your instant savings account cannot cover <strong>{reason}</strong>. You have a shortfall of <strong className="text-red-600">{formatCurrency(shortfall)}</strong>.
          </p>
          <span className="text-[10px] text-amber-700 block mt-1.5 font-medium">
            Select which investment holding to liquidate, or fund via an emergency loan:
          </span>
        </div>

        {/* Investment Options */}
        <div className="space-y-2">
          {/* Stocks */}
          {stockVal > 0 && (
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs font-bold text-text-primary block">📈 Direct Stocks</span>
                <span className="text-[10px] text-text-muted">Available: {formatCurrency(stockVal)}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs"
                onClick={() => handleSellAsset('stocks', stockVal)}
              >
                Sell Stocks ({formatCurrency(Math.min(shortfall, stockVal))})
              </Button>
            </div>
          )}

          {/* Mutual Funds */}
          {mfVal > 0 && (
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs font-bold text-text-primary block">📊 Mutual Funds</span>
                <span className="text-[10px] text-text-muted">Available: {formatCurrency(mfVal)}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs"
                onClick={() => handleSellAsset('mf', mfVal)}
              >
                Redeem MF ({formatCurrency(Math.min(shortfall, mfVal))})
              </Button>
            </div>
          )}

          {/* Gold */}
          {goldVal > 0 && (
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs font-bold text-text-primary block">🪙 Gold Holdings</span>
                <span className="text-[10px] text-text-muted">Available: {formatCurrency(goldVal)}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs"
                onClick={() => handleSellAsset('gold', goldVal)}
              >
                Sell Gold ({formatCurrency(Math.min(shortfall, goldVal))})
              </Button>
            </div>
          )}

          {/* Fixed Deposit */}
          {fdVal > 0 && (
            <div className="p-3 bg-white rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs font-bold text-text-primary block">🔒 Break Fixed Deposit</span>
                <span className="text-[10px] text-text-muted">Available: {formatCurrency(fdVal)} (1% fee)</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs text-amber-700"
                onClick={() => handleSellAsset('fd', fdVal)}
              >
                Break FD ({formatCurrency(Math.min(shortfall, fdVal))})
              </Button>
            </div>
          )}

          {/* Emergency Loan Fallback */}
          <div className="p-3.5 bg-blue-50/80 rounded-xl border-2 border-accent-action mt-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-extrabold text-blue-900 block">
                  💳 Emergency Distress Loan (No Selling)
                </span>
                <span className="text-[10px] text-blue-700 block">
                  Preserve your investment portfolio! Fund the {formatCurrency(shortfall)} shortfall via an instant bank personal loan at 12% p.a.
                </span>
              </div>
            </div>
            <Button
              fullWidth
              size="sm"
              onClick={handleTakeEmergencyLoan}
            >
              Take Emergency Loan for {formatCurrency(shortfall)}
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};

export default LiquidationModal;

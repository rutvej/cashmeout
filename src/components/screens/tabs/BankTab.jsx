import React, { useState } from 'react';
import useGameStore from '../../../engine/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../utils/format';
import EventLog from '../../game/EventLog';

const BankTab = () => {
  const store = useGameStore();
  const [fdAmountInput, setFdAmountInput] = useState('');
  const [showFdModal, setShowFdModal] = useState(false);

  const savingsAmount = Math.round((store.instruments.savings / 100) * store.pool);
  const fdAmount = Math.round((store.instruments.fd / 100) * store.pool);

  const handleDepositFd = () => {
    const amt = Number(fdAmountInput);
    if (amt > 0 && amt <= savingsAmount) {
      store.depositToFd(amt);
      setFdAmountInput('');
      setShowFdModal(false);
    }
  };

  const handleWithdrawFd = () => {
    if (fdAmount > 0) {
      if (confirm(`Break FD early? A 1% early withdrawal penalty (${formatCurrency(fdAmount * 0.01)}) will be deducted.`)) {
        store.withdrawFd(fdAmount);
      }
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Liquid Net Pool */}
      <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Total Liquid Cash</h3>
            <div className="text-3xl font-extrabold text-text-primary tracking-tight">
              {formatCurrency(store.pool)}
            </div>
          </div>
          <span className="text-2xl">🏦</span>
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          Your immediate liquidity pool across savings accounts and bank fixed deposits.
        </p>
      </Card>

      {/* Two Bank Accounts Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Savings Account */}
        <Card className="p-3 border border-gray-100">
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-base">💳</span>
            <h4 className="text-xs font-bold text-text-primary">Savings A/C</h4>
          </div>
          <div className="text-lg font-extrabold text-text-primary mt-1">
            {formatCurrency(savingsAmount)}
          </div>
          <div className="text-[10px] text-green-700 font-semibold mt-0.5">
            ~3.5% APY · Instant Liquidity
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">
            {store.instruments.savings}% of total pool
          </span>
        </Card>

        {/* Fixed Deposit */}
        <Card className="p-3 border border-gray-100">
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="text-base">🔒</span>
            <h4 className="text-xs font-bold text-text-primary">Fixed Deposit</h4>
          </div>
          <div className="text-lg font-extrabold text-text-primary mt-1">
            {formatCurrency(fdAmount)}
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-0.5">
            7.0% APY · Guaranteed
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">
            {store.instruments.fd}% of total pool
          </span>
        </Card>
      </div>

      {/* FD Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1 text-xs"
          onClick={() => setShowFdModal(!showFdModal)}
          disabled={savingsAmount <= 1000}
        >
          + Deposit to FD
        </Button>
        {fdAmount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 text-xs text-red-500"
            onClick={handleWithdrawFd}
          >
            Break FD (1% fee)
          </Button>
        )}
      </div>

      {/* Deposit to FD Inline Box */}
      {showFdModal && (
        <Card className="p-3 bg-gray-50 border border-gray-200">
          <h4 className="text-xs font-bold mb-2">Deposit Cash into 7% FD</h4>
          <p className="text-[11px] text-text-muted mb-2">
            Available in Savings: {formatCurrency(savingsAmount)}
          </p>
          <div className="flex space-x-2 mb-2">
            <input
              type="number"
              placeholder="e.g. 50000"
              className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none"
              value={fdAmountInput}
              onChange={e => setFdAmountInput(e.target.value)}
            />
            <Button
              size="sm"
              onClick={handleDepositFd}
              disabled={!fdAmountInput || Number(fdAmountInput) <= 0 || Number(fdAmountInput) > savingsAmount}
            >
              Deposit
            </Button>
          </div>
          <div className="flex space-x-1">
            {[0.25, 0.5, 1].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setFdAmountInput(Math.round(savingsAmount * pct))}
                className="text-[10px] bg-white border border-gray-200 rounded px-2 py-0.5 text-text-muted hover:bg-gray-100"
              >
                {pct === 1 ? 'Max' : `${pct * 100}%`}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Safe Event Log */}
      <div className="mt-4">
        <EventLog events={store.eventHistory} />
      </div>
    </div>
  );
};

export default BankTab;

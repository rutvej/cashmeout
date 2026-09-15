import React, { useState } from 'react';
import useGameStore from '../../../engine/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import ProgressBar from '../../ui/ProgressBar';
import { formatCurrency } from '../../../utils/format';

const LOAN_PRESETS = [50000, 100000, 250000, 500000];

const LoansTab = () => {
  const store = useGameStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState(100000);
  const [tenure, setTenure] = useState(24); // months
  const interestRate = 0.12; // 12% p.a.

  const totalEmi = store.loans.reduce((sum, l) => sum + l.emi, 0);
  const totalIncome = store.incomes.reduce((sum, inc) => sum + inc.amount, 0) + (store.businessIncome || 0);
  const emiRatio = totalIncome > 0 ? (totalEmi / totalIncome) * 100 : 0;

  let ratioColor = 'bg-green-500';
  let ratioText = 'Healthy (<40%)';
  if (emiRatio > 60) {
    ratioColor = 'bg-red-500';
    ratioText = 'Critical Danger (>60%)';
  } else if (emiRatio > 40) {
    ratioColor = 'bg-yellow-500';
    ratioText = 'Caution (40-60%)';
  }

  // Calculate proposed loan EMI
  const monthlyRate = interestRate / 12;
  const proposedEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );
  const proposedNewRatio = totalIncome > 0 ? ((totalEmi + proposedEmi) / totalIncome) * 100 : 0;

  const handleTakeLoan = () => {
    store.takePersonalLoan(loanAmount, tenure, interestRate, `Personal Loan (₹${loanAmount / 1000}k)`);
    setShowApplyModal(false);
  };

  const handleRepay = (loanId) => {
    const loan = store.loans.find(l => l.id === loanId);
    if (!loan) return;
    if (confirm(`Pay off ${loan.name} completely for ${formatCurrency(loan.principal)}? This will eliminate ₹${loan.emi}/mo from your fixed deductions.`)) {
      store.repayLoanEarly(loanId);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* EMI Debt Burden Card */}
      <Card className="border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
              Total Monthly EMI Burden
            </h3>
            <div className="text-3xl font-black text-text-primary tracking-tight">
              {formatCurrency(totalEmi)}<span className="text-xs text-text-muted font-normal">/mo</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowApplyModal(!showApplyModal)}
            className="text-xs"
          >
            + Apply for Loan
          </Button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span>EMI-to-Income: {emiRatio.toFixed(1)}%</span>
            <span className={ratioColor.replace('bg-', 'text-')}>{ratioText}</span>
          </div>
          <ProgressBar value={Math.min(100, emiRatio)} color={ratioColor} />
          <p className="text-[10px] text-text-muted mt-1.5 leading-snug">
            Financial advisors recommend keeping EMIs under 40% of monthly income to stay solvent through emergencies.
          </p>
        </div>
      </Card>

      {/* Proactive Apply Loan Form */}
      {showApplyModal && (
        <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/40 border-2 border-accent-action">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Personal Loan Application
            </h4>
            <button
              onClick={() => setShowApplyModal(false)}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Amount Presets */}
            <div>
              <span className="text-[10px] text-text-muted font-bold block mb-1.5">Select Principal Borrowing:</span>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {LOAN_PRESETS.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoanAmount(amt)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      loanAmount === amt
                        ? 'bg-accent-action text-text-primary border-accent-action-dark'
                        : 'bg-white border-gray-200 text-text-muted'
                    }`}
                  >
                    {amt >= 100000 ? `₹${amt / 100000}L` : `₹${amt / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure Options */}
            <div>
              <span className="text-[10px] text-text-muted font-bold block mb-1.5">Tenure:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[12, 24, 36].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTenure(m)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                      tenure === m
                        ? 'bg-accent-action text-text-primary border-accent-action-dark'
                        : 'bg-white border-gray-200 text-text-muted'
                    }`}
                  >
                    {m} Months ({m / 12}y)
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated EMI breakdown */}
            <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Interest Rate:</span>
                <span className="font-bold">12.0% p.a.</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-text-muted">Monthly EMI:</span>
                <span className="font-extrabold text-red-600">{formatCurrency(proposedEmi)}/mo</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-1 mt-1">
                <span className="text-text-muted">New EMI Ratio:</span>
                <span className={`font-bold ${proposedNewRatio > 50 ? 'text-red-600' : 'text-green-700'}`}>
                  {proposedNewRatio.toFixed(1)}%
                </span>
              </div>
            </div>

            <Button
              fullWidth
              onClick={handleTakeLoan}
              className="mt-2"
            >
              Disburse {formatCurrency(loanAmount)} Cash Instantly
            </Button>
          </div>
        </Card>
      )}

      {/* Active Loans List */}
      <h3 className="font-bold text-sm text-text-primary mt-4 mb-2">Active Borrowings & EMIs</h3>
      {store.loans.length === 0 ? (
        <Card className="text-center py-8 text-text-muted bg-gray-50 border border-gray-100">
          <span className="text-2xl block mb-1">🎉</span>
          <span className="font-bold text-xs">Debt Free!</span>
          <p className="text-[11px] mt-0.5">No active loans drag down your cashflow.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {store.loans.map(loan => {
            const canPrepay = store.pool >= loan.principal;

            return (
              <Card key={loan.id} className="p-3.5 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-xs text-text-primary">{loan.name}</h4>
                    <span className="text-[10px] text-text-muted font-medium">
                      Interest: {loan.rate}% p.a.
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-red-600">{formatCurrency(loan.emi)}/mo</div>
                    <div className="text-[10px] text-text-muted font-medium">{loan.remainingMonths} months remaining</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-text-muted text-[10px] block">Outstanding Principal:</span>
                    <span className="font-bold">{formatCurrency(loan.principal)}</span>
                  </div>

                  {canPrepay ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs !py-1 text-green-700 border-green-300 hover:bg-green-50"
                      onClick={() => handleRepay(loan.id)}
                    >
                      Prepay Early (Full)
                    </Button>
                  ) : (
                    <span className="text-[10px] text-text-muted">
                      Need {formatCurrency(loan.principal)} to prepay
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LoansTab;

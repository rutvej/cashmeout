import React from 'react';
import { formatCurrency } from '../../utils/format';

const IncomeDeductions = ({ totalIncome = 0, totalDeductions = 0 }) => {
  const surplus = totalIncome - totalDeductions;

  return (
    <div className="px-4 py-2.5 bg-surface-card-alt border-y border-gray-100 flex justify-between items-center text-xs">
      <div className="flex items-center space-x-1">
        <span className="text-text-muted">Inflow:</span>
        <span className="font-extrabold text-green-700">
          +{formatCurrency(totalIncome)}/mo
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-text-muted">Outflow:</span>
        <span className="font-extrabold text-red-600">
          -{formatCurrency(totalDeductions)}/mo
        </span>
      </div>
      <div className={`flex items-center font-black px-2 py-0.5 rounded-md ${surplus >= 0 ? 'text-green-800 bg-green-100/70' : 'text-red-700 bg-red-100/70'}`}>
        {surplus >= 0 ? `+${formatCurrency(surplus)}/mo` : `-${formatCurrency(Math.abs(surplus))}/mo`}
      </div>
    </div>
  );
};

export default IncomeDeductions;

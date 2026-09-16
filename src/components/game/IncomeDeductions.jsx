import React from 'react';
import { formatCurrency } from '../../utils/format';

const IncomeDeductions = ({ totalIncome = 0, totalDeductions = 0 }) => {
  const surplus = totalIncome - totalDeductions;

  return (
    <div className="px-3 sm:px-4 py-2.5 bg-surface-card-alt rounded-2xl border border-gray-100 flex items-center justify-between text-xs gap-1.5 shadow-2xs overflow-hidden">
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider truncate">Inflow</span>
        <span className="font-black text-green-700 text-xs sm:text-sm truncate">
          +{formatCurrency(totalIncome)}<span className="text-[10px] font-normal text-text-muted">/mo</span>
        </span>
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider truncate">Outflow</span>
        <span className="font-black text-red-600 text-xs sm:text-sm truncate">
          -{formatCurrency(totalDeductions)}<span className="text-[10px] font-normal text-text-muted">/mo</span>
        </span>
      </div>

      <div className={`flex flex-col items-end px-2.5 py-1 rounded-xl shrink-0 ${surplus >= 0 ? 'bg-green-100/80 text-green-900 border border-green-200' : 'bg-red-100/80 text-red-900 border border-red-200'}`}>
        <span className="text-[9px] uppercase font-black opacity-75">
          {surplus >= 0 ? 'Surplus' : 'Deficit'}
        </span>
        <span className="font-black text-xs sm:text-sm whitespace-nowrap">
          {surplus >= 0 ? `+${formatCurrency(surplus)}` : `-${formatCurrency(Math.abs(surplus))}`}
          <span className="text-[9px] font-normal">/mo</span>
        </span>
      </div>
    </div>
  );
};

export default IncomeDeductions;

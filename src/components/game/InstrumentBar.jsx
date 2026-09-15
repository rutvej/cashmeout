import React from 'react';
import { formatCurrency } from '../../utils/format';

const instrumentColors = {
  savings: 'bg-blue-300',
  stocks: 'bg-green-300',
  gold: 'bg-yellow-300',
  mf: 'bg-purple-300',
  fd: 'bg-orange-300'
};

const instrumentLabels = {
  savings: 'Savings',
  stocks: 'Stocks',
  gold: 'Gold',
  mf: 'Mutual Funds',
  fd: 'Fixed Deposits'
};

const InstrumentBar = ({ instruments = {}, pool = 0 }) => {
  const entries = Object.entries(instruments).filter(([key, pct]) => pct > 0);
  
  return (
    <div className="w-full px-4 mb-6">
      <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-100">
        {entries.map(([key, pct]) => (
          <div 
            key={key} 
            className={`h-full ${instrumentColors[key] || 'bg-gray-300'}`} 
            style={{ width: `${pct}%` }}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap mt-3 gap-x-4 gap-y-2">
        {entries.map(([key, pct]) => {
          const value = (pct / 100) * pool;
          
          return (
            <div key={key} className="flex items-center text-xs">
              <div className={`w-2 h-2 rounded-full mr-1.5 ${instrumentColors[key] || 'bg-gray-300'}`} />
              <span className="text-text-muted mr-1">{instrumentLabels[key] || key} ({Math.round(pct)}%):</span>
              <span className="font-semibold">{formatCurrency(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstrumentBar;

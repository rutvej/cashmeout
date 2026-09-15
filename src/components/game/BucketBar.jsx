import React from 'react';
import { formatCurrency } from '../../utils/format';

const colors = [
  'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-orange-200', 'bg-pink-200', 'bg-teal-200'
];

const BucketBar = ({ buckets = {}, goals = [], pool = 0 }) => {
  const entries = Object.entries(buckets).filter(([id, pct]) => pct > 0);
  
  return (
    <div className="w-full px-4 mb-6">
      <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-100">
        {entries.map(([id, pct], index) => {
          return (
            <div 
              key={id} 
              className={`h-full ${colors[index % colors.length]}`} 
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      
      <div className="flex flex-wrap mt-3 gap-x-4 gap-y-2">
        {entries.map(([id, pct], index) => {
          const goal = goals.find(g => g.id === id);
          if (!goal) return null;
          
          const value = (pct / 100) * pool;
          
          return (
            <div key={id} className="flex items-center text-xs">
              <div className={`w-2 h-2 rounded-full mr-1.5 ${colors[index % colors.length]}`} />
              <span className="text-text-muted mr-1">{goal.name} ({Math.round(pct)}%):</span>
              <span className="font-semibold">{formatCurrency(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BucketBar;

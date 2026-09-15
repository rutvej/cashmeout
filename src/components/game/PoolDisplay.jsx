import React from 'react';
import { formatCurrency } from '../../utils/format';

const PoolDisplay = ({ pool, prevPool }) => {
  const change = pool - (prevPool || pool);
  const isUp = change >= 0;

  return (
    <div className="flex flex-col items-center justify-center my-6">
      <span className="text-sm text-text-muted uppercase tracking-wider font-semibold mb-1">Total Pool</span>
      <div className="text-4xl font-extrabold tracking-tight text-text-primary">
        {formatCurrency(pool)}
      </div>
      {change !== 0 && (
        <div className={`mt-2 flex items-center text-sm font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
          {isUp ? '↑' : '↓'} {formatCurrency(Math.abs(change))}
        </div>
      )}
    </div>
  );
};

export default PoolDisplay;

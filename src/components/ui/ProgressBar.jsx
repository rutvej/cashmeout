import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ value, color = 'bg-accent-action', height = 'md', animated = false }) => {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[height]}`}>
      {animated ? (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      ) : (
        <div 
          className={`h-full rounded-full transition-all duration-300 ${color}`} 
          style={{ width: `${safeValue}%` }} 
        />
      )}
    </div>
  );
};

export default ProgressBar;

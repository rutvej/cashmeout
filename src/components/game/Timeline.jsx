import React from 'react';
import { motion } from 'framer-motion';

const Timeline = ({ currentDay, totalDays = 7300, financialHealth = 'stable' }) => {
  const progress = Math.min((currentDay / totalDays) * 100, 100);
  const currentAge = Math.floor(22 + (currentDay / 365));
  
  const healthColor = financialHealth === 'distress' ? 'bg-accent-caution' : 'bg-accent-action';

  return (
    <div className="w-full px-4 py-6">
      <div className="relative">
        {/* Day counter above marker */}
        <motion.div 
          className="absolute -top-6 transform -translate-x-1/2 text-xs font-semibold text-text-primary"
          animate={{ left: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        >
          Day {Math.floor(currentDay)}
        </motion.div>
        
        {/* Track */}
        <div className="h-1 bg-gray-200 rounded-full w-full relative">
          {/* Filled portion */}
          <motion.div 
            className="absolute top-0 left-0 h-full bg-accent-action rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
          
          {/* Marker */}
          <motion.div 
            className={`absolute top-1/2 -mt-2 -ml-2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${healthColor}`}
            animate={{ left: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
        
        {/* Age Labels */}
        <div className="flex justify-between mt-2 text-xs text-text-muted font-medium">
          <span>Age 22</span>
          <span className="text-text-primary font-bold text-sm">Age {currentAge}</span>
          <span>Age 42</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;

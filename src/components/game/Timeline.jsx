import React from 'react';
import { motion } from 'framer-motion';

const Timeline = ({ currentDay, totalDays = 7300, financialHealth = 'stable', calendarQueue = null }) => {
  const progress = Math.min((currentDay / totalDays) * 100, 100);
  const currentAge = Math.floor(22 + (currentDay / 365));
  const currentYear = Math.floor(currentDay / 365) + 1;
  const monthOfYear = Math.min(12, Math.floor((currentDay % 365) / 30) + 1);
  const dayOfMonth = (currentDay % 30) + 1;
  
  const healthColor = financialHealth === 'distress' ? 'bg-accent-caution' : 'bg-accent-action';

  // Peek upcoming 15 days for calendar queue events
  const upcomingEvents = calendarQueue?.peekUpcoming ? calendarQueue.peekUpcoming(currentDay + 1, 15) : [];

  return (
    <div className="w-full px-4 pt-3 pb-2">
      {/* Date & Age Header Banner */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
            📅 Year {currentYear}, Month {monthOfYear}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Day {dayOfMonth}/30
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            Age {currentAge}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">/ 42</span>
        </div>
      </div>

      {/* 20-Year Lifetime Progress Track */}
      <div className="relative mb-2">
        {/* Track */}
        <div className="h-1.5 bg-gray-200 rounded-full w-full relative overflow-hidden">
          {/* Filled portion */}
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
      </div>

      {/* Mini 15-Day Forward Calendar Ribbon */}
      <div className="flex items-center justify-between text-[10px] bg-slate-50/90 rounded-xl px-2.5 py-1 border border-slate-100">
        <div className="flex items-center space-x-1">
          <span className="text-slate-400 font-bold">Upcoming:</span>
          {upcomingEvents.length > 0 ? (
            <div className="flex items-center space-x-1.5">
              {upcomingEvents.slice(0, 3).map((ue, idx) => (
                <span 
                  key={idx}
                  className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold flex items-center space-x-0.5 border border-amber-200"
                  title={`Event scheduled around Day ${ue.day}`}
                >
                  <span>❓</span>
                  <span>+{ue.day - currentDay}d</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-400 italic">Smooth sailing</span>
          )}
        </div>

        {/* 1st of next month payday countdown */}
        <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
          <span>💰 Payday in {30 - (currentDay % 30)}d</span>
        </span>
      </div>
    </div>
  );
};

export default Timeline;

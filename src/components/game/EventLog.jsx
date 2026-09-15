import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';

const EventLog = ({ events = [] }) => {
  const [expanded, setExpanded] = useState(false);

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-text-muted text-xs bg-gray-50 rounded-xl">
        No recent financial events yet.
      </div>
    );
  }

  const displayEvents = expanded ? events : events.slice(0, 4);

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Recent Activity</h3>
        {events.length > 4 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent-action font-semibold hover:underline"
          >
            {expanded ? 'Show Less' : `View All (${events.length})`}
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {displayEvents.map((evt, idx) => {
          const eventTitle = typeof evt.event === 'object' ? (evt.event?.name || evt.eventName) : (evt.eventName || evt.event || 'Financial Activity');
          const icon = typeof evt.event === 'object' ? (evt.event?.icon || evt.icon) : (evt.icon || '📝');
          const outcomeText = evt.outcome || '';
          const poolDelta = evt.poolDelta || 0;

          return (
            <div key={idx} className="flex items-start bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="text-2xl mr-3 flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-xs text-text-primary truncate pr-2">{eventTitle}</p>
                  <span className="text-[10px] text-text-muted whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                    Day {Math.floor(evt.day || 0)}
                  </span>
                </div>
                {evt.choice && (
                  <p className="text-[11px] text-text-muted mt-0.5 font-medium">
                    Choice: <span className="text-text-primary">{evt.choice}</span>
                  </p>
                )}
                {outcomeText && (
                  <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                    {outcomeText}
                  </p>
                )}
                {poolDelta !== 0 && (
                  <div className="mt-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${poolDelta > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {poolDelta > 0 ? '+' : ''}{formatCurrency(poolDelta)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventLog;

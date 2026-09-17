import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/format';

export default function LiveFinancialLedger({ 
  eventHistory = [], 
  simRunning = false,
  onPause = null,
  recentAutoToast = null,
  onDismissToast = null,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'statements' | 'events'
  const [expandedItems, setExpandedItems] = useState({});
  const [viewLimit, setViewLimit] = useState(5);

  const toggleExpand = (idx) => {
    setExpandedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Filter events
  const filteredEvents = eventHistory.filter(item => {
    if (filter === 'statements') return item.type === 'statement';
    if (filter === 'events') return item.type !== 'statement';
    return true;
  });

  const displayList = filteredEvents.slice(0, viewLimit);
  const totalCount = filteredEvents.length;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
      {/* Auto-Event Floating Announcement Pill */}
      <AnimatePresence>
        {recentAutoToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="text-base">{recentAutoToast.icon || '⚡'}</span>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                    ⚡ Auto-Processed
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {recentAutoToast.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {recentAutoToast.message || recentAutoToast.choice}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 ml-2">
              {recentAutoToast.poolDelta !== 0 && (
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${recentAutoToast.poolDelta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {recentAutoToast.poolDelta > 0 ? '+' : ''}{formatCurrency(recentAutoToast.poolDelta)}
                </span>
              )}
              {onDismissToast && (
                <button
                  onClick={onDismissToast}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📜</span>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>Financial Ledger</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.5 rounded-full">
                {eventHistory.length}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Real-time statements & life events (Newest on top)
            </p>
          </div>
        </div>

        {/* Status / Pause helper */}
        {simRunning && onPause && (
          <button
            onClick={onPause}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg flex items-center space-x-1 transition"
            title="Pause to make changes"
          >
            <span>⏸️</span>
            <span>Pause to Edit</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl mb-3 text-[11px] font-bold">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1 rounded-lg transition text-center ${filter === 'all' ? 'bg-white shadow-xs text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('statements')}
          className={`flex-1 py-1 rounded-lg transition text-center ${filter === 'statements' ? 'bg-white shadow-xs text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Statements
        </button>
        <button
          onClick={() => setFilter('events')}
          className={`flex-1 py-1 rounded-lg transition text-center ${filter === 'events' ? 'bg-white shadow-xs text-indigo-700 font-extrabold' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Life Events
        </button>
      </div>

      {/* Growing Items List (Newest on Top) */}
      {totalCount === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <span className="text-2xl block mb-1">⏳</span>
          No statements recorded yet. Simulation starting...
        </div>
      ) : (
        <div className="space-y-2">
          {displayList.map((item, idx) => {
            const isStatement = item.type === 'statement';
            const stmt = item.statementDetails;
            const isExpanded = !!expandedItems[idx];
            const poolDelta = item.poolDelta || 0;

            return (
              <div 
                key={item.id || `${item.day}_${idx}`}
                className={`rounded-2xl p-3 border transition ${isStatement ? 'bg-slate-50/60 border-slate-100 hover:border-slate-200' : 'bg-white border-slate-100 shadow-xs'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <span className="text-xl shrink-0 mt-0.5">{item.icon || (isStatement ? '📊' : '📝')}</span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-800 truncate">
                          {item.eventName}
                        </span>
                        {item.isAuto && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-black px-1.5 py-0.2 rounded">
                            ⚡ AUTO
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.outcome}
                      </div>

                      {item.choice && !isStatement && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Decision: <strong className="text-slate-700">{item.choice}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pool Delta & Day Tag */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                      Day {Math.floor(item.day || 0)}
                    </span>
                    {poolDelta !== 0 ? (
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full inline-block ${poolDelta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {poolDelta > 0 ? '+' : ''}{formatCurrency(poolDelta)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 bg-slate-100 rounded">
                        ₹0
                      </span>
                    )}
                  </div>
                </div>

                {/* Statement Expandable Breakdown */}
                {isStatement && stmt && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-[10px] font-extrabold text-slate-600 hover:text-slate-900 flex items-center space-x-1 transition"
                    >
                      <span>{isExpanded ? '▲ Hide Breakdown' : '▼ Itemized Cashflow Breakdown'}</span>
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 grid grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-xl border border-slate-200"
                      >
                        {/* Inflows */}
                        <div className="space-y-1 pr-1 border-r border-slate-100">
                          <p className="font-extrabold text-emerald-700 uppercase tracking-wider text-[9px] mb-1">
                            Incomes Earned
                          </p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Salary/Job:</span>
                            <span className="font-bold text-slate-800">{formatCurrency(stmt.salaryEarned || 0)}</span>
                          </div>
                          {stmt.businessEarned > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Business:</span>
                              <span className="font-bold text-emerald-700">{formatCurrency(stmt.businessEarned)}</span>
                            </div>
                          )}
                          {stmt.rentEarned > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Rent:</span>
                              <span className="font-bold text-emerald-700">{formatCurrency(stmt.rentEarned)}</span>
                            </div>
                          )}
                          {stmt.investmentGains > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Inv. Growth:</span>
                              <span className="font-bold text-emerald-700">+{formatCurrency(stmt.investmentGains)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-slate-100 font-extrabold">
                            <span className="text-slate-700">Total Inflow:</span>
                            <span className="text-emerald-700">{formatCurrency(stmt.totalEarned || 0)}</span>
                          </div>
                        </div>

                        {/* Outflows */}
                        <div className="space-y-1 pl-1">
                          <p className="font-extrabold text-rose-700 uppercase tracking-wider text-[9px] mb-1">
                            Total Outflow
                          </p>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Living & Rent:</span>
                            <span className="font-bold text-rose-600">-{formatCurrency(stmt.totalExpenses || 0)}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-100 font-extrabold">
                            <span className="text-slate-700">Net Surplus:</span>
                            <span className={stmt.surplus >= 0 ? "text-emerald-700" : "text-rose-700"}>
                              {stmt.surplus >= 0 ? '+' : ''}{formatCurrency(stmt.surplus || 0)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Expand View */}
      {totalCount > 5 && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-medium">
            Showing {Math.min(viewLimit, totalCount)} of {totalCount} entries
          </span>
          <button
            onClick={() => setViewLimit(viewLimit > 5 ? 5 : totalCount)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            {viewLimit > 5 ? 'Show Less ▲' : `View All (${totalCount}) ▼`}
          </button>
        </div>
      )}
    </div>
  );
}

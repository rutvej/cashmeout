import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ReferenceLine, ResponsiveContainer, Legend 
} from 'recharts';
import useGameStore from '../../engine/store';
import Timeline from '../game/Timeline';
import SimControls from '../game/SimControls';
import PoolDisplay from '../game/PoolDisplay';
import FloatingDelta from '../game/FloatingDelta';
import IncomeDeductions from '../game/IncomeDeductions';
import InstrumentBar from '../game/InstrumentBar';
import BucketBar from '../game/BucketBar';
import LiveFinancialLedger from '../game/LiveFinancialLedger';
import EventCard from '../game/EventCard';
import MilestoneModal from '../game/MilestoneModal';
import LiquidationModal from '../game/LiquidationModal';
import AllocationSheet from '../game/AllocationSheet';
import JobMarketModal from '../game/JobMarketModal';
import RefillEmergencyModal from '../game/RefillEmergencyModal';
import { formatCurrency } from '../../utils/format';

const GOAL_COLORS = {
  Emergency: '#10b981',
  Marriage: '#ec4899',
  Home: '#3b82f6',
  Car: '#f59e0b',
  Vacation: '#8b5cf6',
  Business: '#f97316',
  Retirement: '#06b6d4',
};

const MainGame = () => {
  const store = useGameStore();
  const [prevPool, setPrevPool] = useState(store.pool);
  const [poolDelta, setPoolDelta] = useState(0);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'ledger' | 'both'
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'trend'
  const [showJobMarket, setShowJobMarket] = useState(false);

  useEffect(() => {
    if (store.pool !== prevPool) {
      setPoolDelta(store.pool - prevPool);
      setPrevPool(store.pool);
      const timer = setTimeout(() => {
        setPoolDelta(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [store.pool, prevPool]);

  // Start sim on mount, cleanup on unmount
  useEffect(() => {
    store.startSimulation();
    return () => store.pauseSimulation();
  }, []);

  // When a shortfall is resolved AND emergency fund was depleted, redirect
  // to FinancialSetup so the player can readjust investments to replenish it.
  useEffect(() => {
    if (!store.deficitInfo && store.pendingEmergencyRedesign && store.screen === 'game') {
      store.pauseSimulation();
      useGameStore.setState({ pendingEmergencyRedesign: false, screen: 'financialSetup' });
    }
  }, [store.deficitInfo, store.pendingEmergencyRedesign, store.screen]);

  const rentalIncome = (store.homesOwned || [])
    .filter(h => h.isRentedOut && h.rentalIncome)
    .reduce((sum, h) => sum + h.rentalIncome, 0);

  const totalIncome = (store.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0) + (store.businessIncome || 0) + rentalIncome;
  const totalDeductions =
    (store.fixedDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0) +
    (store.loans?.reduce((sum, l) => sum + l.emi, 0) || 0) +
    (store.hasHealthInsurance ? store.healthInsuranceCost : 0) +
    (store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0) +
    (store.homeMaintenanceCost || 0) +
    (store.carMaintenanceCost || 0);

  const surplus = totalIncome - totalDeductions;

  // Chart calculation for goal trajectories
  const chartData = useMemo(() => {
    const snaps = store.monthlySnapshots || [];
    const goals = store.goals || [];
    
    // Always provide at least month 0 baseline so chart renders cleanly
    const points = [];
    const initialPoint = { month: 0 };
    goals.forEach(g => { initialPoint[g.id] = 0; });
    points.push(initialPoint);

    snaps.forEach((snap, idx) => {
      const month = idx + 1;
      const dataPoint = { month };
      goals.forEach(goal => {
        let monthlyAmt = store.goalMonthlyAllocations?.[goal.id];
        if (monthlyAmt === undefined || monthlyAmt === null) {
          const allocPct = store.buckets?.[goal.id] || 0;
          monthlyAmt = Math.max(0, Math.round((allocPct / 100) * surplus));
        }
        const instKey = store.goalInstruments?.[goal.id] || 'mf';
        const rateMap = { equity: 0.15/12, mf: 0.12/12, fd: 0.07/12, gold: 0.08/12, silver: 0.08/12, savings: 0.04/12 };
        const rate = rateMap[instKey] || 0.08 / 12;
        let fv = monthlyAmt * month;
        if (rate > 0 && monthlyAmt > 0) {
          fv = monthlyAmt * ((Math.pow(1 + rate, month) - 1) / rate);
        }
        dataPoint[goal.id] = Math.round(fv);
      });
      points.push(dataPoint);
    });

    return points;
  }, [store.monthlySnapshots, store.goals, store.buckets, store.goalMonthlyAllocations, store.goalInstruments, surplus]);

  const goalBarData = useMemo(() => {
    const goals = store.goals || [];
    const currentDay = store.currentDay;
    const monthsElapsed = Math.max(0, Math.floor(currentDay / 30));
    const rateMap = { equity: 0.15/12, mf: 0.12/12, fd: 0.07/12, gold: 0.08/12, silver: 0.08/12, savings: 0.04/12 };

    return goals
      .filter(goal => {
        // If achieved, remove from chart EXCEPT recurring/fixed goals (emergency fund and travel)
        if (goal.achieved) {
          const isRecurring = goal.type === 'emergency' || goal.type === 'travel' || goal.type === 'vacation' || 
            (goal.name && (goal.name.toLowerCase().includes('emergency') || goal.name.toLowerCase().includes('travel') || goal.name.toLowerCase().includes('vacation')));
          return isRecurring;
        }
        return !goal.sacrificed;
      })
      .map(goal => {
        const cleanName = (goal.name || '').replace(/^[^\w\s]+/, '').trim();
        const firstWord = cleanName.split(' ')[0];
        const shortName = firstWord.length > 7 ? firstWord.slice(0, 6) + '…' : firstWord;

        if (goal.type === 'medical') {
          const isCovered = store.hasHealthInsurance;
          const cov = store.healthInsuranceCoverage || (isCovered ? 1000000 : 0);
          return {
            id: goal.id,
            name: 'Medical',
            fullName: 'Medical Insurance',
            icon: '🏥',
            saved: isCovered ? cov : 0,
            target: 1000000,
            percent: isCovered ? 100 : 0,
            color: '#f43f5e',
            achieved: isCovered,
            type: 'medical',
          };
        }

        const target = goal.currentTarget || goal.targetAmount || 100000;
        let saved = goal.accumulatedAmount !== undefined ? goal.accumulatedAmount : (goal.dedicatedContribution || 0);

        if (saved === 0 && !goal.achieved) {
          let monthlyAmt = store.goalMonthlyAllocations?.[goal.id];
          if (monthlyAmt === undefined || monthlyAmt === null) {
            const allocPct = store.buckets?.[goal.id] || 0;
            monthlyAmt = Math.max(0, Math.round((allocPct / 100) * surplus));
          }
          const instKey = store.goalInstruments?.[goal.id] || 'mf';
          const rate = rateMap[instKey] || 0.08 / 12;
          let fv = monthlyAmt * monthsElapsed;
          if (rate > 0 && monthlyAmt > 0) {
            fv = monthlyAmt * ((Math.pow(1 + rate, monthsElapsed) - 1) / rate);
          }
          const bucketShare = (store.pool || 0) * ((store.buckets?.[goal.id] || 0) / 100);
          saved = Math.min(target, Math.round(fv + bucketShare));
        }
        if (goal.achieved) {
          saved = Math.max(saved, target);
        }

        const percent = Math.min(100, Math.round((saved / Math.max(1, target)) * 100));
        const color = GOAL_COLORS[firstWord] || '#10b981';

        return {
          id: goal.id,
          name: shortName,
          fullName: goal.name,
          icon: goal.icon || '🎯',
          saved,
          target,
          percent,
          color,
          achieved: !!goal.achieved,
          type: goal.type,
        };
      });
  }, [store.goals, store.currentDay, store.goalMonthlyAllocations, store.goalInstruments, store.buckets, store.pool, store.hasHealthInsurance, store.healthInsuranceCoverage, surplus]);

  // Strict modal priority
  const activeModal = (() => {
    if (store.deficitInfo) return 'liquidation';
    if (store.showMilestone) return 'milestone';
    if (store.showAllocation) return 'allocation';
    return null;
  })();

  const hasPendingEvent = !!store.currentEvent;
  const startAge = store.player?.characterAge || 22;
  const retirementAge = store.retirementAge || 50;
  const totalDays = store.totalDays || ((retirementAge - startAge) * 365);

  const formatCompact = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-24 relative overflow-x-hidden w-full max-w-full font-sans">
      {/* Floating Cashflow Delta Pill */}
      {poolDelta !== 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <FloatingDelta delta={poolDelta} keyId={store.currentDay} />
        </div>
      )}

      {/* Top Header - Timeline & Sim Controls */}
      <div className="bg-slate-800/90 backdrop-blur-md rounded-b-3xl shadow-lg z-20 sticky top-0 border-b border-slate-700 max-w-md w-full mx-auto">
        <Timeline 
          currentDay={store.currentDay}
          totalDays={totalDays}
          financialHealth={store.pool > 0 ? 'stable' : 'distress'}
          calendarQueue={store.calendarQueue}
          startAge={startAge}
          retirementAge={retirementAge}
        />
        <SimControls 
          isRunning={store.simRunning} 
          speed={store.simSpeed} 
          onToggle={() => store.simRunning ? store.pauseSimulation() : store.startSimulation()} 
          onSpeedChange={store.setSimSpeed} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full pb-20">
        <div className="py-3 px-3 max-w-md w-full mx-auto space-y-3">
            
            {/* Active Life Event Card (Slide-In) */}
            {hasPendingEvent && (
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 mb-2">
                <EventCard
                  event={store.currentEvent}
                  onChoice={store.resolveEvent}
                />
              </div>
            )}

            {/* Core Financial Dashboard Metrics */}
            <PoolDisplay pool={store.pool} prevPool={prevPool} />
            <IncomeDeductions totalIncome={totalIncome} totalDeductions={totalDeductions} />

            {/* Month-on-Month Growth Indicator */}
            <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700/80 flex items-center justify-between text-xs shadow-md">
              <div className="flex items-center space-x-2.5">
                <span className="text-xl">🌱</span>
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Month-on-Month Flow</span>
                  <span className="text-[10px] text-slate-400">
                    Earned: +{formatCurrency(totalIncome)} · Spent: -{formatCurrency(totalDeductions)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-black block text-sm ${surplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}/mo
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                  Compounding Growth
                </span>
              </div>
            </div>

            {/* Quick Rebalance Goals Action */}
            <button
              type="button"
              onClick={() => {
                store.pauseSimulation();
                useGameStore.setState({ screen: 'financialSetup' });
              }}
              className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-2xl text-left flex justify-between items-center transition text-xs shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">🎯</span>
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Redesign Goal Investments</span>
                  <span className="text-[10px] text-slate-400">Distribute surplus {formatCurrency(surplus)}/mo across goals (same as starting setup)</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-400 shrink-0">Redesign →</span>
            </button>

            {/* Dashboard View Switcher */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-bold">
              <button
                onClick={() => setViewMode('chart')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${viewMode === 'chart' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <span>📊</span>
                <span>Goal Charts</span>
              </button>
              <button
                onClick={() => setViewMode('ledger')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${viewMode === 'ledger' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <span>📜</span>
                <span>Live Ledger</span>
              </button>
              <button
                onClick={() => setViewMode('both')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${viewMode === 'both' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <span>📑</span>
                <span>All Views</span>
              </button>
            </div>

            {/* Goal Progress Chart */}
            {(viewMode === 'chart' || viewMode === 'both') && (
              <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <span>🎯</span>
                      <span>Individual Goal Progress</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {chartType === 'bar' ? 'Comparing saved vs target per goal' : 'Trajectories over lifetime'}
                    </p>
                  </div>
                  <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-2 py-1 rounded-md transition-all ${chartType === 'bar' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      📊 Bar
                    </button>
                    <button
                      onClick={() => setChartType('trend')}
                      className={`px-2 py-1 rounded-md transition-all ${chartType === 'trend' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      📈 Trend
                    </button>
                  </div>
                </div>

                {chartType === 'bar' ? (
                  /* Recharts Individual Goals Bar Chart */
                  <div>
                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={goalBarData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            stroke="#475569" 
                            interval={0}
                          />
                          <YAxis 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            stroke="#475569" 
                            tickFormatter={formatCompact} 
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1 z-50">
                                  <p className="font-bold text-white flex items-center gap-1.5">
                                    <span>{data.icon || '🎯'}</span>
                                    <span>{data.fullName}</span>
                                  </p>
                                  <div className="flex justify-between gap-4 text-slate-300">
                                    <span>Saved:</span>
                                    <span className="font-black text-emerald-400">{formatCurrency(data.saved)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4 text-slate-400">
                                    <span>Target:</span>
                                    <span className="font-bold">{formatCurrency(data.target)}</span>
                                  </div>
                                  <div className="pt-1 border-t border-slate-800 flex justify-between font-bold">
                                    <span className="text-slate-400">Progress:</span>
                                    <span className={data.percent >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                                      {data.percent}% {data.achieved ? '✅' : ''}
                                    </span>
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} iconType="circle" />
                          <Bar dataKey="saved" name="Saved / Accumulated" radius={[4, 4, 0, 0]}>
                            {goalBarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                          <Bar dataKey="target" name="Target Goal" fill="#334155" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Compact Goal Status Grid */}
                    <div className="mt-3 pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2">
                      {goalBarData.map(g => (
                        <div key={g.id} className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-300 truncate pr-1">
                              {g.icon} {g.name}
                            </span>
                            <span className={`text-[10px] font-black ${g.achieved ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {g.percent}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, g.percent)}%`, backgroundColor: g.color }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                            <span>{formatCompact(g.saved)}</span>
                            <span>{formatCompact(g.target)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Recharts Growth Trajectory Line Chart */
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" tickFormatter={(v) => `${Math.floor(v/12)}y`} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" tickFormatter={formatCompact} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(val) => formatCurrency(val)}
                          labelFormatter={(val) => `Month ${val}`}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} iconType="circle" />
                        
                        {(store.goals || []).map((goal, i) => {
                          const nameKey = (goal.name || '').replace(/^[^\w\s]+/, '').trim().split(' ')[0];
                          const color = GOAL_COLORS[nameKey] || Object.values(GOAL_COLORS)[i % 7];
                          return (
                            <React.Fragment key={goal.id}>
                              <Line type="monotone" dataKey={goal.id} name={goal.name} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                              <ReferenceLine y={goal.currentTarget} stroke={color} strokeDasharray="3 3" opacity={0.4} />
                            </React.Fragment>
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Asset Allocation Bars */}
            <div className="space-y-2">
              <InstrumentBar instruments={store.instruments} pool={store.pool} />
              <BucketBar buckets={store.buckets} goals={store.goals} pool={store.pool} />
            </div>

            {/* Live Financial Statement & Activity Ledger */}
            {(viewMode === 'ledger' || viewMode === 'both') && (
              <LiveFinancialLedger
                eventHistory={store.eventHistory}
                simRunning={store.simRunning}
                onPause={store.pauseSimulation}
                recentAutoToast={store.recentAutoToast}
                onDismissToast={store.clearAutoToast}
              />
            )}

          </div>
      </div>

      {/* Sticky Bottom Goal Redesign & Career Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              Active Monthly Cashflow
            </span>
            <span className={`text-sm font-black truncate ${surplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}/mo surplus
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Career / Reapply for Job button */}
            {!(store.incomes || []).some(i => i.type === 'job') ? (
              <button
                type="button"
                onClick={() => {
                  store.pauseSimulation();
                  setShowJobMarket(true);
                }}
                className="py-2 px-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 animate-pulse transition flex items-center space-x-1.5 shrink-0 border border-amber-300"
              >
                <span>💼</span>
                <span>Apply for Job</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  store.pauseSimulation();
                  setShowJobMarket(true);
                }}
                className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center space-x-1 shrink-0"
              >
                <span>💼</span>
                <span>Job Market</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                store.pauseSimulation();
                useGameStore.setState({ screen: 'financialSetup' });
              }}
              className="py-2 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-1.5 shrink-0"
            >
              <span>🎯</span>
              <span>Readjust Goals</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals with Strict Priority Hierarchy */}
      <JobMarketModal
        isOpen={showJobMarket}
        onClose={() => {
          setShowJobMarket(false);
          if (!store.currentEvent && !store.deficitInfo && !store.showMilestone && !store.showAllocation && !store.refillEmergencyPrompt) {
            store.startSimulation();
          }
        }}
      />

      <RefillEmergencyModal
        prompt={store.refillEmergencyPrompt}
        onDismiss={() => {
          store.dismissRefillPrompt();
          store.startSimulation();
        }}
        onRefill={() => {
          store.dismissRefillPrompt();
          store.pauseSimulation();
          useGameStore.setState({ screen: 'financialSetup' });
        }}
      />

      {activeModal === 'liquidation' && (
        <LiquidationModal deficitInfo={store.deficitInfo} onResolve={store.resolveLiquidation} />
      )}
      {activeModal === 'milestone' && (
        <MilestoneModal milestone={store.showMilestone} onAction={(action) => store.resolveMilestone(store.showMilestone.goalId, action)} />
      )}
      {activeModal === 'allocation' && (
        <AllocationSheet isOpen={true} goals={store.goals.filter(g => !g.achieved && !g.sacrificed)} fixedDeductions={store.fixedDeductions.filter(d => d.type === 'allocation')} initialAllocations={store.buckets} onConfirm={store.confirmAllocation} />
      )}
    </div>
  );
};

export default MainGame;

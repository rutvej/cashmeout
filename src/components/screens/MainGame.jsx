import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';
import useGameStore from '../../engine/store';
import TabBar from '../ui/TabBar';
import EventCard from '../game/EventCard';
import MilestoneModal from '../game/MilestoneModal';
import LiquidationModal from '../game/LiquidationModal';
import AllocationSheet from '../game/AllocationSheet';
import { formatCurrency } from '../../utils/format';

// Tab screens
import BankTab from './tabs/BankTab';
import InvestmentsTab from './tabs/InvestmentsTab';
import InsuranceTab from './tabs/InsuranceTab';
import LoansTab from './tabs/LoansTab';
import IncomeTab from './tabs/IncomeTab';
import GoalsTab from './tabs/GoalsTab';

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
  const [showIncomeOptions, setShowIncomeOptions] = useState(false);

  useEffect(() => {
    store.startSimulation();
    return () => store.pauseSimulation();
  }, []);

  const handleTabChange = (tab) => {
    if (tab === 'home' || tab === null) {
      useGameStore.setState({ activeTab: null });
    } else {
      useGameStore.setState({ activeTab: store.activeTab === tab ? null : tab });
    }
  };

  const renderTabContent = () => {
    switch (store.activeTab) {
      case 'bank': return <BankTab />;
      case 'investments': return <InvestmentsTab />;
      case 'insurance': return <InsuranceTab />;
      case 'loans': return <LoansTab />;
      case 'income': return <IncomeTab />;
      case 'goals': return <GoalsTab />;
      default: return null;
    }
  };

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

  const chartData = useMemo(() => {
    const snaps = store.monthlySnapshots || [];
    const goals = store.goals || [];
    return snaps.map((snap, idx) => {
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
            fv = monthlyAmt * ((Math.pow(1+rate, month)-1)/rate);
        }
        dataPoint[goal.id] = Math.round(fv);
      });
      return dataPoint;
    });
  }, [store.monthlySnapshots, store.goals, store.buckets, store.goalMonthlyAllocations, store.goalInstruments, surplus]);

  const activeModal = (() => {
    if (store.deficitInfo) return 'liquidation';
    if (store.showMilestone) return 'milestone';
    if (store.showAllocation) return 'allocation';
    return null;
  })();

  const startAge = store.player?.characterAge || 22;
  const age = startAge + Math.floor(store.currentDay / 365);
  const totalDays = store.totalDays || ((store.retirementAge || 50) - startAge) * 365;
  const progressPercent = Math.min(100, (store.currentDay / totalDays) * 100);

  const formatCompact = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col pb-24 relative overflow-x-hidden w-full max-w-full font-sans">
      
      {/* Top Bar */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-b-3xl shadow-lg z-20 sticky top-0 border-b border-slate-700 max-w-md w-full mx-auto px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-3">
            <span className="bg-indigo-600/20 text-indigo-400 font-bold px-2.5 py-1 rounded-lg text-sm border border-indigo-500/30">
              Age {age}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Net Worth</span>
              <span className="text-sm font-black text-emerald-400">{formatCurrency(store.pool)}</span>
            </div>
          </div>
          
          <div className="flex space-x-1.5 bg-slate-900/50 p-1 rounded-xl border border-slate-700">
            <button onClick={() => store.simRunning ? store.pauseSimulation() : store.startSimulation()} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors">
              {store.simRunning ? '⏸' : '▶️'}
            </button>
            <button onClick={() => store.setSimSpeed(1)} className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${store.simSpeed === 1 ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}>1x</button>
            <button onClick={() => store.setSimSpeed(2)} className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${store.simSpeed === 2 ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}>2x</button>
            <button onClick={() => store.setSimSpeed(5)} className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors ${store.simSpeed === 5 ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}>5x</button>
          </div>
        </div>
        
        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        {!store.activeTab ? (
          <div className="py-4 px-3 max-w-md w-full mx-auto space-y-4">
            
            {/* Goal Progress Chart */}
            <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Goal Progress</h3>
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
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                    
                    {(store.goals || []).map((goal, i) => {
                      const color = GOAL_COLORS[goal.name.split(' ')[0]] || Object.values(GOAL_COLORS)[i % 7];
                      return (
                        <React.Fragment key={goal.id}>
                          <Line type="monotone" dataKey={goal.id} name={goal.name} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                          <ReferenceLine y={goal.currentTarget} stroke={color} strokeDasharray="3 3" opacity={0.5} />
                        </React.Fragment>
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Income Ticker */}
            <div className="bg-slate-800 rounded-2xl p-3 shadow-lg border border-slate-700 flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-slate-400">Income</span>
                <span className="font-bold text-emerald-400">+{formatCompact(totalIncome)}</span>
              </div>
              <div className="h-6 w-px bg-slate-700"></div>
              <div className="flex flex-col">
                <span className="text-slate-400">Expenses</span>
                <span className="font-bold text-rose-400">-{formatCompact(totalDeductions)}</span>
              </div>
              <div className="h-6 w-px bg-slate-700"></div>
              <div className="flex flex-col">
                <span className="text-slate-400">Surplus</span>
                <span className="font-bold text-indigo-400">{formatCompact(surplus)}</span>
              </div>
            </div>

            {/* Event Area */}
            {hasPendingEvent && (
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                <EventCard event={store.currentEvent} onChoice={store.resolveEvent} />
              </div>
            )}
            
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-slate-900 min-h-full max-w-md w-full mx-auto overflow-x-hidden pb-24 text-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black capitalize text-slate-100">
                {store.activeTab} Overview
              </h2>
              <button
                onClick={() => handleTabChange(null)}
                className="text-xs text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-full px-3 py-1 font-semibold transition"
              >
                ✕ Close
              </button>
            </div>
            {renderTabContent()}
          </div>
        )}
      </div>

      {/* Quick Actions / Bottom Tabs */}
      <TabBar 
        activeTab={store.activeTab} 
        onTabChange={handleTabChange} 
        hasPendingEvent={hasPendingEvent}
      />

      {/* Floating Action Button for Income Options */}
      {!store.activeTab && (
        <button 
          onClick={() => { store.pauseSimulation(); setShowIncomeOptions(true); }}
          className="fixed bottom-24 right-4 z-40 bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-12 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <span className="text-xl">⚡</span>
        </button>
      )}

      {/* Quick Actions Sheet */}
      {showIncomeOptions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowIncomeOptions(false)}>
          <div className="bg-slate-800 w-full max-w-md rounded-t-3xl p-5 border-t border-slate-700 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-100">Income Options</h3>
              <button onClick={() => setShowIncomeOptions(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <button className="w-full text-left p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 transition flex items-center space-x-3" onClick={() => { setShowIncomeOptions(false); handleTabChange('income'); }}>
              <span className="text-2xl">📚</span>
              <div>
                <div className="font-bold text-slate-200">Take a Course</div>
                <div className="text-xs text-slate-400">Improve skills for better pay</div>
              </div>
            </button>
            <button className="w-full text-left p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 transition flex items-center space-x-3" onClick={() => { setShowIncomeOptions(false); handleTabChange('income'); }}>
              <span className="text-2xl">💼</span>
              <div>
                <div className="font-bold text-slate-200">Switch Job</div>
                <div className="text-xs text-slate-400">Look for new opportunities</div>
              </div>
            </button>
            <button className="w-full text-left p-4 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 transition flex items-center space-x-3" onClick={() => { setShowIncomeOptions(false); handleTabChange('income'); }}>
              <span className="text-2xl">🏢</span>
              <div>
                <div className="font-bold text-slate-200">Start Business</div>
                <div className="text-xs text-slate-400">Launch your own venture</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
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

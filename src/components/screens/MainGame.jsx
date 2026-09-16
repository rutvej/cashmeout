import React, { useEffect, useState } from 'react';
import useGameStore from '../../engine/store';
import Timeline from '../game/Timeline';
import SimControls from '../game/SimControls';
import PoolDisplay from '../game/PoolDisplay';
import BucketBar from '../game/BucketBar';
import InstrumentBar from '../game/InstrumentBar';
import IncomeDeductions from '../game/IncomeDeductions';
import TabBar from '../ui/TabBar';
import EventCard from '../game/EventCard';
import EventLog from '../game/EventLog';
import AllocationSheet from '../game/AllocationSheet';
import MilestoneModal from '../game/MilestoneModal';
import LiquidationModal from '../game/LiquidationModal';
import LedgerDisplay from '../game/LedgerDisplay';
import FloatingDelta from '../game/FloatingDelta';

// Tab screens
import BankTab from './tabs/BankTab';
import InvestmentsTab from './tabs/InvestmentsTab';
import InsuranceTab from './tabs/InsuranceTab';
import LoansTab from './tabs/LoansTab';
import IncomeTab from './tabs/IncomeTab';
import GoalsTab from './tabs/GoalsTab';

const MainGame = () => {
  const store = useGameStore();
  const [prevPool, setPrevPool] = useState(store.pool);
  const [poolDelta, setPoolDelta] = useState(0);

  useEffect(() => {
    if (store.pool !== prevPool) {
      setPoolDelta(store.pool - prevPool);
      setPrevPool(store.pool);
    }
  }, [store.pool, prevPool]);

  // Start sim on mount, cleanup on unmount
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

  // Strict modal priority to prevent any overlapping dialogs (events never block navigation)
  const activeModal = (() => {
    if (store.deficitInfo) return 'liquidation';
    if (store.showMilestone) return 'milestone';
    if (store.showAllocation) return 'allocation';
    if (store.showMonthlyLedger) return 'ledger';
    return null;
  })();

  const hasPendingEvent = !!store.currentEvent;

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col pb-24 relative overflow-x-hidden w-full max-w-full">
      {/* Floating Cashflow Delta Pill */}
      {poolDelta !== 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <FloatingDelta delta={poolDelta} keyId={store.currentDay} />
        </div>
      )}

      {/* Top Section - Fixed Sticky Timeline & Sim Controls */}
      <div className="bg-white rounded-b-3xl shadow-sm z-20 sticky top-0 border-b border-gray-100 max-w-md w-full mx-auto">
        <Timeline 
          currentDay={store.currentDay} 
          financialHealth={store.pool > 0 ? 'stable' : 'distress'}
          calendarQueue={store.calendarQueue}
        />
        <SimControls 
          isRunning={store.simRunning} 
          speed={store.simSpeed} 
          onToggle={() => store.simRunning ? store.pauseSimulation() : store.startSimulation()} 
          onSpeedChange={store.setSimSpeed} 
        />

        {/* Notice Banner when browsing tabs while event is waiting */}
        {hasPendingEvent && store.activeTab && (
          <div
            onClick={() => handleTabChange(null)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 text-xs font-bold flex items-center justify-between cursor-pointer transition shadow-sm"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="text-base animate-pulse">⚡</span>
              <span className="truncate">Decision Pending: {store.currentEvent.name}</span>
            </div>
            <span className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full text-[11px] font-black whitespace-nowrap ml-2">
              Decide on Home →
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area - Scrollable Dashboard */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        {!store.activeTab ? (
          <div className="py-3 px-3 max-w-md w-full mx-auto space-y-3">
            {/* Active Life Event Card (Slide-In) */}
            {store.currentEvent && (
              <div className="mb-2">
                <EventCard
                  event={store.currentEvent}
                  onChoice={store.resolveEvent}
                />
              </div>
            )}

            {/* Core Financial Dashboard Metrics */}
            <PoolDisplay pool={store.pool} prevPool={prevPool} />
            <IncomeDeductions totalIncome={totalIncome} totalDeductions={totalDeductions} />
            <InstrumentBar instruments={store.instruments} pool={store.pool} />
            <BucketBar buckets={store.buckets} goals={store.goals} pool={store.pool} />

            {/* Recent Activity Log */}
            <div className="pt-2">
              <EventLog events={[...store.eventHistory].reverse()} />
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 bg-gray-50/50 min-h-full max-w-md w-full mx-auto overflow-x-hidden pb-24">
            {/* Tab Header with Close Button */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-black capitalize text-text-primary">
                {store.activeTab} Overview
              </h2>
              <button
                onClick={() => handleTabChange(null)}
                className="text-xs text-text-muted bg-white border border-gray-200 hover:bg-gray-100 rounded-full px-3 py-1 font-semibold transition"
              >
                ✕ Close Tab
              </button>
            </div>
            {renderTabContent()}
          </div>
        )}
      </div>

      {/* Persistent Bottom Tab Bar */}
      <TabBar 
        activeTab={store.activeTab} 
        onTabChange={handleTabChange} 
        hasPendingEvent={hasPendingEvent}
      />

      {/* ========================================================
          NON-OVERLAPPING MODALS (Strict Priority Hierarchy)
          ======================================================== */}

      {/* 1. Liquidation Modal (Shortfall Emergency) */}
      {activeModal === 'liquidation' && (
        <LiquidationModal 
          deficitInfo={store.deficitInfo} 
          onResolve={store.resolveLiquidation} 
        />
      )}

      {/* 2. Milestone Modal (Goal Achieved) */}
      {activeModal === 'milestone' && (
        <MilestoneModal 
          milestone={store.showMilestone} 
          onAction={(action) => store.resolveMilestone(store.showMilestone.goalId, action)} 
        />
      )}

      {/* 4. Full Allocation Sheet (Bucket Resplit) */}
      {activeModal === 'allocation' && (
        <AllocationSheet 
          isOpen={true} 
          goals={store.goals.filter(g => !g.achieved && !g.sacrificed)} 
          fixedDeductions={store.fixedDeductions.filter(d => d.type === 'allocation')}
          initialAllocations={store.buckets}
          onConfirm={store.confirmAllocation} 
        />
      )}

      {/* 5. Monthly Ledger Modal (Day 1 Statement When Financials Change) */}
      {activeModal === 'ledger' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📊</span>
                <span className="font-extrabold text-sm text-slate-800">Monthly Financial Statement</span>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                1st of Month
              </span>
            </div>

            <LedgerDisplay
              incomes={store.incomes}
              deductions={store.fixedDeductions}
              loans={store.loans}
              insuranceCosts={[
                ...(store.hasHealthInsurance ? [{ name: 'Health Insurance', amount: store.healthInsuranceCost }] : []),
                ...(store.hasVehicleInsurance ? [{ name: 'Vehicle Insurance', amount: store.vehicleInsuranceCost }] : []),
              ]}
              maintenanceCosts={[
                ...(store.homeMaintenanceCost > 0 ? [{ name: 'Home Maintenance', amount: store.homeMaintenanceCost }] : []),
                ...(store.carMaintenanceCost > 0 ? [{ name: 'Car Maintenance', amount: store.carMaintenanceCost }] : []),
              ]}
              surplus={totalIncome - totalDeductions}
              buckets={store.buckets}
              goals={store.goals}
              pool={store.pool}
              instruments={store.instruments}
              isExpanded={true}
            />

            <button
              onClick={store.closeMonthlyLedger}
              className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg transition"
            >
              Acknowledge & Continue Sim →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainGame;

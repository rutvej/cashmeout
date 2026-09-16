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
import AllocationSheet from '../game/AllocationSheet';
import MilestoneModal from '../game/MilestoneModal';
import LiquidationModal from '../game/LiquidationModal';
import LifestyleScene from '../game/LifestyleScene';

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

  useEffect(() => {
    if (store.pool !== prevPool) {
      setPrevPool(store.pool);
    }
  }, [store.pool]);

  // Start sim on mount, cleanup on unmount
  useEffect(() => {
    store.startSimulation();
    return () => store.pauseSimulation();
  }, []);

  const handleTabChange = (tab) => {
    useGameStore.setState({ activeTab: store.activeTab === tab ? null : tab });
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

  const totalIncome = (store.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0) + (store.businessIncome || 0);
  const totalDeductions =
    (store.fixedDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0) +
    (store.loans?.reduce((sum, l) => sum + l.emi, 0) || 0) +
    (store.hasHealthInsurance ? store.healthInsuranceCost : 0) +
    (store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0) +
    (store.homeMaintenanceCost || 0) +
    (store.carMaintenanceCost || 0);

  const hasPendingEvent = !!store.currentEvent;

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col pb-20">
      {/* Top Section - Fixed Sticky Timeline & Sim Controls */}
      <div className="bg-white rounded-b-3xl shadow-sm z-20 sticky top-0 border-b border-gray-100">
        <Timeline 
          currentDay={store.currentDay} 
          financialHealth={store.pool > 0 ? 'stable' : 'distress'} 
        />
        <SimControls 
          isRunning={store.simRunning} 
          speed={store.simSpeed} 
          onToggle={() => store.simRunning ? store.pauseSimulation() : store.startSimulation()} 
          onSpeedChange={store.setSimSpeed} 
        />

        {/* Non-blocking Notice Banner when browsing tabs while event is waiting */}
        {hasPendingEvent && store.activeTab && (
          <div
            onClick={() => handleTabChange(null)}
            className="bg-amber-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer hover:bg-amber-600 transition shadow-inner"
          >
            <div className="flex items-center space-x-2 truncate">
              <span>⚡</span>
              <span className="truncate">Decision Pending: {store.currentEvent.name}</span>
            </div>
            <span className="underline whitespace-nowrap ml-2 text-[11px]">Decide Now →</span>
          </div>
        )}
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {!store.activeTab ? (
          <div className="py-2">
            {/* Inline Event Card (Non-blocking: sits right in the main feed!) */}
            {hasPendingEvent && (
              <EventCard 
                event={store.currentEvent} 
                onChoice={store.resolveEvent} 
              />
            )}

            <PoolDisplay pool={store.pool} prevPool={prevPool} />
            <BucketBar buckets={store.buckets} goals={store.goals} pool={store.pool} />
            <InstrumentBar instruments={store.instruments} pool={store.pool} />
            <IncomeDeductions totalIncome={totalIncome} totalDeductions={totalDeductions} />
            <LifestyleScene />
          </div>
        ) : (
          <div className="p-4 bg-gray-50/50 min-h-full">
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
      <TabBar activeTab={store.activeTab} onTabChange={handleTabChange} />

      {/* Full Allocation Sheet (only triggers on salary change / goal reconfiguration) */}
      <AllocationSheet 
        isOpen={store.showAllocation} 
        goals={store.goals.filter(g => !g.achieved && !g.sacrificed)} 
        fixedDeductions={store.fixedDeductions.filter(d => d.type === 'allocation')}
        initialAllocations={store.buckets}
        onConfirm={store.confirmAllocation} 
      />

      {/* Milestone Modal */}
      {store.showMilestone && (
        <MilestoneModal 
          milestone={store.showMilestone} 
          onAction={(action) => store.resolveMilestone(store.showMilestone.goalId, action)} 
        />
      )}

      {/* Liquidation Choice Modal (when savings buffer is depleted) */}
      {store.deficitInfo && (
        <LiquidationModal 
          deficitInfo={store.deficitInfo} 
          onResolve={store.resolveLiquidation} 
        />
      )}
    </div>
  );
};

export default MainGame;

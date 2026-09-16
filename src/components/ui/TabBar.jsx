import React from 'react';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'bank', label: 'Bank', icon: '🏦' },
  { id: 'investments', label: 'Invest', icon: '📈' },
  { id: 'insurance', label: 'Insure', icon: '🛡️' },
  { id: 'loans', label: 'Loans', icon: '💸' },
  { id: 'income', label: 'Income', icon: '💰' },
  { id: 'goals', label: 'Goals', icon: '🎯' }
];

const TabBar = ({ activeTab, onTabChange, hasPendingEvent = false }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-1 px-0.5 sm:px-2 z-30 shadow-lg">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map(tab => {
          const isActive = (tab.id === 'home' && !activeTab) || activeTab === tab.id;
          const isHomeWithEvent = tab.id === 'home' && hasPendingEvent;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 relative transition ${
                isActive ? 'text-accent-action' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <div className="relative">
                <span className="text-base sm:text-lg mb-0.5 block">{tab.icon}</span>
                {isHomeWithEvent && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] truncate max-w-full text-center leading-tight ${
                isActive ? 'font-black text-accent-action' : 'font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;

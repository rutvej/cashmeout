import React from 'react';

const tabs = [
  { id: 'bank', label: 'Bank', icon: '🏦' },
  { id: 'investments', label: 'Investments', icon: '📈' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'loans', label: 'Loans', icon: '💸' },
  { id: 'income', label: 'Income', icon: '💰' },
  { id: 'goals', label: 'Goals', icon: '🎯' }
];

const TabBar = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-1.5 px-1 sm:px-2 z-30">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 ${isActive ? 'text-accent-action' : 'text-text-muted'}`}
            >
              <span className="text-lg sm:text-xl mb-0.5">{tab.icon}</span>
              <span className={`text-[9px] sm:text-[10px] truncate max-w-full text-center ${isActive ? 'font-bold' : 'font-medium'}`}>
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

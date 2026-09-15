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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-2 z-30">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full py-1 ${isActive ? 'text-accent-action' : 'text-text-muted'}`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;

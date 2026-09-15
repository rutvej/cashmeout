import React from 'react';

const SimControls = ({ isRunning, speed, onToggle, onSpeedChange }) => {
  return (
    <div className="flex justify-between items-center px-4 mb-2">
      <button 
        onClick={onToggle}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-action text-white shadow-sm hover:opacity-90"
      >
        {isRunning ? (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      <div className="flex bg-gray-100 rounded-full p-1">
        {[1, 2, 4].map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${speed === s ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default SimControls;

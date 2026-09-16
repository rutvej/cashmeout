import React from 'react';

export default function DefaultEventScene({ event, onChoice }) {
  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="z-10 bg-white p-5 rounded-2xl shadow-xl transform -rotate-3">
          <span className="text-5xl">{event.icon || '✨'}</span>
        </div>
      </div>
      <div className="p-8 text-center flex-grow flex flex-col justify-center bg-slate-50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">{event.name}</h2>
        <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
          {event.description}
        </p>
        <div className="flex flex-col gap-3 justify-center mt-auto w-full max-w-sm mx-auto">
          {event.options && event.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoice(idx)}
              className="w-full px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl shadow-sm border border-slate-200 transition-all text-left flex flex-col hover:border-indigo-300"
            >
              <span className="font-bold text-sm text-indigo-900">{opt.label}</span>
              {opt.description && <span className="text-xs text-slate-500 font-normal mt-0.5">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

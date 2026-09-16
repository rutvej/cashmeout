import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function PromotionScene({ event, onChoice }) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#fcd34d']
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-50 to-teal-50">
      <div className="relative w-full h-64 bg-gradient-to-r from-emerald-500 to-teal-600 flex flex-col items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-20">
          <path d="M 0 100 L 50 60 L 100 80 L 150 30 L 200 50 L 200 100 Z" fill="#fff" />
        </svg>
        <div className="z-10 bg-white/20 p-4 rounded-full backdrop-blur-sm mb-4">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="z-10 text-white text-xl font-bold tracking-wider uppercase drop-shadow-md">Achievement Unlocked</h3>
      </div>
      <div className="p-8 text-center flex-grow flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-teal-900 mb-4">{event.name}</h2>
        <p className="text-teal-700 text-lg mb-8 leading-relaxed max-w-lg mx-auto bg-teal-100/50 p-4 rounded-xl border border-teal-200">
          {event.description}
        </p>
        <div className="flex flex-col gap-3 justify-center mt-auto max-w-md mx-auto w-full">
          {event.options && event.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoice(idx)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 text-left flex flex-col"
            >
              <span className="font-bold text-sm">{opt.label}</span>
              {opt.description && <span className="text-xs text-emerald-100 font-normal mt-0.5">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

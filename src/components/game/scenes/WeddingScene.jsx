import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function WeddingScene({ event, onChoice }) {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff0000', '#ffd700']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff0000', '#ffd700']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="relative w-full h-64 bg-rose-100 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 100" className="absolute bottom-0 w-full h-full object-cover opacity-80">
          <path d="M 20 100 L 20 20 Q 100 -20 180 20 L 180 100 Z" fill="none" stroke="#e11d48" strokeWidth="4" />
          <path d="M 40 100 L 40 40 Q 100 10 160 40 L 160 100 Z" fill="none" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="50" r="15" fill="#fcd34d" />
        </svg>
        <div className="z-10 text-rose-500">
          <svg className="w-24 h-24 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </div>
      <div className="p-8 text-center flex-grow flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-rose-800 mb-4">{event.name}</h2>
        <p className="text-rose-900/80 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          {event.description}
        </p>
        <div className="flex flex-col gap-3 justify-center mt-auto max-w-md mx-auto w-full">
          {event.options && event.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoice(idx)}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-semibold rounded-2xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 text-left flex flex-col"
            >
              <span className="font-bold text-sm">{opt.label}</span>
              {opt.description && <span className="text-xs text-amber-900/80 font-normal mt-0.5">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export default function MarketCrashScene({ event, onChoice }) {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="relative w-full h-64 bg-red-950 flex flex-col items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-40">
          <motion.path 
            d="M 0 20 L 40 40 L 80 30 L 120 70 L 160 50 L 200 90" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="4" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <path d="M 0 20 L 40 40 L 80 30 L 120 70 L 160 50 L 200 90 L 200 100 L 0 100 Z" fill="rgba(239,68,68,0.2)" />
        </svg>
        
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="z-10 bg-red-900/80 p-4 rounded-full border border-red-500/30 backdrop-blur-sm"
        >
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        </motion.div>
      </div>
      <div className="p-8 text-center flex-grow flex flex-col justify-center border-t border-red-900/50">
        <h2 className="text-3xl font-bold text-red-400 mb-4">{event.name}</h2>
        <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          {event.description}
        </p>
        <div className="flex flex-col gap-3 justify-center mt-auto max-w-md mx-auto w-full">
          {event.options && event.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoice(idx)}
              className="px-6 py-3.5 bg-red-900/60 hover:bg-red-800 text-red-100 font-semibold rounded-xl border border-red-800 hover:border-red-600 transition-all shadow-[0_0_15px_rgba(153,27,27,0.5)] text-left flex flex-col"
            >
              <span className="font-bold text-sm">{opt.label}</span>
              {opt.description && <span className="text-xs text-red-300 font-normal mt-0.5">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

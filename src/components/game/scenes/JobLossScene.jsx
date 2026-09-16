import React from 'react';
import { motion } from 'framer-motion';

export default function JobLossScene({ event, onChoice }) {
  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      <div className="relative w-full h-64 bg-slate-950 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-30">
          <rect x="20" y="20" width="30" height="60" fill="#1e293b" />
          <rect x="80" y="30" width="40" height="50" fill="#1e293b" />
          <rect x="150" y="10" width="30" height="70" fill="#1e293b" />
        </svg>
        <motion.div 
          className="z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <svg className="w-24 h-24 text-rose-500/80 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
      </div>
      <div className="p-8 text-center flex-grow flex flex-col justify-center relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />
        <h2 className="text-3xl font-bold text-slate-100 mb-4">{event.name}</h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          {event.description}
        </p>
        <div className="flex flex-col gap-3 justify-center mt-auto max-w-md mx-auto w-full">
          {event.options && event.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoice(idx)}
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 font-medium rounded-xl shadow-md transition-all text-left flex flex-col"
            >
              <span className="font-bold text-sm text-slate-100">{opt.label}</span>
              {opt.description && <span className="text-xs text-slate-400 font-normal mt-0.5">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

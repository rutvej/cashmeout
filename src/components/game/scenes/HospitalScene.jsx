import React from 'react';
import { motion } from 'framer-motion';

export default function HospitalScene({ event, onChoice }) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="relative w-full h-64 bg-blue-900 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 100" className="absolute bottom-0 w-full h-full opacity-30">
          <rect x="0" y="50" width="200" height="50" fill="#1e3a8a" />
          <path d="M 40 60 L 160 60 L 160 80 L 40 80 Z" fill="#3b82f6" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <motion.svg viewBox="0 0 100 40" className="w-full h-24"
            initial={{ x: -100 }}
            animate={{ x: 100 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <path d="M 0 20 L 20 20 L 25 10 L 30 35 L 35 5 L 40 25 L 45 20 L 100 20" fill="none" stroke="#34d399" strokeWidth="2" />
          </motion.svg>
        </div>
        <div className="z-10 text-white flex items-center justify-center w-24 h-24 bg-red-500 rounded-full shadow-2xl border-4 border-white/20">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
        </div>
      </div>
      <div className="p-8 text-center flex-grow flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">{event.name}</h2>
        <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
          {event.description}
        </p>
        <div className="flex flex-col gap-3 justify-center mt-auto max-w-md mx-auto w-full">
          {event.options && event.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onChoice(idx)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transform transition hover:-translate-y-0.5 active:translate-y-0 text-left flex flex-col"
            >
              <span className="font-bold text-sm">{opt.label}</span>
              {opt.description && <span className="text-xs text-blue-200 font-normal mt-0.5">{opt.description}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

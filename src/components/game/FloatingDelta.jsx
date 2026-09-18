import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingDelta({ delta, keyId }) {
  if (!delta || delta === 0) return null;

  const isPositive = delta > 0;
  const colorClass = isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';
  const prefix = isPositive ? '+' : '';
  const formatted = `${prefix}₹${Math.round(Math.abs(delta)).toLocaleString('en-IN')}`;

  return (
    <AnimatePresence>
      <motion.div
        key={keyId}
        initial={{ opacity: 0, y: isPositive ? 10 : -10, scale: 0.8 }}
        animate={{ opacity: 1, y: isPositive ? -24 : 24, scale: 1.05 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className={`pointer-events-none px-3 py-1 rounded-full shadow-md font-extrabold text-xs sm:text-sm border whitespace-nowrap ${
          isPositive ? 'border-emerald-300' : 'border-rose-300'
        } ${colorClass}`}
      >
        {formatted}
      </motion.div>
    </AnimatePresence>
  );
}

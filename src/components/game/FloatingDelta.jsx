import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingDelta({ delta, keyId }) {
  if (!delta || delta === 0) return null;

  const isPositive = delta > 0;
  const colorClass = isPositive ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50';
  const prefix = isPositive ? '+' : '';
  const formatted = `${prefix}₹${Math.abs(delta).toLocaleString('en-IN')}`;

  return (
    <AnimatePresence>
      <motion.div
        key={keyId}
        initial={{ opacity: 0, y: isPositive ? 10 : -10, scale: 0.8 }}
        animate={{ opacity: 1, y: isPositive ? -30 : 30, scale: 1.1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`absolute left-1/2 -translate-x-1/2 pointer-events-none z-50 px-3 py-1 rounded-full shadow-lg font-bold text-sm border ${
          isPositive ? 'border-emerald-200' : 'border-rose-200'
        } ${colorClass}`}
      >
        {formatted}
      </motion.div>
    </AnimatePresence>
  );
}

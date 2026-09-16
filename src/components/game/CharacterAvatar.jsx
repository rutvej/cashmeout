import React from 'react';
import { motion } from 'framer-motion';

export default function CharacterAvatar({ age, isWorking, isFreelancing, mood, wealthTier, isMarried, hasHome, hasCar }) {
  let ageStage = 'young';
  if (age >= 28 && age <= 33) ageStage = 'mid';
  else if (age >= 34 && age <= 38) ageStage = 'senior';
  else if (age >= 39) ageStage = 'mature';

  let hairColor = '#3b2f2f';
  if (age >= 32) {
    const grayRatio = Math.min((age - 31) / 10, 1);
    const r = Math.round(59 + (128 - 59) * grayRatio);
    const g = Math.round(47 + (128 - 47) * grayRatio);
    const b = Math.round(47 + (128 - 47) * grayRatio);
    hairColor = `rgb(${r}, ${g}, ${b})`;
  }

  let outfitColor = '#4a90e2';
  if (wealthTier === 'middle') outfitColor = '#2c3e50';
  else if (wealthTier === 'comfortable') outfitColor = '#8e44ad';
  else if (wealthTier === 'wealthy') outfitColor = '#f39c12';

  let mouth = <path d="M 45 70 Q 60 80 75 70" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  let eyes = (
    <g>
      <circle cx="48" cy="55" r="4.5" fill="#333" />
      <circle cx="72" cy="55" r="4.5" fill="#333" />
    </g>
  );
  if (mood === 'neutral') {
    mouth = <path d="M 48 72 L 72 72" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  } else if (mood === 'stressed') {
    mouth = <path d="M 45 75 Q 60 65 75 75" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    eyes = (
      <g>
        <path d="M 44 51 L 52 56" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 76 51 L 68 56" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="48" cy="58" r="3.5" fill="#333" />
        <circle cx="72" cy="58" r="3.5" fill="#333" />
      </g>
    );
  }

  const typingAnimation = (isWorking || isFreelancing) ? {
    y: [0, 3, 0, -2, 0],
    transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
  } : {
    y: [0, -4, 0],
    transition: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
  };

  return (
    <motion.div className="w-full h-full flex items-center justify-center drop-shadow-xl" animate={typingAnimation}>
      <svg viewBox="0 0 120 160" className="w-full h-full max-w-xs drop-shadow-2xl">
        <defs>
          <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fce5cd" />
            <stop offset="100%" stopColor="#e8c3a1" />
          </linearGradient>
          <linearGradient id="outfit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={outfitColor} />
            <stop offset="100%" stopColor="#2c3e50" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>
        
        <g filter="url(#shadow)">
          <path d="M 25 160 C 25 100 95 100 95 160 Z" fill="url(#outfit)" />
          
          <rect x="52" y="85" width="16" height="25" fill="url(#skin)" rx="2" />
          
          <path d="M 52 100 L 60 115 L 68 100 Z" fill="#e2e8f0" />
          
          <circle cx="60" cy="62" r="30" fill="url(#skin)" />
          
          <path d="M 28 62 C 28 15 92 15 92 62 L 88 68 C 88 35 32 35 32 68 Z" fill={hairColor} />
          {ageStage !== 'young' && <path d="M 28 60 Q 32 50 35 60" stroke="#ccc" strokeWidth="2" fill="none" />}
          
          {eyes}
          {mouth}
        </g>
        
        {isMarried && (
          <circle cx="70" cy="140" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" className="drop-shadow-sm" />
        )}
      </svg>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function CourseCompletedModal({ data }) {
  const { dismissCourseCompletion } = useGameStore();

  if (!data) return null;

  const { courseName, skillBoost, newSkillLevel } = data;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      {...backdropFade}
    >
      <motion.div
        className="w-full max-w-md bg-white border-3 border-slate-900 shadow-[8px_8px_0px_#0f172a] p-5 sm:p-6 space-y-4 my-auto text-center"
        {...sheetSlideUp}
      >
        <div className="w-16 h-16 mx-auto bg-amber-400 border-2 border-slate-900 flex items-center justify-center text-3xl shadow-[3px_3px_0px_#0f172a]">
          🎓
        </div>

        <div className="space-y-1">
          <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-900 font-mono font-bold text-[9px] uppercase tracking-wider inline-block">
            Professional Certification Awarded
          </span>
          <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900">
            Course Completed!
          </h2>
          <p className="text-xs font-mono font-bold text-slate-700">
            {courseName}
          </p>
        </div>

        {/* Skill Rating Upgrade Card */}
        <div className="p-4 bg-slate-50 border-2 border-slate-900 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Permanent Skill Rating Upgrade
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-black text-emerald-700">
              +{skillBoost}
            </span>
            <span className="text-slate-400 font-black text-xl">➔</span>
            <div className="text-left font-mono">
              <div className="text-2xl font-black text-slate-900">
                {newSkillLevel?.toFixed(1)} <span className="text-xs font-normal text-slate-500">/ 5.0</span>
              </div>
              <div className="flex text-amber-500 text-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {newSkillLevel >= star ? '★' : newSkillLevel >= star - 0.5 ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 font-mono pt-1">
            Higher tier job openings with increased compensation are now unlocked on the Job Board!
          </p>
        </div>

        <button
          type="button"
          onClick={dismissCourseCompletion}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press"
        >
          Continue Career Journey ➔
        </button>
      </motion.div>
    </motion.div>
  );
}

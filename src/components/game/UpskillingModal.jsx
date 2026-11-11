import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../engine/store.js';
import { UPSKILLING_COURSES } from '../../engine/careerEngine.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function UpskillingModal({ onClose }) {
  const { character, enrollInCourse, dropActiveCourse } = useGameStore();
  const [selectedCourseId, setSelectedCourseId] = useState(character?.activeCourse?.courseId || null);
  const [showConfirmDrop, setShowConfirmDrop] = useState(false);

  if (!character) return null;

  const activeCourse = character.activeCourse;
  const currentSkill = character.skillLevel || 1.0;
  const surplus = character.monthlySurplus || 0;
  const liquidCash = character.liquidCash || 0;

  const handleEnroll = (courseId) => {
    const success = enrollInCourse(courseId);
    if (success) {
      setSelectedCourseId(courseId);
    }
  };

  const handleDrop = () => {
    dropActiveCourse();
    setShowConfirmDrop(false);
    setSelectedCourseId(null);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
      {...backdropFade}
    >
      <motion.div
        className="w-full max-w-2xl bg-white border-3 border-slate-900 shadow-[6px_6px_0px_#0f172a] p-4 sm:p-6 space-y-4 my-auto"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🎓</span>
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
                Upskilling & Certifications Hub
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 font-mono">
                Level up your skills to unlock senior positions & higher compensation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono font-black text-sm btn-press-sm"
          >
            ✕
          </button>
        </div>

        {/* Current Skill Gauge Card */}
        <div className="p-3.5 bg-slate-50 border-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Candidate Skill Rating
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-black text-slate-900">
                {currentSkill.toFixed(1)}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">/ 5.0</span>
              <div className="flex text-amber-500 text-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {currentSkill >= star ? '★' : currentSkill >= star - 0.5 ? '★' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-[11px]">
            <span className="text-slate-500 block uppercase text-[9px]">Monthly Surplus</span>
            <span className={`font-bold ${surplus >= 12000 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {formatINR(surplus)}/mo
            </span>
            <span className="text-slate-400 block text-[10px]">Bank: {formatINR(liquidCash)}</span>
          </div>
        </div>

        {/* Active Course Banner if enrolled */}
        {activeCourse && (
          <div className="p-3.5 bg-blue-50 border-2 border-blue-900 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-1.5 py-0.5 bg-blue-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider">
                  Active Enrollment
                </span>
                <h4 className="font-display font-black text-slate-900 text-sm pt-1">
                  {activeCourse.courseName}
                </h4>
                <div className="text-xs font-mono text-slate-600">
                  Month {activeCourse.monthsCompleted} of {activeCourse.totalDurationMonths} · Outflow:{' '}
                  <strong>{formatINR(activeCourse.monthlyFee)}/mo</strong>
                </div>
              </div>

              {!showConfirmDrop ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDrop(true)}
                  className="px-2.5 py-1 text-[10px] font-mono font-bold text-rose-700 border border-rose-700 hover:bg-rose-100 btn-press-sm self-start sm:self-auto"
                >
                  Drop Course
                </button>
              ) : (
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[10px] font-mono text-rose-800 font-bold">Forfeit progress?</span>
                  <button
                    type="button"
                    onClick={handleDrop}
                    className="px-2 py-0.5 bg-rose-600 text-white font-mono font-bold text-[10px] btn-press-sm"
                  >
                    Confirm Drop
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDrop(false)}
                    className="px-1.5 py-0.5 bg-slate-200 text-slate-800 font-mono text-[10px] btn-press-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-0.5 pt-1">
              <div className="w-full h-2.5 bg-white border border-blue-900 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (activeCourse.monthsCompleted / activeCourse.totalDurationMonths) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-blue-900 font-bold">
                <span>
                  {Math.round((activeCourse.monthsCompleted / activeCourse.totalDurationMonths) * 100)}% Complete
                </span>
                <span>+{activeCourse.skillBoostReward} Skill Boost upon completion</span>
              </div>
            </div>
          </div>
        )}

        {/* Course Catalog */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
            Available Programs
          </span>

          <div className="grid grid-cols-1 gap-2.5">
            {UPSKILLING_COURSES.map((course) => {
              const isCurrentlyEnrolled = activeCourse?.courseId === course.id;
              const hasOtherActive = activeCourse && !isCurrentlyEnrolled;
              const hasCompleted = character.completedCourses?.includes(course.id);
              const isAffordable = surplus >= course.monthlyFee;

              return (
                <div
                  key={course.id}
                  className={`p-3.5 border-2 transition-all ${
                    isCurrentlyEnrolled
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-900 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{course.icon}</span>
                        <h4 className="font-display font-black text-slate-900 text-sm">
                          {course.name}
                        </h4>
                        <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-900 font-mono text-[9px] font-bold text-slate-800">
                          {course.tierName}
                        </span>
                        {hasCompleted && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 border border-emerald-900 font-mono text-[9px] font-bold text-emerald-800">
                            ✓ Previously Completed
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-snug">
                        {course.description}
                      </p>

                      {/* Course Meta Tags */}
                      <div className="flex items-center gap-3 pt-1 text-[11px] font-mono font-bold text-slate-700 flex-wrap">
                        <span>Duration: <strong>{course.durationMonths} Months</strong></span>
                        <span>·</span>
                        <span>Fee: <strong>{formatINR(course.monthlyFee)}/mo</strong></span>
                        <span>·</span>
                        <span>Total: <strong>{formatINR(course.totalCost)}</strong></span>
                        <span>·</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1 border border-emerald-300">
                          +{course.skillBoostReward} Skill Boost
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-1 sm:pt-0">
                      {isCurrentlyEnrolled ? (
                        <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-mono font-bold tracking-wider uppercase border-2 border-slate-900">
                          Enrolled
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEnroll(course.id)}
                          disabled={hasOtherActive}
                          className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase btn-press border-2 border-slate-900 transition-all ${
                            hasOtherActive
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-400'
                              : isAffordable
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                              : 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                          }`}
                        >
                          {hasOtherActive ? 'Course in Progress' : 'Enroll Now'}
                        </button>
                      )}
                      {!isAffordable && !hasOtherActive && !isCurrentlyEnrolled && (
                        <span className="text-[9px] font-mono text-amber-700 font-bold">
                          ⚠️ Exceeds surplus
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-mono font-bold text-xs uppercase tracking-wider btn-press"
          >
            Done / Close Hub
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

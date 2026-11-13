import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '../../utils/format.js';
import ProgressRing from './ProgressRing.jsx';

export default function VoiceoverTourModal({ isOpen, onClose, character, simulation, goals, netWorth }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDrawerPreviewOpen, setIsDrawerPreviewOpen] = useState(false);
  const synthRef = useRef(null);

  const TOUR_STEPS = [
    {
      title: 'Top Command: Life & Net Worth',
      subtitle: 'Track your career journey and live financial standing at a glance.',
      script: 'Welcome to CashMeOut. In this top bar, your age, career timeline, and live Net Worth are always in sight—giving you clear, instant feedback on your financial health.',
      highlight: 'header',
      drawerOpen: false,
    },
    {
      title: 'Monthly Cashflow Pulse',
      subtitle: 'See exactly where your money goes every single month.',
      script: 'Here is your Monthly Pulse. Rather than cluttering the screen with endless numbers, you see your Take-Home pay, your fixed living costs, and the all-important monthly surplus that builds your wealth.',
      highlight: 'cashflow',
      drawerOpen: false,
    },
    {
      title: 'Active Goal Compounding Buckets',
      subtitle: 'Watch your money waterfall from emergency shield into major milestones.',
      script: 'Below are your active life priorities: your Emergency Shield, First Car, and Retirement. Completed goals automatically waterfall extra cash into your next dream.',
      highlight: 'goals',
      drawerOpen: false,
    },
    {
      title: 'The Clean Hamburger Menu (☰)',
      subtitle: 'All secondary actions and life hubs tucked away until you need them.',
      script: 'Notice how clean the main screen is. Whenever you want to enroll in an upskilling course, explore the job market, or launch a side hustle, simply open this Life Hub menu.',
      highlight: 'menu',
      drawerOpen: true,
    },
    {
      title: 'Thumb Zone Simulation Dock',
      subtitle: 'Play, pause, and control the speed of life with one thumb.',
      script: 'Right here in your thumb zone at the bottom, you can pause simulation time to make big decisions, or speed up time to watch compound interest do its magic.',
      highlight: 'dock',
      drawerOpen: false,
    },
  ];

  // Speech synthesis integration
  const speakStep = (stepIndex) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(TOUR_STEPS[stepIndex].script);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => {
      // Auto-advance if playing and not on last step
      if (isPlaying && stepIndex < TOUR_STEPS.length - 1) {
        setTimeout(() => {
          setCurrentStep((prev) => (prev < TOUR_STEPS.length - 1 ? prev + 1 : prev));
        }, 1200);
      } else if (stepIndex === TOUR_STEPS.length - 1) {
        setIsPlaying(false);
      }
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    setIsDrawerPreviewOpen(TOUR_STEPS[currentStep].drawerOpen);
    if (isPlaying) {
      speakStep(currentStep);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, currentStep, isPlaying, isMuted]);

  if (!isOpen) return null;

  const currentInfo = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden my-auto"
      >
        {/* Left Side: Mobile Phone Device Simulation Container */}
        <div className="flex-1 p-3 sm:p-5 flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b md:border-b-0 md:border-r border-slate-800">
          {/* Authentic Smartphone Bezel */}
          <div className="relative w-[285px] sm:w-[320px] h-[580px] bg-slate-950 rounded-[44px] p-2.5 shadow-[0_0_40px_rgba(37,99,235,0.25)] border-[4px] border-slate-700 flex flex-col overflow-hidden">
            
            {/* Dynamic Island / Speaker Notch */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-between px-3">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-950 border border-blue-600/50" />
            </div>

            {/* Mobile Screen Inside */}
            <div className="relative w-full h-full bg-[#f8fafc] rounded-[34px] overflow-hidden flex flex-col font-sans pt-6 text-slate-900 select-none">
              
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between px-4 py-1 text-[10px] font-mono font-bold text-slate-700 border-b border-slate-200">
                <span>9:41</span>
                <span className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100% 🔋</span>
                </span>
              </div>

              {/* Scrollable Mobile App Body */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 text-[11px] relative">
                
                {/* 1. Header Area */}
                <div
                  className={`p-2 bg-white border-2 border-slate-900 rounded-lg shadow-sm transition-all duration-300 ${
                    currentInfo.highlight === 'header'
                      ? 'ring-4 ring-blue-500 scale-[1.02] shadow-lg'
                      : 'opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                        {character?.age || 24}
                      </div>
                      <div>
                        <div className="font-display font-black text-xs leading-none">
                          Age {character?.age || 24}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">
                          Target Age 60
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="bg-slate-50 border border-slate-900 px-2 py-0.5 rounded text-right">
                        <span className="text-[7px] font-mono uppercase block text-slate-500">Net Worth</span>
                        <span className="font-mono font-black text-xs text-slate-900">
                          {formatINR(netWorth || 485000)}
                        </span>
                      </div>
                      
                      {/* Hamburger Button */}
                      <div
                        className={`w-7 h-7 flex items-center justify-center border-2 border-slate-900 font-black text-sm bg-amber-300 rounded cursor-pointer transition-all ${
                          currentInfo.highlight === 'menu' ? 'ring-4 ring-purple-500 animate-bounce' : ''
                        }`}
                      >
                        ☰
                      </div>
                    </div>
                  </div>

                  {/* Career Progress */}
                  <div className="mt-1.5">
                    <div className="w-full h-1.5 bg-slate-100 border border-slate-900 rounded-full overflow-hidden">
                      <div className="w-[35%] h-full bg-blue-600" />
                    </div>
                  </div>
                </div>

                {/* 2. Monthly Cashflow Pulse Card */}
                <div
                  className={`p-2.5 bg-white border-2 border-slate-900 rounded-lg space-y-1.5 transition-all duration-300 ${
                    currentInfo.highlight === 'cashflow'
                      ? 'ring-4 ring-emerald-500 scale-[1.02] shadow-lg bg-emerald-50/30'
                      : 'opacity-90'
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500 uppercase">
                    <span>⚡ Monthly Cashflow Pulse</span>
                    <span className="text-blue-600 underline">Ledger ℹ️</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                    <div className="bg-slate-50 p-1 border border-slate-200 rounded">
                      <span className="text-[8px] text-slate-500 block">Take-Home</span>
                      <strong className="text-emerald-700 font-bold">{formatINR(character?.monthlyTakeHome || 72000)}</strong>
                    </div>
                    <div className="bg-slate-50 p-1 border border-slate-200 rounded">
                      <span className="text-[8px] text-slate-500 block">Outflow</span>
                      <strong className="text-slate-800 font-bold">{formatINR(character?.totalMonthlyOutflow || 48000)}</strong>
                    </div>
                  </div>
                  <div className="bg-emerald-100 border border-emerald-900 p-1 rounded text-center">
                    <span className="text-[8px] font-mono font-bold uppercase text-emerald-950 block">Monthly Surplus to Goals</span>
                    <span className="font-mono font-black text-xs text-emerald-900">
                      +{formatINR((character?.monthlyTakeHome || 72000) - (character?.totalMonthlyOutflow || 48000))}/mo
                    </span>
                  </div>
                </div>

                {/* 3. Goals Section */}
                <div
                  className={`space-y-1.5 transition-all duration-300 ${
                    currentInfo.highlight === 'goals'
                      ? 'ring-4 ring-blue-500 p-1 rounded-lg bg-blue-50/40'
                      : 'opacity-90'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                    <span>🎯 Active Goals (3)</span>
                    <span className="text-blue-600 text-[9px]">Adjust SIPs ⚙️</span>
                  </div>

                  {/* Goal 1 */}
                  <div className="p-2 bg-white border border-slate-900 rounded shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🛡️</span>
                      <div>
                        <div className="font-bold text-[10px] leading-tight">Emergency Shield</div>
                        <div className="text-[8px] text-emerald-700 font-mono font-bold">100% Full · Cascading</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1 border border-emerald-900 rounded">
                      Safe
                    </span>
                  </div>

                  {/* Goal 2 */}
                  <div className="p-2 bg-white border border-slate-900 rounded shadow-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">🚗</span>
                        <div>
                          <div className="font-bold text-[10px] leading-tight">First Car</div>
                          <div className="text-[8px] text-slate-500 font-mono">₹4.8L / ₹6.5L</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-blue-700">74%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 border border-slate-900 rounded-full overflow-hidden">
                      <div className="w-[74%] h-full bg-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Simulated Drawer Slide-Over (When step 4 is active) */}
                <AnimatePresence>
                  {isDrawerPreviewOpen && (
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      className="absolute inset-y-0 right-0 w-[88%] bg-white border-l-2 border-slate-900 p-2.5 shadow-2xl z-20 space-y-2 flex flex-col text-[10px] font-mono"
                    >
                      <div className="flex items-center justify-between border-b border-slate-300 pb-1 font-bold">
                        <span>⚙️ LIFE DECISIONS HUB</span>
                        <span className="cursor-pointer text-xs font-black">✕</span>
                      </div>
                      <div className="space-y-1 text-slate-800">
                        <div className="p-1.5 bg-purple-50 border border-purple-900 rounded font-bold flex items-center justify-between">
                          <span>🎓 Upskill Hub</span>
                          <span className="text-[8px] bg-purple-200 px-1">Courses</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-900 rounded font-bold flex items-center justify-between">
                          <span>💼 Dynamic Job Market</span>
                          <span className="text-[8px] bg-emerald-200 text-emerald-950 px-1">+30% Pay</span>
                        </div>
                        <div className="p-1.5 bg-purple-50 border border-purple-900 rounded font-bold flex items-center justify-between">
                          <span>➕ New Side Hustle</span>
                          <span className="text-[8px] bg-purple-200 px-1">Ventures</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-900 rounded font-bold flex items-center justify-between">
                          <span>⚙️ Rebalance SIPs</span>
                          <span>➔</span>
                        </div>
                        <div className="p-1.5 bg-slate-50 border border-slate-900 rounded font-bold flex items-center justify-between">
                          <span>💳 Loan Prepayments</span>
                          <span>➔</span>
                        </div>
                        <div className="p-1.5 bg-blue-50 border border-blue-900 rounded font-bold flex items-center justify-between">
                          <span>✈️ Auto-Vacation</span>
                          <span className="text-[8px] bg-blue-600 text-white px-1">ON</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* 4. Bottom Floating Simulation Dock */}
              <div
                className={`p-2 bg-slate-900 text-white border-t-2 border-slate-900 flex items-center justify-between gap-1 transition-all duration-300 ${
                  currentInfo.highlight === 'dock'
                    ? 'ring-4 ring-amber-400 scale-[1.02]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-mono font-bold text-[9px] rounded">
                    ▶ PLAY
                  </div>
                  <div className="flex bg-slate-800 border border-slate-700 rounded text-[9px] font-mono px-1">
                    <span className="px-1 text-white font-bold">1x</span>
                    <span className="px-1 text-slate-400">2x</span>
                  </div>
                </div>
                <div className="text-[9px] font-mono text-slate-300">
                  Bank: <strong className="text-white">₹82,000</strong>
                </div>
              </div>

              {/* iPhone Home Indicator Line */}
              <div className="h-4 flex items-center justify-center bg-slate-900">
                <div className="w-24 h-1 bg-slate-600 rounded-full" />
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Narration Transcript & Tour Controller */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-4 text-white">
          <div className="space-y-4">
            
            {/* Header with Step Indicator */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 bg-blue-600 text-white font-mono font-bold text-[10px] rounded uppercase tracking-wider">
                  Mobile Screen Tour · Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
                <h3 className="font-display font-black text-lg sm:text-xl text-white pt-1">
                  {currentInfo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
                title="Close Walkthrough"
              >
                ✕
              </button>
            </div>

            {/* Audio Voiceover Subtitle Bubble */}
            <div className="p-4 bg-slate-950 border border-blue-900/60 rounded-xl space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-blue-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{isPlaying ? '🎙️ Speaking Narration...' : '⏸ Narration Paused'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {isMuted ? '🔇 Unmute Voice' : '🔊 Voice Enabled'}
                </button>
              </div>
              <p className="font-sans text-sm sm:text-base text-slate-200 leading-relaxed italic">
                "{currentInfo.script}"
              </p>
            </div>

            {/* Step Explanation Note */}
            <div className="text-xs font-mono text-slate-400 space-y-1 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
              <span className="text-slate-300 font-bold block uppercase text-[10px] tracking-wider">
                Why this reduces clutter:
              </span>
              <p className="leading-snug">{currentInfo.subtitle}</p>
            </div>

          </div>

          {/* Controller Navigation Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className={`px-4 py-2 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                <span>{isPlaying ? '⏸ Pause Voice' : '▶ Play Voice'}</span>
              </button>
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-mono text-xs rounded-lg font-bold"
              >
                ◀ Prev
              </button>
              <button
                type="button"
                disabled={currentStep === TOUR_STEPS.length - 1}
                onClick={() => setCurrentStep((s) => Math.min(TOUR_STEPS.length - 1, s + 1))}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-mono text-xs rounded-lg font-bold"
              >
                Next ▶
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-lg shadow-md transition-colors"
            >
              Done & Return to Game ➔
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

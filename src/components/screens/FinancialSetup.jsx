import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import useGameStore from '../../engine/store';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { formatCurrency } from '../../utils/format';

const INSTRUMENTS = [
  { key: 'equity', label: 'Equity', risk: 'High Risk', returnStr: '~15%/yr', r: 0.15/12 },
  { key: 'mf', label: 'Mutual Fund', risk: 'Med Risk', returnStr: '~12%/yr', r: 0.12/12 },
  { key: 'gold', label: 'Gold', risk: 'Med Risk', returnStr: '~8%/yr', r: 0.08/12 },
  { key: 'silver', label: 'Silver', risk: 'Med Risk', returnStr: '~8%/yr', r: 0.08/12 },
  { key: 'fd', label: 'Fixed Deposit', risk: 'Low Risk', returnStr: '~7%/yr', r: 0.07/12 },
  { key: 'savings', label: 'Savings', risk: 'Safe', returnStr: '~4%/yr', r: 0.04/12 },
];

function projectFutureValue(monthlyAmount, r, monthsToGoal) {
  if (r === 0) return monthlyAmount * monthsToGoal;
  return monthlyAmount * ((Math.pow(1 + r, monthsToGoal) - 1) / r);
}

const FinancialSetup = () => {
  const store = useGameStore();
  const player = store.player;
  const setScreen = store.setScreen;
  const setGoalMonthlyAllocation = store.setGoalMonthlyAllocation;
  const setGoalInstrument = store.setGoalInstrument;

  const goals = store.goals || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skippedGoals, setSkippedGoals] = useState(new Set());

  // Income / Deductions
  const totalIncome = (store.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0) + (store.businessIncome || 0);
  const totalDeductions = (store.fixedDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0) +
    (store.loans?.reduce((sum, l) => sum + l.emi, 0) || 0) +
    (store.hasHealthInsurance ? store.healthInsuranceCost : 0) +
    (store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0) +
    (store.homeMaintenanceCost || 0) +
    (store.carMaintenanceCost || 0);
  
  const monthlySurplus = Math.max(0, totalIncome - totalDeductions) || 50000; // fallback if data missing

  const totalAllocated = useMemo(() => {
    return goals.reduce((sum, g) => {
      if (skippedGoals.has(g.id)) return sum;
      return sum + (store.goalMonthlyAllocations[g.id] || 0);
    }, 0);
  }, [goals, skippedGoals, store.goalMonthlyAllocations]);

  const remainingSurplus = monthlySurplus - totalAllocated;

  const currentGoal = goals[currentIndex];

  const handleNext = () => {
    if (currentIndex < goals.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSkip = () => {
    setGoalMonthlyAllocation(currentGoal.id, 0);
    setSkippedGoals(new Set([...skippedGoals, currentGoal.id]));
    handleNext();
  };

  const handleStartGame = () => {
    setScreen('game');
  };

  const setAllocation = (amount) => {
    const prevAlloc = store.goalMonthlyAllocations[currentGoal.id] || 0;
    const maxAllowed = remainingSurplus + prevAlloc;
    const finalAmount = Math.min(amount, maxAllowed);
    setGoalMonthlyAllocation(currentGoal.id, finalAmount);
    
    if (skippedGoals.has(currentGoal.id)) {
      const newSkipped = new Set(skippedGoals);
      newSkipped.delete(currentGoal.id);
      setSkippedGoals(newSkipped);
    }
  };

  const handlePreset = (addAmount) => {
    const current = store.goalMonthlyAllocations[currentGoal.id] || 0;
    setAllocation(current + addAmount);
  };

  if (!currentGoal) return null;

  const targetAge = currentGoal.targetAge || 30;
  const currentAge = player?.characterAge || 22;
  const yearsAway = Math.max(1, targetAge - currentAge);
  const monthsAway = yearsAway * 12;

  const currentAlloc = store.goalMonthlyAllocations[currentGoal.id] || 0;
  const currentInstKey = store.goalInstruments[currentGoal.id] || 'mf';
  const currentInst = INSTRUMENTS.find(i => i.key === currentInstKey) || INSTRUMENTS[1];

  const fv = projectFutureValue(currentAlloc, currentInst.r, monthsAway);
  
  // Projection Chart Data
  const chartData = useMemo(() => {
    const data = [];
    const steps = Math.max(1, Math.floor(monthsAway / 12));
    for (let m = 0; m <= monthsAway; m += steps) {
      data.push({
        month: m,
        value: Math.round(projectFutureValue(currentAlloc, currentInst.r, m)),
        target: currentGoal.currentTarget
      });
    }
    // ensure last point
    if (data[data.length - 1].month !== monthsAway) {
      data.push({
        month: monthsAway,
        value: Math.round(projectFutureValue(currentAlloc, currentInst.r, monthsAway)),
        target: currentGoal.currentTarget
      });
    }
    return data;
  }, [monthsAway, currentAlloc, currentInst.r, currentGoal.currentTarget]);

  const isSuccess = fv >= currentGoal.currentTarget;
  const isBorderline = fv >= currentGoal.currentTarget * 0.8 && !isSuccess;
  const chartColor = isSuccess ? '#10b981' : isBorderline ? '#f59e0b' : '#ef4444';

  let signalColor, signalText;
  if (isSuccess) {
    signalColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    signalText = `🟢 On Track — projected ${formatCurrency(fv)} vs target ${formatCurrency(currentGoal.currentTarget)}`;
  } else if (isBorderline) {
    signalColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    signalText = `🟡 Borderline — ${formatCurrency(currentGoal.currentTarget - fv)} short of target`;
  } else {
    signalColor = 'bg-red-500/20 text-red-400 border-red-500/30';
    signalText = `🔴 Behind — increase allocation or change instrument`;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Persistent Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800 z-50 p-4 pt-6 shadow-xl">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Surplus</span>
              <span className="text-xl font-black text-white">{formatCurrency(monthlySurplus)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Allocated</span>
              <span className={`text-sm font-black ${remainingSurplus < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatCurrency(totalAllocated)} / {formatCurrency(monthlySurplus)}
              </span>
            </div>
          </div>
          <ProgressBar 
            value={Math.min(100, (totalAllocated / monthlySurplus) * 100)} 
            color={remainingSurplus < 0 ? 'bg-red-500' : 'bg-emerald-500'} 
            className="h-2 bg-slate-800"
          />
          
          <div className="flex justify-center items-center mt-3 gap-1.5">
            {goals.map((g, idx) => (
              <div 
                key={g.id} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-6 bg-blue-500' : 
                  skippedGoals.has(g.id) ? 'w-2 bg-slate-700' :
                  (store.goalMonthlyAllocations[g.id] > 0) ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Allocation Area */}
      <div className="flex-1 overflow-x-hidden pt-28 pb-32">
        <div className="max-w-md mx-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentGoal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{currentGoal.name.split(' ')[0]}</span>
                    <h2 className="text-lg font-bold text-white">{currentGoal.name.substring(currentGoal.name.indexOf(' ') + 1)}</h2>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentGoal.tagColor || 'bg-slate-800 text-slate-300'}`}>
                    {currentGoal.tag || 'Goal'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">Target Amount</span>
                  <span className="text-lg font-black text-white">{formatCurrency(currentGoal.currentTarget)}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                    By age {targetAge} ({monthsAway} months)
                  </span>
                </div>
              </div>

              {/* Monthly Allocation Input */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Monthly Allocation</label>
                <div className="relative mb-3">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">₹</span>
                  <input 
                    type="number"
                    value={currentAlloc || ''}
                    onChange={(e) => setAllocation(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-xl font-black text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  {[500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handlePreset(amt)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                {remainingSurplus < 0 && (
                  <p className="text-[10px] font-bold text-red-400 mt-2">
                    ⚠️ Allocation exceeds monthly surplus! Decrease amount.
                  </p>
                )}
              </div>

              {/* Instrument Selector */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Investment Instrument</label>
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-1 px-1">
                  {INSTRUMENTS.map(inst => (
                    <button
                      key={inst.key}
                      onClick={() => setGoalInstrument(currentGoal.id, inst.key)}
                      className={`flex-shrink-0 flex flex-col items-start p-3 rounded-xl border transition-all min-w-[120px] ${
                        currentInstKey === inst.key 
                          ? 'bg-blue-500/10 border-blue-500 shadow-inner' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`text-sm font-bold ${currentInstKey === inst.key ? 'text-blue-400' : 'text-slate-300'}`}>
                        {inst.label}
                      </span>
                      <span className={`text-[10px] font-medium mt-1 ${currentInstKey === inst.key ? 'text-blue-300' : 'text-slate-500'}`}>
                        {inst.returnStr}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold mt-2">
                        {inst.risk}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Projection Chart */}
              <div className="mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Projection</h4>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" hide />
                      <YAxis hide domain={[0, Math.max(currentGoal.currentTarget * 1.2, fv)]} />
                      <ReferenceLine y={currentGoal.currentTarget} stroke="#64748b" strokeDasharray="3 3" />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={chartColor} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Feasibility Signal */}
              <div className={`p-3 rounded-xl border ${signalColor} transition-colors`}>
                <span className="text-xs font-bold block">{signalText}</span>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <button 
              onClick={handleSkip}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
            >
              Skip Goal
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentIndex === goals.length - 1}
              className="px-4 py-2 text-sm font-bold text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Start Game Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-50">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-400">
              {goals.length - skippedGoals.size} Planned · {skippedGoals.size} Skipped
            </span>
            {remainingSurplus > 0 && (
              <span className="text-xs font-bold text-emerald-500">
                + {formatCurrency(remainingSurplus)} Cash Buffer
              </span>
            )}
          </div>
          <Button
            fullWidth
            size="lg"
            className="rounded-xl shadow-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-4 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
            onClick={handleStartGame}
          >
            Start Life Simulation 🚀
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default FinancialSetup;

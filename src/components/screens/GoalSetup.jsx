import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../engine/store';
import { createGoal } from '../../engine/goals';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const GoalSetup = () => {
  const store = useGameStore();
  const player = store.player;
  const setGoalsAction = store.setGoals;
  const setScreen = store.setScreen;

  const cityTier = player?.cityTier || 2;
  
  // Calculate expenses for rules
  const totalExpenses = (store.fixedDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0) +
    (store.loans?.reduce((sum, l) => sum + l.emi, 0) || 0) +
    (store.hasHealthInsurance ? store.healthInsuranceCost : 0) +
    (store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0) +
    (store.homeMaintenanceCost || 0) +
    (store.carMaintenanceCost || 0);

  const baseExpenses = totalExpenses || (player?.startingSalary * 0.5) || 20000;
  
  const emergencyFund = baseExpenses * 6;
  const retirementCorpus = baseExpenses * 12 * 25;
  const currentAge = player?.characterAge || 22;

  const initialGoalsData = [
    {
      id: 'g1',
      type: 'emergency',
      name: 'Emergency Fund',
      icon: '🛡️',
      tag: 'Mandatory',
      tagColor: 'text-red-600 bg-red-100',
      amount: emergencyFund,
      targetAge: currentAge + 1,
      desc: 'Always needed. 6 months of living expenses.',
      status: 'Needs Planning'
    },
    {
      id: 'g2',
      type: 'marriage',
      name: 'Marriage',
      icon: '💍',
      tag: 'Desired',
      tagColor: 'text-emerald-700 bg-emerald-100',
      amount: cityTier === 1 ? 1750000 : cityTier === 2 ? 1000000 : 650000,
      targetAge: player?.marriageAge || 28,
      desc: 'Wedding expenses and celebrations.',
      status: 'Needs Planning'
    },
    {
      id: 'g3',
      type: 'home',
      name: 'Buy a Home',
      icon: '🏠',
      tag: 'Desired',
      tagColor: 'text-emerald-700 bg-emerald-100',
      amount: cityTier === 1 ? 2000000 : cityTier === 2 ? 1150000 : 600000,
      targetAge: 31,
      desc: '20% downpayment for your dream house.',
      status: 'Needs Planning'
    },
    {
      id: 'g4',
      type: 'car',
      name: 'Get a Car',
      icon: '🚗',
      tag: 'Desired',
      tagColor: 'text-emerald-700 bg-emerald-100',
      amount: cityTier === 1 ? 1000000 : cityTier === 2 ? 650000 : 400000,
      targetAge: 27,
      desc: 'A personal vehicle for commute.',
      status: 'Needs Planning'
    },
    {
      id: 'g5',
      type: 'vacation',
      name: 'Annual Vacation',
      icon: '✈️',
      tag: 'Recurring',
      tagColor: 'text-blue-700 bg-blue-100',
      amount: cityTier === 1 ? 300000 : cityTier === 2 ? 150000 : 75000,
      targetAge: currentAge + 1,
      desc: 'Every year travel budget.',
      status: 'Needs Planning'
    },
    {
      id: 'g6',
      type: 'business',
      name: 'Start a Business',
      icon: '💼',
      tag: 'Desired',
      tagColor: 'text-emerald-700 bg-emerald-100',
      amount: cityTier === 1 ? 1500000 : cityTier === 2 ? 850000 : 400000,
      targetAge: 33,
      desc: 'Seed capital for your venture.',
      status: 'Needs Planning'
    },
    {
      id: 'g7',
      type: 'education',
      name: "Kids' Education",
      icon: '👶',
      tag: 'Unlocks after marriage',
      tagColor: 'text-amber-700 bg-amber-100',
      amount: cityTier === 1 ? 5000000 : cityTier === 2 ? 3500000 : 2500000,
      targetAge: 40,
      desc: 'Higher education fund for children.',
      status: 'Needs Planning'
    },
    {
      id: 'g8',
      type: 'retirement',
      name: 'Retirement Fund',
      icon: '🏖️',
      tag: 'Mandatory',
      tagColor: 'text-red-600 bg-red-100',
      amount: retirementCorpus,
      targetAge: store.retirementAge || 50,
      desc: '4% rule corpus for financial independence.',
      status: 'Needs Planning'
    }
  ];

  const handleContinue = () => {
    const finalGoals = initialGoalsData.map(g => {
      const newGoal = createGoal(g.type, `${g.icon} ${g.name}`, g.amount, 0.06, 0, false, false);
      return { 
        ...newGoal, 
        targetAge: g.targetAge, 
        tag: g.tag, 
        tagColor: g.tagColor, 
        desc: g.desc, 
        recurring: g.tag === 'Recurring' 
      };
    });
    setGoalsAction(finalGoals);
    setScreen('financialSetup');
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-32 text-slate-100">
      <div className="max-w-md w-full mx-auto mt-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-white mb-1">
            Your Client's Life Goals
          </h2>
          <p className="text-sm text-emerald-400 font-medium">
            {player?.characterName || 'Player'}'s dreams, your plan
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Auto-Generated Roadmap
          </span>
          <span className="text-xs font-bold text-slate-900 bg-slate-200 px-2 py-1 rounded-full">
            {initialGoalsData.length} Goals
          </span>
        </div>

        {/* Goal Cards */}
        <div className="space-y-4 mb-8">
          {initialGoalsData.map((goal) => (
            <div key={goal.id} className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg text-white">{goal.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${goal.tagColor}`}>
                      {goal.tag}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-black text-white">
                    {formatCurrency(goal.amount)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                    By age {goal.targetAge} (~{goal.targetAge > currentAge ? goal.targetAge - currentAge : 1} yrs)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{goal.desc}</p>
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  {goal.status}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Target Locked
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="text-left">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <span className="block text-sm font-black text-white">{initialGoalsData.length} Goals to Plan</span>
          </div>
          <Button
            size="lg"
            className="rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white px-6"
            onClick={handleContinue}
          >
            Continue to Financial Planning →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalSetup;

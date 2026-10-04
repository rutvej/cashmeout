import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../engine/store';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatCurrencyFull = formatCurrency;

const SpawnReveal = () => {
  const player = useGameStore(state => state.player);
  const setScreen = useGameStore(state => state.setScreen);

  // Example fallback data in case player isn't loaded properly
  const p = player || {
    characterName: 'Rahul Sharma',
    characterAge: 22,
    cityTier: 1,
    incomeSource: 'job',
    jobTitle: 'Junior Developer',
    difficultyRating: 3,
    startingSalary: 45000,
    sideBusinessIncome: 0,
    sideBusinessName: '',
    rentalIncome: 0,
    rentCost: 15000,
    homeOwned: false,
    homeMaintenanceCost: 0,
    livingCost: 12000,
    existingLoan: null,
    existingDebt: null,
    dependantCost: 0,
    dependantReason: '',
    dreams: ['🏠 Own a home', '🚗 Buy a car', '✈️ Travel abroad']
  };

  const incomeSourcesLabels = {
    job: 'Salaried Job',
    family_business: 'Family Business',
    passive_income: 'Passive Income',
    fresh_start: 'Fresh Start'
  };

  const cityNames = {
    1: 'Tier 1 City (Metro)',
    2: 'Tier 2 City (Growing)',
    3: 'Tier 3 City (Small)'
  };

  // Calculations
  const totalIncome = (p.startingSalary || 0) + (p.sideBusinessIncome || 0) + (p.rentalIncome || 0);
  
  let housingCost = p.homeOwned ? (p.homeMaintenanceCost || 0) : (p.rentCost || 0);
  let loanEmi = p.existingLoan?.emi || 0;
  let debtEmi = p.existingDebt?.emi || 0; // fallback if needed
  let dependantCost = p.dependantCost || 0;
  
  const totalExpenses = housingCost + (p.livingCost || 0) + loanEmi + debtEmi + dependantCost;
  const netSurplus = totalIncome - totalExpenses;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 p-4 pb-32 font-sans selection:bg-emerald-500/30">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto mt-4 space-y-5"
      >
        {/* Section 1: Character Identity Card */}
        <motion.div variants={itemVariants} className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-6 overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">👤</div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30">
              Age {p.characterAge || 22}
            </span>
            <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30">
              {incomeSourcesLabels[p.incomeSource] || 'Salaried'}
            </span>
          </div>
          <h1 className="text-3xl font-black mb-1">{p.characterName || 'Player'}</h1>
          <p className="text-sm text-gray-300 font-medium mb-4">
            {p.jobTitle || 'Professional'} in {cityNames[p.cityTier] || 'City'}
          </p>
          
          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-gray-400 font-bold uppercase">Difficulty</span>
            <div className="flex gap-1 text-sm">
              {[1,2,3,4,5].map(star => (
                <span key={star} className={star <= (p.difficultyRating || 3) ? 'text-amber-400' : 'text-gray-700 opacity-50'}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section 2: Income Breakdown */}
        <motion.div variants={itemVariants} className="bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-5 backdrop-blur-sm">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>💵</span> Income Sources
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-300">Base Salary</span>
              <span className="text-lg font-bold text-white">{formatCurrency(p.startingSalary || 0)}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
            </div>
            {p.sideBusinessIncome > 0 && (
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-300">Side Income ({p.sideBusinessName})</span>
                <span className="text-lg font-bold text-emerald-300">+{formatCurrency(p.sideBusinessIncome)}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
              </div>
            )}
            {p.rentalIncome > 0 && (
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-300">Rental Income</span>
                <span className="text-lg font-bold text-emerald-300">+{formatCurrency(p.rentalIncome)}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
              </div>
            )}
            <div className="pt-3 border-t border-emerald-500/20 flex justify-between items-end">
              <span className="text-sm font-bold text-emerald-500">Total Monthly Income</span>
              <span className="text-xl font-black text-white">{formatCurrency(totalIncome)}</span>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Expenses & Liabilities */}
        <motion.div variants={itemVariants} className="bg-amber-950/30 border border-amber-500/30 rounded-3xl p-5 backdrop-blur-sm">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📉</span> Fixed Expenses
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-300">{p.homeOwned ? 'Home Maintenance' : 'House Rent'}</span>
              <span className="text-lg font-bold text-white">{formatCurrency(housingCost)}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-300">Living Expenses</span>
              <span className="text-lg font-bold text-white">{formatCurrency(p.livingCost || 0)}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
            </div>
            {loanEmi > 0 && (
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-300">Loan EMI ({p.existingLoan?.type || 'Personal'})</span>
                <span className="text-lg font-bold text-amber-300">{formatCurrency(loanEmi)}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
              </div>
            )}
            {dependantCost > 0 && (
              <div className="flex justify-between items-end">
                <span className="text-sm text-gray-300">Dependant ({p.dependantReason || 'Family'})</span>
                <span className="text-lg font-bold text-amber-300">{formatCurrency(dependantCost)}<span className="text-xs text-gray-500 font-normal">/mo</span></span>
              </div>
            )}
            <div className="pt-3 border-t border-amber-500/20 flex justify-between items-end">
              <span className="text-sm font-bold text-amber-500">Total Monthly Expenses</span>
              <span className="text-xl font-black text-white">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Net Surplus */}
        <motion.div variants={itemVariants} className={`border rounded-3xl p-6 backdrop-blur-sm text-center ${netSurplus >= 0 ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
          <p className="text-sm text-gray-300 mb-1">Monthly Surplus</p>
          <div className={`text-4xl font-black mb-2 ${netSurplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netSurplus >= 0 ? '+' : ''}{formatCurrency(netSurplus)}
          </div>
          <p className="text-xs text-gray-400 font-medium">This is what you have to work with each month.</p>
        </motion.div>

        {/* Section 5: Dreams */}
        <motion.div variants={itemVariants} className="bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-5 backdrop-blur-sm">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>✨</span> Character's Dreams
          </h2>
          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            As their financial advisor, you'll guide them through the next decades of their life to achieve their goals.
          </p>
          <div className="flex flex-wrap gap-2">
            {(p.dreams || ['🏠 Own home', '💍 Wedding', '🚗 Car', '✈️ Travel', '👶 Kids']).map((dream, i) => (
              <span key={i} className="text-xs font-medium bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-500/30">
                {dream}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <p className="text-xs text-gray-500">Playing till retirement at age {useGameStore.getState().retirementAge || 50}</p>
          <p className="text-xs text-gray-500">Journey: {(useGameStore.getState().retirementAge || 50) - (p.characterAge || 22)} years</p>
        </motion.div>
      </motion.div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0e1a]/90 backdrop-blur-md border-t border-white/10 z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setScreen('goalSetup')}
            className="w-full py-4 rounded-2xl font-black text-lg bg-emerald-500 text-[#0a0e1a] hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300"
          >
            Accept this Client →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpawnReveal;

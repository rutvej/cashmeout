import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../engine/store';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrency, formatCurrencyFull } from '../../utils/format';

const CITY_NAMES = { 1: 'Tier 1 (Mumbai / Delhi / Bangalore)', 2: 'Tier 2', 3: 'Tier 3' };
const INCOME_LABELS = {
  job: 'Salaried Job',
  family_business: 'Family Business',
  passive_income: 'Passive Income + Side Work',
  fresh_start: 'Fresh Start — Just Got a Job',
};

const StatCard = ({ icon, label, value, detail, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
  >
    <Card className="flex items-center justify-between py-3 px-4 mb-3">
      <div className="flex items-center min-w-0">
        <span className="text-2xl mr-3 shrink-0">{icon}</span>
        <span className="text-sm font-medium text-text-muted truncate">{label}</span>
      </div>
      <div className="text-right shrink-0 ml-3">
        <span className="font-semibold text-text-primary">{value}</span>
        {detail && <p className="text-xs text-text-muted">{detail}</p>}
      </div>
    </Card>
  </motion.div>
);

const SpawnReveal = () => {
  const player = useGameStore(state => state.player);
  const loans = useGameStore(state => state.loans);
  const setScreen = useGameStore(state => state.setScreen);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!player) return null;

  const stats = [
    { icon: '🏙️', label: 'City', value: CITY_NAMES[player.cityTier] || `Tier ${player.cityTier}` },
    { icon: '💼', label: 'Income Source', value: INCOME_LABELS[player.incomeSource] || player.incomeSource },
    { icon: '💵', label: 'Starting Salary', value: `${formatCurrency(player.startingSalary)}/mo` },
    { icon: '🏦', label: 'Starting Savings', value: formatCurrency(player.startingSavings) },
  ];

  // Conditionally add loan/debt cards
  if (player.existingLoan) {
    stats.push({
      icon: '💳',
      label: `${player.existingLoan.type === 'education' ? 'Education' : 'Personal'} Loan`,
      value: `${formatCurrency(player.existingLoan.principal)}`,
      detail: `EMI: ${formatCurrencyFull(player.existingLoan.emi)}/mo`,
    });
  }
  if (player.existingDebt) {
    stats.push({
      icon: '📉',
      label: 'Informal Debt',
      value: formatCurrency(player.existingDebt.amount),
      detail: player.existingDebt.description,
    });
  }

  stats.push(
    {
      icon: '🏠',
      label: player.homeOwned ? 'Home Ownership' : 'Housing Status',
      value: player.homeOwned ? 'Owned Primary Home' : `Renting (Tier ${player.cityTier})`,
      detail: player.homeOwned
        ? (player.homeCondition || `Maintenance liability: ${formatCurrencyFull(player.homeMaintenanceCost)}/mo`)
        : `House Rent: ${formatCurrencyFull(player.rentCost)}/mo`,
    },
    { icon: '🚗', label: 'Car', value: player.carOwned ? 'Owned' : 'None', detail: player.carOwned ? `Maintenance: ${formatCurrencyFull(player.carMaintenanceCost)}/mo` : null },
    { icon: '🏪', label: 'Food & Utilities', value: `${formatCurrency(player.livingCost)}/mo` },
  );

  return (
    <div className="min-h-screen bg-surface-bg p-4 flex flex-col pb-24">
      <div className="max-w-md w-full mx-auto mt-6">
        <div className="text-center mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-action-dark bg-blue-50 px-3 py-1 rounded-full inline-block mb-1.5">
            Character Profile · {player.characterName || 'Rahul Sharma'} (Age {player.characterAge || 22})
          </span>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black text-text-primary"
          >
            Your Starting Hand
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-xs mt-1"
          >
            Review your financial cards before setting up your 20-year plan.
          </motion.p>
        </div>

        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={0.2 + i * 0.18} />
        ))}

        {/* Difficulty rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + stats.length * 0.18 }}
          className="text-center mt-4 mb-8"
        >
          <span className="text-xs text-text-muted block mb-1">Difficulty</span>
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-lg">
                {i < player.difficultyRating ? '🔥' : '⚪'}
              </span>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-1">
            {player.difficultyRating <= 2 ? 'Comfortable start' : player.difficultyRating <= 3 ? 'Average challenge' : 'Tough road ahead'}
          </p>
        </motion.div>
      </div>

      {/* Sticky CTA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 50 }}
        transition={{ duration: 0.4 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-20"
      >
        <div className="max-w-md mx-auto">
          <Button fullWidth onClick={() => setScreen('setup')}>
            Step into Financial Planning (Setup Phase) →
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SpawnReveal;

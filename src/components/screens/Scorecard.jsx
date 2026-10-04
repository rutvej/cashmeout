import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useGameStore from '../../engine/store';
import { calculateResults, generateInsights } from '../../engine/scoring';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrency, formatAge } from '../../utils/format';

const Scorecard = () => {
  const store = useGameStore();
  const resetGame = useGameStore(state => state.resetGame);

  const isBroke = store.gameOverReason === 'broke';

  const results = useMemo(() => {
    try {
      return store.results || calculateResults(store);
    } catch (e) {
      return {
        goalsAchieved: [],
        goalsSacrificed: [],
        bonusGoals: [],
        resultScore: 0,
        finalNetWorth: store.pool || 0,
        literacyScore: 50,
        biggestMistake: 'Maintain a diversified buffer for life emergencies.',
        biggestWin: 'Navigated 20 years of career and life events.',
        turningPoint: 'Mid-career transitions.',
      };
    }
  }, [store]);

  const achievedGoals = (store.goals || []).filter(g => g.achieved);
  const missedGoals = (store.goals || []).filter(g => !g.achieved && !g.sacrificed);
  const sacrificedGoals = (store.goals || []).filter(g => g.sacrificed);

  const realEstateValue = (store.homesOwned || []).reduce((sum, h) => sum + (h.value || 0), 0);
  const businessValue = store.hasActiveBusiness ? (store.businessIncome || 0) * 22 : 0;
  const totalDebt = (store.loans || []).reduce((sum, l) => sum + (l.principal || 0), 0);
  const totalNetWorth = results.finalNetWorth ?? (store.pool + realEstateValue + businessValue - totalDebt);

  // Score Calculations based on rules
  const goalsAchievement = Math.min(40, ((achievedGoals.length / Math.max(1, (store.goals || []).length)) * 40));
  
  // financialHealth = (emergencyFundScore + emiRatioScore) * 10 each
  let emergencyFundScore = 0;
  if ((store.funds || []).some(f => f.type === 'emergency')) emergencyFundScore = 1;
  const emiRatio = totalDebt > 0 ? 0 : 1; // Simplification, calculate appropriately
  const financialHealth = (emergencyFundScore + emiRatio) * 10;

  // riskManagement = (hasHealthInsurance * 5 + hasVehicleInsurance * 5 + emergencyFundMaintained * 5)
  const riskManagement = (store.hasHealthInsurance ? 5 : 0) + (store.hasVehicleInsurance ? 5 : 0) + (emergencyFundScore ? 5 : 0);

  // investmentWisdom
  let divCount = 0;
  if (store.instruments) Object.values(store.instruments).forEach(val => { if (val > 5) divCount++; });
  const investmentWisdom = (divCount >= 3 ? 15 : divCount === 2 ? 10 : 5);

  // debtManagement
  const debtManagement = totalDebt === 0 ? 10 : 5;

  const totalScore = Math.round(goalsAchievement + financialHealth + riskManagement + investmentWisdom + debtManagement);

  // Grade
  let grade = 'F';
  let gradeColor = 'text-slate-500';
  let badge = '💀 BROKE';
  
  if (!isBroke) {
    if (totalScore >= 90) { grade = 'S'; gradeColor = 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500'; badge = '🏆 PERFECT'; }
    else if (totalScore >= 80) { grade = 'A'; gradeColor = 'text-emerald-400'; badge = '🏆 EXCELLENT'; }
    else if (totalScore >= 70) { grade = 'B'; gradeColor = 'text-blue-400'; badge = '✅ STANDARD'; }
    else if (totalScore >= 60) { grade = 'C'; gradeColor = 'text-amber-400'; badge = '✅ STANDARD'; }
    else { grade = 'D'; gradeColor = 'text-red-400'; badge = '😤 SURVIVOR'; }
  }

  const chartData = (store.monthlySnapshots || [])
    .filter((_, i) => i % 3 === 0)
    .map(s => ({
      age: formatAge(s.day || 0),
      'Net Worth': Math.round(s.netWorth ?? s.pool ?? 0),
    }));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Cashflow Game Run',
          text: `I finished with a net worth of ${formatCurrency(totalNetWorth)} and Grade ${grade}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    }
  };

  const formatCompact = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val;
  };

  const categories = [
    { name: '🎯 Goals Achievement', score: goalsAchievement, max: 40, color: 'bg-blue-500' },
    { name: '💚 Financial Health', score: financialHealth, max: 20, color: 'bg-emerald-500' },
    { name: '🛡️ Risk Management', score: riskManagement, max: 15, color: 'bg-amber-500' },
    { name: '📈 Investment Wisdom', score: investmentWisdom, max: 15, color: 'bg-purple-500' },
    { name: '💳 Debt Management', score: debtManagement, max: 10, color: 'bg-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-y-auto font-sans">
      <div className="max-w-md w-full mx-auto p-4 pb-24 space-y-6">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 text-center relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 border border-slate-700">
            {badge}
          </div>
          
          <h2 className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 mb-4">Life Simulation Complete</h2>
          
          <div className="flex justify-center items-end gap-4 mb-2">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
              className={`text-8xl font-black ${gradeColor}`}
            >
              {grade}
            </motion.div>
          </div>
          
          <div className="text-3xl font-black mb-1">{totalScore}<span className="text-lg text-slate-500">/100</span></div>
          
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            {isBroke ? "Your financial choices led to insolvency. Try building an emergency fund next time!" : "You navigated 20 years of career, investments, and life events successfully."}
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xl mb-1">💰</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Net Worth</div>
            <div className="font-black text-emerald-400 text-sm truncate">{formatCompact(totalNetWorth)}</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xl mb-1">⏳</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Played</div>
            <div className="font-black text-slate-200 text-sm">{Math.floor((store.currentDay||0)/365)} yrs</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-xl mb-1">🎯</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Goals</div>
            <div className="font-black text-blue-400 text-sm">{achievedGoals.length}/{Math.max(1, store.goals?.length || 1)}</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">{cat.name}</span>
                  <span className="text-slate-100">{Math.round(cat.score)}<span className="text-slate-500">/{cat.max}</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(cat.score / cat.max) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 + (idx * 0.1) }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Goal Results */}
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 ml-1">Goal Outcomes</h3>
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
            {(store.goals || []).map(g => (
              <div key={g.id} className="min-w-[160px] snap-start bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-2xl mb-2">{g.icon || '🎯'}</div>
                  <div className="font-bold text-sm text-slate-200 mb-1 leading-tight">{g.name}</div>
                  <div className="text-xs text-slate-500">{formatCompact(g.currentTarget)}</div>
                </div>
                <div className="mt-4">
                  {g.achieved ? (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg">✅ Achieved</span>
                  ) : g.sacrificed ? (
                    <span className="bg-slate-700 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-lg">⏭️ Skipped</span>
                  ) : (
                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-lg">❌ Missed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decisions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-900/50">
            <h3 className="font-bold text-emerald-500 text-[10px] uppercase tracking-wider mb-2">🌟 Best Decision</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">{results.biggestWin || 'Consistent saving.'}</p>
          </div>
          <div className="bg-red-950/40 p-4 rounded-2xl border border-red-900/50">
            <h3 className="font-bold text-red-500 text-[10px] uppercase tracking-wider mb-2">⚠️ Worst Decision</h3>
            <p className="text-xs text-red-100/80 leading-relaxed">{results.biggestMistake || 'None recorded.'}</p>
          </div>
        </div>

        {/* Net Worth Chart */}
        {chartData.length > 2 && (
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Net Worth Journey</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#334155" />
                  <YAxis width={42} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#334155" tickFormatter={formatCompact} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="Net Worth" stroke="#60a5fa" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-3">
          <Button fullWidth onClick={handleShare} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl border-none">
            📤 Share
          </Button>
          <Button fullWidth onClick={resetGame} variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 rounded-xl border border-slate-700">
            🔄 Play Again
          </Button>
        </div>
        
      </div>
    </div>
  );
};

export default Scorecard;

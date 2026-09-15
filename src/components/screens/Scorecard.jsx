import React, { useMemo, useState } from 'react';
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
  const [copied, setCopied] = useState(false);

  const isBroke = store.gameOverReason === 'broke';

  const results = useMemo(() => calculateResults(store), [store.goals, store.pool]);
  const insights = useMemo(() => generateInsights(store), [store]);

  const achievedGoals = store.goals.filter(g => g.achieved);
  const sacrificedGoals = store.goals.filter(g => g.sacrificed);
  const bonusGoals = achievedGoals.filter(g => g.bonus);

  const resultScore = achievedGoals.length - sacrificedGoals.length + bonusGoals.length;

  // Prepare chart data
  const chartData = (store.monthlySnapshots || [])
    .filter((_, i) => i % 3 === 0) // Sample every 3 months for cleaner chart
    .map(s => ({
      age: formatAge(s.day),
      'Net Worth': Math.round(s.netWorth || s.pool),
    }));

  const seedNumber = store.gameSeed || 'Standard';

  const generateShareText = () => {
    const achievedSummary = achievedGoals.map(g => {
      const year = Math.max(1, Math.ceil((g.achievedDay || 0) / 365));
      const age = 22 + Math.floor((g.achievedDay || 0) / 365);
      return `✓ ${g.name} (Year ${year}, Age ${age})`;
    }).join('\n');

    return `🎮 CashMeOut Life Simulation Run (Age 22→42)
🌱 World Seed: #${seedNumber}
💰 Final Net Worth: ${formatCurrency(store.pool)}
🧠 Financial Literacy: ${results.literacyScore}/100
🏆 Goals Achieved (${achievedGoals.length}/${store.goals.length}):
${achievedSummary || '• None achieved'}
${results.biggestMistake ? `\n💡 Lesson: ${results.biggestMistake}` : ''}

Can you beat my financial score on Seed #${seedNumber}?
Play here: ${window.location.origin}${window.location.pathname}`;
  };

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-surface-bg overflow-y-auto">
      <div className="max-w-md w-full mx-auto p-4 pb-24">
        {/* Screenshot-Friendly Life Certificate Card */}
        <div id="shareable-result-card" className="bg-white rounded-3xl p-5 shadow-md border-2 border-gray-200/80 mb-6 relative overflow-hidden">
          {/* Subtle Watermark Stamp */}
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-9xl font-black">
            ₹
          </div>

          {/* Top Seed & Brand Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl">🏆</span>
              <span className="font-extrabold text-sm text-text-primary tracking-tight">CashMe<span className="text-accent-action-dark">Out</span></span>
            </div>
            <div className="bg-gray-100 px-2.5 py-1 rounded-full text-[11px] font-mono font-black text-text-primary border border-gray-200">
              Seed #{seedNumber}
            </div>
          </div>

          {/* Header Status */}
          <div className="text-center mb-5">
            {isBroke ? (
              <>
                <div className="w-14 h-14 bg-accent-caution/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">💸</span>
                </div>
                <h1 className="text-2xl font-black text-text-primary mb-1">Game Over (Insolvent)</h1>
                <p className="text-xs text-text-muted">
                  Life's financial curveballs exhausted liquidity. A lesson in risk hedging!
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-accent-stable/30 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">🎉</span>
                </div>
                <h1 className="text-2xl font-black text-text-primary mb-1">Age 42 — Life Completed</h1>
                <p className="text-xs text-text-muted">
                  20 years of compound decisions, investments, and life milestones.
                </p>
              </>
            )}
          </div>

          {/* Big Net Worth Card */}
          <div className="bg-surface-card-alt p-4 rounded-2xl text-center mb-4 border border-gray-100">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Final Net Worth</p>
            <div className={`text-3xl sm:text-4xl font-black tracking-tight mb-3 ${store.pool >= 0 ? 'text-accent-stable-dark' : 'text-accent-caution-dark'}`}>
              {formatCurrency(store.pool)}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-200/60 pt-2.5">
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold">Financial Literacy</p>
                <p className="text-xl font-black">{results.literacyScore}<span className="text-xs text-text-muted">/100</span></p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold">Goal Score</p>
                <p className="text-xl font-black">{resultScore >= 0 ? '+' : ''}{resultScore}</p>
              </div>
            </div>
          </div>

          {/* Goals Milestone Summary with Year Achieved */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary">
                Life Milestones ({achievedGoals.length}/{store.goals.length} Achieved)
              </h3>
            </div>
            <div className="space-y-1.5">
              {store.goals.map(g => {
                const year = Math.max(1, Math.ceil((g.achievedDay || 0) / 365));
                const age = 22 + Math.floor((g.achievedDay || 0) / 365);

                return (
                  <div key={g.id} className="flex justify-between items-center bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 text-xs">
                    <div className="truncate pr-2">
                      <span className="font-bold text-text-primary block truncate">{g.name}</span>
                      {g.achieved && (
                        <span className="text-[10px] text-green-700 font-extrabold">
                          Achieved in Year {year} (Age {age})
                        </span>
                      )}
                    </div>
                    {g.achieved ? (
                      <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                        ✓ YEAR {year}
                      </span>
                    ) : g.sacrificed ? (
                      <span className="bg-gray-200 text-gray-700 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                        SACRIFICED
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                        MISSED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Share Action Buttons inside Card */}
          <div className="pt-2 border-t border-gray-100 flex space-x-2">
            <button
              type="button"
              onClick={handleCopyShare}
              className="flex-1 py-2.5 px-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied with Seed!' : 'Copy Result Text'}</span>
            </button>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2.5 px-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm"
              title="Share to WhatsApp"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </button>
          </div>
          <span className="text-[9px] text-text-muted text-center block mt-1.5">
            📸 Take a screenshot of this card to challenge friends on Seed #{seedNumber}!
          </span>
        </div>

        {/* Net Worth Chart */}
        {chartData.length > 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2">Net Worth Trajectory</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="age" tick={{ fontSize: 10 }} stroke="#8A8781" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#8A8781" tickFormatter={v => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Net Worth']} />
                    <Line type="monotone" dataKey="Net Worth" stroke="#6A8FC4" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Biggest Takeaway */}
        <Card className="mb-4 bg-accent-caution/10 border border-accent-caution/30">
          <h3 className="font-bold text-accent-caution-dark text-xs uppercase tracking-wider mb-1">💡 Key Financial Lesson</h3>
          <p className="text-xs text-text-primary leading-relaxed">{results.biggestMistake}</p>
        </Card>

        {/* Financial Insights */}
        {insights.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2">Financial Insights</h3>
            <div className="space-y-1.5">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start text-xs text-text-primary">
                  <span className="text-accent-action-dark font-black mr-2">•</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Play Again CTA */}
        <div className="space-y-2">
          <Button fullWidth onClick={resetGame}>
            Play Another Life →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;

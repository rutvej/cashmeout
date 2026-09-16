import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useGameStore from '../../engine/store';
import { calculateResults, generateInsights } from '../../engine/scoring';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrency, formatAge } from '../../utils/format';
import { toPng } from 'html-to-image';

const Scorecard = () => {
  const store = useGameStore();
  const resetGame = useGameStore(state => state.resetGame);
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [screenshotSaved, setScreenshotSaved] = useState(false);

  const isBroke = store.gameOverReason === 'broke';

  const results = useMemo(() => {
    try {
      return calculateResults(store);
    } catch (e) {
      console.error('Error calculating results:', e);
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

  const insights = useMemo(() => {
    try {
      return generateInsights(store);
    } catch (e) {
      return ['You completed your life simulation run.'];
    }
  }, [store]);

  const achievedGoals = (store.goals || []).filter(g => g.achieved);
  const sacrificedGoals = (store.goals || []).filter(g => g.sacrificed);
  const bonusGoals = achievedGoals.filter(g => g.bonus);

  const resultScore = achievedGoals.length - sacrificedGoals.length + bonusGoals.length;

  // Prepare chart data with safe fallbacks
  const chartData = (store.monthlySnapshots || [])
    .filter((_, i) => i % 3 === 0)
    .map(s => ({
      age: formatAge(s.day || 0),
      'Net Worth': Math.round(s.netWorth ?? s.pool ?? 0),
    }));

  const seedNumber = store.gameSeed || 'Standard';

  const realEstateValue = (store.homesOwned || []).reduce((sum, h) => sum + (h.value || 0), 0);
  const businessValue = store.hasActiveBusiness ? (store.businessIncome || 0) * 22 : 0;
  const totalDebt = (store.loans || []).reduce((sum, l) => sum + (l.principal || 0), 0);
  const totalNetWorth = results.finalNetWorth ?? (store.pool + realEstateValue + businessValue - totalDebt);

  const shareUrl = `${window.location.origin}${window.location.pathname}?seed=${seedNumber}`;

  const generateShareText = () => {
    const achievedSummary = achievedGoals.map(g => {
      const year = Math.max(1, Math.ceil((g.achievedDay || 0) / 365));
      const age = 22 + Math.floor((g.achievedDay || 0) / 365);
      return `✓ ${g.name} (Year ${year}, Age ${age})`;
    }).join('\n');

    return `🎮 CashMeOut Life Simulation Run (Age 22→42)
🌱 World Seed: #${seedNumber}
💰 Final Net Worth: ${formatCurrency(totalNetWorth)}
🧠 Financial Literacy: ${results.literacyScore}/100
🏆 Goals Achieved (${achievedGoals.length}/${store.goals?.length || 0}):
${achievedSummary || '• None achieved'}
${results.biggestWin ? `\n🏆 Win: ${results.biggestWin}` : ''}
${results.biggestMistake ? `\n💡 Lesson: ${results.biggestMistake}` : ''}

Can you beat my financial score on Seed #${seedNumber}?
Play here: ${shareUrl}`;
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

  const handleDownloadScreenshot = async () => {
    try {
      setCapturing(true);
      const element = document.getElementById('shareable-result-card');
      if (!element) return;
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `cashmeout-seed-${seedNumber}-scorecard.png`;
      link.href = dataUrl;
      link.click();
      setScreenshotSaved(true);
      setTimeout(() => setScreenshotSaved(false), 2500);
    } catch (e) {
      console.error('Screenshot download failed', e);
    } finally {
      setCapturing(false);
    }
  };

  const handleShareScreenshot = async () => {
    try {
      setCapturing(true);
      const element = document.getElementById('shareable-result-card');
      if (!element) return;
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `cashmeout-seed-${seedNumber}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `CashMeOut Run — Seed #${seedNumber}`,
            text: generateShareText(),
          });
          return;
        } catch (shareErr) {
          // Cancelled by user
        }
      }

      // Fallback download
      handleDownloadScreenshot();
    } catch (e) {
      console.error('Share screenshot failed', e);
    } finally {
      setCapturing(false);
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
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Final Net Worth (Assets - Debt)</p>
            <div className={`text-3xl sm:text-4xl font-black tracking-tight mb-2 ${totalNetWorth >= 0 ? 'text-accent-stable-dark' : 'text-accent-caution-dark'}`}>
              {formatCurrency(totalNetWorth)}
            </div>

            {/* Asset & Debt Micro-Breakdown */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3 text-[10px] text-slate-600 font-medium">
              <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                💵 Liquid: <strong className="text-slate-800">{formatCurrency(store.pool || 0)}</strong>
              </span>
              {realEstateValue > 0 && (
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                  🏡 Property: <strong className="text-emerald-700">{formatCurrency(realEstateValue)}</strong>
                </span>
              )}
              {businessValue > 0 && (
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                  💼 Business: <strong className="text-emerald-700">{formatCurrency(businessValue)}</strong>
                </span>
              )}
              {totalDebt > 0 && (
                <span className="bg-white px-2 py-0.5 rounded border border-rose-200 text-rose-700">
                  💳 Debt: <strong>-{formatCurrency(totalDebt)}</strong>
                </span>
              )}
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
                Life Milestones ({achievedGoals.length}/{store.goals?.length || 0} Achieved)
              </h3>
            </div>
            <div className="space-y-1.5">
              {(store.goals || []).map(g => {
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

          {/* Card Footer Stamp */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-text-muted">
            <span className="font-bold text-gray-500">🎮 CashMeOut Life Certificate</span>
            <span className="font-mono font-semibold">Seed #{seedNumber}</span>
          </div>
        </div>

        {/* Share & Screenshot Action Toolbar */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-200 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
              Share Your Life Run
            </span>
            {screenshotSaved && (
              <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                ✓ Screenshot Saved (.PNG)!
              </span>
            )}
            {copied && (
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                ✓ Text Copied!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={capturing}
              onClick={handleDownloadScreenshot}
              className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <span>{capturing ? '⏳' : '📸'}</span>
              <span>{capturing ? 'Generating...' : 'Save Screenshot'}</span>
            </button>

            <button
              type="button"
              disabled={capturing}
              onClick={handleShareScreenshot}
              className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <span>📲</span>
              <span>Share Image</span>
            </button>

            <button
              type="button"
              onClick={handleCopyShare}
              className="py-2 px-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm"
              title="Share to WhatsApp"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Net Worth Chart */}
        {chartData.length > 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted mb-2">Net Worth Trajectory</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="age" tick={{ fontSize: 9 }} stroke="#8A8781" />
                    <YAxis width={42} tick={{ fontSize: 9 }} stroke="#8A8781" tickFormatter={v => v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Net Worth']} />
                    <Line type="monotone" dataKey="Net Worth" stroke="#6A8FC4" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Biggest Win */}
        {results.biggestWin && (
          <Card className="mb-3 bg-emerald-50/70 border border-emerald-200">
            <h3 className="font-bold text-emerald-800 text-xs uppercase tracking-wider mb-1">🏆 Biggest Financial Win</h3>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">{results.biggestWin}</p>
          </Card>
        )}

        {/* Biggest Takeaway */}
        <Card className="mb-3 bg-accent-caution/10 border border-accent-caution/30">
          <h3 className="font-bold text-accent-caution-dark text-xs uppercase tracking-wider mb-1">💡 Key Financial Lesson</h3>
          <p className="text-xs text-text-primary leading-relaxed">{results.biggestMistake}</p>
        </Card>

        {/* Turning Point */}
        {results.turningPoint && (
          <Card className="mb-4 bg-indigo-50/70 border border-indigo-200">
            <h3 className="font-bold text-indigo-800 text-xs uppercase tracking-wider mb-1">📈 Net Worth Turning Point</h3>
            <p className="text-xs text-indigo-950 leading-relaxed font-medium">{results.turningPoint}</p>
          </Card>
        )}

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

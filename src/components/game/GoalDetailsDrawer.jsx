import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { INSTRUMENTS } from '../../engine/compoundingEngine.js';
import { formatINR } from '../../utils/format.js';
import { backdropFade, sheetSlideUp } from '../../utils/motion.js';

export default function GoalDetailsDrawer({
  goal,
  character,
  simulation,
  isOpen,
  onClose,
  onTransferLumpSum,
  onUpdateAllocation,
  onUpdateGoal,
}) {
  if (!isOpen || !goal) return null;

  const [seedAmount, setSeedAmount] = useState(10000);
  const [monthlySIPInput, setMonthlySIPInput] = useState(goal.baseMonthlySIP || 0);
  const [timeHorizon, setTimeHorizon] = useState('monthly'); // 'monthly' | 'yearly'
  const [transferSuccessMsg, setTransferSuccessMsg] = useState('');

  const availableBankCash = Math.max(0, character?.liquidCash || 0);
  const availableSurplus = Math.max(0, character?.monthlySurplus || 0);
  const currentInst = INSTRUMENTS[goal.instrumentId] || INSTRUMENTS.savings;
  const isRetirement = goal.id === 'goal_retirement';

  const maxLumpSum = isRetirement
    ? availableBankCash
    : Math.min(availableBankCash, Math.max(0, (goal.targetAmount || 1) - (goal.currentAmount || 0)));

  // Handle Lump-Sum Transfer
  const handleExecuteTransfer = () => {
    const amt = Math.min(seedAmount, maxLumpSum);
    if (amt <= 0) return;
    const ok = onTransferLumpSum(goal.id, amt);
    if (ok) {
      setTransferSuccessMsg(`Successfully seeded +${formatINR(amt)} from Bank Cash!`);
      setTimeout(() => setTransferSuccessMsg(''), 3500);
    }
  };

  // Handle Monthly SIP update
  const handleSaveSIP = () => {
    const sip = Math.max(0, Number(monthlySIPInput) || 0);
    onUpdateAllocation(goal.id, {
      baseMonthlySIP: sip,
      allocationPercent: availableSurplus > 0 ? Math.min(100, Math.round((sip / availableSurplus) * 100)) : 0,
    });
  };

  // Switch Instrument
  const handleSelectInstrument = (instId) => {
    if (onUpdateGoal) {
      onUpdateGoal(goal.id, { instrumentId: instId });
    }
    if (onUpdateAllocation) {
      onUpdateAllocation(goal.id, { instrumentId: instId });
    }
  };

  // Prepare Chart Data
  const chartData = useMemo(() => {
    const history = goal.history || [];
    if (history.length === 0) {
      return [
        {
          label: 'M0',
          month: 0,
          investedPrincipal: goal.totalPrincipalDeposited || goal.currentAmount || 0,
          actualBalance: goal.currentAmount || 0,
        },
      ];
    }

    if (timeHorizon === 'yearly') {
      const yearlyEntries = history.filter((h) => h.month % 12 === 0);
      if (yearlyEntries.length === 0) {
        return history.map((h) => ({
          label: `M${h.month}`,
          month: h.month,
          investedPrincipal: h.investedPrincipal,
          actualBalance: h.actualBalance,
        }));
      }
      return yearlyEntries.map((h) => ({
        label: `Age ${h.age}`,
        month: h.month,
        investedPrincipal: h.investedPrincipal,
        actualBalance: h.actualBalance,
      }));
    }

    // Monthly view
    return history.map((h) => ({
      label: `M${h.month}`,
      month: h.month,
      investedPrincipal: h.investedPrincipal,
      actualBalance: h.actualBalance,
    }));
  }, [goal.history, goal.currentAmount, goal.totalPrincipalDeposited, timeHorizon]);

  const currentPrincipal = goal.totalPrincipalDeposited || goal.currentAmount || 0;
  const currentActual = goal.currentAmount || 0;
  const netWealthGain = currentActual - currentPrincipal;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans"
      {...backdropFade}
    >
      <motion.div
        className="card-neopop max-w-2xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 text-left space-y-4 sm:space-y-5 bg-white text-slate-900 border-2 border-slate-900 shadow-hard"
        {...sheetSlideUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="text-3xl p-2 bg-slate-100 border-2 border-slate-900 shrink-0">
              {goal.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-lg sm:text-xl font-black text-slate-900 truncate">
                  {goal.name}
                </h2>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-slate-100 border border-slate-900 text-slate-800 uppercase">
                  {goal.category}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-mono text-slate-600 truncate">
                Target: {formatINR(goal.targetAmount)} {goal.targetAge ? `by Age ${goal.targetAge}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-xs font-mono font-bold uppercase btn-press"
          >
            ✕ Close
          </button>
        </div>

        {/* ─── 1. Lump-Sum Seeding from Bank Cash ─── */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-2 border-slate-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Mid-Game Goal Seeding
              </span>
              <h3 className="font-display font-black text-sm text-slate-900">
                ⚡ Seed Capital from Bank Cash
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 block">Available Bank Cash:</span>
              <span className="text-xs sm:text-sm font-mono font-black text-emerald-700">
                {formatINR(availableBankCash)}
              </span>
            </div>
          </div>

          {transferSuccessMsg && (
            <div className="p-2 bg-emerald-100 border border-emerald-700 text-emerald-900 text-xs font-mono font-bold">
              ✓ {transferSuccessMsg}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSeedAmount(Math.max(1000, seedAmount - 5000))}
                className="w-9 h-9 bg-white border-2 border-slate-900 font-mono font-bold text-sm btn-press"
              >
                −
              </button>
              <div className="flex-1 px-3 py-1.5 bg-white border-2 border-slate-900 font-mono font-black text-base text-slate-900 text-center">
                {formatINR(seedAmount)}
              </div>
              <button
                type="button"
                onClick={() => setSeedAmount(Math.min(maxLumpSum, seedAmount + 5000))}
                className="w-9 h-9 bg-white border-2 border-slate-900 font-mono font-bold text-sm btn-press"
              >
                +
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
              {[10000, 25000, 50000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSeedAmount(Math.min(maxLumpSum, preset))}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-900 font-bold"
                >
                  +{formatINR(preset)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSeedAmount(maxLumpSum)}
                className="px-2 py-1 bg-purple-100 hover:bg-purple-200 border border-purple-900 text-purple-900 font-bold ml-auto"
              >
                Max ({formatINR(maxLumpSum)})
              </button>
            </div>

            <button
              type="button"
              disabled={maxLumpSum <= 0 || seedAmount <= 0}
              onClick={handleExecuteTransfer}
              className={`w-full py-2.5 px-4 font-mono font-black text-xs uppercase tracking-wider border-2 border-slate-900 shadow-hard-sm btn-press transition-colors ${
                maxLumpSum > 0 && seedAmount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              ⚡ Transfer {formatINR(seedAmount)} into Goal Corpus
            </button>
          </div>

          {/* Monthly SIP Quick Adjuster */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-mono">
              <span className="text-slate-500 block text-[9px] uppercase font-bold">Monthly SIP from Surplus:</span>
              <strong className="text-slate-900 font-bold">{formatINR(goal.effectiveMonthlySIP || goal.baseMonthlySIP || 0)}/mo</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="500"
                min="0"
                value={monthlySIPInput}
                onChange={(e) => setMonthlySIPInput(e.target.value)}
                className="w-24 px-2 py-1 bg-white border border-slate-900 font-mono text-xs font-bold"
              />
              <button
                type="button"
                onClick={handleSaveSIP}
                className="px-2.5 py-1 bg-slate-900 text-white font-mono text-xs font-bold border border-slate-900 btn-press-sm"
              >
                Update SIP
              </button>
            </div>
          </div>
        </div>

        {/* ─── 2. Interactive Analytics Graph: Principal vs Actual Value ─── */}
        <div className="p-3.5 sm:p-4 bg-white border-2 border-slate-900 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Portfolio Compounding Analytics
              </span>
              <h3 className="font-display font-black text-sm text-slate-900">
                Principal Deposited vs. Actual Fund Value
              </h3>
            </div>

            {/* Time Horizon Toggle */}
            <div className="flex bg-slate-100 border border-slate-900 p-0.5 self-start sm:self-auto font-mono text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTimeHorizon('monthly')}
                className={`px-2.5 py-1 transition-colors ${
                  timeHorizon === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ● Monthly
              </button>
              <button
                type="button"
                onClick={() => setTimeHorizon('yearly')}
                className={`px-2.5 py-1 transition-colors ${
                  timeHorizon === 'yearly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ○ Yearly
              </button>
            </div>
          </div>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-300 p-2 text-center text-xs font-mono">
            <div>
              <span className="text-[8px] sm:text-[9px] uppercase text-slate-500 block">Invested Principal</span>
              <span className="font-bold text-slate-700">{formatINR(currentPrincipal)}</span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] uppercase text-slate-500 block">Actual Value</span>
              <span className="font-bold text-emerald-700">{formatINR(currentActual)}</span>
            </div>
            <div>
              <span className="text-[8px] sm:text-[9px] uppercase text-slate-500 block">Net Growth</span>
              <span className={`font-bold ${netWealthGain >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {netWealthGain >= 0 ? `+${formatINR(netWealthGain)}` : formatINR(netWealthGain)}
              </span>
            </div>
          </div>

          {/* Area Chart */}
          <div className="w-full h-44 sm:h-52 bg-slate-50 border border-slate-300 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 9, fill: '#64748B' }}
                  tickFormatter={(v) => (v >= 100000 ? `${(v / 100000).toFixed(1)}L` : `${v}`)}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#0f172a', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area
                  type="monotone"
                  dataKey="investedPrincipal"
                  name="Invested Principal"
                  stroke="#64748B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrincipal)"
                />
                <Area
                  type="monotone"
                  dataKey="actualBalance"
                  name="Actual Fund Value"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── 3. Instrument Risk Profile Card ─── */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-2 border-slate-900 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Selected Instrument & Risk Profile
            </span>
            <span className="text-xs font-mono font-black text-slate-900">
              {currentInst.name} ({(currentInst.annualRate * 100).toFixed(1)}% p.a.)
            </span>
          </div>

          {/* Risk Narrative Card */}
          <div className="p-2.5 bg-white border border-slate-300 text-xs font-body leading-relaxed space-y-1">
            {goal.instrumentId === 'savings' && (
              <p className="text-slate-700">
                🛡️ <strong className="text-emerald-800">Liquid Savings:</strong> Steady linear climb with 0% volatility. 100% capital protection and instant liquidity. Ideal for short-term emergency buffer and vacation.
              </p>
            )}
            {goal.instrumentId === 'fd' && (
              <p className="text-slate-700">
                🔒 <strong className="text-blue-800">Fixed Deposit (FD):</strong> Guaranteed compounded exponential growth (7% p.a.). Zero market volatility. Incurs a 1.5% penalty if liquidated before maturity.
              </p>
            )}
            {goal.instrumentId === 'gold' && (
              <p className="text-slate-700">
                🟡 <strong className="text-amber-800">Gold / SGB:</strong> Inflation hedge with moderate cyclical fluctuations (-1.0% to +2.0%/mo). Resilient safe haven during market crises.
              </p>
            )}
            {goal.instrumentId === 'equity' && (
              <p className="text-slate-700">
                ★ <strong className="text-purple-800">Equity Mutual Funds:</strong> High long-term compounding (~12% p.a.) with high monthly volatility (-3.5% to +4.5%/mo) and a guaranteed macro crash (-28% to -55%). Ideal for multi-decade retirement.
              </p>
            )}
          </div>

          {/* Instrument Switcher Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
            {[
              { id: 'savings', label: 'Liquid (4%)' },
              { id: 'fd', label: 'FD (7%)' },
              { id: 'gold', label: 'Gold (8.5%)' },
              { id: 'equity', label: 'Equity (12%)' },
            ].map((inst) => (
              <button
                key={inst.id}
                type="button"
                onClick={() => handleSelectInstrument(inst.id)}
                className={`py-1.5 px-2 border border-slate-900 font-bold transition-colors text-center ${
                  goal.instrumentId === inst.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {inst.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

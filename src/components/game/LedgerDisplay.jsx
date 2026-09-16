import React from 'react';
import CountUp from 'react-countup';
import { formatCurrency } from '../../utils/format';
import { motion, AnimatePresence } from 'framer-motion';

export default function LedgerDisplay({ 
  incomes = [], 
  deductions = [], 
  loans = [], 
  insuranceCosts = [], 
  maintenanceCosts = [], 
  surplus = 0, 
  buckets = [], 
  goals = [], 
  pool = 0, 
  instruments = [], 
  isExpanded 
}) {
  const totalIncome = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalLoans = loans.reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalInsurance = insuranceCosts.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalMaintenance = maintenanceCosts.reduce((sum, m) => sum + (m.amount || 0), 0);
  const totalExpenses = totalDeductions + totalLoans + totalInsurance + totalMaintenance;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans">
      <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex justify-between items-center">
        <h3 className="font-semibold tracking-wide uppercase text-sm text-slate-300">Monthly Ledger</h3>
        <div className="text-xl font-bold flex items-center gap-2">
          <span className="text-slate-400 text-sm font-normal">Surplus:</span>
          <span className={surplus >= 0 ? "text-emerald-400" : "text-rose-400"}>
            {surplus >= 0 ? '+' : ''}<CountUp end={surplus} separator="," prefix="₹" duration={1} />
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50">
              {/* Income Section */}
              <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex justify-between border-b border-emerald-100 pb-2">
                  <span>Income Sources</span>
                  <span>{formatCurrency(totalIncome)}</span>
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  {incomes.map((inc, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{inc.name}</span>
                      <span className="font-medium text-slate-800">{formatCurrency(inc.amount)}</span>
                    </li>
                  ))}
                  {incomes.length === 0 && <li className="text-slate-400 italic">No income</li>}
                </ul>
              </div>

              {/* Expenses Section */}
              <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-rose-100">
                <h4 className="text-sm font-bold text-rose-700 uppercase tracking-wider flex justify-between border-b border-rose-100 pb-2">
                  <span>Total Expenses</span>
                  <span>{formatCurrency(totalExpenses)}</span>
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  {deductions.map((d, i) => (
                    <li key={`d-${i}`} className="flex justify-between">
                      <span>{d.name}</span>
                      <span className="text-rose-600 font-medium">-{formatCurrency(d.amount)}</span>
                    </li>
                  ))}
                  {loans.map((l, i) => (
                    <li key={`l-${i}`} className="flex justify-between">
                      <span>{l.name} EMI</span>
                      <span className="text-rose-600 font-medium">-{formatCurrency(l.emi)}</span>
                    </li>
                  ))}
                  {insuranceCosts.map((ins, i) => (
                    <li key={`i-${i}`} className="flex justify-between">
                      <span>{ins.name} Premium</span>
                      <span className="text-rose-600 font-medium">-{formatCurrency(ins.amount)}</span>
                    </li>
                  ))}
                  {maintenanceCosts.map((m, i) => (
                    <li key={`m-${i}`} className="flex justify-between">
                      <span>{m.name} Maint.</span>
                      <span className="text-rose-600 font-medium">-{formatCurrency(m.amount)}</span>
                    </li>
                  ))}
                  {totalExpenses === 0 && <li className="text-slate-400 italic">No expenses</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isExpanded && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <div className="flex gap-4">
            <span>In: <span className="font-medium text-emerald-600">{formatCurrency(totalIncome)}</span></span>
            <span>Out: <span className="font-medium text-rose-600">{formatCurrency(totalExpenses)}</span></span>
          </div>
          <span className="text-xs text-slate-400">Expand for details</span>
        </div>
      )}
    </div>
  );
}

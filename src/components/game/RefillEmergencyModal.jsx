import React from 'react';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';

const RefillEmergencyModal = ({ prompt, onDismiss, onRefill }) => {
  if (!prompt) return null;

  const { role, company, newSalary, currentEmergency, targetEmergency, shortfall } = prompt;
  const progressPct = Math.min(100, Math.round((currentEmergency / Math.max(1, targetEmergency)) * 100));

  return (
    <BottomSheet isOpen={!!prompt} onClose={onDismiss} title="🛡️ Refill Emergency Fund">
      <div className="space-y-4 mb-6">
        {/* Celebration Banner */}
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl shadow-md">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-2xl">🎉</span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
              New Position Secured!
            </span>
          </div>
          <h3 className="text-lg font-black text-white">
            {role}
          </h3>
          <p className="text-xs text-emerald-100">
            {company} · <strong>+{formatCurrency(newSalary)}/mo</strong> cashflow
          </p>
        </div>

        {/* Emergency Fund Depletion Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">
              Emergency Buffer Status
            </span>
            <span className="text-xs font-black text-amber-600">
              {progressPct}% Funded
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                progressPct > 60 ? 'bg-emerald-500' : progressPct > 30 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="p-2 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Current Buffer</span>
              <span className="text-sm font-black text-slate-900">{formatCurrency(currentEmergency)}</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">6-Month Target</span>
              <span className="text-sm font-black text-emerald-700">{formatCurrency(targetEmergency)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            Your Emergency Fund successfully shielded your finances during your job search! Now that steady salary cashflow is restored, let's replenish the <strong className="text-slate-900">{formatCurrency(shortfall)}</strong> buffer to protect against future surprises.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            fullWidth
            size="lg"
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm py-3.5 rounded-xl shadow-lg"
            onClick={onRefill}
          >
            🎯 Reallocate Surplus to Refill Fund →
          </Button>
          <Button
            fullWidth
            size="md"
            variant="ghost"
            className="text-slate-500 hover:text-slate-700 text-xs font-bold"
            onClick={onDismiss}
          >
            Keep Current Allocations & Resume Simulation ▶
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default RefillEmergencyModal;

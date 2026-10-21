import React from 'react';
import useGameStore from '../../engine/store';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { generateJobMarketOffers, getJobSwitchCooldown } from '../../engine/careers';
import { formatCurrency } from '../../utils/format';

const JobMarketModal = ({ isOpen, onClose }) => {
  const store = useGameStore();
  const applyForNewJob = useGameStore(state => state.applyForNewJob);

  if (!isOpen) return null;

  const currentJob = store.incomes?.find(i => i.type === 'job');
  const hasJob = !!currentJob;
  const currentSalary = currentJob ? currentJob.amount : 0;
  const expYears = Math.floor((store.experienceMonths || 0) / 12);
  const expRemainingMonths = (store.experienceMonths || 0) % 12;

  const daysSinceSwitch = store.lastJobSwitchDay ? (store.currentDay - store.lastJobSwitchDay) : 999;
  const switchCooldown = getJobSwitchCooldown(currentSalary || 35000);
  const canSwitchJob = !hasJob || daysSinceSwitch >= switchCooldown;

  const offers = generateJobMarketOffers(store);

  const handleApply = (offer) => {
    const success = applyForNewJob(offer);
    if (success) {
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="💼 Career Market: Apply for Positions">
      <div className="space-y-4 mb-6">
        {/* Status Banner */}
        <div className={`p-3.5 rounded-2xl border ${
          hasJob 
            ? 'bg-slate-50 border-slate-200 text-slate-800' 
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-slate-500">
                Current Employment
              </span>
              <span className="text-sm font-black block">
                {hasJob ? `${currentJob.name} (${formatCurrency(currentSalary)}/mo)` : '🚨 Unemployed — Seeking Position'}
              </span>
              <span className="text-[11px] text-slate-600">
                Experience: <strong>{expYears}y {expRemainingMonths}m</strong> · Economic Cycle: <strong className="capitalize">{store.economicCycle || 'Normal'}</strong>
              </span>
            </div>
            {!hasJob ? (
              <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                Fast Hire Ready
              </span>
            ) : !canSwitchJob ? (
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                Cooldown ({switchCooldown - daysSinceSwitch}d)
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Eligible to Switch
              </span>
            )}
          </div>
        </div>

        {/* List of Job Offers */}
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
            Available Positions
          </span>

          {offers.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
              No matching corporate roles right now. Check back next month!
            </div>
          ) : (
            offers.map(offer => {
              const meetsExp = (store.experienceMonths || 0) >= offer.requiredExp || store.courseCompleted;
              const isEligible = meetsExp && canSwitchJob;

              return (
                <div
                  key={offer.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition shadow-sm space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        <span className="text-sm font-black text-slate-900">
                          {offer.role}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {offer.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {offer.company} · {offer.type}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-600 block">
                        {formatCurrency(offer.salary)}<span className="text-[10px] font-normal text-slate-400">/mo</span>
                      </span>
                      {hasJob && offer.hikeAmount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          +{formatCurrency(offer.hikeAmount)}/mo hike
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-500">
                      Stability: <strong className="text-slate-800">{offer.stability}</strong>
                      {offer.requiredExp > 0 ? ` · Req: ${Math.round(offer.requiredExp / 12)}y exp` : ''}
                    </span>

                    <Button
                      size="sm"
                      variant={isEligible ? 'primary' : 'secondary'}
                      className={`text-xs px-4 py-1.5 font-bold ${
                        isEligible ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md' : 'opacity-60 cursor-not-allowed'
                      }`}
                      disabled={!isEligible}
                      onClick={() => handleApply(offer)}
                    >
                      {!meetsExp
                        ? `Req. ${Math.round(offer.requiredExp / 12)}y Exp`
                        : !canSwitchJob && hasJob
                        ? `Cooldown (${switchCooldown - daysSinceSwitch}d)`
                        : hasJob
                        ? `Accept Offer (+${offer.hikePercent}%)`
                        : 'Accept Position 🚀'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </BottomSheet>
  );
};

export default JobMarketModal;

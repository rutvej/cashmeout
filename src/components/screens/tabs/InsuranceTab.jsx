import React from 'react';
import useGameStore from '../../../engine/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../utils/format';

const InsuranceTab = () => {
  const store = useGameStore();
  const hasCar = store.player?.carOwned || (store.carsOwned && store.carsOwned.length > 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Health Insurance */}
      <Card className={`border-2 ${store.hasHealthInsurance ? 'border-green-400 bg-green-50/30' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center min-w-0 flex-1 pr-2">
            <span className="text-3xl mr-3 shrink-0">🏥</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-text-primary truncate">Health Insurance Policy</h3>
              <p className="text-xs text-text-muted">Protects liquid wealth from hospitalization shocks</p>
            </div>
          </div>
          {store.hasHealthInsurance && (
            <span className="bg-green-100 text-green-800 text-xs font-black px-2 py-1 rounded shrink-0">ACTIVE</span>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-100">
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold">Monthly Premium</div>
            <div className="font-extrabold text-sm">{formatCurrency(store.healthInsuranceCost || 750)}/mo</div>
          </div>
          {!store.hasHealthInsurance ? (
            <Button size="sm" onClick={() => store.buyInsurance('health')}>Buy Health Policy</Button>
          ) : (
            <span className="text-xs text-green-700 font-bold">✓ 80-90% Medical Coverage</span>
          )}
        </div>
      </Card>

      {/* Vehicle Insurance */}
      {hasCar ? (
        <Card className={`border-2 ${store.hasVehicleInsurance ? 'border-green-400 bg-green-50/30' : 'border-gray-200'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center min-w-0 flex-1 pr-2">
              <span className="text-3xl mr-3 shrink-0">🚗</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-text-primary truncate">Vehicle Insurance Policy</h3>
                <p className="text-xs text-text-muted">Mandatory collision & damage repair coverage</p>
              </div>
            </div>
            {store.hasVehicleInsurance && (
              <span className="bg-green-100 text-green-800 text-xs font-black px-2 py-1 rounded shrink-0">ACTIVE</span>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-100">
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold">Monthly Premium</div>
              <div className="font-extrabold text-sm">{formatCurrency(store.vehicleInsuranceCost || 350)}/mo</div>
            </div>
            {!store.hasVehicleInsurance ? (
              <Button size="sm" onClick={() => store.buyInsurance('vehicle')}>Buy Vehicle Policy</Button>
            ) : (
              <span className="text-xs text-green-700 font-bold">✓ 90% Repair Coverage</span>
            )}
          </div>
        </Card>
      ) : (
        <Card className="border border-dashed border-gray-300 bg-gray-50/70 opacity-80">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-3xl mr-3 grayscale opacity-60">🚗</span>
              <div>
                <h3 className="font-bold text-sm text-text-muted">Vehicle Insurance Policy</h3>
                <p className="text-xs text-text-muted">Unlocks once you achieve your Car Goal or acquire a vehicle</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-gray-200 text-text-muted px-2 py-1 rounded">LOCKED</span>
          </div>
        </Card>
      )}

      {/* Spouse Health Cover */}
      {store.married ? (
        <Card className="border-2 border-green-400 bg-green-50/30">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center min-w-0 flex-1 pr-2">
              <span className="text-3xl mr-3 shrink-0">💍</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-text-primary truncate">Spouse Medical Cover</h3>
                <p className="text-xs text-text-muted">Family floater extension covering hospitalization for spouse</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-black px-2 py-1 rounded shrink-0">ACTIVE</span>
          </div>
          <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-100">
            <div>
              <div className="text-[10px] text-text-muted uppercase font-bold">Monthly Premium</div>
              <div className="font-extrabold text-sm">₹650/mo (Included in household)</div>
            </div>
            <span className="text-xs text-green-700 font-bold">✓ 85% Inpatient Cover</span>
          </div>
        </Card>
      ) : (
        <Card className="border border-dashed border-gray-300 bg-gray-50/70 opacity-80">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-3xl mr-3 grayscale opacity-60">💍</span>
              <div>
                <h3 className="font-bold text-sm text-text-muted">Spouse Health Extension</h3>
                <p className="text-xs text-text-muted">Unlocks automatically upon completing the Marriage milestone</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-gray-200 text-text-muted px-2 py-1 rounded">🔒 UNMARRIED</span>
          </div>
        </Card>
      )}

      {/* Parents Senior Citizen Medical Cover */}
      <Card className="border border-purple-200 bg-purple-50/30">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center min-w-0 flex-1 pr-2">
            <span className="text-3xl mr-3 shrink-0">👴</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-text-primary truncate">Parents Senior Citizen Healthcare</h3>
              <p className="text-xs text-text-muted">Covers aging parents with pre-existing conditions</p>
            </div>
          </div>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.5 rounded">HIGH PREMIUM</span>
        </div>
        <div className="mt-3 flex justify-between items-center pt-2 border-t border-purple-100">
          <div>
            <div className="text-[10px] text-text-muted uppercase font-bold">Alternative to Insurance</div>
            <div className="text-xs font-bold text-purple-900">Recommended: Maintain a ₹5L Medical Reserve Fund</div>
          </div>
          <span className="text-[11px] text-stone-600 font-semibold">Pre-existing coverage</span>
        </div>
      </Card>

      {/* Children Health Shield */}
      <Card className="border border-dashed border-gray-300 bg-gray-50/70 opacity-80">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-3xl mr-3 grayscale opacity-60">👶</span>
            <div>
              <h3 className="font-bold text-sm text-text-muted">Child Health & Pediatric Shield</h3>
              <p className="text-xs text-text-muted">Unlocks after family expansion / child milestone</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-gray-200 text-text-muted px-2 py-1 rounded">🔒 FUTURE</span>
        </div>
      </Card>

      {/* Info Tip */}
      <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl text-xs leading-relaxed border border-blue-100">
        <strong>Financial Planning Rule:</strong> Insurance is your defensive moat. Without adequate health or auto coverage, a single emergency can instantly wipe out months of savings.
      </div>
    </div>
  );
};

export default InsuranceTab;

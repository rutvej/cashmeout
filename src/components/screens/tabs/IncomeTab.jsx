import React from 'react';
import useGameStore from '../../../engine/store';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../utils/format';
import { CITY_TIERS } from '../../../engine/constants';

const IncomeTab = () => {
  const store = useGameStore();

  const totalJobIncome = store.incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalBusinessIncome = store.businessIncome || 0;
  const rentalIncome = (store.homesOwned || []).reduce((sum, h) => sum + (h.isRentedOut ? (h.rentalIncome || 0) : 0), 0);
  const totalMonthlyIncome = totalJobIncome + totalBusinessIncome + rentalIncome;

  const livingDeduction = store.fixedDeductions.find(d => d.type === 'living')?.amount || 0;
  const rentDeduction = store.fixedDeductions.find(d => d.type === 'rent')?.amount || 0;
  const totalEmi = store.loans.reduce((sum, l) => sum + l.emi, 0);
  const healthInsuranceCost = store.hasHealthInsurance ? store.healthInsuranceCost : 0;
  const vehicleInsuranceCost = store.hasVehicleInsurance ? store.vehicleInsuranceCost : 0;
  const homeMaintenance = store.homeMaintenanceCost || 0;
  const carMaintenance = store.carMaintenanceCost || 0;

  const totalDeductions =
    livingDeduction +
    rentDeduction +
    totalEmi +
    healthInsuranceCost +
    vehicleInsuranceCost +
    homeMaintenance +
    carMaintenance;

  const netMonthlySurplus = totalMonthlyIncome - totalDeductions;
  const hasJob = store.incomes.some(i => i.type === 'job');
  const cityTierMeta = CITY_TIERS[store.player?.cityTier || 1];

  return (
    <div className="space-y-4 pb-24">
      {/* Net Monthly Cashflow Banner */}
      <Card className={`border ${netMonthlySurplus >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'}`}>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">
              Net Monthly Cashflow (Surplus)
            </span>
            <div className={`text-3xl font-black tracking-tight ${netMonthlySurplus >= 0 ? 'text-green-800' : 'text-red-700'}`}>
              {netMonthlySurplus >= 0 ? '+' : ''}{formatCurrency(netMonthlySurplus)}<span className="text-xs font-medium">/mo</span>
            </div>
            <span className="text-[11px] text-text-muted">
              {netMonthlySurplus >= 0 ? 'Surplus invested into goal buckets' : '⚠️ Deficit draining cash pool!'}
            </span>
          </div>
          <span className="text-2xl">{netMonthlySurplus >= 0 ? '📈' : '📉'}</span>
        </div>
      </Card>

      {/* Unemployment Alert & Freelance Recovery Action */}
      {!hasJob && (
        <Card className="p-3.5 bg-red-50 border-2 border-red-300">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-red-900 block mb-1">
                ⚠️ Unemployed: Salaried Income Disrupted
              </span>
              <p className="text-[11px] text-red-700 leading-snug">
                Fixed costs keep deducting every month. Take freelance gigs or cut living expenses to survive the transition.
              </p>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              className="text-xs flex-1 bg-red-600 text-white hover:bg-red-700"
              onClick={() => store.takeFreelanceGig()}
            >
              + Take Freelance Gig (+₹20k/mo)
            </Button>
          </div>
        </Card>
      )}

      {/* 1. Incomes Breakdown */}
      <Card className="p-3.5 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold text-xs text-text-primary uppercase tracking-wider">
            Monthly Inflow Channels
          </h3>
          <span className="text-xs font-black text-green-700">
            +{formatCurrency(totalMonthlyIncome)}/mo
          </span>
        </div>

        <div className="space-y-2">
          {store.incomes.map(inc => (
            <div key={inc.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
              <span className="text-text-primary font-medium">{inc.name}</span>
              <span className="font-bold text-green-700">+{formatCurrency(inc.amount)}/mo</span>
            </div>
          ))}

          {totalBusinessIncome > 0 && (
            <div className="flex justify-between items-center text-xs py-1 border-b border-gray-50">
              <div>
                <span className="text-text-primary font-medium">Side Business Profits</span>
                <span className="text-[10px] text-text-muted block">Venture cashflow</span>
              </div>
              <span className="font-bold text-green-700">+{formatCurrency(totalBusinessIncome)}/mo</span>
            </div>
          )}

          {rentalIncome > 0 && (
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-text-primary font-medium">Property Rental Inflow</span>
              <span className="font-bold text-green-700">+{formatCurrency(rentalIncome)}/mo</span>
            </div>
          )}
        </div>
      </Card>

      {/* Properties — Rental Management */}
      {(store.homesOwned || []).length > 0 && (
        <Card className="p-3.5 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-xs text-text-primary uppercase tracking-wider">
              Properties Owned
            </h3>
            <span className="text-xs font-bold text-indigo-700">
              {(store.homesOwned || []).length} {(store.homesOwned || []).length === 1 ? 'property' : 'properties'}
            </span>
          </div>
          <div className="space-y-3">
            {(store.homesOwned || []).map((home, idx) => {
              const isPrimary = idx === 0 && !store.player?.isRenting;
              return (
                <div key={home.id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-text-primary block">
                        {home.label || (isPrimary ? 'Primary Residence' : 'Investment Property')}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Value: {formatCurrency(home.value || 0)}
                      </span>
                    </div>
                    {!isPrimary && (
                      <Button
                        size="sm"
                        variant={home.isRentedOut ? 'primary' : 'secondary'}
                        className="text-[10px] px-2 py-1"
                        onClick={() => store.toggleHomeRental(home.id)}
                      >
                        {home.isRentedOut ? '🔑 Rented Out' : 'Rent Out'}
                      </Button>
                    )}
                    {isPrimary && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        You live here
                      </span>
                    )}
                  </div>
                  {home.isRentedOut && home.rentalIncome > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-green-700 font-medium">
                        Rental income: +{formatCurrency(home.rentalIncome)}/mo
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Maint: -{formatCurrency(home.maintenanceCost || 0)}/mo
                      </span>
                    </div>
                  )}
                  {!home.isRentedOut && !isPrimary && (
                    <p className="text-[10px] text-amber-700">⚠️ Vacant — no rental income. Toggle to start earning.</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 2. Sub-Column Distribution of Fixed Deductions */}
      <Card className="p-3.5 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold text-xs text-text-primary uppercase tracking-wider">
            Monthly Expense Distribution
          </h3>
          <span className="text-xs font-black text-red-600">
            -{formatCurrency(totalDeductions)}/mo
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {/* Housing (Rent vs Maintenance) */}
          {rentDeduction > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <div>
                <span className="font-medium text-text-primary">House Rent (Tier {store.player?.cityTier})</span>
                <span className="text-[10px] text-text-muted block">Primary residential lease</span>
              </div>
              <span className="font-bold text-red-600">-{formatCurrency(rentDeduction)}/mo</span>
            </div>
          )}

          {homeMaintenance > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <div>
                <span className="font-medium text-text-primary">Home Maintenance & Taxes</span>
                <span className="text-[10px] text-amber-700 block">
                  {store.player?.homeCondition || 'Aging property maintenance liability'}
                </span>
              </div>
              <span className="font-bold text-red-600">-{formatCurrency(homeMaintenance)}/mo</span>
            </div>
          )}

          {/* Living Costs (Food & Utilities) */}
          <div className="flex justify-between items-center py-1 border-b border-gray-50">
            <div>
              <span className="font-medium text-text-primary">Food, Groceries & Utilities</span>
              {store.isAusterityMode && (
                <span className="text-[10px] text-green-700 font-bold block">Austerity Mode: -25% active</span>
              )}
            </div>
            <span className="font-bold text-red-600">-{formatCurrency(livingDeduction)}/mo</span>
          </div>

          {/* Vehicle Maintenance */}
          {carMaintenance > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <div>
                <span className="font-medium text-text-primary">Car Fuel & Maintenance</span>
                <span className="text-[10px] text-text-muted block">Ongoing recurring upkeep</span>
              </div>
              <span className="font-bold text-red-600">-{formatCurrency(carMaintenance)}/mo</span>
            </div>
          )}

          {/* Loan EMIs */}
          {totalEmi > 0 && (
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <div>
                <span className="font-medium text-text-primary">Loan EMIs ({store.loans.length} active)</span>
                <span className="text-[10px] text-text-muted block">Debt servicing</span>
              </div>
              <span className="font-bold text-red-600">-{formatCurrency(totalEmi)}/mo</span>
            </div>
          )}

          {/* Insurance Premiums */}
          {(healthInsuranceCost > 0 || vehicleInsuranceCost > 0) && (
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-medium text-text-primary">Insurance Premiums</span>
                <span className="text-[10px] text-text-muted block">Health & vehicle risk coverage</span>
              </div>
              <span className="font-bold text-red-600">-{formatCurrency(healthInsuranceCost + vehicleInsuranceCost)}/mo</span>
            </div>
          )}
        </div>
      </Card>

      {/* 3. Cost-Reduction & Downsizing Hub */}
      <Card className="p-3.5 border border-gray-100 bg-gray-50/50">
        <h3 className="font-extrabold text-xs text-text-primary uppercase tracking-wider mb-2">
          Cost-Reduction & Liquidity Actions
        </h3>
        <p className="text-[11px] text-text-muted mb-3 leading-snug">
          Reduce fixed monthly burn or cash out physical assets to withstand economic pressure.
        </p>

        <div className="space-y-2">
          {/* Downsize Rent */}
          {rentDeduction > 4000 && (
            <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-text-primary block">Downsize to Budget Rent</span>
                <span className="text-[10px] text-text-muted">
                  Move to modest older studio (saves ~35% rent)
                </span>
              </div>
              <Button size="sm" variant="secondary" className="text-xs" onClick={() => store.downsizeHousing()}>
                Downsize
              </Button>
            </div>
          )}

          {/* Relocate City */}
          {store.player?.cityTier < 3 && (
            <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-text-primary block">
                  Relocate to Tier {store.player.cityTier + 1} City
                </span>
                <span className="text-[10px] text-text-muted">
                  Cheaper rent & groceries (lowers costs by 30-40%)
                </span>
              </div>
              <Button size="sm" variant="secondary" className="text-xs" onClick={() => store.relocateCity(store.player.cityTier + 1)}>
                Relocate
              </Button>
            </div>
          )}

          {/* Austerity Mode Toggle */}
          <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-text-primary block">
                {store.isAusterityMode ? 'Deactivate Austerity Mode' : 'Activate Austerity Mode (-25%)'}
              </span>
              <span className="text-[10px] text-text-muted">
                {store.isAusterityMode ? 'Restore standard grocery & utility lifestyle' : 'Strictly trim dining out and utility consumption'}
              </span>
            </div>
            <Button
              size="sm"
              variant={store.isAusterityMode ? 'primary' : 'secondary'}
              className="text-xs"
              onClick={() => store.toggleAusterityMode()}
            >
              {store.isAusterityMode ? 'Active' : 'Enable'}
            </Button>
          </div>

          {/* Sell Car */}
          {store.carsOwned && store.carsOwned.length > 0 && (
            <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-text-primary block">Sell Car for Cash</span>
                <span className="text-[10px] text-text-muted">
                  Receive +₹2.8L cash & eliminate fuel/maintenance liability
                </span>
              </div>
              <Button size="sm" variant="secondary" className="text-xs text-red-600" onClick={() => store.sellCar()}>
                Sell Car
              </Button>
            </div>
          )}

          {/* Sell Primary Home */}
          {store.homesOwned && store.homesOwned.length > 0 && (
            <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-text-primary block">Sell Primary Home</span>
                <span className="text-[10px] text-text-muted">
                  Liquidate property equity into cash pool & switch to renting
                </span>
              </div>
              <Button size="sm" variant="secondary" className="text-xs text-red-600" onClick={() => store.sellHome(store.homesOwned[0].id)}>
                Sell Home
              </Button>
            </div>
          )}

          {/* Business Management: Reinvest or Exit */}
          {store.hasActiveBusiness && (
            <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-900 block">Venture Operations</span>
                  <span className="text-[10px] text-indigo-700">Current Profit: +{formatCurrency(store.businessIncome)}/mo</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => store.reinvestInBusiness(50000)}
                  disabled={store.pool < 50000}
                >
                  Reinvest ₹50k (+₹8k/mo)
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs text-red-600"
                  onClick={() => store.sellBusiness()}
                >
                  Exit / Sell Venture
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default IncomeTab;

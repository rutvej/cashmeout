import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../engine/store';
import { getSuggestedGoal, createGoal } from '../../engine/goals';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/format';

const PREDEFINED_TYPES = [
  { type: 'home', icon: '🏠', label: 'Buy a Home', desc: 'Real estate asset with appreciation', defaultStep: 500000 },
  { type: 'car', icon: '🚗', label: 'Buy a Car', desc: 'Mobility & comfort (adds maintenance)', defaultStep: 100000 },
  { type: 'marriage', icon: '💍', label: 'Wedding / Marriage', desc: 'Major personal life celebration', defaultStep: 100000 },
  { type: 'business', icon: '💼', label: 'Start a Business', desc: 'Seed capital for commercial venture', defaultStep: 200000 },
];

const CUSTOM_PRESETS = [
  { name: "Kid's Future Fund", icon: '🎓', amount: 1500000 },
  { name: 'World Travel Tour', icon: '✈️', amount: 500000 },
  { name: "Parents' Healthcare", icon: '🏥', amount: 1000000 },
  { name: 'Financial Freedom', icon: '🏖️', amount: 2500000 },
];

const GoalSetup = () => {
  const player = useGameStore(state => state.player);
  const setGoalsAction = useGameStore(state => state.setGoals);
  const setScreen = useGameStore(state => state.setScreen);

  const cityTier = player?.cityTier || 1;

  // Selected goals state
  const [selectedGoals, setSelectedGoals] = useState(() => {
    // Default select Home and Car
    const homeSug = getSuggestedGoal('home', cityTier);
    const carSug = getSuggestedGoal('car', cityTier);
    return [
      {
        type: 'home',
        icon: '🏠',
        label: 'Buy a Home',
        targetAmount: homeSug.suggestedAmount,
        inflationRate: homeSug.inflationRate,
      },
      {
        type: 'car',
        icon: '🚗',
        label: 'Buy a Car',
        targetAmount: carSug.suggestedAmount,
        inflationRate: carSug.inflationRate,
      }
    ];
  });

  const [customGoalOpen, setCustomGoalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [day1HealthInsurance, setDay1HealthInsurance] = useState(true);
  const [day1VehicleInsurance, setDay1VehicleInsurance] = useState(player?.carOwned ? true : false);

  const isSelected = (type) => selectedGoals.some(g => g.type === type);

  const togglePredefined = (item) => {
    if (isSelected(item.type)) {
      setSelectedGoals(selectedGoals.filter(g => g.type !== item.type));
    } else {
      const suggested = getSuggestedGoal(item.type, cityTier);
      setSelectedGoals([
        ...selectedGoals,
        {
          type: item.type,
          icon: item.icon,
          label: item.label,
          targetAmount: suggested.suggestedAmount,
          inflationRate: suggested.inflationRate,
        }
      ]);
    }
  };

  const updateGoalAmount = (type, newAmount) => {
    const valid = Math.max(10000, Number(newAmount) || 0);
    setSelectedGoals(selectedGoals.map(g => (g.type === type ? { ...g, targetAmount: valid } : g)));
  };

  const adjustGoalAmount = (type, delta) => {
    setSelectedGoals(selectedGoals.map(g => {
      if (g.type === type) {
        return { ...g, targetAmount: Math.max(50000, g.targetAmount + delta) };
      }
      return g;
    }));
  };

  const handleAddCustom = (name, target) => {
    const finalName = name.trim();
    const finalTarget = Number(target);
    if (!finalName || !finalTarget || finalTarget <= 0) return;

    setSelectedGoals([
      ...selectedGoals,
      {
        type: `custom_${Date.now()}`,
        icon: '🎯',
        label: finalName,
        targetAmount: finalTarget,
        inflationRate: 0.06,
      }
    ]);
    setCustomName('');
    setCustomTarget('');
    setCustomGoalOpen(false);
  };

  const removeGoal = (type) => {
    setSelectedGoals(selectedGoals.filter(g => g.type !== type));
  };

  const totalTarget = selectedGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  const handleBegin = () => {
    if (selectedGoals.length === 0) return;
    const goalsToStore = selectedGoals.map((g, i) =>
      createGoal(g.type, `${g.icon} ${g.label}`, g.targetAmount, g.inflationRate, 0, false)
    );
    setGoalsAction(goalsToStore);

    if (day1HealthInsurance) {
      useGameStore.getState().buyInsurance('health');
    }
    if (day1VehicleInsurance) {
      useGameStore.getState().buyInsurance('vehicle');
    }

    setScreen('game');
  };

  return (
    <div className="min-h-screen bg-surface-bg p-4 pb-32">
      <div className="max-w-md w-full mx-auto mt-4">
        {/* Header */}
        <div className="mb-5">
          <span className="text-[11px] font-bold text-accent-action-dark uppercase tracking-wider block mb-1">
            Step 2 of 2 · Financial Planning
          </span>
          <h2 className="text-2xl font-extrabold text-text-primary">
            Choose Your Life Goals
          </h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Select the milestones you want to achieve between ages 22 and 42. You can tweak targets or add custom dreams.
          </p>
        </div>

        {/* Selected Goals Summary Banner */}
        <div className="bg-white rounded-2xl p-3.5 mb-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
              Total Target Commitment
            </span>
            <span className="text-xl font-black text-text-primary">
              {formatCurrency(totalTarget)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-accent-action-dark bg-blue-50 px-2.5 py-1 rounded-full">
              {selectedGoals.length} {selectedGoals.length === 1 ? 'Goal' : 'Goals'} Chosen
            </span>
          </div>
        </div>

        {/* Predefined Goals List */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Primary Milestones (City Tier {cityTier})
          </h3>

          {PREDEFINED_TYPES.map(item => {
            const active = isSelected(item.type);
            const goalData = selectedGoals.find(g => g.type === item.type);
            const suggested = getSuggestedGoal(item.type, cityTier);

            return (
              <div
                key={item.type}
                className={`rounded-2xl transition-all duration-200 border-2 overflow-hidden ${
                  active
                    ? 'border-accent-action bg-white shadow-sm ring-2 ring-accent-action/20'
                    : 'border-transparent bg-white/70 hover:bg-white hover:border-gray-200'
                }`}
              >
                {/* Header Row (Clickable Checkbox) */}
                <div
                  onClick={() => togglePredefined(item)}
                  className="p-3.5 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{item.label}</h4>
                      <p className="text-[11px] text-text-muted">{item.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!active && (
                      <span className="text-xs text-text-muted font-medium">
                        ~{formatCurrency(suggested.suggestedAmount)}
                      </span>
                    )}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                        active
                          ? 'bg-accent-action border-accent-action text-white text-xs font-bold'
                          : 'border-gray-300'
                      }`}
                    >
                      {active ? '✓' : ''}
                    </div>
                  </div>
                </div>

                {/* Expanded Target Adjuster when selected */}
                {active && goalData && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-gray-100 bg-blue-50/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-text-muted">
                        Target Cost (Inflation ~{(goalData.inflationRate * 100).toFixed(0)}%/yr)
                      </span>
                      <span className="text-sm font-black text-text-primary">
                        {formatCurrency(goalData.targetAmount)}
                      </span>
                    </div>

                    {/* Quick increment/decrement buttons */}
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => adjustGoalAmount(item.type, -item.defaultStep)}
                        className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-text-muted hover:bg-gray-50 active:scale-95 transition"
                      >
                        -{formatCurrency(item.defaultStep)}
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustGoalAmount(item.type, item.defaultStep)}
                        className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-accent-action-dark hover:bg-blue-50 active:scale-95 transition"
                      >
                        +{formatCurrency(item.defaultStep)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Goals List */}
        {selectedGoals.filter(g => g.type.startsWith('custom_')).length > 0 && (
          <div className="mb-5 space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Custom Goals
            </h3>
            {selectedGoals
              .filter(g => g.type.startsWith('custom_'))
              .map(g => (
                <div
                  key={g.type}
                  className="p-3 bg-white rounded-xl border-2 border-accent-bonus flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">🎯</span>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{g.label}</h4>
                      <span className="text-[11px] font-extrabold text-accent-bonus-dark">
                        {formatCurrency(g.targetAmount)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeGoal(g.type)}
                    className="text-text-muted hover:text-red-500 text-xs px-2 py-1"
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Add Custom Goal Section */}
        {!customGoalOpen ? (
          <button
            type="button"
            onClick={() => setCustomGoalOpen(true)}
            className="w-full py-3.5 px-4 border-2 border-dashed border-gray-300 rounded-2xl text-center text-xs font-bold text-text-muted hover:border-gray-400 hover:text-text-primary transition bg-white/50"
          >
            + Add Custom Goal / Dream
          </button>
        ) : (
          <Card className="p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                New Custom Goal
              </h4>
              <button
                onClick={() => setCustomGoalOpen(false)}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                ✕ Close
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-3">
              <span className="text-[10px] text-text-muted block mb-1.5 font-medium">Quick Ideas:</span>
              <div className="flex flex-wrap gap-1.5">
                {CUSTOM_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddCustom(preset.name, preset.amount)}
                    className="text-[10px] bg-gray-100 hover:bg-blue-50 hover:text-accent-action-dark border border-gray-200 rounded-full px-2.5 py-1 transition"
                  >
                    {preset.icon} {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Fields */}
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-text-muted font-bold block mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. European Vacation"
                  className="w-full bg-surface-bg border border-gray-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-accent-action"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted font-bold block mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  placeholder="500000"
                  className="w-full bg-surface-bg border border-gray-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-accent-action"
                  value={customTarget}
                  onChange={e => setCustomTarget(e.target.value)}
                />
              </div>
              <div className="pt-2 flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 text-xs"
                  onClick={() => setCustomGoalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  disabled={!customName.trim() || !customTarget || Number(customTarget) <= 0}
                  onClick={() => handleAddCustom(customName, customTarget)}
                >
                  Add Dream
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Day 1 Risk Protection Opt-in */}
        <div className="mt-6 mb-4">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            Day 1 Risk Protection & Insurance
          </h3>
          <div className="space-y-2">
            <div
              onClick={() => setDay1HealthInsurance(!day1HealthInsurance)}
              className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                day1HealthInsurance
                  ? 'border-green-400 bg-green-50/40 shadow-sm'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">🏥</span>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Comprehensive Health Insurance</h4>
                  <span className="text-[10px] text-text-muted">₹750/mo · Protects liquid savings from Day 1 medical shocks</span>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${day1HealthInsurance ? 'bg-green-600 border-green-600 text-white text-xs font-bold' : 'border-gray-300'}`}>
                {day1HealthInsurance ? '✓' : ''}
              </div>
            </div>

            {player?.carOwned && (
              <div
                onClick={() => setDay1VehicleInsurance(!day1VehicleInsurance)}
                className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                  day1VehicleInsurance
                    ? 'border-green-400 bg-green-50/40 shadow-sm'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Mandatory Vehicle Insurance</h4>
                    <span className="text-[10px] text-text-muted">₹350/mo · 90% accident collision coverage for your car</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${day1VehicleInsurance ? 'bg-green-600 border-green-600 text-white text-xs font-bold' : 'border-gray-300'}`}>
                  {day1VehicleInsurance ? '✓' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            size="lg"
            className="rounded-full shadow-md"
            disabled={selectedGoals.length === 0}
            onClick={handleBegin}
          >
            {selectedGoals.length === 0
              ? 'Select at least 1 goal to proceed'
              : `Begin Life with ${selectedGoals.length} ${selectedGoals.length === 1 ? 'Goal' : 'Goals'} →`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalSetup;

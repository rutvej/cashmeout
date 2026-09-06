import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/data/initial-state';
import { processHealthAndConsequences, getConsequenceWarnings } from '../src/engine/health-engine';
import { EventScheduler } from '../src/events/event-scheduler';
import { getEventDefById } from '../src/events/event-pool';

describe('Doctor Warning & Card Repetition Safeguards', () => {
  it('triggers a doctor warning at 60% consequence threshold', () => {
    const state = createInitialState();
    state.player.consequenceMeters.cheapFoodDays = 11;
    state.player.lifestyle.foodTier = 'street';

    // Day tick brings cheapFoodDays to 12 (60% of 20)
    const result = processHealthAndConsequences(state, 5);

    expect(result.warning).toBeDefined();
    expect(result.warning?.meterKey).toBe('cheapFoodDays');
    expect(result.warning?.pct).toBe(60);
    expect(result.warning?.impendingCrisis).toBe('Acute Gastroenteritis');
    expect(result.warning?.expectedCost).toBe(3500);
  });

  it('getConsequenceWarnings returns active doctor warnings when meter >= 60%', () => {
    const state = createInitialState();
    state.player.consequenceMeters.noExerciseDays = 22; // > 60% of 35

    const warnings = getConsequenceWarnings(state);
    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings.some(w => w.meterKey === 'noExerciseDays')).toBe(true);
    expect(warnings[0].doctorName).toContain('Dr.');
  });

  it('generates an actionable Doctor Warning event card in the scheduler', () => {
    const state = createInitialState();
    const scheduler = new EventScheduler();

    const warningResult = {
      triggered: false,
      warning: {
        meterKey: 'cheapFoodDays' as const,
        title: 'Digestive Inflammation Warning (60% Risk)',
        doctorName: 'Dr. Nair (Gastroenterologist)',
        meterName: 'Street Food Strain',
        currentDays: 12,
        maxDays: 20,
        pct: 60,
        impendingCrisis: 'Acute Gastroenteritis',
        expectedCost: 3500,
        advice: 'Switch to mild home food or take prescribed probiotics now.'
      }
    };

    const cards = scheduler.generateCardsForDay(state, warningResult);
    const doctorCard = cards.find(c => c.defId === 'doctor-warning-cheapFoodDays');

    expect(doctorCard).toBeDefined();
    expect(doctorCard?.title).toContain('Doctor');

    // Follow doctor advice choice
    state.player.consequenceMeters.cheapFoodDays = 12;
    state.player.money = 5000;
    const choiceRes = scheduler.resolveCardChoice(doctorCard!, 'follow-advice', state);

    expect(state.player.consequenceMeters.cheapFoodDays).toBe(4); // 12 - 8 = 4 (Safe!)
    expect(state.player.money).toBe(4600); // 5000 - 400
    expect(choiceRes.outcomeText).toContain('doctor');
  });

  it('ensures annoying dilemmas like cracked screen and pipe leaks only occur once', () => {
    const crackedPhone = getEventDefById('dilemma-cracked-screen');
    const leakingPipe = getEventDefById('dilemma-leaking-pipe');

    expect(crackedPhone?.once).toBe(true);
    expect(leakingPipe?.once).toBe(true);
  });
});

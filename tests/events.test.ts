import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/data/initial-state';
import { EventScheduler } from '../src/events/event-scheduler';
import { ALL_EVENT_DEFS } from '../src/events/event-pool';

describe('Event System & Scheduler', () => {
  it('registers all event pools in the master catalog', () => {
    expect(ALL_EVENT_DEFS.length).toBeGreaterThanOrEqual(15);
  });

  it('generates welcome milestone and cards on Day 1', () => {
    const state = createInitialState();
    const scheduler = new EventScheduler();
    const cards = scheduler.generateCardsForDay(state);

    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(cards.some(c => c.category === 'milestone' || c.defId === 'milestone-day-1-welcome')).toBe(true);
  });

  it('correctly resolves card choices and applies consequences', () => {
    const state = createInitialState();
    const scheduler = new EventScheduler();
    const cards = scheduler.generateCardsForDay(state);
    const firstCard = cards[0];

    const choice = firstCard.choices[0];
    const result = scheduler.resolveCardChoice(firstCard, choice.id, state);

    expect(firstCard.resolved).toBe(true);
    expect(firstCard.selectedChoiceId).toBe(choice.id);
    expect(result.outcomeText).toBeTruthy();
    expect(state.player.eventLog[0].text).toContain(firstCard.title);
  });

  it('generates high-priority medical emergency cards when triggered', () => {
    const state = createInitialState();
    const scheduler = new EventScheduler();

    const emergency = {
      triggered: true,
      name: 'Acute Gastroenteritis',
      medicalBill: 3500,
      outOfPocketCost: 3500,
      description: 'Street food streak disaster.'
    };

    const cards = scheduler.generateCardsForDay(state, emergency);
    expect(cards.some(c => c.category === 'health' && c.title.includes('Acute Gastroenteritis'))).toBe(true);
  });
});

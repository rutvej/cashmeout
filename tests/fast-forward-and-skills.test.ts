import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/data/initial-state';
import { GameLoop } from '../src/engine/game-loop';
import { COURSES, ALL_JOBS } from '../src/data/static-data';
import { EventScheduler } from '../src/events/event-scheduler';
import { ActiveEventCard } from '../src/events/event-types';

describe('Fast-Forward & Education Career System', () => {
  it('simulates 7 days fast-forward and aggregates deltas', () => {
    const state = createInitialState();
    const gameLoop = new GameLoop(state);
    const startDay = state.player.currentDay;

    const report = gameLoop.simulateMultipleDays(7);

    expect(report.startDay).toBe(startDay);
    expect(report.endDay).toBe(startDay + 7);
    expect(report.daysAdvanced).toBe(7);
    expect(state.player.currentDay).toBe(startDay + 7);
    expect(typeof report.moneyDelta).toBe('number');
    expect(typeof report.netWorthDelta).toBe('number');
  });

  it('simulates 30 days (month skip) processing monthly pay cycle and rent', () => {
    const state = createInitialState();
    const gameLoop = new GameLoop(state);
    const startDay = state.player.currentDay;

    const report = gameLoop.simulateMultipleDays(30);

    expect(report.startDay).toBe(startDay);
    expect(report.endDay).toBe(startDay + 30);
    expect(report.daysAdvanced).toBe(30);
    expect(state.player.currentDay).toBe(startDay + 30);
    // Over 30 days, two paydays (day 15 and day 30) should have occurred
    const payEntries = state.player.eventLog.filter(e => e.text.includes('Payday: Received'));
    expect(payEntries.length).toBeGreaterThanOrEqual(2);
  });

  it('has comprehensive multi-tier courses linking directly to high-paying jobs', () => {
    expect(COURSES.length).toBeGreaterThanOrEqual(12);

    // Verify each course points to a valid job in ALL_JOBS
    for (const course of COURSES) {
      expect(course.track).toBeDefined();
      expect(course.tier).toBeGreaterThanOrEqual(1);
      expect(course.unlocksJobId).toBeDefined();
      expect(course.unlocksJobTitle).toBeDefined();

      const matchedJob = ALL_JOBS.find(j => j.id === course.unlocksJobId);
      expect(matchedJob).toBeDefined();
      expect(matchedJob!.title).toBe(course.unlocksJobTitle);
      expect(matchedJob!.salaryPerCycle).toBe(course.unlocksJobSalary);
      // High tier jobs pay substantially more (Tier 3 >= 24k, Tier 4 >= 60k)
      if (course.tier >= 3) {
        expect(matchedJob!.salaryPerCycle).toBeGreaterThanOrEqual(24000);
      }
      if (course.tier >= 4) {
        expect(matchedJob!.salaryPerCycle).toBeGreaterThanOrEqual(60000);
      }
    }
  });

  it('resolves certification event card to immediately promote player to new job', () => {
    const state = createInitialState();
    const scheduler = new EventScheduler();
    const course = COURSES.find(c => c.id === 'fin-cfa')!;
    const targetJob = ALL_JOBS.find(j => j.id === course.unlocksJobId)!;

    // Simulate cert card
    const certCard: ActiveEventCard = {
      instanceId: `card-cert-${course.id}-test`,
      defId: `cert-${course.id}`,
      category: 'milestone',
      title: `🎓 Certified: ${course.name}!`,
      emoji: '📜',
      narrative: `You passed CFA Charter!`,
      day: state.player.currentDay,
      choices: [
        { id: 'switch-now', label: 'Accept Offer' },
        { id: 'keep-current', label: 'Decline' }
      ],
      resolved: false
    };

    const result = scheduler.resolveCardChoice(certCard, 'switch-now', state);

    expect(certCard.resolved).toBe(true);
    expect(state.player.job.id).toBe(targetJob.id);
    expect(state.player.job.title).toBe(targetJob.title);
    expect(state.player.job.salaryPerCycle).toBe(targetJob.salaryPerCycle);
    expect(result.outcomeText).toContain('Hedge Fund Portfolio Manager');
  });

  it('validates progression requirements for top-tier executive positions', () => {
    const ceoJob = ALL_JOBS.find(j => j.id === 'chief-executive-officer')!;
    expect(ceoJob).toBeDefined();
    expect(ceoJob.requiredMinNetWorth).toBe(500000);
    expect(ceoJob.requiredCourse).toBe('board-leadership');
    expect(ceoJob.salaryPerCycle).toBe(140000);
  });
});

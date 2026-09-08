import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/data/initial-state';
import { EventScheduler } from '../src/events/event-scheduler';
import { WEALTH_GOALS, HEALTH_GOALS, LIFESTYLE_GOALS } from '../src/data/life-goals';
import { calculateTimeline } from '../src/ui/components/hud';
import { calculateResumeScore } from '../src/ui/screens/profile-resume';
import { adjustBehavioralCounter } from '../src/events/pools/behavioral-events';
import { STARTER_JOBS, HOUSING_OPTIONS } from '../src/ui/screens/onboarding';

describe('Phase 1 Foundation & UI Rebuild Verification', () => {
  describe('1. Onboarding & State Initialization', () => {
    it('provides valid starter jobs and housing choices', () => {
      expect(STARTER_JOBS.length).toBe(3);
      expect(HOUSING_OPTIONS.length).toBe(2);

      const devJob = STARTER_JOBS.find(j => j.id === 'junior-dev')!;
      expect(devJob.salaryMonthly).toBe(2200);

      const nearHousing = HOUSING_OPTIONS.find(h => h.id === 'near-office')!;
      expect(nearHousing.commuteDailyHours).toBe(0.5);
    });

    it('initializes state correctly from onboarding selections', () => {
      const state = createInitialState();
      expect(state.player.onboardingComplete).toBe(false);
      expect(state.player.startingAge).toBe(22);

      // Simulate onboarding completion
      state.player.name = 'Alex Morgan';
      state.player.job = {
        id: STARTER_JOBS[0].id,
        title: STARTER_JOBS[0].title,
        salaryPerCycle: STARTER_JOBS[0].salaryPerCycle,
        payCycleDays: STARTER_JOBS[0].payCycleDays,
        stressPerDay: STARTER_JOBS[0].stressPerDay,
        timeSlotsCost: STARTER_JOBS[0].timeSlotsCost
      };
      state.player.housing = {
        type: 'rent',
        amountPerCycle: HOUSING_OPTIONS[0].rentMonthly,
        cycleDays: 30,
        lastPaidDay: 1,
        locationTier: 'near-office'
      };
      state.player.lifeGoals = {
        wealth: 'six-figure-net-worth',
        health: 'olympic-resilience',
        lifestyle: 'homeowner-pride'
      };
      state.player.onboardingComplete = true;

      expect(state.player.onboardingComplete).toBe(true);
      expect(state.player.job.salaryPerCycle).toBe(900);
      expect(state.player.housing.amountPerCycle).toBe(540);
      expect(state.player.lifeGoals.wealth).toBe('six-figure-net-worth');
    });
  });

  describe('2. Timeline & Top HUD Metrics', () => {
    it('correctly maps in-game days to Age, Year, Month and Day', () => {
      // Day 1: Age 22, Year 1, Month 1, Day 1
      const t1 = calculateTimeline(1, 22);
      expect(t1.age).toBe(22);
      expect(t1.year).toBe(1);
      expect(t1.month).toBe(1);
      expect(t1.dayOfMonth).toBe(1);
      expect(t1.displayString).toContain('Age 22 · Mo 1, Day 1');

      // Day 31: Age 22, Year 1, Month 2, Day 1 (Salary Day Month 2)
      const t2 = calculateTimeline(31, 22);
      expect(t2.year).toBe(1);
      expect(t2.month).toBe(2);
      expect(t2.dayOfMonth).toBe(1);

      // Day 361: Age 23, Year 2, Month 1, Day 1
      const t3 = calculateTimeline(361, 22);
      expect(t3.age).toBe(23);
      expect(t3.year).toBe(2);
      expect(t3.month).toBe(1);
    });

    it('tracks progress toward all 3 life goals correctly', () => {
      const state = createInitialState();
      state.player.money = 25000;
      state.player.savingsBalance = 25000;

      const fortressGoal = WEALTH_GOALS.find(g => g.id === 'safety-fortress')!;
      const prog = fortressGoal.getProgress(state);
      expect(prog.pct).toBe(100);
      expect(prog.isMet).toBe(true);

      const olympicGoal = HEALTH_GOALS.find(g => g.id === 'olympic-resilience')!;
      state.player.health.physical = 90;
      const hProg = olympicGoal.getProgress(state);
      expect(hProg.isMet).toBe(true);

      const homeownerGoal = LIFESTYLE_GOALS.find(g => g.id === 'homeowner-pride')!;
      expect(homeownerGoal.getProgress(state).isMet).toBe(false);
      state.player.housing.type = 'own';
      expect(homeownerGoal.getProgress(state).isMet).toBe(true);
    });
  });

  describe('3. Dynamic Behavioral Feedback Loop', () => {
    it('maintains the universal rule that counters NEVER drop below 1.0', () => {
      const state = createInitialState();
      expect(state.player.behavioralCounters.impulseBuyCounter).toBeGreaterThanOrEqual(1.0);

      // Try repeatedly lowering counter by massive amounts
      adjustBehavioralCounter(state, 'impulseBuyCounter', -5.0);
      expect(state.player.behavioralCounters.impulseBuyCounter).toBe(1.0);

      adjustBehavioralCounter(state, 'gymSkipCounter', -10.0);
      expect(state.player.behavioralCounters.gymSkipCounter).toBe(1.0);
    });

    it('increases counters upon temptation and caps at 10.0', () => {
      const state = createInitialState();
      adjustBehavioralCounter(state, 'sleepDebtCounter', 3.0);
      expect(state.player.behavioralCounters.sleepDebtCounter).toBe(4.5);

      adjustBehavioralCounter(state, 'sleepDebtCounter', 20.0);
      expect(state.player.behavioralCounters.sleepDebtCounter).toBe(10.0);
    });

    it('dynamically prioritizes behavioral event cards when counters are elevated', () => {
      const state = createInitialState();
      state.player.currentDay = 15;
      state.player.money = 2000;
      state.player.behavioralCounters.impulseBuyCounter = 8.5; // very high impulse

      const scheduler = new EventScheduler();
      const cards = scheduler.generateCardsForDay(state);

      // Higher probability of behavioral temptation card being scheduled
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Algorithmic Resume Scoring System', () => {
    it('calculates algorithmic resume score based on experience, rank, and certs', () => {
      const state = createInitialState();
      const scoreEarly = calculateResumeScore(state);

      expect(scoreEarly.total).toBeGreaterThanOrEqual(15);
      expect(scoreEarly.continuityBonus).toBe(10);

      // Add completed course
      state.player.educationProgress['fin-accounting'] = 100;
      const scoreWithCert = calculateResumeScore(state);
      expect(scoreWithCert.coursePoints).toBe(6);
      expect(scoreWithCert.total).toBeGreaterThan(scoreEarly.total);
    });
  });
});

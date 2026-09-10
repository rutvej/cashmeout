import { describe, it, expect } from 'vitest';
import { calculateIncomeTax, computeMonthlyCashflow } from '../src/engine/economy';
import { HEALTH_INSURANCE_TIERS } from '../src/data/insurance';
import { getCreditTierInfo, adjustCreditScore } from '../src/engine/credit';
import { calculateResumeScore } from '../src/engine/resume';
import { getMacroEconomicEra } from '../src/engine/market';
import { createInitialState } from '../src/data/initial-state';
import { clampCounter, calculateEventProbability, adjustHabitCounter } from '../src/engine/behavioral';
import { getTimelineInfo } from '../src/engine/time';
import { LIFE_GOALS, calculateTotalNetWorth } from '../src/data/life-goals';

describe('Specs vs Code Alignment Verification', () => {
  describe('Spec 07: Progressive Income Tax Brackets', () => {
    it('applies 0% on income <= $15,000', () => {
      expect(calculateIncomeTax(12000)).toBe(0);
      expect(calculateIncomeTax(15000)).toBe(0);
    });

    it('applies 10% marginal tax on income between $15,001 and $35,000', () => {
      expect(calculateIncomeTax(25000)).toBe(1000);
      expect(calculateIncomeTax(35000)).toBe(2000);
    });

    it('matches exact canonical example: $45,000 income yields $4,000 tax', () => {
      // Per Spec 07 Section 2:
      // $15,000 @ 0% = $0
      // $20,000 @ 10% = $2,000
      // $10,000 @ 20% = $2,000
      // Total = $4,000
      expect(calculateIncomeTax(45000)).toBe(4000);
    });

    it('applies 30% on income above $65,000', () => {
      expect(calculateIncomeTax(85000)).toBe(14000);
    });
  });

  describe('Spec 07: Health Insurance Plans & Deductibles', () => {
    it('defines Bronze, Silver, and Gold tiers with proper deductibles and caps', () => {
      const none = HEALTH_INSURANCE_TIERS.find(t => t.tier === 'none')!;
      const bronze = HEALTH_INSURANCE_TIERS.find(t => t.tier === 'basic')!;
      const silver = HEALTH_INSURANCE_TIERS.find(t => t.tier === 'standard')!;
      const gold = HEALTH_INSURANCE_TIERS.find(t => t.tier === 'premium')!;

      expect(none.monthlyPremium).toBe(0);
      expect(none.coveragePct).toBe(0.0);

      expect(bronze.monthlyPremium).toBe(50);
      expect(bronze.coveragePct).toBe(0.5);
      expect(bronze.deductible).toBe(500);
      expect(bronze.maxOutOfPocket).toBe(5000);

      expect(silver.monthlyPremium).toBe(120);
      expect(silver.coveragePct).toBe(0.8);
      expect(silver.deductible).toBe(250);
      expect(silver.maxOutOfPocket).toBe(2500);

      expect(gold.monthlyPremium).toBe(250);
      expect(gold.coveragePct).toBe(0.95);
      expect(gold.deductible).toBe(0);
      expect(gold.maxOutOfPocket).toBe(1000);
    });
  });

  describe('Spec 07: Credit Scoring Engine', () => {
    it('correctly classifies score tiers and loan eligibility', () => {
      expect(getCreditTierInfo(800).tier).toBe('prime');
      expect(getCreditTierInfo(800).mortgageAPR).toBe(0.048);

      expect(getCreditTierInfo(720).tier).toBe('good');
      expect(getCreditTierInfo(720).mortgageAPR).toBe(0.055);

      expect(getCreditTierInfo(640).tier).toBe('fair');
      expect(getCreditTierInfo(640).mortgageAPR).toBe(0.072);

      expect(getCreditTierInfo(500).tier).toBe('impaired');
      expect(getCreditTierInfo(500).mortgageEligible).toBe(false);
    });

    it('clamps adjusted score between 350 and 850', () => {
      expect(adjustCreditScore(840, 30)).toBe(850);
      expect(adjustCreditScore(360, -50)).toBe(350);
    });
  });

  describe('Spec 08: Dynamic Behavioral Counters', () => {
    it('never allows counters to drop below 1.0', () => {
      expect(clampCounter(0.5)).toBe(1.0);
      expect(clampCounter(-2.0)).toBe(1.0);
      expect(clampCounter(7.5)).toBe(7.5);
      expect(clampCounter(12.0)).toBe(10.0);

      const counters = createInitialState().behavioral;
      adjustHabitCounter(counters, 'impulseBuyCounter', -5.0);
      expect(counters.impulseBuyCounter).toBe(1.0);
    });

    it('calculates event probability formula P = base + (counter * 0.075)', () => {
      // Counter = 1.0, base = 0.05 -> 0.05 + 0.075 = 0.125
      expect(calculateEventProbability(0.05, 1.0)).toBeCloseTo(0.125, 3);
      // Counter = 6.0, base = 0.05 -> 0.05 + 0.45 = 0.50
      expect(calculateEventProbability(0.05, 6.0)).toBeCloseTo(0.50, 3);
    });
  });

  describe('Spec 13: Algorithmic Resume Score Formula', () => {
    it('scores entry-level candidate accurately', () => {
      const state = createInitialState();
      const resume = calculateResumeScore(state);
      expect(resume.totalScore).toBeGreaterThanOrEqual(15);
      expect(resume.totalScore).toBeLessThanOrEqual(35);
      expect(resume.expPoints).toBeLessThanOrEqual(25);
      expect(resume.coursePoints).toBe(0);
    });

    it('increases score with courses, seniority, and experience', () => {
      const state = createInitialState();
      state.career.yearsOfExperience = 5.0; // 5 * 2.5 = 12.5 -> 13 pts
      state.career.completedCourseIds = ['c1', 'c2', 'c3']; // 3 * 6 = 18 pts
      if (state.career.currentJob) {
        state.career.currentJob.salaryMonthly = 8500; // Manager tier (20 pts)
      }
      const resume = calculateResumeScore(state);
      expect(resume.totalScore).toBeGreaterThanOrEqual(60);
      expect(resume.tierLabel).toBe('Senior Professional');
      expect(resume.negotiationBonusPct).toBe(12);
    });
  });

  describe('Spec 14: Emergency Fund Buffer Spectrum', () => {
    it('accurately evaluates emergency fund coverage tiers', () => {
      const state = createInitialState();
      const cf = computeMonthlyCashflow(state);
      expect(cf.emergencyFundMonths).toBeGreaterThan(0);
      expect(['critical', 'vulnerable', 'stable', 'fortress']).toContain(cf.emergencyTier);
    });
  });

  describe('Spec 10: Life Goals & Year 10 Evaluation', () => {
    it('evaluates goals and net worth correctly', () => {
      const state = createInitialState();
      const netWorth = calculateTotalNetWorth(state);
      expect(typeof netWorth).toBe('number');

      const sixFigureGoal = LIFE_GOALS.find(g => g.id === 'six-figure-net-worth')!;
      expect(sixFigureGoal.checkCompletion(state)).toBe(false);

      state.resources.cashOnHand = 150000;
      expect(sixFigureGoal.checkCompletion(state)).toBe(true);
    });
  });

  describe('Timeline Engine & 10-Year Macro Eras', () => {
    it('maps in-game days to Year, Month, Age, and Salary Day', () => {
      const day1 = getTimelineInfo(1, 22);
      expect(day1.age).toBe(22);
      expect(day1.year).toBe(1);
      expect(day1.month).toBe(1);
      expect(day1.dayInMonth).toBe(1);
      expect(day1.isSalaryDay).toBe(true);

      const day3650 = getTimelineInfo(3650, 22);
      expect(day3650.isGameComplete).toBe(true);
      expect(day3650.year).toBe(10);
    });

    it('cycles through macroeconomic eras per Spec 04 & 12', () => {
      expect(getMacroEconomicEra(12)).toBe('BULL_RUN');
      expect(getMacroEconomicEra(40)).toBe('PEAK');
      expect(getMacroEconomicEra(60)).toBe('RECESSION');
      expect(getMacroEconomicEra(80)).toBe('RECOVERY');
      expect(getMacroEconomicEra(100)).toBe('SUPER_BULL');
    });
  });
});

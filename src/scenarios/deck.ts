import { GameState, ScenarioCard } from '../types/game';
import { adjustHabitCounter } from '../engine/behavioral';
import { adjustCreditScore } from '../engine/credit';
import { HEALTH_INSURANCE_TIERS } from '../data/insurance';

export const SCENARIO_DECK: ScenarioCard[] = [
  // ─── 1. CAREER SCENARIOS ─────────────────────────────────────
  {
    id: 'car-urgent-crunch',
    category: 'career',
    title: 'High-Stakes Midnight Deliverable',
    description: 'A major client pushed up the launch deadline to tomorrow morning. Your director asks for 4 hours of overtime tonight.',
    condition: (s) => s.career.currentJob !== null,
    choices: [
      {
        id: 'crunch-accept',
        label: 'Grind Through Midnight',
        description: 'Stay until 1 AM. Boost appraisal standing, but sacrifice sleep and workout.',
        immediateImpactPreview: '-15 Energy, +2.0 Late-Night Habit, +5 Job Rating',
        apply: (s) => {
          s.resources.energy = Math.max(0, s.resources.energy - 15);
          s.resources.mentalHealth = Math.max(0, s.resources.mentalHealth - 6);
          adjustHabitCounter(s.behavioral, 'lateNightWorkCounter', 2.0);
          adjustHabitCounter(s.behavioral, 'sleepDebtCounter', 1.5);
          if (s.career.currentJob) s.career.currentJob.performanceRating = Math.min(5, s.career.currentJob.performanceRating + 0.4);
          return { outcomeText: 'Your boss personally thanked you. Deliverable met on time.', notificationType: 'positive' };
        }
      },
      {
        id: 'crunch-decline',
        label: 'Enforce Work-Life Boundaries',
        description: 'Log off at standard hours. Protect your sleep and mental sanity.',
        immediateImpactPreview: '+5 Mental Health, -0.5 Job Rating, -1.0 Late-Night',
        apply: (s) => {
          s.resources.mentalHealth = Math.min(100, s.resources.mentalHealth + 5);
          adjustHabitCounter(s.behavioral, 'lateNightWorkCounter', -1.0);
          if (s.career.currentJob) s.career.currentJob.performanceRating = Math.max(1, s.career.currentJob.performanceRating - 0.3);
          return { outcomeText: 'You logged off at 6 PM. Management noted your lack of overtime flexibility.', notificationType: 'warning' };
        }
      }
    ]
  },
  {
    id: 'car-recruiter-inbound',
    category: 'career',
    title: 'Headhunter Inbound Inquiry',
    description: 'An executive headhunter on LinkedIn reached out with an interview opportunity offering a 25% salary bump.',
    condition: (s) => s.career.currentJob !== null && s.career.yearsOfExperience >= 1,
    choices: [
      {
        id: 'recruiter-interview',
        label: 'Take the Interview',
        description: 'Spend an afternoon preparing and interviewing.',
        immediateImpactPreview: '-5 Energy, Potential +25% Salary Offer',
        apply: (s) => {
          s.resources.energy = Math.max(0, s.resources.energy - 5);
          if (s.career.currentJob) {
            const newSal = Math.round(s.career.currentJob.salaryMonthly * 1.25);
            s.career.currentJob.salaryMonthly = newSal;
            return { outcomeText: `Interview aced! Promoted to a new role with base comp $${newSal}/mo.`, notificationType: 'positive' };
          }
          return { outcomeText: 'Interview completed successfully.', notificationType: 'info' };
        }
      },
      {
        id: 'recruiter-pass',
        label: 'Politely Decline',
        description: 'Stay loyal to your current roadmap and avoid switching disruption.',
        immediateImpactPreview: 'No change to role or stress',
        apply: () => {
          return { outcomeText: 'You thanked the recruiter and stayed the course at your current firm.', notificationType: 'info' };
        }
      }
    ]
  },

  // ─── 2. FINANCIAL SCENARIOS ──────────────────────────────────
  {
    id: 'fin-tax-refund',
    category: 'financial',
    title: 'Unexpected Statutory Tax Refund',
    description: 'The internal revenue service processed your prior year withholding reconciliation: you received a $1,200 direct deposit refund.',
    condition: (s) => s.resources.currentYearTaxableIncome > 5000,
    choices: [
      {
        id: 'refund-save',
        label: 'Bolster Emergency Buffer ($1,200)',
        description: 'Transfer 100% of the windfall to your high-yield cash reserves.',
        immediateImpactPreview: '+$1,200 Emergency Fund, +5 Mental Peace',
        apply: (s) => {
          s.resources.emergencyFund += 1200;
          s.resources.mentalHealth = Math.min(100, s.resources.mentalHealth + 5);
          return { outcomeText: 'Buffer fortified! Liquid cash safety increased significantly.', notificationType: 'positive' };
        }
      },
      {
        id: 'refund-splurge',
        label: 'Splurge on Designer Wardrobe & Dinner',
        description: 'Reward yourself with luxury shopping and fine dining.',
        immediateImpactPreview: '+$10 Mental, -$1,200 Cash, +2.0 Impulse Buy',
        apply: (s) => {
          s.resources.mentalHealth = Math.min(100, s.resources.mentalHealth + 10);
          adjustHabitCounter(s.behavioral, 'impulseBuyCounter', 2.0);
          adjustHabitCounter(s.behavioral, 'lifestyleCreepCounter', 1.5);
          return { outcomeText: 'You bought high-end designer gear. Temporary dopamine boost achieved!', notificationType: 'info' };
        }
      }
    ]
  },
  {
    id: 'fin-car-breakdown',
    category: 'financial',
    title: 'Vehicle Radiator & Brake Failure',
    description: 'Smoke poured from under the hood during morning rush hour. Mechanic quotes $850 for repairs.',
    condition: (s) => s.insurance.hasVehicleInsurance || s.resources.dailySchedule.commuteHours >= 1,
    choices: [
      {
        id: 'car-repair-cash',
        label: 'Pay Cash ($850)',
        description: 'Draw directly from checking or liquid emergency reserves.',
        immediateImpactPreview: '-$850 Cash, Zero Debt Incurred',
        apply: (s) => {
          if (s.resources.cashOnHand >= 850) {
            s.resources.cashOnHand -= 850;
          } else {
            const shortfall = 850 - s.resources.cashOnHand;
            s.resources.cashOnHand = 0;
            s.resources.emergencyFund = Math.max(0, s.resources.emergencyFund - shortfall);
          }
          return { outcomeText: 'Car repaired and safely back on the road.', notificationType: 'info' };
        }
      },
      {
        id: 'car-repair-credit',
        label: 'Put on 24% APR Credit Card',
        description: 'Finance repair over 6 months to preserve cash in checking.',
        immediateImpactPreview: '-$160/mo EMI for 6 Months, -10 Credit Score',
        apply: (s) => {
          s.liabilities.loans.push({
            id: `card-${Date.now()}`,
            name: 'Credit Card (Emergency Auto Repair)',
            principal: 850,
            balance: 850,
            annualInterestRate: 0.24,
            monthlyEMI: 160,
            remainingMonths: 6
          });
          adjustCreditScore(s.resources.creditScore, -10);
          return { outcomeText: 'Repairs financed at high interest. Monthly cashflow tightened.', notificationType: 'warning' };
        }
      }
    ]
  },

  // ─── 3. HEALTH SCENARIOS ─────────────────────────────────────
  {
    id: 'hea-gym-slump',
    category: 'health',
    title: 'Winter Sluggishness & Gym Inertia',
    description: 'It is 6:30 AM, cold and raining. The bed is warm, and your alarm is ringing for gym session #4 of the week.',
    choices: [
      {
        id: 'gym-force',
        label: 'Lace Up & Hit the Weights',
        description: 'Push through the resistance. Maintain your training discipline.',
        immediateImpactPreview: '+2 Physical, +3 Energy, -1.0 Gym Skip Habit',
        apply: (s) => {
          s.resources.physicalHealth = Math.min(100, s.resources.physicalHealth + 2);
          s.resources.energy = Math.min(100, s.resources.energy + 3);
          s.simulation.lifetimeGymSessions += 1;
          adjustHabitCounter(s.behavioral, 'gymSkipCounter', -1.0);
          return { outcomeText: 'Great lifting session! Endorphins rushing for the day.', notificationType: 'positive' };
        }
      },
      {
        id: 'gym-sleepin',
        label: 'Hit Snooze for 90 Minutes',
        description: 'Sleep in and skip the workout for today.',
        immediateImpactPreview: '+1.5 Gym Skip Counter, +5 Sleep Recovery',
        apply: (s) => {
          s.resources.energy = Math.min(100, s.resources.energy + 5);
          adjustHabitCounter(s.behavioral, 'gymSkipCounter', 1.5);
          return { outcomeText: 'You slept in. Feeling rested, but physical inertia grew.', notificationType: 'info' };
        }
      }
    ]
  },
  {
    id: 'hea-acute-illness',
    category: 'health',
    title: 'Severe Bacterial Throat Infection',
    description: 'High fever and severe inflammation strike. You cannot speak or focus on work.',
    choices: [
      {
        id: 'illness-doctor',
        label: 'Visit Urgent Care Clinic',
        description: 'Consult doctor, get prescription antibiotics, and take 2 days off.',
        immediateImpactPreview: 'Cost buffered by Insurance, +15 Health Recovery',
        apply: (s) => {
          const plan = HEALTH_INSURANCE_TIERS.find(t => t.tier === s.insurance.healthInsuranceTier)!;
          const grossBill = 350;
          const outOfPocket = plan.tier === 'none' ? grossBill : Math.min(plan.maxOutOfPocket, Math.round(plan.deductible + (grossBill - plan.deductible) * (1 - plan.coveragePct)));
          s.resources.cashOnHand = Math.max(0, s.resources.cashOnHand - outOfPocket);
          s.resources.physicalHealth = Math.min(100, s.resources.physicalHealth + 15);
          return { outcomeText: `Doctor prescribed medication. Out-of-pocket: $${outOfPocket} (Plan: ${plan.name}).`, notificationType: 'info' };
        }
      },
      {
        id: 'illness-tough',
        label: 'Power Through Without Medicine',
        description: 'Drink hot tea and attempt to work through the fever.',
        immediateImpactPreview: '-15 Physical Health, -20 Energy',
        apply: (s) => {
          s.resources.physicalHealth = Math.max(0, s.resources.physicalHealth - 15);
          s.resources.energy = Math.max(0, s.resources.energy - 20);
          return { outcomeText: 'The infection worsened. You lost days of productive focus.', notificationType: 'negative' };
        }
      }
    ]
  },

  // ─── 4. MARKET SCENARIOS ─────────────────────────────────────
  {
    id: 'mkt-crash-dip',
    category: 'market',
    title: 'Macro Market Panic: 25% Correction',
    description: 'Inflation spikes trigger a global equity selloff. Tech stocks plunge 25% in a single week.',
    choices: [
      {
        id: 'market-buy-dip',
        label: 'Buy the Blood ($1,500 Lump Sum)',
        description: 'Inject liquid reserves into discounted broad market index funds.',
        immediateImpactPreview: '-$1,500 Cash, Buy Discounted Equities, +Financial IQ',
        apply: (s) => {
          if (s.resources.cashOnHand >= 1500) {
            s.resources.cashOnHand -= 1500;
            const fund = s.investments.mutualFundUnits['fund-broad'] || { units: 0, investedAmount: 0 };
            fund.investedAmount += 1500;
            fund.units += 18; // discounted units
            s.investments.mutualFundUnits['fund-broad'] = fund;
            return { outcomeText: 'Disciplined contrarian move! Acquired 18 discounted index units.', notificationType: 'positive' };
          }
          return { outcomeText: 'Insufficient liquid cash to buy the dip.', notificationType: 'warning' };
        }
      },
      {
        id: 'market-stay-course',
        label: 'Stay the Course (Keep SIP Active)',
        description: 'Ignore daily market hysteria and maintain automatic dollar-cost averaging.',
        immediateImpactPreview: 'No extra cash spent, SIP auto-buys dip',
        apply: () => {
          return { outcomeText: 'Steady hands. You ignored market panic and let compounding work.', notificationType: 'positive' };
        }
      },
      {
        id: 'market-panic-sell',
        label: 'Panic Sell Equities to Cash',
        description: 'Liquidate stock holdings to protect nominal dollars.',
        immediateImpactPreview: 'Lock in 25% Loss, +2.0 Panic Counter',
        apply: (s) => {
          let liquidated = 0;
          for (const [_, holding] of Object.entries(s.investments.stocksOwned)) {
            liquidated += holding.shares * holding.averageCost * 0.75;
          }
          s.investments.stocksOwned = {};
          s.resources.cashOnHand += Math.round(liquidated);
          adjustHabitCounter(s.behavioral, 'cryptoFomoCounter', 2.0);
          return { outcomeText: `Liquidated equities at a 25% loss for $${Math.round(liquidated)} cash.`, notificationType: 'negative' };
        }
      }
    ]
  },
  {
    id: 'mkt-crypto-fomo',
    category: 'market',
    title: 'Meme Coin Moonshot Mania',
    description: 'Your college group chat is buzzing: "MoonDoge coin jumped 400% in 48 hours!" Coworkers are bragging about overnight wins.',
    condition: (s) => s.behavioral.cryptoFomoCounter >= 2.0,
    choices: [
      {
        id: 'fomo-gamble',
        label: 'Ape In With $1,000 Speculation',
        description: 'Buy MOON tokens at the top of the hype cycle.',
        immediateImpactPreview: '-$1,000 Cash, High Risk, +3.0 FOMO Counter',
        apply: (s) => {
          if (s.resources.cashOnHand >= 1000) {
            s.resources.cashOnHand -= 1000;
            adjustHabitCounter(s.behavioral, 'cryptoFomoCounter', 3.0);
            const luck = Math.random();
            if (luck > 0.65) {
              s.resources.cashOnHand += 2200;
              return { outcomeText: 'Crazy gamble paid off! You doubled your money to $2,200.', notificationType: 'positive' };
            } else {
              return { outcomeText: 'Whales dumped! Token plummeted 80% within 24 hours.', notificationType: 'negative' };
            }
          }
          return { outcomeText: 'Insufficient cash to chase the hype.', notificationType: 'warning' };
        }
      },
      {
        id: 'fomo-mute',
        label: 'Mute Group Chat & Focus on Work',
        description: 'Reject speculative gambling. Stay committed to cashflow assets.',
        immediateImpactPreview: '-1.0 FOMO Counter, +5 Mental Discipline',
        apply: (s) => {
          adjustHabitCounter(s.behavioral, 'cryptoFomoCounter', -1.0);
          s.resources.mentalHealth = Math.min(100, s.resources.mentalHealth + 5);
          return { outcomeText: 'Discipline maintained. You avoided the pump-and-dump trap.', notificationType: 'positive' };
        }
      }
    ]
  },

  // ─── 5. LIFE & RELATIONSHIP SCENARIOS ────────────────────────
  {
    id: 'lfe-friend-wedding',
    category: 'life',
    title: 'Best Friend Destination Wedding',
    description: 'Your close childhood friend is getting married in Bali. Flights, hotel, and tuxedo rental total $1,400.',
    choices: [
      {
        id: 'wedding-attend',
        label: 'Book Flights & Attend ($1,400)',
        description: 'Celebrate your friend, create lifelong memories, and recharge.',
        immediateImpactPreview: '-$1,400 Cash, +25 Mental Health, +10 Happiness',
        apply: (s) => {
          s.resources.cashOnHand = Math.max(0, s.resources.cashOnHand - 1400);
          s.resources.mentalHealth = Math.min(100, s.resources.mentalHealth + 25);
          s.resources.energy = Math.min(100, s.resources.energy + 10);
          return { outcomeText: 'Unforgettable weekend celebrating with old friends in paradise.', notificationType: 'positive' };
        }
      },
      {
        id: 'wedding-gift',
        label: 'Send Meaningful Gift ($200) & Skip',
        description: 'Prioritize financial discipline and current career commitments.',
        immediateImpactPreview: '-$200 Cash, -5 Mental Health',
        apply: (s) => {
          s.resources.cashOnHand = Math.max(0, s.resources.cashOnHand - 200);
          s.resources.mentalHealth = Math.max(0, s.resources.mentalHealth - 5);
          return { outcomeText: 'You sent a thoughtful registry gift and saved $1,200.', notificationType: 'info' };
        }
      }
    ]
  },

  // ─── 6. BEHAVIORAL SCENARIOS ─────────────────────────────────
  {
    id: 'beh-gadget-sale',
    category: 'behavioral',
    title: 'Flash Gadget Sale: Flagship Tech Upgrade',
    description: 'Targeted ads show the latest ultra-sleek OLED laptop at a 30% discount for today only ($1,500).',
    condition: (s) => s.behavioral.impulseBuyCounter >= 1.5,
    choices: [
      {
        id: 'gadget-buy',
        label: 'Click "1-Click Buy Now" ($1,500)',
        description: 'Satisfy immediate urge with premium electronics.',
        immediateImpactPreview: '-$1,500 Cash, +2.0 Impulse Counter, +1.5 Lifestyle Creep',
        apply: (s) => {
          s.resources.cashOnHand = Math.max(0, s.resources.cashOnHand - 1500);
          adjustHabitCounter(s.behavioral, 'impulseBuyCounter', 2.0);
          adjustHabitCounter(s.behavioral, 'lifestyleCreepCounter', 1.5);
          return { outcomeText: 'Shiny new device arrived! Bank account took a $1,500 hit.', notificationType: 'info' };
        }
      },
      {
        id: 'gadget-pass',
        label: 'Close Browser & Wait 72 Hours',
        description: 'Apply the 72-hour cooling-off rule on major discretionary purchases.',
        immediateImpactPreview: '-1.0 Impulse Counter, +5 Discipline',
        apply: (s) => {
          adjustHabitCounter(s.behavioral, 'impulseBuyCounter', -1.0);
          return { outcomeText: 'Urge passed. You kept $1,500 working in your investments.', notificationType: 'positive' };
        }
      }
    ]
  },

  // ─── 7. EMERGENCY CRISIS SCENARIOS ───────────────────────────
  {
    id: 'emg-medical-shock',
    category: 'emergency',
    title: 'Acute Emergency Surgery (Appendectomy)',
    description: 'Sudden intense abdominal pain sent you to the emergency room for an urgent laparoscopic appendectomy ($8,400 bill).',
    choices: [
      {
        id: 'emg-surgery-insurance',
        label: 'File Health Insurance Claim',
        description: 'Let insurance coverage handle the majority of the hospital bill.',
        immediateImpactPreview: 'Cost capped by Plan Deductible & Co-pay',
        apply: (s) => {
          const plan = HEALTH_INSURANCE_TIERS.find(t => t.tier === s.insurance.healthInsuranceTier)!;
          const gross = 8400;
          let patientCost = 0;
          if (plan.tier === 'none') {
            patientCost = gross;
          } else {
            patientCost = Math.min(plan.maxOutOfPocket, Math.round(plan.deductible + (gross - plan.deductible) * (1 - plan.coveragePct)));
          }

          if (s.resources.cashOnHand >= patientCost) {
            s.resources.cashOnHand -= patientCost;
          } else if (s.resources.emergencyFund >= patientCost) {
            s.resources.emergencyFund -= patientCost;
          } else {
            // Unfunded crisis: triggers forced high-APR loan (Spec 07 & 14)
            const shortfall = patientCost - (s.resources.cashOnHand + s.resources.emergencyFund);
            s.resources.cashOnHand = 0;
            s.resources.emergencyFund = 0;
            s.liabilities.loans.push({
              id: `med-loan-${Date.now()}`,
              name: 'Emergency Medical Loan',
              principal: shortfall,
              balance: shortfall,
              annualInterestRate: 0.22,
              monthlyEMI: Math.round(shortfall * 0.10),
              remainingMonths: 14
            });
            adjustCreditScore(s.resources.creditScore, -45);
            s.simulation.emergencyFundSpiralActive = true;
          }

          s.resources.physicalHealth = Math.min(100, s.resources.physicalHealth + 20);
          return { outcomeText: `Surgery successful. Paid $${patientCost} out-of-pocket (Insurance: ${plan.name}).`, notificationType: 'info' };
        }
      }
    ]
  }
];

export function selectActiveEvents(state: GameState): ScenarioCard[] {
  // Filter eligible cards
  const eligible = SCENARIO_DECK.filter(card => {
    if (card.condition && !card.condition(state)) return false;
    return true;
  });

  // Pick 1 to 2 random cards
  const count = Math.min(2, eligible.length);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

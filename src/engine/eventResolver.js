import { applyEventToInstruments } from './instruments.js';
import { randInt, randFloat } from '../utils/random.js';

export const resolveEvent = (event, playerChoice, state) => {
  const changes = {
    poolDelta: 0,
    newLoans: [],
    removedIncomes: [],
    newIncomes: [],
    newDeductions: [],
    instrumentShocks: {},
    statusMessages: [],
    triggerAllocation: false,
    businessIncomeDelta: 0,
    hasActiveBusinessDelta: null,
    inflationSpike: false,
    newInstruments: null,
    optInHealthInsurance: false,
    courseCompletedDelta: false,
  };

  const impact = event.financialImpact || {};

  switch (event.id) {
    case 'annual_tax': {
      const taxBill = impact.amount || Math.round((state.annualIncomeAcc || 300000) * 0.08);
      changes.poolDelta = -taxBill;
      changes.statusMessages.push(`Annual tax of ₹${taxBill.toLocaleString('en-IN')} paid to income tax department.`);
      break;
    }

    case 'annual_inflation': {
      changes.statusMessages.push(`Living costs and rent adjusted upwards to match annual consumer inflation.`);
      break;
    }

    case 'medical_emergency':
    case 'uninsured_illness': {
      const bill = impact.billAmount || randInt(50000, 250000);
      if (state.hasHealthInsurance && event.id !== 'uninsured_illness') {
        const covered = Math.round(bill * 0.8);
        const outOfPocket = bill - covered;
        changes.poolDelta = -outOfPocket;
        changes.statusMessages.push(`Insurance covered 80% (₹${covered.toLocaleString('en-IN')}). You paid ₹${outOfPocket.toLocaleString('en-IN')}.`);
      } else {
        changes.poolDelta = -bill;
        changes.statusMessages.push(`Paid full medical bill of ₹${bill.toLocaleString('en-IN')}.`);
      }

      // Check if player chose to opt-in to health insurance simultaneously
      if (event.optInHealthInsurance || playerChoice === 0) {
        changes.optInHealthInsurance = true;
        changes.statusMessages.push(`Enrolled in comprehensive health insurance policy (₹750/mo premium) for future safety.`);
      }
      break;
    }

    case 'job_loss': {
      state.incomes.filter(i => i.type === 'job').forEach(job => {
        changes.removedIncomes.push(job.id);
      });
      changes.statusMessages.push(`Lost salaried position. Relying on savings & freelance gigs until new offer.`);
      break;
    }

    case 'freelance_gig': {
      if (playerChoice === 0) {
        const gigPay = impact.gigPay || impact.amount || randInt(18000, 30000);
        changes.newIncomes.push({
          id: `freelance_${Date.now()}`,
          type: 'job',
          amount: gigPay,
          name: 'Consulting / Freelance Retainer',
        });
        changes.statusMessages.push(`Started consulting gig! Earning +₹${gigPay.toLocaleString('en-IN')}/mo cashflow.`);
        changes.triggerAllocation = true;
      } else {
        changes.statusMessages.push(`Passed on freelance gig to focus on corporate applications.`);
      }
      break;
    }

    case 'course_upskill': {
      if (playerChoice === 0) {
        // Pay out of pocket
        changes.poolDelta = -35000;
        changes.courseCompletedDelta = true;
        changes.statusMessages.push(`Completed executive certification! Raised promotion probability and unlocked senior leadership offers.`);
      } else {
        changes.statusMessages.push(`Skipped course for now to preserve cash.`);
      }
      break;
    }

    case 'senior_job_offer': {
      if (playerChoice === 0) {
        const currentJob = state.incomes.find(i => i.type === 'job');
        const base = currentJob ? currentJob.amount : 40000;
        const newSalary = impact.newSalary || Math.round(Math.max(base * 1.5, 75000));
        changes.newIncomes.push({
          id: `job_${Date.now()}`,
          type: 'job',
          amount: newSalary,
          name: 'Executive Leadership Role',
        });
        if (currentJob) changes.removedIncomes.push(currentJob.id);
        changes.statusMessages.push(`Accepted Executive Leadership Role at ₹${newSalary.toLocaleString('en-IN')}/mo!`);
        changes.triggerAllocation = true;
      } else {
        changes.statusMessages.push(`Declined executive offer to maintain work-life balance.`);
      }
      break;
    }

    case 'market_crash':
    case 'mf_correction': {
      if (playerChoice === 1) {
        const currStocks = state.instruments.stocks || 0;
        const currMf = state.instruments.mf || 0;
        const freedPercent = Math.round(currStocks * 0.5 + currMf * 0.5);
        changes.newInstruments = {
          ...state.instruments,
          stocks: Math.round(currStocks * 0.5),
          mf: Math.round(currMf * 0.5),
          savings: (state.instruments.savings || 0) + freedPercent
        };
        changes.statusMessages.push(`Sold 50% of volatile equities to cash/savings to prevent further slide.`);
      } else {
        const { newTotal, shocks } = applyEventToInstruments(event.id, state.instruments, state.pool);
        changes.instrumentShocks = shocks;
        changes.poolDelta = newTotal - state.pool;
        changes.statusMessages.push(`Held steady through market drawdown.`);
      }
      break;
    }

    case 'market_boom':
    case 'gold_surge': {
      const { newTotal, shocks } = applyEventToInstruments(event.id, state.instruments, state.pool);
      changes.instrumentShocks = shocks;
      changes.poolDelta = newTotal - state.pool;

      if (playerChoice === 1) {
        if (event.id === 'market_boom') {
          const stockShare = state.instruments.stocks || 0;
          changes.newInstruments = {
            ...state.instruments,
            stocks: 0,
            savings: (state.instruments.savings || 0) + stockShare
          };
          changes.statusMessages.push(`Booked profits! Sold entire stock allocation (0% stocks) into safe Savings.`);
        } else if (event.id === 'gold_surge') {
          const goldShare = state.instruments.gold || 0;
          changes.newInstruments = {
            ...state.instruments,
            gold: 0,
            savings: (state.instruments.savings || 0) + goldShare
          };
          changes.statusMessages.push(`Booked profits! Shifted gold proceeds into Savings.`);
        }
      } else {
        changes.statusMessages.push(`Rode the rally! Portfolio grew by +₹${Math.round(changes.poolDelta).toLocaleString('en-IN')}.`);
      }
      break;
    }

    case 'salary_hike': {
      const primaryJob = state.incomes.find(i => i.type === 'job');
      if (primaryJob) {
        const hike = impact.hikeAmount || Math.round(primaryJob.amount * 0.15);
        changes.newIncomes.push({ ...primaryJob, amount: primaryJob.amount + hike, id: `job_${Date.now()}` });
        changes.removedIncomes.push(primaryJob.id);
        changes.statusMessages.push(`Salary increased by +₹${hike.toLocaleString('en-IN')}/mo!`);
        changes.triggerAllocation = true;
      }
      break;
    }

    case 'job_switch': {
      if (playerChoice === 0) {
        const currentJob = state.incomes.find(i => i.type === 'job');
        const base = currentJob ? currentJob.amount : 35000;
        const newSalary = impact.newSalary || Math.round(base * 1.35);
        changes.newIncomes.push({ id: `job_${Date.now()}`, type: 'job', amount: newSalary, name: 'Senior Role Salary' });
        if (currentJob) changes.removedIncomes.push(currentJob.id);
        changes.statusMessages.push(`Accepted senior job offer at ₹${newSalary.toLocaleString('en-IN')}/mo!`);
        changes.triggerAllocation = true;
      } else {
        changes.statusMessages.push(`Stayed at current stable position.`);
      }
      break;
    }

    case 'vehicle_accident': {
      const dmg = impact.repairCost || randInt(15000, 60000);
      if (state.hasVehicleInsurance) {
        const copay = Math.round(dmg * 0.1);
        changes.poolDelta = -copay;
        changes.statusMessages.push(`Vehicle insurance covered 90%. You paid deductible of ₹${copay.toLocaleString('en-IN')}.`);
      } else {
        changes.poolDelta = -dmg;
        changes.statusMessages.push(`Paid full vehicle repair bill of ₹${dmg.toLocaleString('en-IN')}.`);
      }
      break;
    }

    case 'family_wedding': {
      let giftAmt = 35000;
      if (event.contributionAmount) {
        giftAmt = event.contributionAmount;
      } else if (playerChoice === 0) {
        giftAmt = impact.tierLow || 15000;
      } else if (playerChoice === 1) {
        giftAmt = impact.tierMid || 35000;
      } else if (playerChoice === 2) {
        giftAmt = impact.tierHigh || 75000;
      }

      changes.poolDelta = -giftAmt;
      changes.statusMessages.push(`Contributed ₹${giftAmt.toLocaleString('en-IN')} towards family wedding.`);
      break;
    }

    case 'scam_fraud': {
      const loss = impact.lossAmount || Math.min(Math.round(state.pool * 0.08), 35000);
      changes.poolDelta = -loss;
      changes.statusMessages.push(`Lost ₹${loss.toLocaleString('en-IN')} to online financial fraud.`);
      break;
    }

    case 'inheritance_gift': {
      const gift = impact.giftAmount || randInt(100000, 400000);
      changes.poolDelta = gift;
      changes.statusMessages.push(`Received family windfall gift of +₹${gift.toLocaleString('en-IN')}!`);
      break;
    }

    case 'business_opportunity': {
      if (playerChoice === 0) {
        const investment = impact.investmentCost || 100000;
        const monthlyReturn = impact.monthlyReturn || 14000;
        changes.poolDelta = -investment;
        changes.hasActiveBusinessDelta = true;
        changes.businessIncomeDelta = monthlyReturn;
        changes.statusMessages.push(`Invested ₹${investment.toLocaleString('en-IN')} in venture. Generating +₹${monthlyReturn.toLocaleString('en-IN')}/mo cashflow!`);
        changes.triggerAllocation = true;
      } else {
        changes.statusMessages.push(`Passed on business opportunity to protect liquidity.`);
      }
      break;
    }

    case 'business_boom': {
      const boost = Math.round((state.businessIncome || 12000) * 0.4);
      changes.businessIncomeDelta = boost;
      changes.statusMessages.push(`Business surge! Monthly business profit boosted by +₹${boost.toLocaleString('en-IN')}/mo.`);
      break;
    }

    case 'business_downturn': {
      const lossMonthly = Math.round((state.businessIncome || 10000) * 0.4);
      changes.businessIncomeDelta = -lossMonthly;
      changes.statusMessages.push(`Business client renewals delayed. Profit dipped by -₹${lossMonthly.toLocaleString('en-IN')}/mo.`);
      break;
    }

    case 'business_failure': {
      if (playerChoice === 0) {
        // Close down and write off
        changes.hasActiveBusinessDelta = false;
        changes.businessIncomeDelta = -(state.businessIncome || 0);
        changes.statusMessages.push(`Wrote off struggling business venture and halted operations. Total loss taken.`);
      } else {
        // Emergency capital injection
        changes.poolDelta = -50000;
        changes.businessIncomeDelta = randInt(4000, 12000);
        changes.statusMessages.push(`Injected ₹50,000 emergency working capital to restructure and revive operations.`);
      }
      break;
    }

    case 'theft': {
      const theftAmt = impact.theftAmount || Math.min(Math.round(state.pool * 0.06), 25000);
      changes.poolDelta = -theftAmt;
      changes.statusMessages.push(`Lost ₹${theftAmt.toLocaleString('en-IN')} to theft.`);
      break;
    }

    case 'work_bonus': {
      const bonus = impact.bonusAmount || randInt(20000, 60000);
      changes.poolDelta = bonus;
      changes.statusMessages.push(`Corporate performance bonus: +₹${bonus.toLocaleString('en-IN')} credited!`);
      break;
    }

    default:
      changes.statusMessages.push(`Event acknowledged.`);
      break;
  }

  return changes;
};

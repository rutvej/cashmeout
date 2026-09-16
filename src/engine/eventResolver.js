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
    married: null,
    homeNeedsRenovation: null,
    utilityHikePercent: null,
    homeValueIncrease: null,
    triggerPostMarriageHome: false,
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
        const newSalary = impact.newSalary || Math.round(base * 1.5);
        const role = impact.roleName || 'Director / VP of Strategy';
        changes.newIncomes.push({
          id: `job_${Date.now()}`,
          type: 'job',
          amount: newSalary,
          name: role,
        });
        if (currentJob) changes.removedIncomes.push(currentJob.id);
        changes.statusMessages.push(`Accepted Executive Mandate as ${role} at ₹${newSalary.toLocaleString('en-IN')}/mo!`);
        changes.triggerAllocation = true;
      } else {
        changes.statusMessages.push(`Declined executive offer to maintain work-life balance.`);
      }
      break;
    }

    case 'new_job_offer': {
      if (playerChoice === 0) {
        const newSalary = impact.newSalary || 45000;
        const role = impact.roleName || 'Full-Time Corporate Specialist';
        changes.newIncomes.push({
          id: `job_${Date.now()}`,
          type: 'job',
          amount: newSalary,
          name: role,
        });
        changes.statusMessages.push(`Accepted full-time salaried position as ${role} at ₹${newSalary.toLocaleString('en-IN')}/mo!`);
        changes.triggerAllocation = true;
      } else {
        changes.statusMessages.push(`Passed on the job offer to hold out for higher pay.`);
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
        const hike = impact.hikeAmount || Math.round(primaryJob.amount * 0.18);
        const newSalary = impact.newSalary || (primaryJob.amount + hike);
        const role = impact.newRole || primaryJob.name;
        changes.newIncomes.push({ ...primaryJob, amount: newSalary, name: role, id: `job_${Date.now()}` });
        changes.removedIncomes.push(primaryJob.id);
        changes.statusMessages.push(`Promoted to ${role}! Salary increased by +₹${hike.toLocaleString('en-IN')}/mo (+${impact.hikePercent || 18}%)!`);
        changes.triggerAllocation = true;
      }
      break;
    }

    case 'job_switch': {
      const currentJob = state.incomes.find(i => i.type === 'job');
      const currentSalary = currentJob ? currentJob.amount : 40000;

      if (playerChoice === 0) {
        // High-Growth Tech Venture Offer
        const newSalary = impact.startupSalary || impact.newSalary || Math.round(currentSalary * 1.38);
        const role = impact.startupRole || 'Lead Specialist (High-Growth Tech)';
        changes.newIncomes.push({ id: `job_${Date.now()}`, type: 'job', amount: newSalary, name: role });
        if (currentJob) changes.removedIncomes.push(currentJob.id);
        changes.statusMessages.push(`Accepted High-Growth Tech offer as ${role} at ₹${newSalary.toLocaleString('en-IN')}/mo (+${impact.startupHikePct || 38}% hike)!`);
        changes.triggerAllocation = true;
      } else if (playerChoice === 1) {
        // Premier Global Enterprise MNC Offer
        const newSalary = impact.mncSalary || Math.round(currentSalary * 1.26);
        const role = impact.mncRole || 'Senior Manager (Global MNC)';
        changes.newIncomes.push({ id: `job_${Date.now()}`, type: 'job', amount: newSalary, name: role });
        if (currentJob) changes.removedIncomes.push(currentJob.id);
        changes.statusMessages.push(`Accepted Enterprise MNC offer as ${role} at ₹${newSalary.toLocaleString('en-IN')}/mo (+${impact.mncHikePct || 26}% hike)!`);
        changes.triggerAllocation = true;
      } else {
        // Current Employer Retention Counter-Offer
        const retentionHike = impact.retentionHike || Math.round(currentSalary * 0.15);
        const newSalary = impact.retentionSalary || (currentSalary + retentionHike);
        const role = currentJob ? `${currentJob.name} (Retained)` : 'Senior Retained Role';
        changes.newIncomes.push({ id: `job_${Date.now()}`, type: 'job', amount: newSalary, name: role });
        if (currentJob) changes.removedIncomes.push(currentJob.id);
        changes.statusMessages.push(`Leveraged offer for a counter-offer! Current employer gave you a +₹${retentionHike.toLocaleString('en-IN')}/mo (+15%) retention raise to stay.`);
        changes.triggerAllocation = true;
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

    case 'home_renovation': {
      if (playerChoice === 0) {
        const homeValue = (state.homesOwned && state.homesOwned[0]?.value) || 3000000;
        const cost = randInt(80000, Math.min(300000, Math.round(homeValue * 0.04)));
        changes.poolDelta = -cost;
        changes.homeValueIncrease = Math.round(cost * 0.6);
        changes.homeNeedsRenovation = false;
        changes.statusMessages.push(`Full renovation complete! Paid ₹${cost.toLocaleString('en-IN')}. Home value appreciated by ₹${Math.round(cost * 0.6).toLocaleString('en-IN')}.`);
      } else {
        const cost = randInt(20000, 55000);
        changes.poolDelta = -cost;
        changes.homeNeedsRenovation = false;
        changes.statusMessages.push(`Quick patch done for ₹${cost.toLocaleString('en-IN')}. A more thorough renovation will be needed soon.`);
      }
      break;
    }

    case 'utility_hike': {
      changes.utilityHikePercent = randFloat(0.08, 0.15);
      changes.statusMessages.push(`Utility tariffs permanently increased. Monthly costs rise by ~${Math.round(changes.utilityHikePercent * 100)}%.`);
      break;
    }

    case 'property_tax': {
      const totalHomeVal = (state.homesOwned || []).reduce((s, h) => s + (h.value || 0), 0);
      const propTaxBill = Math.round(totalHomeVal * (0.003 + Math.random() * 0.003));
      changes.poolDelta = -propTaxBill;
      changes.statusMessages.push(`Municipal property tax of ₹${propTaxBill.toLocaleString('en-IN')} paid.`);
      break;
    }

    case 'marriage_event': {
      changes.married = true;
      if (playerChoice === 0) {
        changes.poolDelta = -(impact.weddingCost || 0);
        changes.statusMessages.push(`Grand wedding celebrated! Paid ₹${(impact.weddingCost || 0).toLocaleString('en-IN')}.`);
      } else if (playerChoice === 1) {
        const loanAmt = impact.loanAmt || 500000;
        const emi = impact.emi || 15000;
        changes.newLoans.push({
          id: `loan_wedding_${Date.now()}`,
          name: 'Wedding Loan',
          principal: loanAmt,
          emi,
          remainingMonths: 36,
          rate: 10.8,
          type: 'personal',
        });
        changes.statusMessages.push(`Wedding loan taken! EMI: ₹${emi.toLocaleString('en-IN')}/mo for 36 months.`);
      } else {
        changes.poolDelta = -50000;
        changes.statusMessages.push(`Court marriage completed. Paid ₹50,000.`);
      }
      changes.triggerPostMarriageHome = true;
      break;
    }

    default:
      changes.statusMessages.push(`Event acknowledged.`);
      break;
  }

  return changes;
};

import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { saveGame } from '../../save/save-manager';

export interface BuyablePropertyDef {
  id: string;
  name: string;
  type: 'personal' | 'investment';
  price: number;
  downPaymentPct: number;
  monthlyEmi: number;
  commuteDaily: number;
  expectedRentMonthly: number;
  netPassiveMonthly: number;
  description: string;
}

export const PROPERTY_CATALOG: BuyablePropertyDef[] = [
  // Personal Homes
  {
    id: 'studio-downtown',
    name: 'Studio Downtown',
    type: 'personal',
    price: 38000,
    downPaymentPct: 0.20,
    monthlyEmi: 290,
    commuteDaily: 0,
    expectedRentMonthly: 0,
    netPassiveMonthly: 0,
    description: 'Eliminates commute completely (0h). Locks in fixed $290/mo EMI and ends rent creep.'
  },
  {
    id: '1bhk-near-office',
    name: '1BHK Near Office',
    type: 'personal',
    price: 65000,
    downPaymentPct: 0.20,
    monthlyEmi: 495,
    commuteDaily: 0.5,
    expectedRentMonthly: 0,
    netPassiveMonthly: 0,
    description: 'Prime location, 15-minute walk. High appreciation corridor and comfortable couple space.'
  },
  {
    id: '2bhk-suburb',
    name: '2BHK Suburb',
    type: 'personal',
    price: 45000,
    downPaymentPct: 0.20,
    monthlyEmi: 342,
    commuteDaily: 2.0,
    expectedRentMonthly: 0,
    netPassiveMonthly: 0,
    description: 'Spacious and affordable, but carries a +2h daily commute tax that drains daily energy.'
  },
  {
    id: '3bhk-family-home',
    name: '3BHK Family Home',
    type: 'personal',
    price: 90000,
    downPaymentPct: 0.20,
    monthlyEmi: 685,
    commuteDaily: 1.0,
    expectedRentMonthly: 0,
    netPassiveMonthly: 0,
    description: 'Large family home in top neighborhood. High capital appreciation and room for children.'
  },

  // Investment Properties
  {
    id: 'studio-investment',
    name: 'Studio Investment Rental',
    type: 'investment',
    price: 50000,
    downPaymentPct: 0.20,
    monthlyEmi: 320,
    commuteDaily: 0,
    expectedRentMonthly: 420,
    netPassiveMonthly: 100,
    description: 'Low vacancy risk. Generates $420/mo tenant rent minus $320 EMI = +$100/mo net cashflow.'
  },
  {
    id: '1bhk-investment',
    name: '1BHK Investment Unit',
    type: 'investment',
    price: 65000,
    downPaymentPct: 0.20,
    monthlyEmi: 415,
    commuteDaily: 0,
    expectedRentMonthly: 540,
    netPassiveMonthly: 125,
    description: 'Reliable long-term tenant demographic. Produces +$125/mo net passive income.'
  },
  {
    id: 'commercial-shop',
    name: 'Commercial Shop Space',
    type: 'investment',
    price: 80000,
    downPaymentPct: 0.20,
    monthlyEmi: 520,
    commuteDaily: 0,
    expectedRentMonthly: 700,
    netPassiveMonthly: 180,
    description: 'Prime commercial location. Generates +$180/mo net passive cashflow.'
  }
];

export function renderPropertyScreen(
  state: GameState,
  onAction?: (action: string, payload?: any) => void
): HTMLElement {
  const p = state.player;
  const container = document.createElement('div');
  container.className = 'screen-content property-screen';

  // Calculate Total Equity & Mortgage Debt
  let totalPropertyMarketValue = 0;
  let totalMortgageDebt = 0;

  for (const prop of p.properties) {
    const catalogItem = PROPERTY_CATALOG.find(x => x.id === prop.id);
    const val = catalogItem ? catalogItem.price : prop.purchasePrice;
    totalPropertyMarketValue += val;
    if (prop.mortgage) {
      totalMortgageDebt += prop.mortgage.principalRemaining;
    }
  }

  const totalRealEstateEquity = Math.max(0, totalPropertyMarketValue - totalMortgageDebt);

  // Hero Card: Real Estate Wealth
  const heroCard = document.createElement('div');
  heroCard.className = 'card hero-property-card';
  heroCard.innerHTML = `
    <div class="property-hero-label">REAL ESTATE EQUITY & WEALTH</div>
    <div class="property-hero-val val-emerald">${formatCurrency(totalRealEstateEquity)}</div>
    <div class="property-breakdown-row">
      <div class="prop-chip">
        <span class="chip-lbl">Portfolio Asset Value</span>
        <span class="chip-val val-sky">${formatCurrency(totalPropertyMarketValue)}</span>
      </div>
      <div class="prop-chip">
        <span class="chip-lbl">Mortgage Debt</span>
        <span class="chip-val val-rose">${formatCurrency(totalMortgageDebt)}</span>
      </div>
      <div class="prop-chip">
        <span class="chip-lbl">Properties Owned</span>
        <span class="chip-val">${p.properties.length}</span>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // Current Living Situation Card
  const currentLivingCard = document.createElement('div');
  currentLivingCard.className = 'card';
  currentLivingCard.innerHTML = `
    <div class="card-title">
      <span>🏠 Current Living Arrangement</span>
      <span class="badge ${p.housing.type === 'own' ? 'badge-green' : 'badge-sky'}">
        ${p.housing.type === 'own' ? 'Homeowner' : 'Renting'}
      </span>
    </div>
    <div class="living-status-box">
      <div class="living-row">
        <span>Monthly Outlay:</span>
        <strong class="val-rose">${formatCurrency(p.housing.amountPerCycle)} / month</strong>
      </div>
      <div class="living-row">
        <span>Daily Commute Transit:</span>
        <strong>${p.timeAllocation.commute} hrs / day</strong>
      </div>
      <div class="living-row">
        <span>Location Tier:</span>
        <strong>${p.housing.locationTier === 'distant' ? 'Suburban Rental (Long Commute)' : 'Near Office / Downtown'}</strong>
      </div>
      <p class="rent-creep-note">
        💡 <em>Renting Insight:</em> Rent prices creep upward 7–8% annually due to inflation. Purchasing locks in a fixed EMI forever and builds net equity.
      </p>
    </div>
  `;
  container.appendChild(currentLivingCard);

  // Buyable Personal Homes
  const personalHomesCard = document.createElement('div');
  personalHomesCard.className = 'card';
  personalHomesCard.innerHTML = `
    <div class="card-title">
      <span>🏡 Buyable Personal Residences</span>
      <span class="badge badge-sky">20% Down Payment</span>
    </div>
    <p class="card-sub-hint">
      Purchasing a home eliminates rent payments and converts EMI principal into verifiable Net Worth equity.
    </p>
    <div class="property-grid" id="personal-homes-grid"></div>
  `;

  const personalGrid = personalHomesCard.querySelector('#personal-homes-grid')!;
  PROPERTY_CATALOG.filter(item => item.type === 'personal').forEach(prop => {
    const isOwned = p.properties.some(x => x.id === prop.id);
    const downPayment = prop.price * prop.downPaymentPct;
    const canAffordDown = p.money >= downPayment;

    const propEl = document.createElement('div');
    propEl.className = `property-card ${isOwned ? 'prop-owned' : ''}`;
    propEl.innerHTML = `
      <div class="prop-header">
        <span class="prop-name">${prop.name}</span>
        <span class="prop-price">${formatCurrency(prop.price)}</span>
      </div>
      <div class="prop-stats">
        <div class="prop-stat-row">
          <span>Down Payment (20%):</span>
          <strong>${formatCurrency(downPayment)}</strong>
        </div>
        <div class="prop-stat-row">
          <span>Monthly Mortgage EMI:</span>
          <strong class="val-rose">${formatCurrency(prop.monthlyEmi)}/mo</strong>
        </div>
        <div class="prop-stat-row">
          <span>Daily Commute:</span>
          <strong>${prop.commuteDaily} hrs/day</strong>
        </div>
      </div>
      <p class="prop-desc">${prop.description}</p>
      <div class="prop-footer">
        ${isOwned ? `
          <span class="badge badge-green">✓ Primary Home Owned</span>
        ` : `
          <button class="btn btn-sm btn-primary" data-buy-home="${prop.id}" ${!canAffordDown ? 'disabled' : ''}>
            ${canAffordDown ? `Buy Home (${formatCurrency(downPayment)} down)` : `Need ${formatCurrency(downPayment)} Cash`}
          </button>
        `}
      </div>
    `;

    propEl.querySelector(`[data-buy-home="${prop.id}"]`)?.addEventListener('click', () => {
      buyProperty(prop);
    });

    personalGrid.appendChild(propEl);
  });
  container.appendChild(personalHomesCard);

  // Investment Properties
  const investPropsCard = document.createElement('div');
  investPropsCard.className = 'card';
  investPropsCard.innerHTML = `
    <div class="card-title">
      <span>📦 Passive Income Investment Properties</span>
      <span class="badge badge-green">Tenant Rental Yield</span>
    </div>
    <p class="card-sub-hint">
      Investment properties pay for their own mortgage and deposit net passive surplus into your cashflow on Salary Day.
    </p>
    <div class="property-grid" id="investment-homes-grid"></div>
  `;

  const investGrid = investPropsCard.querySelector('#investment-homes-grid')!;
  PROPERTY_CATALOG.filter(item => item.type === 'investment').forEach(prop => {
    const isOwned = p.properties.some(x => x.id === prop.id);
    const downPayment = prop.price * prop.downPaymentPct;
    const canAffordDown = p.money >= downPayment;

    const propEl = document.createElement('div');
    propEl.className = `property-card ${isOwned ? 'prop-owned' : ''}`;
    propEl.innerHTML = `
      <div class="prop-header">
        <span class="prop-name">${prop.name}</span>
        <span class="prop-price">${formatCurrency(prop.price)}</span>
      </div>
      <div class="prop-stats">
        <div class="prop-stat-row">
          <span>Down Payment (20%):</span>
          <strong>${formatCurrency(downPayment)}</strong>
        </div>
        <div class="prop-stat-row">
          <span>Gross Tenant Rent:</span>
          <strong class="val-emerald">+${formatCurrency(prop.expectedRentMonthly)}/mo</strong>
        </div>
        <div class="prop-stat-row">
          <span>Net Passive Cashflow:</span>
          <strong class="val-emerald">+${formatCurrency(prop.netPassiveMonthly)}/mo</strong>
        </div>
      </div>
      <p class="prop-desc">${prop.description}</p>
      <div class="prop-footer">
        ${isOwned ? `
          <span class="badge badge-green">✓ In Portfolio (+${formatCurrency(prop.netPassiveMonthly)}/mo)</span>
        ` : `
          <button class="btn btn-sm btn-primary" data-buy-invest="${prop.id}" ${!canAffordDown ? 'disabled' : ''}>
            ${canAffordDown ? `Acquire Asset (${formatCurrency(downPayment)})` : `Need ${formatCurrency(downPayment)}`}
          </button>
        `}
      </div>
    `;

    propEl.querySelector(`[data-buy-invest="${prop.id}"]`)?.addEventListener('click', () => {
      buyProperty(prop);
    });

    investGrid.appendChild(propEl);
  });
  container.appendChild(investPropsCard);

  function buyProperty(prop: BuyablePropertyDef) {
    const downPayment = prop.price * prop.downPaymentPct;
    const loanAmount = prop.price - downPayment;

    if (p.money < downPayment) {
      alert(`Insufficient cash balance for 20% down payment (${formatCurrency(downPayment)} required).`);
      return;
    }

    if (confirm(`Acquire ${prop.name} for ${formatCurrency(prop.price)}? (${formatCurrency(downPayment)} upfront down payment, ${formatCurrency(prop.monthlyEmi)}/mo EMI)`)) {
      p.money -= downPayment;

      // Add loan
      const mortgageLoan = {
        id: `mortgage-${prop.id}-${Date.now()}`,
        name: `Mortgage: ${prop.name}`,
        type: 'mortgage' as const,
        principalRemaining: loanAmount,
        interestRate: 0.07,
        emiAmount: prop.monthlyEmi,
        cycleDays: 30,
        lastPaidDay: p.currentDay,
        missedPayments: 0
      };
      p.loans.push(mortgageLoan);

      // Add property
      p.properties.push({
        id: prop.id,
        purchasePrice: prop.price,
        riskStatus: 'clear',
        mortgage: mortgageLoan
      });

      // If personal home, update housing status
      if (prop.type === 'personal') {
        p.housing.type = 'own';
        p.housing.amountPerCycle = prop.monthlyEmi;
        p.timeAllocation.commute = prop.commuteDaily;
      }

      p.eventLog.unshift({
        day: p.currentDay,
        text: `🏡 Acquired ${prop.name}! Down payment of ${formatCurrency(downPayment)} paid; mortgage active.`,
        type: 'investment'
      });

      saveGame(state);
      if (onAction) onAction('refresh-property');
    }
  }

  return container;
}

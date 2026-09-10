import { StockTicker, CryptoToken, MutualFund } from '../types/game';

export const STOCK_TICKERS: StockTicker[] = [
  {
    symbol: 'ORFOOD',
    name: 'Orion Foods Co.',
    sector: 'Consumer Staple',
    basePrice: 120,
    currentPrice: 120,
    volatility: 0.04,
    dividendYield: 0.025,
    priceHistory: [118, 119, 120]
  },
  {
    symbol: 'LUXBEV',
    name: 'Luxe Beverages',
    sector: 'Consumer Discretionary',
    basePrice: 85,
    currentPrice: 85,
    volatility: 0.06,
    dividendYield: 0.018,
    priceHistory: [82, 84, 85]
  },
  {
    symbol: 'NXTECH',
    name: 'NexGen Technologies',
    sector: 'Tech Hardware',
    basePrice: 340,
    currentPrice: 340,
    volatility: 0.09,
    dividendYield: 0.0,
    priceHistory: [325, 332, 340]
  },
  {
    symbol: 'CLDNET',
    name: 'CloudNet Solutions',
    sector: 'Tech / SaaS',
    basePrice: 210,
    currentPrice: 210,
    volatility: 0.08,
    dividendYield: 0.0,
    priceHistory: [200, 205, 210]
  },
  {
    symbol: 'SOLPWR',
    name: 'SolarPower Energy',
    sector: 'Clean Energy',
    basePrice: 175,
    currentPrice: 175,
    volatility: 0.07,
    dividendYield: 0.020,
    priceHistory: [168, 172, 175]
  },
  {
    symbol: 'GRNFUEL',
    name: 'GreenFuel Corp',
    sector: 'Energy Commodities',
    basePrice: 92,
    currentPrice: 92,
    volatility: 0.08,
    dividendYield: 0.012,
    priceHistory: [90, 91, 92]
  },
  {
    symbol: 'STBANK',
    name: 'Sterling Bank Ltd',
    sector: 'Banking & Finance',
    basePrice: 540,
    currentPrice: 540,
    volatility: 0.03,
    dividendYield: 0.035,
    priceHistory: [535, 538, 540]
  },
  {
    symbol: 'INSFIN',
    name: 'InsureFirst Finance',
    sector: 'Insurance',
    basePrice: 158,
    currentPrice: 158,
    volatility: 0.05,
    dividendYield: 0.022,
    priceHistory: [155, 157, 158]
  }
];

export const CRYPTO_TOKENS: CryptoToken[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    currentPrice: 48000,
    volatility: 0.14,
    priceHistory: [46000, 47200, 48000]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    currentPrice: 2900,
    volatility: 0.18,
    priceHistory: [2750, 2820, 2900]
  },
  {
    symbol: 'MOON',
    name: 'MoonDoge (Meme)',
    currentPrice: 0.45,
    volatility: 0.45,
    priceHistory: [0.35, 0.40, 0.45]
  }
];

export const MUTUAL_FUNDS: MutualFund[] = [
  {
    id: 'fund-broad',
    name: 'Broad Market S&P Index Fund',
    category: 'broad',
    expenseRatio: 0.001,
    expectedAnnualReturn: 0.10,
    riskTier: 'low',
    currentNAV: 100
  },
  {
    id: 'fund-growth',
    name: 'NextGen Alpha Tech Growth Fund',
    category: 'growth',
    expenseRatio: 0.0075,
    expectedAnnualReturn: 0.15,
    riskTier: 'high',
    currentNAV: 100
  },
  {
    id: 'fund-balanced',
    name: 'Balanced Hybrid Debt & Equity Fund',
    category: 'balanced',
    expenseRatio: 0.004,
    expectedAnnualReturn: 0.075,
    riskTier: 'medium',
    currentNAV: 100
  }
];

export const FD_TIERS = [
  { durationMonths: 6, annualRate: 0.055, label: '6 Months (5.5% p.a.)' },
  { durationMonths: 12, annualRate: 0.070, label: '1 Year (7.0% p.a.)' },
  { durationMonths: 36, annualRate: 0.082, label: '3 Years (8.2% p.a.)' }
];

export interface CreditTierInfo {
  tier: 'prime' | 'good' | 'fair' | 'impaired';
  label: string;
  personalLoanAPR: number;
  mortgageAPR: number;
  mortgageEligible: boolean;
}

export function getCreditTierInfo(score: number): CreditTierInfo {
  const safeScore = Math.max(350, Math.min(850, score));

  if (safeScore >= 760) {
    return {
      tier: 'prime',
      label: 'Prime / Excellent',
      personalLoanAPR: 0.085,
      mortgageAPR: 0.048,
      mortgageEligible: true
    };
  } else if (safeScore >= 680) {
    return {
      tier: 'good',
      label: 'Good Standing',
      personalLoanAPR: 0.115,
      mortgageAPR: 0.055,
      mortgageEligible: true
    };
  } else if (safeScore >= 600) {
    return {
      tier: 'fair',
      label: 'Fair / Subprime',
      personalLoanAPR: 0.170,
      mortgageAPR: 0.072,
      mortgageEligible: true
    };
  } else {
    return {
      tier: 'impaired',
      label: 'Severely Impaired',
      personalLoanAPR: 0.260,
      mortgageAPR: 0.10,
      mortgageEligible: false
    };
  }
}

export function adjustCreditScore(currentScore: number, delta: number): number {
  return Math.max(350, Math.min(850, Math.round(currentScore + delta)));
}

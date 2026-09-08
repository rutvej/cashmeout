export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const res = `$${Math.round(abs).toLocaleString('en-US')}`;
  return isNegative ? `-${res}` : res;
}

export function formatPercent(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${(val * 100).toFixed(1)}%`;
}

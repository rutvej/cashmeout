export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-US');
  return isNegative ? `-$${formatted}` : `$${formatted}`;
}

export function formatPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

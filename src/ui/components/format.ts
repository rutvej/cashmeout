export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  let res = '';

  if (abs >= 10000000) {
    res = `₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    res = `₹${(abs / 100000).toFixed(2)} L`;
  } else {
    res = `₹${Math.round(abs).toLocaleString('en-IN')}`;
  }

  return isNegative ? `-${res}` : res;
}

export function formatPercent(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${(val * 100).toFixed(1)}%`;
}

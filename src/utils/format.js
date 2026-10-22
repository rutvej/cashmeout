// Indian currency and number formatting utility

export function formatINR(amount, options = {}) {
  const num = Math.round(Number(amount) || 0);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Indian numbering system formatting: last 3 digits, then groups of 2 digits
  const str = absNum.toString();
  let result = '';
  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const otherDigits = str.substring(0, str.length - 3);
    const formattedOther = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedOther},${lastThree}`;
  }

  const prefix = options.noSymbol ? '' : '₹';
  return `${isNegative ? '-' : ''}${prefix}${result}`;
}

export function formatPercent(decimal) {
  return `${(decimal * 100).toFixed(1)}%`;
}

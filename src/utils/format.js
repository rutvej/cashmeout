export const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  const val = Math.round(amount);
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatCurrencyFull = (amount) => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
};

export const formatPercent = (decimal) => {
  return `${(decimal * 100).toFixed(1)}%`;
};

export const formatAge = (day) => {
  const STARTING_AGE = 22;
  const DAYS_PER_YEAR = 365;
  const age = STARTING_AGE + Math.floor(day / DAYS_PER_YEAR);
  return age;
};

export const formatDay = (day) => {
  const years = Math.floor(day / 365);
  const remainingDays = day % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;
  return `Y${years + 1}, M${months + 1}, D${days + 1}`;
};

export const formatYearsMonths = (totalMonths) => {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
};

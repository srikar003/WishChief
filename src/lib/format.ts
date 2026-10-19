export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'JPY', symbol: '¥' },
] as const;

export const currencySymbol = (code: string) =>
  CURRENCIES.find((c) => c.code === code)?.symbol ?? code;

export const formatMoney = (amount: number, currency = 'USD') => {
  const sym = currencySymbol(currency);
  const rounded = Math.round(amount * 100) / 100;
  const whole = Number.isInteger(rounded);
  const body = Math.abs(rounded).toLocaleString('en-US', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${rounded < 0 ? '-' : ''}${sym}${body}`;
};

export const formatMonths = (months: number | null) => {
  if (months === null) return null;
  if (months < 0.1) return '0 mo';
  if (months < 10) return `${Math.round(months * 10) / 10} mo`;
  return `${Math.round(months)} mo`;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatMonthYear = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

export const shortMonth = (key: string) => MONTHS[Number(key.split('-')[1]) - 1];

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isValidISODate = (s: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, day] = s.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === day;
};

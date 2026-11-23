import { COMMERCE } from '../config/site';

const currencyFormatter = new Intl.NumberFormat(COMMERCE.locale, {
  style: 'currency',
  currency: COMMERCE.currency,
  maximumFractionDigits: 0
});

const preciseCurrencyFormatter = new Intl.NumberFormat(COMMERCE.locale, {
  style: 'currency',
  currency: COMMERCE.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat(COMMERCE.locale);

const dateFormatter = new Intl.DateTimeFormat(COMMERCE.locale, {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat(COMMERCE.locale, {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

export const formatCurrency = (value, { precise = false } = {}) =>
  (precise ? preciseCurrencyFormatter : currencyFormatter).format(Number(value) || 0);

/** $14,3 M · $850 mil: para cifras grandes en tarjetas de resumen. */
export const formatCompactCurrency = (value) => {
  const amount = Number(value) || 0;
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `$${(amount / 1_000_000).toLocaleString(COMMERCE.locale, { maximumFractionDigits: 2 })} M`;
  }
  if (abs >= 10_000) {
    return `$${(amount / 1_000).toLocaleString(COMMERCE.locale, { maximumFractionDigits: 0 })} mil`;
  }
  return formatCurrency(amount);
};

export const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

export const formatPercent = (ratio) => `${Math.round((Number(ratio) || 0) * 100)}%`;

const toDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '—';
};

export const formatDateTime = (value) => {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : '—';
};

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${Number(count) === 1 ? singular : plural}`;

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'HJ';

/** Normaliza texto para búsquedas sin tildes ni mayúsculas. */
export const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const shortId = (id = '') => String(id).slice(-6).toUpperCase();

import { INVENTORY } from '../config/site';
import { normalizeText } from './format';

export const STOCK_STATUS = {
  ok: { key: 'ok', label: 'Disponible', tone: 'success' },
  low: { key: 'low', label: 'Bajo stock', tone: 'warning' },
  out: { key: 'out', label: 'Sin stock', tone: 'danger' }
};

export const getProductId = (product) => product?._id ?? product?.id;

export const getStockStatus = (product, threshold = INVENTORY.lowStockThreshold) => {
  const stock = Number(product?.stock ?? 0);
  if (stock <= 0) return STOCK_STATUS.out;
  if (stock <= threshold) return STOCK_STATUS.low;
  return STOCK_STATUS.ok;
};

/** SKU legible derivado de la categoría y el id: HJ-ALM-0001. */
export const getSku = (product) => {
  const category = normalizeText(product?.categoria || INVENTORY.defaultCategory)
    .replace(/[^a-z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');
  const rawId = String(getProductId(product) ?? '');
  const tail = /^\d+$/.test(rawId) ? rawId.slice(-4).padStart(4, '0') : rawId.slice(-4).toUpperCase();
  return `${INVENTORY.skuPrefix}-${category}-${tail || '0000'}`;
};

export const isSustainable = (product) => {
  const text = normalizeText([product?.materiales, product?.descripcion, product?.nombre].filter(Boolean).join(' '));
  return INVENTORY.sustainableKeywords.some((keyword) => text.includes(normalizeText(keyword)));
};

export const getCategories = (products = []) => {
  const counts = new Map();
  products.forEach((product) => {
    const category = product.categoria || INVENTORY.defaultCategory;
    counts.set(category, (counts.get(category) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

export const computeInventoryKpis = (products = [], threshold = INVENTORY.lowStockThreshold) => {
  const total = products.length;
  let active = 0;
  let low = 0;
  let out = 0;
  let units = 0;
  let value = 0;
  let sustainable = 0;
  const valueByCategory = new Map();

  products.forEach((product) => {
    const stock = Math.max(0, Number(product.stock ?? 0));
    const price = Math.max(0, Number(product.precio ?? 0));
    const status = getStockStatus(product, threshold).key;
    if (status !== 'out') active += 1;
    if (status === 'low') low += 1;
    if (status === 'out') out += 1;
    if (isSustainable(product)) sustainable += 1;
    units += stock;
    value += stock * price;
    const category = product.categoria || INVENTORY.defaultCategory;
    valueByCategory.set(category, (valueByCategory.get(category) || 0) + stock * price);
  });

  const [topCategory = null, topCategoryValue = 0] =
    [...valueByCategory.entries()].sort((a, b) => b[1] - a[1])[0] || [];

  return {
    total,
    active,
    low,
    out,
    alerts: low + out,
    units,
    value,
    sustainable,
    sustainableRatio: total ? sustainable / total : 0,
    activeRatio: total ? active / total : 0,
    alertRatio: total ? (low + out) / total : 0,
    topCategory,
    topCategoryRatio: value ? topCategoryValue / value : 0
  };
};

export const matchesProductSearch = (product, query) => {
  const needle = normalizeText(query);
  if (!needle) return true;
  return [product.nombre, product.descripcion, product.categoria, product.materiales, getSku(product)]
    .filter(Boolean)
    .some((field) => normalizeText(field).includes(needle));
};

/** Cuerpo completo que espera PUT /api/productos/:id (el endpoint reemplaza todos los campos). */
export const toProductPayload = (product, overrides = {}) => ({
  nombre: product.nombre,
  descripcion: product.descripcion || '',
  precio: Number(product.precio),
  stock: Number(product.stock ?? 0),
  categoria: product.categoria || INVENTORY.defaultCategory,
  imagenUrl: product.imagenUrl || product.imagen || '',
  ...overrides
});

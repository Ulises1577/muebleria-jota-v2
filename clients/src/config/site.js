/**
 * Parámetros del sitio: un único lugar para los datos de marca, del taller y del negocio.
 * Cualquier vista que muestre estos datos debe leerlos de acá, nunca escribirlos a mano.
 */

export const BRAND = {
  name: 'Hermanos Jota',
  logo: '/assets/logo.svg',
  foundedYear: 1960,
  style: 'Diseño Mid-Century Modern',
  description:
    'El redescubrimiento de un arte olvidado: muebles cálidos, atemporales y sustentables creados para habitar tu historia.'
};

export const WORKSHOP = {
  label: 'Casa taller',
  street: 'Av. San Juan 2847',
  neighborhood: 'San Cristóbal',
  city: 'Ciudad Autónoma de Buenos Aires',
  cityShort: 'CABA',
  phone: '+54 11 4892-3001',
  whatsapp: '+54 11 4567-8900',
  email: 'contacto@hermanosjota.com.ar',
  timezone: 'America/Argentina/Buenos_Aires',
  // day: 0 = domingo … 6 = sábado
  hours: [
    { days: [1, 2, 3, 4, 5], open: '10:00', close: '19:00', label: 'Lunes a viernes 10 a 19 hs' },
    { days: [6], open: '10:00', close: '14:00', label: 'Sábados 10 a 14 hs' }
  ]
};

export const COMMERCE = {
  locale: 'es-AR',
  currency: 'ARS',
  installments: 6,
  maxQuantityPerItem: 10,
  shippingNote: 'Embalaje reforzado sin plásticos',
  warrantyYears: 10
};

export const INVENTORY = {
  /** Con esta cantidad o menos una pieza pasa a "bajo stock". */
  lowStockThreshold: 2,
  /** Prefijo de los códigos SKU derivados en el panel. */
  skuPrefix: 'HJ',
  /** Palabras que identifican materiales certificados o recuperados. */
  sustainableKeywords: ['fsc', 'sostenible', 'sustentable', 'recuperad', 'reciclad', 'certificad', 'ecológic'],
  defaultCategory: 'Colección',
  /** Categorías sugeridas en el alta; el panel suma las que ya existen en la base. */
  suggestedCategories: ['Almacenamiento', 'Asientos', 'Mesas', 'Dormitorio', 'Oficina']
};

export const ADMIN = {
  pageSizeOptions: [5, 10, 20],
  defaultPageSize: 5
};

export const CATALOG = {
  featuredCount: 4,
  relatedCount: 3
};

export const ORDER_STATUS = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  confirmado: { label: 'Confirmado', tone: 'primary' },
  enviado: { label: 'Enviado', tone: 'info' },
  entregado: { label: 'Entregado', tone: 'success' }
};

export const ORDER_STATUS_FLOW = ['pendiente', 'confirmado', 'enviado', 'entregado'];

export const STORAGE_KEYS = {
  token: 'hermanos_jota_token',
  user: 'hermanos_jota_user',
  cart: 'hermanos_jota_cart',
  adminColumns: 'hermanos_jota_admin_columns',
  adminPageSize: 'hermanos_jota_admin_page_size'
};

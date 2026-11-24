/** Rutas de la aplicación: los componentes navegan con estas constantes, no con strings sueltos. */
export const ROUTES = {
  home: '/',
  catalog: '/productos',
  product: (id) => `/productos/${encodeURIComponent(id)}`,
  contact: '/contacto',
  profile: '/perfil',
  orders: '/mis-pedidos',
  login: '/login',
  register: '/registro',
  admin: '/admin',
  adminNewProduct: '/admin/productos/nuevo',
  adminInventory: '/admin/inventario',
  adminOrders: '/admin/pedidos',
  adminClients: '/admin/clientes'
};

/** Navegación pública: `hideForAdmin` oculta el enlace cuando ingresa un administrador. */
export const PUBLIC_NAV = [
  { to: ROUTES.home, label: 'Inicio', end: true },
  { to: ROUTES.catalog, label: 'Catálogo' },
  { to: ROUTES.contact, label: 'Contacto', hideForAdmin: true }
];

/** Navegación del panel, igual para todas las vistas de administración. */
export const ADMIN_NAV = [
  { to: ROUTES.admin, label: 'Gestión de productos', end: true },
  { to: ROUTES.catalog, label: 'Catálogo' },
  { to: ROUTES.adminInventory, label: 'Inventario' },
  { to: ROUTES.adminOrders, label: 'Pedidos' },
  { to: ROUTES.adminClients, label: 'Clientes' }
];

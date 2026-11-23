import { STORAGE_KEYS } from '../config/site';

export const isAdminUser = (user) =>
  Boolean(user && (user.rol === 'admin' || user.role === 'admin' || user.isAdmin));

export const normalizeUser = (user) => {
  if (!user) return null;
  const isAdmin = isAdminUser(user);
  return {
    ...user,
    id: user._id || user.id,
    _id: user._id || user.id,
    rol: isAdmin ? 'admin' : user.rol || 'usuario',
    role: isAdmin ? 'admin' : user.role || 'client',
    isAdmin
  };
};

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const session = {
  getToken: () => read(STORAGE_KEYS.token),

  getUser() {
    try {
      const raw = read(STORAGE_KEYS.user);
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  save(token, user) {
    try {
      if (token) localStorage.setItem(STORAGE_KEYS.token, token);
      if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(normalizeUser(user)));
    } catch (error) {
      console.error('No se pudo guardar la sesión en localStorage:', error);
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
    } catch (error) {
      console.error('No se pudo cerrar la sesión local:', error);
    }
  }
};

// Limpieza única: versiones anteriores guardaban tokens "demo-..." que el backend nunca
// aceptó. Si quedaron en el navegador, se descartan para que no simulen una sesión admin.
if ((session.getToken() || '').startsWith('demo-')) {
  session.clear();
}

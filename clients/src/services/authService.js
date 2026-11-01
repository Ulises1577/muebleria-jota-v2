const PRODUCTS_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/productos';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || PRODUCTS_URL.replace(/\/productos\/?$/, '/auth');

const TOKEN_KEY = 'hermanos_jota_token';
const USER_KEY = 'hermanos_jota_user';

export const SESSION_EXPIRED_EVENT = 'hermanos-jota:session-expired';

const normalizeUser = (user) => {
  if (!user) return null;
  const isAdmin = user.rol === 'admin' || user.role === 'admin' || Boolean(user.isAdmin);
  return {
    ...user,
    id: user._id || user.id,
    _id: user._id || user.id,
    rol: isAdmin ? 'admin' : (user.rol || 'usuario'),
    role: isAdmin ? 'admin' : (user.role || 'client'),
    isAdmin
  };
};

// fetch que distingue "no hay conexión" de "el servidor respondió con error"
const safeFetch = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch {
    const error = new Error('No se pudo conectar con el servidor. Verificá que el backend esté activo.');
    error.isNetworkError = true;
    throw error;
  }
};

// Lee el JSON y, si la respuesta no es OK, lanza un Error que conserva el status HTTP
const readJson = async (response, fallbackMessage) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.message || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  if (!payload) {
    throw new Error(fallbackMessage);
  }

  return payload;
};

export const authService = {
  persistSession(token, user) {
    if (!token || !user) return;
    const normalized = normalizeUser(user);
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    } catch (e) {
      console.error('No se pudo guardar la sesión en localStorage:', e);
    }
  },

  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  },

  getCurrentUser() {
    return this.getUser();
  },

  isAuthenticated() {
    return Boolean(this.getToken() && this.getUser());
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('No se pudo cerrar la sesión local:', error);
    }
  },

  async login({ email, password }) {
    const response = await safeFetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await readJson(response, 'No se pudo iniciar sesión.');
    const normalized = normalizeUser(result.data.user);
    this.persistSession(result.data.token, normalized);
    return {
      token: result.data.token,
      user: normalized
    };
  },

  async register({ nombre, email, password }) {
    const response = await safeFetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const result = await readJson(response, 'No se pudo crear la cuenta.');
    const normalized = normalizeUser(result.data.user);
    this.persistSession(result.data.token, normalized);
    return {
      token: result.data.token,
      user: normalized
    };
  },

  async me() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    const response = await safeFetch(`${AUTH_URL}/me`, {
      headers: {
        ...this.getAuthHeaders()
      }
    });

    const result = await readJson(response, 'No se pudo verificar la sesión.');
    const normalized = normalizeUser(result.data);
    this.persistSession(token, normalized);
    return normalized;
  }
};

// Limpieza única: versiones anteriores guardaban tokens "demo-..." que el backend nunca
// aceptó. Si quedaron en el navegador, se descartan para que no simulen una sesión admin.
try {
  if ((localStorage.getItem(TOKEN_KEY) || '').startsWith('demo-')) {
    authService.logout();
  }
} catch {
  /* localStorage no disponible: nada que limpiar */
}

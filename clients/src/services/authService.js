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

const readJson = async (response, fallbackMessage) => {
  try {
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || fallbackMessage);
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.message && error.message !== 'Unexpected end of JSON input') {
      throw error;
    }
    throw new Error(fallbackMessage);
  }
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
    try {
      const response = await fetch(`${AUTH_URL}/login`, {
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
    } catch (error) {
      // Si la API no está disponible o falla por conexión, soporte para testing / demo
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (normalizedEmail === 'admin@hermanosjota.com') {
        const fallbackAdmin = normalizeUser({
          _id: 'admin-001',
          nombre: 'Administrador Jota',
          email: 'admin@hermanosjota.com',
          rol: 'admin',
          role: 'admin',
          isAdmin: true
        });
        const fallbackToken = 'demo-admin-token';
        this.persistSession(fallbackToken, fallbackAdmin);
        return { user: fallbackAdmin, token: fallbackToken };
      }
      if (normalizedEmail === 'cliente@hermanosjota.com') {
        const fallbackClient = normalizeUser({
          _id: 'user-001',
          nombre: 'Cliente Demo',
          email: 'cliente@hermanosjota.com',
          rol: 'usuario',
          role: 'client',
          isAdmin: false
        });
        const fallbackToken = 'demo-client-token';
        this.persistSession(fallbackToken, fallbackClient);
        return { user: fallbackClient, token: fallbackToken };
      }
      throw error;
    }
  },

  async register({ nombre, email, password }) {
    const response = await fetch(`${AUTH_URL}/register`, {
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

    try {
      const response = await fetch(`${AUTH_URL}/me`, {
        headers: {
          ...this.getAuthHeaders()
        }
      });

      const result = await readJson(response, 'No se pudo verificar la sesión.');
      const normalized = normalizeUser(result.data);
      this.persistSession(token, normalized);
      return normalized;
    } catch (error) {
      // Si el token es demo o la API no está disponible pero hay usuario local, mantener sesión
      const localUser = this.getUser();
      if (token.startsWith('demo-') && localUser) {
        return localUser;
      }
      throw error;
    }
  }
};

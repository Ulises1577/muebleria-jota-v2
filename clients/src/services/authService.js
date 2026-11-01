const PRODUCTS_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/productos';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || PRODUCTS_URL.replace(/\/productos\/?$/, '/auth');

const TOKEN_KEY = 'hermanos_jota_token';
const USER_KEY = 'hermanos_jota_user';
const PROFILE_KEY_PREFIX = 'hermanos_jota_profile_';

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

export const SESSION_EXPIRED_EVENT = 'hermanos-jota:session-expired';

const persistSession = (token, user) => {
  if (!token || !user) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const authService = {
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
      return raw ? JSON.parse(raw) : null;
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
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await readJson(response, 'No se pudo iniciar sesión.');
    persistSession(result.data.token, result.data.user);
    return result.data;
  },

  async register({ nombre, email, password }) {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const result = await readJson(response, 'No se pudo crear la cuenta.');
    persistSession(result.data.token, result.data.user);
    return result.data;
  },

  async me() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    const response = await fetch(`${AUTH_URL}/me`, {
      headers: {
        ...this.getAuthHeaders()
      }
    });

    const result = await readJson(response, 'No se pudo verificar la sesión.');
    persistSession(token, result.data);
    return result.data;
  },

  async updateProfile(profileData) {
    const response = await fetch(`${AUTH_URL}/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      body: JSON.stringify(profileData)
    });

    const result = await readJson(response, 'No se pudieron guardar los datos del perfil.');
    const token = this.getToken();
    persistSession(token, result.data);
    return result.data;
  },

  getLocalProfileExtras(userId) {
    try {
      const raw = localStorage.getItem(`${PROFILE_KEY_PREFIX}${userId}`);
      return raw ? JSON.parse(raw) : { telefono: '', direccion: '' };
    } catch {
      return { telefono: '', direccion: '' };
    }
  },

  saveLocalProfileExtras(userId, extras) {
    try {
      localStorage.setItem(`${PROFILE_KEY_PREFIX}${userId}`, JSON.stringify(extras));
    } catch (error) {
      console.error('No se pudieron guardar los datos de despacho:', error);
    }
  }
};

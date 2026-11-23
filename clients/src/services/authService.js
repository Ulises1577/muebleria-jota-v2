import { apiRequest } from './apiClient';
import { session, normalizeUser } from './session';

export { SESSION_EXPIRED_EVENT } from './apiClient';

const startSession = (result) => {
  const user = normalizeUser(result.data.user);
  session.save(result.data.token, user);
  return { token: result.data.token, user };
};

/** Servicio de autenticación (API Express /api/auth). */
export const authService = {
  getToken: () => session.getToken(),
  getUser: () => session.getUser(),
  logout: () => session.clear(),

  async login({ email, password }) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      fallbackMessage: 'No se pudo iniciar sesión.'
    });
    return startSession(result);
  },

  async register({ nombre, email, password }) {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: { nombre, email, password },
      fallbackMessage: 'No se pudo crear la cuenta.'
    });
    return startSession(result);
  },

  async me() {
    const result = await apiRequest('/auth/me', {
      auth: true,
      fallbackMessage: 'No se pudo verificar la sesión.'
    });
    const user = normalizeUser(result.data);
    session.save(null, user);
    return user;
  },

  async updateMe({ nombre, telefono, direccion }) {
    const result = await apiRequest('/auth/me', {
      method: 'PUT',
      body: { nombre, telefono, direccion },
      auth: true,
      fallbackMessage: 'No se pudo actualizar el perfil.'
    });
    const user = normalizeUser(result.data);
    session.save(null, user);
    return user;
  }
};

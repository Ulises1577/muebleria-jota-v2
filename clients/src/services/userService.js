import { apiRequest } from './apiClient';
import { normalizeUser } from './session';

/** Servicio de cuentas registradas (API Express /api/usuarios, solo administradores). */
export const userService = {
  async getUsers() {
    const result = await apiRequest('/usuarios', {
      auth: true,
      fallbackMessage: 'No se pudieron cargar los clientes.'
    });
    return (result.data || []).map(normalizeUser);
  }
};

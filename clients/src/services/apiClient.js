import { session } from './session';

/**
 * Base de la API. Se configura con VITE_API_BASE_URL (ej. https://mi-api.onrender.com/api).
 * Se mantiene compatibilidad con VITE_API_URL, que antes apuntaba directo a /api/productos.
 */
const legacyProductsUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (legacyProductsUrl ? legacyProductsUrl.replace(/\/productos\/?$/, '') : 'http://localhost:5000/api')
).replace(/\/+$/, '');

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export const SESSION_EXPIRED_EVENT = 'hermanos-jota:session-expired';

export class ApiError extends Error {
  constructor(message, { status = 0, isNetworkError = false } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Cliente HTTP único del front: arma la URL, agrega el token cuando hace falta,
 * traduce errores a ApiError y avisa a la app si la sesión venció.
 */
export async function apiRequest(path, { method = 'GET', body, auth = false, fallbackMessage, signal, headers: extraHeaders } = {}) {
  const headers = { ...extraHeaders };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = session.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con el servidor. Verificá que el backend esté activo.', {
      isNetworkError: true
    });
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (auth && response.status === 401 && session.getToken()) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(payload?.message || fallbackMessage || `Error ${response.status}`, {
      status: response.status
    });
  }

  return payload;
}

/** Consulta el endpoint raíz de la API para mostrar si los servicios están operativos. */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_ORIGIN}/`, { method: 'GET' });
    const payload = await response.json().catch(() => null);
    return response.ok && (payload?.status ?? 'online') === 'online';
  } catch {
    return false;
  }
}

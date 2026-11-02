import { authService, SESSION_EXPIRED_EVENT } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/productos';

const normalizeProduct = (product) => {
  if (!product) return product;

  const resolvedId = product._id ?? product.id;

  return {
    ...product,
    id: resolvedId,
    _id: resolvedId,
    imagen: product.imagen || product.imagenUrl || '',
    imagenUrl: product.imagenUrl || product.imagen || '',
    categoria: product.categoria || 'Colección',
    stock: Number(product.stock ?? 0)
  };
};

const parseResponse = async (response, fallbackMessage) => {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 401 && authService.getToken()) {
    // Token vencido o inválido en una acción protegida: avisamos a la app para cerrar sesión
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const withAuthHeaders = (extra = {}) => ({
  ...extra,
  ...authService.getAuthHeaders()
});

/**
 * Servicio para consultar el catálogo de productos a la API de Express
 */
export const productService = {
  /**
   * Obtiene todos los productos desde la API
   * @param {string} [search] Término de búsqueda opcional
   * @returns {Promise<Array>} Lista de muebles
   */
  async getProducts(search = '') {
    const url = search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
    const response = await fetch(url);

    const result = await parseResponse(response, `Error ${response.status}: No se pudieron cargar los productos`);
    return (result.data || []).map(normalizeProduct);
  },

  /**
   * Obtiene el detalle de un producto por su ID
   * @param {number|string} id Identificador del producto
   * @returns {Promise<Object>} Datos del mueble
   */
  async getProductById(id) {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok && response.status === 404) {
      throw new Error('El mueble solicitado no existe en nuestro catálogo');
    }

    const result = await parseResponse(response, `Error ${response.status}: No se pudo cargar el detalle del producto`);
    return normalizeProduct(result.data);
  },

  async createProduct(productData) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(productData)
    });

    const result = await parseResponse(response, 'No se pudo crear el producto.');
    return normalizeProduct(result.data);
  },

  async updateProduct(id, productData) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(productData)
    });

    const result = await parseResponse(response, 'No se pudo actualizar el producto.');
    return normalizeProduct(result.data);
  },

  async deleteProduct(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: withAuthHeaders()
    });

    const result = await parseResponse(response, 'No se pudo eliminar el producto.');
    return result.data ? normalizeProduct(result.data) : result;
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/productos';

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

    if (!response.ok) {
      throw new Error(`Error ${response.status}: No se pudieron cargar los productos`);
    }

    const result = await response.json();
    return result.data || [];
  },

  /**
   * Obtiene el detalle de un producto por su ID
   * @param {number|string} id Identificador del producto
   * @returns {Promise<Object>} Datos del mueble
   */
  async getProductById(id) {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('El mueble solicitado no existe en nuestro catálogo');
      }
      throw new Error(`Error ${response.status}: No se pudo cargar el detalle del producto`);
    }

    const result = await response.json();
    return result.data;
  }
};

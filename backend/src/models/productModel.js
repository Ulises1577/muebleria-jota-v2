import { products } from '../data/productsData.js';

/**
 * Modelo de Producto (Capa de Acceso y Gestión de Datos - MVC)
 */
export const ProductModel = {
  /**
   * Obtiene todos los productos del catálogo
   * @returns {Promise<Array>} Lista de productos
   */
  async getAll() {
    // Simulamos comportamiento asíncrono para replicar interacción con base de datos
    return Promise.resolve([...products]);
  },

  /**
   * Busca un producto por su identificador numérico
   * @param {number|string} id Identificador del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  async getById(id) {
    const product = products.find(p => p.id === numericId);
    return Promise.resolve(product || null);
  }
};

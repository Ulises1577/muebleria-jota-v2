import { apiRequest } from './apiClient';
import { INVENTORY } from '../config/site';

const normalizeProduct = (product) => {
  if (!product) return product;
  const resolvedId = product._id ?? product.id;
  return {
    ...product,
    id: resolvedId,
    _id: resolvedId,
    imagen: product.imagen || product.imagenUrl || '',
    imagenUrl: product.imagenUrl || product.imagen || '',
    categoria: product.categoria || INVENTORY.defaultCategory,
    descripcion: product.descripcion || '',
    precio: Number(product.precio ?? 0),
    stock: Number(product.stock ?? 0)
  };
};

/** Servicio del catálogo de productos (API Express /api/productos). */
export const productService = {
  async getProducts(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const result = await apiRequest(`/productos${query}`, {
      fallbackMessage: 'No se pudieron cargar los productos.'
    });
    return (result?.data || []).map(normalizeProduct);
  },

  async getProductById(id) {
    try {
      const result = await apiRequest(`/productos/${encodeURIComponent(id)}`, {
        fallbackMessage: 'No se pudo cargar el detalle del producto.'
      });
      return normalizeProduct(result.data);
    } catch (error) {
      if (error.status === 404) error.message = 'El mueble solicitado no existe en nuestro catálogo.';
      throw error;
    }
  },

  async createProduct(productData) {
    const result = await apiRequest('/productos', {
      method: 'POST',
      body: productData,
      auth: true,
      fallbackMessage: 'No se pudo crear el producto.'
    });
    return normalizeProduct(result.data);
  },

  async updateProduct(id, productData) {
    const result = await apiRequest(`/productos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: productData,
      auth: true,
      fallbackMessage: 'No se pudo actualizar el producto.'
    });
    return normalizeProduct(result.data);
  },

  async deleteProduct(id) {
    const result = await apiRequest(`/productos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      auth: true,
      fallbackMessage: 'No se pudo eliminar el producto.'
    });
    return result?.data ? normalizeProduct(result.data) : result;
  }
};

import { apiRequest } from './apiClient';

/** Servicio de pedidos (API Express /api/pedidos). */
export const orderService = {
  async createOrder({ items, datosEnvio }) {
    const result = await apiRequest('/pedidos', {
      method: 'POST',
      auth: true,
      body: {
        items: items.map((item) => ({
          productoId: item._id ?? item.id,
          nombre: item.nombre,
          precio: Number(item.precio),
          cantidad: Number(item.quantity),
          imagenUrl: item.imagenUrl || item.imagen || ''
        })),
        datosEnvio
      },
      fallbackMessage: 'No se pudo registrar el pedido.'
    });
    return result.data;
  },

  async getMyOrders() {
    const result = await apiRequest('/pedidos/mis-pedidos', {
      auth: true,
      fallbackMessage: 'No se pudieron cargar tus pedidos.'
    });
    return result.data || [];
  },

  async getAllOrders() {
    const result = await apiRequest('/pedidos', {
      auth: true,
      fallbackMessage: 'No se pudieron cargar los pedidos.'
    });
    return result.data || [];
  },

  async updateStatus(id, estado) {
    const result = await apiRequest(`/pedidos/${encodeURIComponent(id)}/estado`, {
      method: 'PATCH',
      auth: true,
      body: { estado },
      fallbackMessage: 'No se pudo actualizar el estado del pedido.'
    });
    return result.data;
  }
};

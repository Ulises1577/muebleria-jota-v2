import { apiRequest } from './apiClient';

/** Servicio de pedidos (API Express /api/pedidos). */
export const orderService = {
  /**
   * Finaliza la compra. Requiere sesión: el JWT viaja en Authorization: Bearer (auth: true).
   * Solo se envían producto y cantidad; precios y total los calcula el backend.
   * `idempotencyKey` identifica el intento de compra para que un reenvío no duplique el pedido.
   */
  async createOrder({ items, datosEnvio, idempotencyKey }) {
    const result = await apiRequest('/pedidos', {
      method: 'POST',
      auth: true,
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: {
        items: items.map((item) => ({
          productoId: item._id ?? item.id,
          cantidad: Number(item.quantity)
        })),
        datosEnvio
      },
      fallbackMessage: 'No se pudo registrar el pedido.'
    });
    return { order: result.data, duplicated: Boolean(result.duplicated) };
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

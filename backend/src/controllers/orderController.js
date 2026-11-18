import { OrderModel, ORDER_STATUSES } from '../models/orderModel.js';
import { ProductModel } from '../models/productModel.js';

export const OrderController = {
  /**
   * POST /api/pedidos
   * Crea un nuevo pedido asociado al usuario autenticado (extraído del JWT).
   */
  async createOrder(req, res, next) {
    try {
      const { items, total, datosEnvio } = req.body || {};

      // 1. Validar que vengan items y sea un arreglo no vacío
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El pedido debe incluir al menos un producto.'
        });
      }

      // 2. Validar estructura de cada item y calcular el total
      let calculatedTotal = 0;
      const formattedItems = [];

      for (const item of items) {
        const productoId = item.productoId || item._id || item.id;
        const nombre = item.nombre;
        const precio = Number(item.precio);
        const cantidad = Number(item.cantidad || item.quantity || 1);

        if (!productoId || !nombre) {
          return res.status(400).json({
            success: false,
            message: 'Cada producto debe tener un ID y un nombre válido.'
          });
        }

        if (Number.isNaN(precio) || precio < 0) {
          return res.status(400).json({
            success: false,
            message: `El precio del producto "${nombre}" no es válido.`
          });
        }

        if (Number.isNaN(cantidad) || cantidad < 1) {
          return res.status(400).json({
            success: false,
            message: `La cantidad del producto "${nombre}" debe ser de al menos 1 unidad.`
          });
        }

        calculatedTotal += precio * cantidad;

        formattedItems.push({
          productoId: String(productoId),
          nombre: String(nombre).trim(),
          precio,
          cantidad,
          imagenUrl: item.imagenUrl || item.imagen || ''
        });
      }

      // 2b. Validar stock disponible antes de confirmar (solo productos que existen en el catálogo)
      const stockUpdates = [];
      for (const item of formattedItems) {
        const product = await ProductModel.getById(item.productoId);
        if (!product) continue;

        const available = Number(product.stock ?? 0);
        if (available < item.cantidad) {
          return res.status(409).json({
            success: false,
            message: available > 0
              ? `Solo quedan ${available} unidad(es) de "${item.nombre}".`
              : `"${item.nombre}" está sin stock en este momento.`
          });
        }

        stockUpdates.push({ id: product._id ?? product.id, stock: available - item.cantidad });
      }

      // El total final es el calculado a partir de los items
      const finalTotal = total !== undefined && !Number.isNaN(Number(total)) && Number(total) >= 0
        ? Number(total)
        : calculatedTotal;

      // 3. Crear el pedido asociándolo al usuario del token (req.user)
      const orderData = {
        usuarioId: req.user.id,
        usuarioEmail: req.user.email,
        items: formattedItems,
        total: finalTotal,
        estado: 'confirmado',
        datosEnvio: {
          direccion: datosEnvio?.direccion || '',
          telefono: datosEnvio?.telefono || '',
          notas: datosEnvio?.notas || ''
        }
      };

      const newOrder = await OrderModel.create(orderData);

      // 4. Descontar del inventario las unidades vendidas
      await Promise.all(stockUpdates.map(({ id, stock }) => ProductModel.updateById(id, { stock })));

      return res.status(201).json({
        success: true,
        message: 'Pedido realizado con éxito.',
        data: newOrder
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/pedidos/mis-pedidos
   * Obtiene la lista de pedidos realizados por el usuario autenticado.
   */
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await OrderModel.findByUserId(userId);

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/pedidos/:id
   * Obtiene una orden por su ID.
   * Solo accesible por el dueño de la orden o por un administrador.
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado.'
        });
      }

      // Validar pertenencia: solo el dueño o un admin pueden verlo
      const isOwner = String(order.usuarioId) === String(req.user.id);
      const isAdmin = req.user.rol === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tenés permisos para ver este pedido.'
        });
      }

      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/pedidos
   * Obtiene todas las órdenes de la tienda (solo para administradores).
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body || {};

      if (!ORDER_STATUSES.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: `Estado inválido. Valores permitidos: ${ORDER_STATUSES.join(', ')}.`
        });
      }

      const order = await OrderModel.updateStatus(id, estado);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Estado del pedido actualizado.',
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllOrders(req, res, next) {
    try {
      const orders = await OrderModel.getAll();

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }
};

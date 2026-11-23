import { OrderModel, ORDER_STATUSES } from '../models/orderModel.js';
import { ProductModel } from '../models/productModel.js';

// Formato aceptado para el header Idempotency-Key (ej. un UUID generado por el front)
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

export const OrderController = {
  /**
   * POST /api/pedidos
   * Crea un nuevo pedido asociado al usuario autenticado (extraído del JWT, nunca del body).
   * Nombre, precio y total se toman del catálogo: el front solo indica qué productos y cuántos.
   * Header opcional "Idempotency-Key": si se repite, devuelve el pedido ya creado en lugar de duplicarlo.
   */
  async createOrder(req, res, next) {
    try {
      const { items, datosEnvio } = req.body || {};
      const usuarioId = req.user.id;

      // 1. Validar la clave de idempotencia (opcional)
      const rawKey = req.get('Idempotency-Key');
      const idempotencyKey = rawKey ? String(rawKey).trim() : '';
      if (idempotencyKey && !IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
        return res.status(400).json({
          success: false,
          message: 'La clave de idempotencia no es válida.'
        });
      }

      // 2. Si este intento de compra ya se registró (doble clic, reintento por corte de red), no se duplica
      if (idempotencyKey) {
        const existing = await OrderModel.findByIdempotencyKey(usuarioId, idempotencyKey);
        if (existing) {
          return res.status(200).json({
            success: true,
            duplicated: true,
            message: 'Este pedido ya había sido registrado.',
            data: existing
          });
        }
      }

      // 3. Validar que vengan items y sea un arreglo no vacío
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El pedido debe incluir al menos un producto.'
        });
      }

      // 4. Validar cada línea y agrupar por producto (una misma pieza repetida suma cantidades)
      const quantities = new Map();
      for (const item of items) {
        const productoId = item?.productoId ?? item?._id ?? item?.id;
        const cantidad = Number(item?.cantidad ?? item?.quantity);

        if (productoId === undefined || productoId === null || String(productoId).trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Cada producto del pedido debe tener un ID válido.'
          });
        }

        if (!Number.isInteger(cantidad) || cantidad < 1) {
          return res.status(400).json({
            success: false,
            message: 'La cantidad de cada producto debe ser un número entero de al menos 1 unidad.'
          });
        }

        const key = String(productoId).trim();
        quantities.set(key, (quantities.get(key) || 0) + cantidad);
      }

      // 5. Verificar contra el catálogo real: existencia, precio vigente y stock
      const formattedItems = [];
      for (const [productoId, cantidad] of quantities) {
        const product = await ProductModel.getById(productoId);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: 'Uno de los productos del carrito ya no está disponible en el catálogo.'
          });
        }

        const available = Number(product.stock ?? 0);
        if (available < cantidad) {
          return res.status(409).json({
            success: false,
            message: available > 0
              ? `Solo quedan ${available} unidad(es) de "${product.nombre}".`
              : `"${product.nombre}" está sin stock en este momento.`
          });
        }

        formattedItems.push({
          productoId: String(product._id ?? product.id),
          nombre: product.nombre,
          precio: Number(product.precio),
          cantidad,
          imagenUrl: product.imagenUrl || product.imagen || ''
        });
      }

      // 6. Reservar stock de forma atómica; si alguna pieza se agotó mientras tanto, se revierte todo
      const reserved = [];
      const releaseStock = () => Promise.all(
        reserved.map(({ productoId, cantidad }) => ProductModel.incrementStock(productoId, cantidad))
      );

      for (const item of formattedItems) {
        const updated = await ProductModel.decrementStock(item.productoId, item.cantidad);
        if (!updated) {
          await releaseStock();
          return res.status(409).json({
            success: false,
            message: `"${item.nombre}" ya no tiene stock suficiente. Actualizá tu carrito e intentá de nuevo.`
          });
        }
        reserved.push(item);
      }

      // 7. Crear el pedido asociado al usuario del token (req.user), con el total calculado en el servidor
      const total = formattedItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      const orderData = {
        usuarioId,
        usuarioEmail: req.user.email,
        items: formattedItems,
        total,
        estado: 'confirmado',
        datosEnvio: {
          direccion: String(datosEnvio?.direccion ?? '').trim(),
          telefono: String(datosEnvio?.telefono ?? '').trim(),
          notas: String(datosEnvio?.notas ?? '').trim()
        },
        ...(idempotencyKey && { idempotencyKey })
      };

      let newOrder;
      try {
        newOrder = await OrderModel.create(orderData);
      } catch (error) {
        await releaseStock();

        // Dos envíos simultáneos con la misma clave: el segundo devuelve el pedido del primero
        if (error.code === 11000 && idempotencyKey) {
          const existing = await OrderModel.findByIdempotencyKey(usuarioId, idempotencyKey);
          if (existing) {
            return res.status(200).json({
              success: true,
              duplicated: true,
              message: 'Este pedido ya había sido registrado.',
              data: existing
            });
          }
        }
        throw error;
      }

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

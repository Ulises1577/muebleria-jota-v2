import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productoId: { type: String, required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    imagenUrl: { type: String, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true
    },
    usuarioEmail: { type: String, required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true, min: 0 },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmado', 'enviado', 'entregado'],
      default: 'confirmado'
    },
    datosEnvio: {
      direccion: { type: String, default: '' },
      telefono: { type: String, default: '' },
      notas: { type: String, default: '' }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Order = mongoose.model('Order', orderSchema);

const fallbackOrders = [];

export const ORDER_STATUSES = ['pendiente', 'confirmado', 'enviado', 'entregado'];

export const OrderModel = {
  async create(orderData) {
    if (mongoose.connection.readyState === 1) {
      const order = await Order.create(orderData);
      return order.toObject();
    }

    const newOrder = {
      _id: `order-${Date.now()}`,
      usuarioId: String(orderData.usuarioId),
      usuarioEmail: orderData.usuarioEmail,
      items: orderData.items,
      total: Number(orderData.total),
      estado: orderData.estado || 'confirmado',
      datosEnvio: {
        direccion: orderData.datosEnvio?.direccion || '',
        telefono: orderData.datosEnvio?.telefono || '',
        notas: orderData.datosEnvio?.notas || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fallbackOrders.push(newOrder);
    return newOrder;
  },

  async findByUserId(userId) {
    if (mongoose.connection.readyState === 1) {
      return Order.find({ usuarioId: userId })
        .sort({ createdAt: -1 })
        .lean();
    }

    return fallbackOrders
      .filter((order) => String(order.usuarioId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      return Order.findById(id).lean();
    }

    return fallbackOrders.find((order) => String(order._id) === String(id)) || null;
  },

  async updateStatus(id, estado) {
    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      return Order.findByIdAndUpdate(id, { estado }, { new: true, runValidators: true }).lean();
    }

    const order = fallbackOrders.find((item) => String(item._id) === String(id));
    if (!order) return null;
    order.estado = estado;
    order.updatedAt = new Date().toISOString();
    return order;
  },

  async getAll() {
    if (mongoose.connection.readyState === 1) {
      return Order.find().sort({ createdAt: -1 }).lean();
    }

    return [...fallbackOrders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
};

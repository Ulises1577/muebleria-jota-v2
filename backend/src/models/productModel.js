import mongoose from 'mongoose';
import { products } from '../data/productsData.js';

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true
    },
    descripcion: {
      type: String,
      trim: true,
      default: ''
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo']
    },
    imagenUrl: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Product = mongoose.model('Product', productSchema);

const fallbackProducts = [...products].map((product) => ({
  ...product,
  _id: String(product.id),
  imagenUrl: product.imagen || '',
  stock: product.stock ?? 0,
  descripcion: product.descripcion || ''
}));

export const ProductModel = {
  async getAll() {
    if (mongoose.connection.readyState === 1) {
      return Product.find().lean();
    }

    return [...fallbackProducts];
  },

  async getById(id) {
    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      return Product.findById(id).lean();
    }

    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      return fallbackProducts.find((product) => Number(product.id) === numericId) || null;
    }

    return fallbackProducts.find((product) => String(product._id) === String(id)) || null;
  },

  async create(productData) {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.create(productData);
      return product.toObject();
    }

    const newProduct = {
      _id: String(Date.now()),
      id: Date.now(),
      nombre: productData.nombre,
      descripcion: productData.descripcion || '',
      precio: Number(productData.precio),
      stock: Number(productData.stock || 0),
      imagenUrl: productData.imagenUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fallbackProducts.push(newProduct);
    return newProduct;
  },

  async updateById(id, updates) {
    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const product = await Product.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      }).lean();

      return product;
    }

    const index = fallbackProducts.findIndex((product) => Number(product.id) === Number(id) || String(product._id) === String(id));
    if (index === -1) {
      return null;
    }

    fallbackProducts[index] = {
      ...fallbackProducts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return fallbackProducts[index];
  },

  async deleteById(id) {
    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const product = await Product.findByIdAndDelete(id).lean();
      return product;
    }

    const index = fallbackProducts.findIndex((product) => Number(product.id) === Number(id) || String(product._id) === String(id));
    if (index === -1) {
      return null;
    }

    const [deletedProduct] = fallbackProducts.splice(index, 1);
    return deletedProduct;
  }
};

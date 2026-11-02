import mongoose from 'mongoose';
import { ProductModel } from '../models/productModel.js';

const validateProductPayload = (payload) => {
  const errors = [];

  if (!payload?.nombre || typeof payload.nombre !== 'string' || !payload.nombre.trim()) {
    errors.push('El nombre del producto es obligatorio');
  }

  if (payload?.precio === undefined || payload?.precio === null || Number.isNaN(Number(payload.precio))) {
    errors.push('El precio es obligatorio');
  }

  if (payload?.precio !== undefined && payload.precio !== null && Number(payload.precio) < 0) {
    errors.push('El precio no puede ser negativo');
  }

  if (payload?.stock !== undefined && payload?.stock !== null && Number(payload.stock) < 0) {
    errors.push('El stock no puede ser negativo');
  }

  return errors;
};

export const ProductController = {
  async getProducts(req, res, next) {
    try {
      const { search } = req.query;
      let items = await ProductModel.getAll();

      if (search && typeof search === 'string') {
        const query = search.trim().toLowerCase();
        items = items.filter((item) => {
          const nombre = item?.nombre ? item.nombre.toLowerCase() : '';
          const descripcion = item?.descripcion ? item.descripcion.toLowerCase() : '';
          return nombre.includes(query) || descripcion.includes(query);
        });
      }

      return res.status(200).json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id) && Number.isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'El ID del producto no es válido.'
        });
      }

      const product = await ProductModel.getById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${id} no encontrado.`
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req, res, next) {
    try {
      const payload = req.body || {};
      const validationErrors = validateProductPayload(payload);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors[0]
        });
      }

      const product = await ProductModel.create({
        nombre: payload.nombre.trim(),
        descripcion: payload.descripcion?.trim() || '',
        precio: Number(payload.precio),
        stock: Number(payload.stock ?? 0),
        categoria: payload.categoria?.trim() || 'Colección',
        imagenUrl: payload.imagenUrl?.trim() || payload.imagen?.trim() || ''
      });

      return res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const payload = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id) && Number.isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'El ID del producto no es válido.'
        });
      }

      const validationErrors = validateProductPayload(payload);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors[0]
        });
      }

      const updatedProduct = await ProductModel.updateById(id, {
        nombre: payload.nombre.trim(),
        descripcion: payload.descripcion?.trim() || '',
        precio: Number(payload.precio),
        stock: Number(payload.stock ?? 0),
        categoria: payload.categoria?.trim() || 'Colección',
        imagenUrl: payload.imagenUrl?.trim() || payload.imagen?.trim() || ''
      });

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${id} no encontrado.`
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id) && Number.isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: 'El ID del producto no es válido.'
        });
      }

      const deletedProduct = await ProductModel.deleteById(id);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${id} no encontrado.`
        });
      }

      return res.status(200).json({
        success: true,
        data: deletedProduct,
        message: 'Producto eliminado correctamente.'
      });
    } catch (error) {
      next(error);
    }
  }
};

import { ProductModel } from '../models/productModel.js';

/**
 * Controlador de Productos (Capa de Lógica de Negocio y Respuestas HTTP - MVC)
 */
export const ProductController = {
  /**
   * Manejador para listar todos los productos
   * GET /api/productos
   */
  async getProducts(req, res, next) {
    try {
      const { search } = req.query;
      let items = await ProductModel.getAll();

      // Soporte opcional de filtrado por búsqueda en backend
      if (search && typeof search === 'string') {
        const query = search.trim().toLowerCase();
        items = items.filter(item => {
          const nombre = item.nombre ? item.nombre.lowerCase() : '';
          const descripcion = item.descripcion ? item.descripcion.lowerCase() : '';
          return nombre.includes(query) || descripcion.includes(query);
        })
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

  /**
   * Manejador para obtener un producto específico por ID
   * GET /api/productos/:id
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const numericId = Number(id);
      if (isNaN(numericId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID del producto debe ser un número válido.'
        });
      }

      const product = await ProductModel.getById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Producto con ID ${id} no encontrado.`
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
};

import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Retorna la lista de todos los productos
 *     responses:
 *       200:
 *         description: Lista de productos exitosa
 */
// GET /api/productos -> listado completo en JSON
router.get('/', (req, res, next) => ProductController.getProducts(req, res, next));

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Retorna el detalle de un producto específico
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalle del producto exitoso
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', (req, res, next) => ProductController.getProductById(req, res, next));

export default router;

import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { requireAdmin, verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *       properties:
 *         _id:
 *           type: string
 *           description: Identificador único del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         descripcion:
 *           type: string
 *           description: Descripción del producto
 *         precio:
 *           type: number
 *           description: Precio del producto
 *         stock:
 *           type: integer
 *           description: Cantidad disponible
 *         imagenUrl:
 *           type: string
 *           description: URL de la imagen del producto
 *     ProductInput:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *       properties:
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         precio:
 *           type: number
 *         stock:
 *           type: integer
 *         imagenUrl:
 *           type: string
 */

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear un producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos inválidos
 */
router.get('/', (req, res, next) => ProductController.getProducts(req, res, next));
router.post('/', verifyToken, requireAdmin, (req, res, next) => ProductController.createProduct(req, res, next));

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: ID o datos inválidos
 *       404:
 *         description: Producto no encontrado
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', (req, res, next) => ProductController.getProductById(req, res, next));
router.put('/:id', verifyToken, requireAdmin, (req, res, next) => ProductController.updateProduct(req, res, next));
router.delete('/:id', verifyToken, requireAdmin, (req, res, next) => ProductController.deleteProduct(req, res, next));

export default router;

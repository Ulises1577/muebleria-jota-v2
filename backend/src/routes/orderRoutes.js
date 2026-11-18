import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - productoId
 *         - nombre
 *         - precio
 *         - cantidad
 *       properties:
 *         productoId:
 *           type: string
 *         nombre:
 *           type: string
 *         precio:
 *           type: number
 *         cantidad:
 *           type: integer
 *         imagenUrl:
 *           type: string
 *     OrderInput:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
 *           type: number
 *         datosEnvio:
 *           type: object
 *           properties:
 *             direccion:
 *               type: string
 *             telefono:
 *               type: string
 *             notas:
 *               type: string
 */

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       201:
 *         description: Pedido creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post('/', verifyToken, (req, res, next) => OrderController.createOrder(req, res, next));

/**
 * @swagger
 * /api/pedidos/mis-pedidos:
 *   get:
 *     summary: Obtener el historial de pedidos del usuario autenticado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos del usuario
 *       401:
 *         description: No autenticado
 */
router.get('/mis-pedidos', verifyToken, (req, res, next) => OrderController.getMyOrders(req, res, next));

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Obtener todos los pedidos (Solo Administrador)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los pedidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador
 */
router.get('/', verifyToken, requireAdmin, (req, res, next) => OrderController.getAllOrders(req, res, next));

/**
 * @swagger
 * /api/pedidos/{id}:
 *   get:
 *     summary: Obtener el detalle de un pedido por ID
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del pedido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso para ver este pedido
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', verifyToken, (req, res, next) => OrderController.getOrderById(req, res, next));

/**
 * @swagger
 * /api/pedidos/{id}/estado:
 *   patch:
 *     summary: Actualizar el estado de un pedido (Solo Administrador)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, confirmado, enviado, entregado]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Estado inválido
 *       403:
 *         description: Requiere rol de administrador
 *       404:
 *         description: Pedido no encontrado
 */
router.patch('/:id/estado', verifyToken, requireAdmin, (req, res, next) => OrderController.updateOrderStatus(req, res, next));

export default router;

import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar las cuentas registradas (Solo Administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios sin contraseñas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador
 */
router.get('/', verifyToken, requireAdmin, (req, res, next) => UserController.listUsers(req, res, next));

export default router;

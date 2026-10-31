import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthRegister:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre completo del usuario
 *         email:
 *           type: string
 *           description: Correo electrónico (único)
 *         password:
 *           type: string
 *           description: Contraseña (mínimo 6 caracteres)
 *     AuthLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegister'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El email ya está registrado
 */
router.post('/register', (req, res, next) => AuthController.register(req, res, next));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLogin'
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve token JWT
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', (req, res, next) => AuthController.login(req, res, next));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 *       401:
 *         description: Token inválido o ausente
 */
router.get('/me', verifyToken, (req, res, next) => AuthController.me(req, res, next));

export default router;

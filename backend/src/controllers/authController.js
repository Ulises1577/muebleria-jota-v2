import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UserModel } from '../models/userModel.js';

/**
 * Genera un token JWT con los datos esenciales del usuario.
 * Expira en 24 horas.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      rol: user.rol
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
};

export const AuthController = {
  /**
   * POST /api/auth/register
   * Registra un nuevo usuario con rol 'usuario' por defecto.
   */
  async register(req, res, next) {
    try {
      const { nombre, email, password } = req.body || {};

      // Validaciones
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El nombre es obligatorio.'
        });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El email es obligatorio.'
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres.'
        });
      }

      // Verificar si el email ya existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una cuenta con este email.'
        });
      }

      // Crear usuario (siempre con rol 'usuario' por seguridad)
      const newUser = await UserModel.create({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol: 'usuario'
      });

      // Generar token
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Cuenta creada exitosamente.',
        data: {
          user: {
            _id: newUser._id,
            nombre: newUser.nombre,
            email: newUser.email,
            rol: newUser.rol
          },
          token
        }
      });
    } catch (error) {
      // Error de duplicado de MongoDB
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una cuenta con este email.'
        });
      }
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Inicia sesión con email y contraseña, devuelve token JWT.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son obligatorios.'
        });
      }

      // Buscar usuario por email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos.'
        });
      }

      // Comparar contraseñas
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos.'
        });
      }

      // Generar token
      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: {
          user: {
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Devuelve los datos del usuario autenticado (requiere token válido).
   */
  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
};

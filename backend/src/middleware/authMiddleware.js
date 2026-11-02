import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UserModel } from '../models/userModel.js';

/**
 * Middleware: Verificar Token JWT
 * Extrae el token del header Authorization, lo valida y adjunta
 * los datos del usuario a req.user para que los controladores los usen.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No se proporcionó un token válido.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    // Verificar que el usuario aún existe en la base de datos
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'El usuario asociado a este token ya no existe.'
      });
    }

    // Adjuntar datos del usuario al objeto request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado.'
    });
  }
};

/**
 * Middleware: Requerir Rol de Administrador
 * Debe usarse DESPUÉS de verifyToken.
 * Verifica que el usuario autenticado tenga rol 'admin'.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Debés estar autenticado para realizar esta acción.'
    });
  }

  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No tenés permisos de administrador para esta acción.'
    });
  }

  next();
};

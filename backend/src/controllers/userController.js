import { UserModel } from '../models/userModel.js';

export const UserController = {
  /**
   * GET /api/usuarios
   * Lista las cuentas registradas (sin contraseñas). Solo administradores.
   */
  async listUsers(req, res, next) {
    try {
      const users = await UserModel.getAll();
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
};

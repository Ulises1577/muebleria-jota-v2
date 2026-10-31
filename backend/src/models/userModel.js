import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Esquema de Usuario para autenticación y control de acceso.
 * Roles disponibles: 'usuario' (cliente común) y 'admin' (administrador).
 */
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    rol: {
      type: String,
      enum: ['usuario', 'admin'],
      default: 'usuario'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Hashear la contraseña antes de guardar (solo si fue modificada)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas en el login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

/**
 * Usuarios semilla para el modo fallback (sin MongoDB).
 * Las contraseñas se hashean al inicializar el módulo.
 */
const seedPassword = await bcrypt.hash('123456', 10);

const fallbackUsers = [
  {
    _id: 'admin-001',
    nombre: 'Administrador Jota',
    email: 'admin@hermanosjota.com',
    password: seedPassword,
    rol: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'user-001',
    nombre: 'Cliente Demo',
    email: 'cliente@hermanosjota.com',
    password: seedPassword,
    rol: 'usuario',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const UserModel = {
  /**
   * Buscar usuario por email (para login y validación de registro)
   */
  async findByEmail(email) {
    if (mongoose.connection.readyState === 1) {
      return User.findOne({ email: email.toLowerCase() });
    }

    const user = fallbackUsers.find((u) => u.email === email.toLowerCase());
    if (!user) return null;

    // En fallback, retornamos un objeto que simula los métodos de Mongoose
    return {
      ...user,
      comparePassword: async (candidate) => bcrypt.compare(candidate, user.password)
    };
  },

  /**
   * Buscar usuario por ID (para verificar token)
   */
  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return User.findById(id).select('-password').lean();
    }

    const user = fallbackUsers.find((u) => u._id === id);
    if (!user) return null;

    // Retornar sin la contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Crear un nuevo usuario (registro)
   */
  async create(userData) {
    if (mongoose.connection.readyState === 1) {
      const user = await User.create(userData);
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    }

    // Verificar que el email no exista en fallback
    const exists = fallbackUsers.find((u) => u.email === userData.email.toLowerCase());
    if (exists) {
      const error = new Error('El email ya está registrado');
      error.code = 11000; // Simular error de duplicado de MongoDB
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = {
      _id: String(Date.now()),
      nombre: userData.nombre,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      rol: userData.rol || 'usuario',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fallbackUsers.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
};

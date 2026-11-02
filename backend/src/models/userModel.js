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
    },
    telefono: {
      type: String,
      trim: true,
      default: ''
    },
    direccion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Hashear la contraseña antes de guardar (solo si fue modificada)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
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
    telefono: '',
    direccion: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'user-001',
    nombre: 'Cliente Demo',
    email: 'cliente@hermanosjota.com',
    password: seedPassword,
    rol: 'usuario',
    telefono: '',
    direccion: '',
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
      telefono: userData.telefono || '',
      direccion: userData.direccion || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fallbackUsers.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async updateById(id, updates) {
    const allowed = {};
    if (typeof updates.nombre === 'string') allowed.nombre = updates.nombre.trim();
    if (typeof updates.telefono === 'string') allowed.telefono = updates.telefono.trim();
    if (typeof updates.direccion === 'string') allowed.direccion = updates.direccion.trim();

    if (mongoose.connection.readyState === 1) {
      return User.findByIdAndUpdate(id, allowed, {
        new: true,
        runValidators: true
      }).select('-password').lean();
    }

    const index = fallbackUsers.findIndex((user) => String(user._id) === String(id));
    if (index === -1) return null;

    fallbackUsers[index] = {
      ...fallbackUsers[index],
      ...allowed,
      updatedAt: new Date().toISOString()
    };

    const { password, ...userWithoutPassword } = fallbackUsers[index];
    return userWithoutPassword;
  },

  async ensureSeedUsers() {
    if (mongoose.connection.readyState !== 1) return;

    const seeds = [
      {
        nombre: 'Administrador Jota',
        email: 'admin@hermanosjota.com',
        password: '123456',
        rol: 'admin'
      },
      {
        nombre: 'Cliente Demo',
        email: 'cliente@hermanosjota.com',
        password: '123456',
        rol: 'usuario'
      }
    ];

    for (const seed of seeds) {
      const exists = await User.findOne({ email: seed.email });
      if (!exists) {
        await User.create(seed);
        console.log(`Usuario semilla creado: ${seed.email}`);
        continue;
      }

      // El usuario ya existía: se lee el documento "crudo" de la base (sin valores por defecto)
      // y, si el rol está mal guardado (por ejemplo "role" o "isAdmin" de una versión anterior),
      // se corrige a "rol" para que el login y el token salgan con el rol correcto.
      const raw = await User.collection.findOne({ email: seed.email });
      if (raw && raw.rol !== seed.rol) {
        await User.collection.updateOne(
          { email: seed.email },
          { $set: { rol: seed.rol }, $unset: { role: '', isAdmin: '' } }
        );
        console.log(`Rol corregido en la base: ${seed.email} -> ${seed.rol}`);
      }
    }
  }
};
 
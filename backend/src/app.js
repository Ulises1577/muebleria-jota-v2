import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { config } from './config/env.js';

const app = express();

const allowedOrigins = [config.clientUrl, config.frontendUrl, 'http://localhost:5000', 'http://127.0.0.1:5000'].filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    const isLocalDevelopmentOrigin = config.nodeEnv === 'development'
      && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');

    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({
    name: 'Mueblería Hermanos Jota API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      productos: '/api/productos',
      productoDetalle: '/api/productos/:id',
      auth: '/api/auth',
      pedidos: '/api/pedidos',
      usuarios: '/api/usuarios'
    }
  });
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Mueblería Jota',
      version: '1.0.0',
      description: 'Documentación del backend de Mueblería Jota'
    },
    servers: [
      { url: `http://localhost:${config.port}` },
      { url: 'https://<app-name>.onrender.com' }
    ],
    tags: [
      { name: 'Productos', description: 'Gestión de productos del catálogo' },
      { name: 'Autenticación', description: 'Registro, login y perfil de usuarios' },
      { name: 'Pedidos', description: 'Gestión y creación de pedidos' },
      { name: 'Usuarios', description: 'Administración de cuentas registradas' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['nombre', 'precio'],
          properties: {
            _id: { type: 'string', description: 'ID del producto' },
            nombre: { type: 'string', description: 'Nombre del producto' },
            descripcion: { type: 'string', description: 'Descripción' },
            precio: { type: 'number', description: 'Precio' },
            stock: { type: 'integer', description: 'Stock disponible' },
            imagenUrl: { type: 'string', description: 'URL de la imagen' }
          }
        },
        ProductInput: {
          type: 'object',
          required: ['nombre', 'precio'],
          properties: {
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            precio: { type: 'number' },
            stock: { type: 'integer' },
            imagenUrl: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/pedidos', orderRoutes);
app.use('/api/usuarios', userRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
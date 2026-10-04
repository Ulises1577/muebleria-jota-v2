import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';
import { config } from './config/env.js';

const app = express();

const corsOptions = {
  origin: config.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// Middlewares globales
app.use(cors(corsOptions));
app.use(express.json()); // Habilitado para futuras peticiones POST/PUT
app.use(requestLogger);

// Ruta de estado / bienvenida
app.get('/', (req, res) => {
  res.json({
    name: 'Mueblería Hermanos Jota API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      productos: '/api/productos',
      productoDetalle: '/api/productos/:id'
    }
  });
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Mueblería Jota',
      version: '1.0.0',
      description: 'Documentación del backend de Mueblería Jota',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Actualizado al puerto correcto
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Montaje de rutas de la API
app.use('/api/productos', productRoutes);

// Manejadores de 404 y Errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
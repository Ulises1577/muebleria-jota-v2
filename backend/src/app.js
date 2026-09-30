import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

// Middlewares globales
app.use(cors());
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

// Montaje de rutas de la API
app.use('/api/productos', productRoutes);

// Manejadores de 404 y Errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

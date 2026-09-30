import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();

// GET /api/productos -> listado completo en JSON
router.get('/', ProductController.getProducts);

// GET /api/productos/:id -> detalle del producto en JSON (o 404)
router.get('/:id', ProductController.getProductById);

export default router;

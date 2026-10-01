import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';

const router = Router();

// GET /api/productos -> listado completo en JSON
router.get('/', (req, res, next) => ProductController.getProducts(req, res, next));

// GET /api/productos/:id -> detalle del producto en JSON (o 404)
router.get('/:id', (req, res, next) => ProductController.getProductById(req, res, next));

export default router;

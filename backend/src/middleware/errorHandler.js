/**
 * Manejador para rutas y endpoints no encontrados (404)
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: [${req.method}] ${req.originalUrl}`
  });
};

/**
 * Manejador de errores centralizado (500)
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
};

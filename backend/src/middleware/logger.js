/**
 * Middleware global de registro de peticiones (Logging)
 * Requisito Sprint 3: Registra el método HTTP y la URL solicitada.
 */
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

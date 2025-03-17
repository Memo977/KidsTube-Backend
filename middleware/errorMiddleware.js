const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: "Route not found" });
};

/**
 * Middleware para capturar y manejar errores no controlados
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: "Internal server error" });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedTokenModel');

/**
 * Middleware de autenticación para proteger rutas
 */
const authenticate = async (req, res, next) => {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    { path: '/api/users', method: 'POST' },           // Registro de usuario
    { path: '/api/users/confirm', method: 'GET' },    // Confirmación de email
    { path: '/api/session', method: 'POST' }          // Login
  ];
  
  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => 
    req.path === route.path && req.method === route.method
  );
  
  if (isPublicRoute) {
    return next();
  }
  
  // Si requiere autenticación, verificar token
  if (!req.headers["authorization"]) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const authHeader = req.headers['authorization'];
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Invalid authorization format" });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar si el token está en la lista negra
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ error: "Token has been revoked" });
    }
    
    // Verificar validez del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Añadir información del usuario decodificada a req
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;
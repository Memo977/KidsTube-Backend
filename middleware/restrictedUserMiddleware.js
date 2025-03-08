/**
 * Middleware para manejar autenticación de usuarios restringidos por PIN
 */
const Restricted_users = require('../models/restricted_usersModel');

const authenticateRestrictedUser = async (req, res, next) => {
    // Si ya hay un usuario autenticado (admin), continuar
    if (req.user) {
        return next();
    }
    
    const pin = req.headers['x-restricted-pin'];
    
    if (!pin) {
        return res.status(401).json({ error: "Se requiere PIN para acceso restringido" });
    }
    
    try {
        const restrictedUser = await Restricted_users.findOne({ pin });
        
        if (!restrictedUser) {
            return res.status(401).json({ error: "PIN inválido" });
        }
        
        // Guardar ID del usuario restringido en el request para uso posterior
        req.restrictedUserId = restrictedUser._id.toString();
        
        next();
    } catch (err) {
        console.error("Error en autenticación de usuario restringido:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = authenticateRestrictedUser;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedTokenModel');
const { userGetEmail } = require('../controllers/userController');
const { saveSession, deleteSession } = require('../controllers/sessionController');

/**
 * Login con JWT y bcrypt
 * POST /api/session
 */
router.post("/", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(422).json({
      error: 'Username and password are required'
    });
  }

  try {
    const savedUser = await userGetEmail(req.body.username);
    if (!savedUser) {
      return res.status(422).json({
        error: 'Invalid username or password'
      });
    }

    // Verificar si la cuenta está confirmada
    if (savedUser.state === false) {
      return res.status(403).json({
        error: 'Your account has not been confirmed. Please check your email to confirm your registration.'
      });
    }

    // Comparar la contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(req.body.password, savedUser.password);
    
    if (passwordMatch) {
      // Generar JWT con información del usuario
      const token = jwt.sign({
        email: savedUser.email,
        name: savedUser.name,
        permission: ['create', 'edit', 'delete', 'get'],
        id: savedUser._id
      }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Opcional: Guardar información de sesión
      await saveSession(savedUser.email);
      
      return res.status(201).json({ token });
    } else {
      return res.status(422).json({
        error: 'Invalid username or password'
      });
    }
  } catch (err) {
    console.log('Error during login:', err);
    return res.status(500).json({
      error: "Internal server error: " + err.message
    });
  }
});

/**
 * Logout - revoca el token JWT
 * DELETE /api/session
 */
router.delete("/", async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Añadir token a la lista negra hasta que expire
    const expirationDate = new Date(decoded.exp * 1000); // Convertir a milisegundos
    
    const blacklistToken = new BlacklistedToken({
      token: token,
      expireAt: expirationDate
    });
    
    await blacklistToken.save();
    
    // Opcional: Eliminar también de la tabla de sesiones
    await deleteSession(decoded.email);
    
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error during logout:", err);
    return res.status(500).json({ error: "Error during logout" });
  }
});

module.exports = router;
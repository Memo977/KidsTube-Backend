const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { 
  userPost, 
  userGet, 
  userPatch, 
  userDelete,
  confirmEmail
} = require('../controllers/userController');

// Rutas públicas
router.post('/', userPost);
router.get('/confirm', confirmEmail); 

// Rutas protegidas
router.get('/', authenticate, userGet);

module.exports = router;
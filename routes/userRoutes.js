const express = require('express');
const router = express.Router();
const { 
  userPost, 
  userGet, 
  userPatch, 
  userDelete,
  confirmEmail
} = require('../controllers/userController');

/**
 * Crear un nuevo usuario
 * POST /api/users
 */
router.post('/', userPost);

/**
 * Obtener todos los usuarios o un usuario específico
 * GET /api/users
 * GET /api/users?id={userId}
 */
router.get('/', userGet);

/**
 * Actualizar un usuario
 * PATCH /api/users?id={userId}
 */
router.patch('/', userPatch);

/**
 * Eliminar un usuario
 * DELETE /api/users?id={userId}
 */
router.delete('/', userDelete);

/**
 * Confirmar email de usuario
 * GET /api/users/confirm?id={userId}
 */
router.get('/confirm', confirmEmail);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
  restricted_usersPost,
  restricted_usersGet,
  restricted_usersPatch,
  restricted_usersDelete
} = require('../controllers/restricted_usersController');

/**
 * Crear un usuario restringido
 * POST /api/restricted_users
 */
router.post('/', restricted_usersPost);

/**
 * Obtener todos los usuarios restringidos o uno específico
 * GET /api/restricted_users
 * GET /api/restricted_users?id={restrictedUserId}
 * GET /api/restricted_users?pin={pin}
 */
router.get('/', restricted_usersGet);

/**
 * Actualizar un usuario restringido
 * PATCH /api/restricted_users?id={restrictedUserId}
 */
router.patch('/', restricted_usersPatch);
router.put('/', restricted_usersPatch);

/**
 * Eliminar un usuario restringido
 * DELETE /api/restricted_users?id={restrictedUserId}
 */
router.delete('/', restricted_usersDelete);

module.exports = router;
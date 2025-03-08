// routes/playlistRoutes.js
const express = require('express');
const router = express.Router();
const { 
    playlistPost, 
    playlistGet, 
    playlistPatch, 
    playlistDelete 
} = require('../controllers/playlistController');

/**
 * Crear una nueva playlist
 * POST /api/playlists
 */
router.post('/', playlistPost);

/**
 * Obtener todas las playlists o una específica
 * GET /api/playlists
 * GET /api/playlists?id={playlistId}
 * GET /api/playlists?profileId={profileId}
 */
router.get('/', playlistGet);

/**
 * Actualizar una playlist
 * PATCH /api/playlists?id={playlistId}
 */
router.patch('/', playlistPatch);
router.put('/', playlistPatch);

/**
 * Eliminar una playlist
 * DELETE /api/playlists?id={playlistId}
 */
router.delete('/', playlistDelete);

module.exports = router;
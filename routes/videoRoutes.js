const express = require('express');
const router = express.Router();
const { 
    videoPost, 
    videoGet, 
    videoPatch, 
    videoDelete 
} = require('../controllers/videoController');

/**
 * Crear un nuevo video
 * POST /api/videos
 */
router.post('/', videoPost);

/**
 * Obtener todos los videos o uno específico
 * GET /api/videos
 * GET /api/videos?id={videoId}
 * GET /api/videos?playlistId={playlistId}
 * GET /api/videos?search={términoBúsqueda}
 */
router.get('/', videoGet);

/**
 * Actualizar un video
 * PATCH /api/videos?id={videoId}
 */
router.patch('/', videoPatch);
router.put('/', videoPatch);

/**
 * Eliminar un video
 * DELETE /api/videos?id={videoId}
 */
router.delete('/', videoDelete);

module.exports = router;
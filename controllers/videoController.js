const express = require('express');
const Video = require('../models/videoModel');
const Playlist = require('../models/playlistModel');

/**
 * Crear un nuevo video
 * @param {*} req 
 * @param {*} res 
 */
const videoPost = async (req, res) => {
    try {
        // Verificar que req.user existe antes de continuar
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.body.playlistId) {
            return res.status(422).json({ error: 'Playlist ID is required' });
        }

        // Verificar que la playlist existe y pertenece al usuario
        const playlist = await Playlist.findById(req.body.playlistId);
        
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        
        if (playlist.adminId !== req.user.id) {
            return res.status(403).json({ error: "You don't have permission to add videos to this playlist" });
        }

        // Crear el nuevo video
        const video = new Video({
            name: req.body.name,
            youtubeUrl: req.body.youtubeUrl,
            description: req.body.description || '',
            playlistId: req.body.playlistId,
            adminId: req.user.id
        });

        // Validar datos requeridos
        if (!video.name || !video.youtubeUrl) {
            return res.status(422).json({ error: 'Name and YouTube URL are required' });
        }

        // Guardar en la base de datos
        const savedVideo = await video.save();
        
        res.status(201).header({
            'location': `/api/videos?id=${savedVideo.id}`
        }).json(savedVideo);
    } catch (error) {
        console.error('Error creating video:', error);
        
        // Si el error es de validación (URL de YouTube inválida)
        if (error.name === 'ValidationError') {
            return res.status(422).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Error creating video' });
    }
};

/**
 * Obtener todos los videos o uno específico
 * @param {*} req 
 * @param {*} res 
 */
const videoGet = async (req, res) => {
    try {
        // Si se proporciona un ID, obtener un video específico
        if (req.query && req.query.id) {
            const video = await Video.findById(req.query.id);
            
            if (!video) {
                return res.status(404).json({ error: "Video not found" });
            }
            
            // Verificar permisos (debe ser el propietario o estar en la lista de usuarios restringidos)
            const playlist = await Playlist.findById(video.playlistId);
            
            if (!playlist) {
                return res.status(404).json({ error: "Associated playlist not found" });
            }
            
            // Verificar req.user antes de acceder a req.user.id
            const isAdmin = req.user && video.adminId === req.user.id;
            const isRestrictedUser = req.restrictedUserId && playlist.associatedProfiles.includes(req.restrictedUserId);
            
            if (!isAdmin && !isRestrictedUser) {
                return res.status(403).json({ error: "You don't have permission to view this video" });
            }
            
            return res.status(200).json(video);
        } 
        
        // Si se proporciona un playlistId, obtener videos de esa playlist
        else if (req.query && req.query.playlistId) {
            const playlist = await Playlist.findById(req.query.playlistId);
            
            if (!playlist) {
                return res.status(404).json({ error: "Playlist not found" });
            }
            
            // Verificar permisos
            // Verificar req.user antes de acceder a req.user.id
            const isAdmin = req.user && playlist.adminId === req.user.id;
            const isRestrictedUser = req.restrictedUserId && playlist.associatedProfiles.includes(req.restrictedUserId);
            
            if (!isAdmin && !isRestrictedUser) {
                return res.status(403).json({ error: "You don't have permission to view these videos" });
            }
            
            const videos = await Video.find({ playlistId: req.query.playlistId });
            return res.status(200).json(videos);
        } 
        
        // Búsqueda de videos
        else if (req.query && req.query.search) {
            // Si es un usuario restringido, buscar solo en sus playlists asignadas
            if (req.restrictedUserId) {
                const playlists = await Playlist.find({ 
                    associatedProfiles: { $in: [req.restrictedUserId] } 
                });
                
                const playlistIds = playlists.map(p => p._id);
                
                const videos = await Video.find({
                    playlistId: { $in: playlistIds },
                    $or: [
                        { name: { $regex: req.query.search, $options: 'i' } },
                        { description: { $regex: req.query.search, $options: 'i' } }
                    ]
                });
                
                return res.status(200).json(videos);
            } 
            // Si es un usuario administrador, buscar en todos sus videos
            else if (req.user) {
                const videos = await Video.find({
                    adminId: req.user.id,
                    $or: [
                        { name: { $regex: req.query.search, $options: 'i' } },
                        { description: { $regex: req.query.search, $options: 'i' } }
                    ]
                });
                
                return res.status(200).json(videos);
            } else {
                return res.status(401).json({ error: "Authentication required" });
            }
        } 
        
        // Si no se proporcionan parámetros, obtener todos los videos del usuario
        else {
            // Verificar req.user antes de acceder a req.user.id
            if (req.user) {
                const videos = await Video.find({ adminId: req.user.id });
                return res.status(200).json(videos);
            } else if (req.restrictedUserId) {
                // Para usuarios restringidos, obtener videos de playlists asignadas
                const playlists = await Playlist.find({ 
                    associatedProfiles: { $in: [req.restrictedUserId] } 
                });
                
                const playlistIds = playlists.map(p => p._id);
                const videos = await Video.find({ playlistId: { $in: playlistIds } });
                
                return res.status(200).json(videos);
            } else {
                return res.status(401).json({ error: "Authentication required" });
            }
        }
    } catch (error) {
        console.error('Error getting videos:', error);
        res.status(500).json({ error: 'Error getting videos' });
    }
};

/**
 * Actualizar un video
 * @param {*} req 
 * @param {*} res 
 */
const videoPatch = async (req, res) => {
    try {
        // Verificar que req.user existe antes de continuar
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.query || !req.query.id) {
            return res.status(400).json({ error: "Video ID is required" });
        }

        const video = await Video.findById(req.query.id);
        
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }
        
        // Verificar que el usuario sea el propietario del video
        if (video.adminId !== req.user.id) {
            return res.status(403).json({ error: "You don't have permission to edit this video" });
        }
        
        // Actualizar campos
        if (req.body.name) video.name = req.body.name;
        if (req.body.youtubeUrl) video.youtubeUrl = req.body.youtubeUrl;
        if (req.body.description !== undefined) video.description = req.body.description;
        
        // Si se proporciona un nuevo playlistId, verificar que existe y pertenece al usuario
        if (req.body.playlistId) {
            const playlist = await Playlist.findById(req.body.playlistId);
            
            if (!playlist) {
                return res.status(404).json({ error: 'Playlist not found' });
            }
            
            if (playlist.adminId !== req.user.id) {
                return res.status(403).json({ error: "You don't have permission to move videos to this playlist" });
            }
            
            video.playlistId = req.body.playlistId;
        }
        
        // Guardar cambios
        const updatedVideo = await video.save();
        
        res.status(200).json({
            message: "Video updated successfully",
            data: updatedVideo
        });
    } catch (error) {
        console.error('Error updating video:', error);
        
        // Si el error es de validación (URL de YouTube inválida)
        if (error.name === 'ValidationError') {
            return res.status(422).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Error updating video' });
    }
};

/**
 * Eliminar un video
 * @param {*} req 
 * @param {*} res 
 */
const videoDelete = async (req, res) => {
    try {
        // Verificar que req.user existe antes de continuar
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.query || !req.query.id) {
            return res.status(400).json({ error: "Video ID is required" });
        }

        const video = await Video.findById(req.query.id);
        
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }
        
        // Verificar que el usuario sea el propietario del video
        if (video.adminId !== req.user.id) {
            return res.status(403).json({ error: "You don't have permission to delete this video" });
        }
        
        // Eliminar el video
        await video.deleteOne();
        
        res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Error deleting video' });
    }
};

module.exports = {
    videoPost,
    videoGet,
    videoPatch,
    videoDelete
};
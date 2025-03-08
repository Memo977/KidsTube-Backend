const express = require('express');
const Playlist = require('../models/playlistModel');
const Video = require('../models/videoModel');

/**
 * Crear una nueva playlist
 * @param {*} req 
 * @param {*} res 
 */
const playlistPost = async (req, res) => {
    try {
        // Verificar que req.user existe antes de acceder a req.user.id
        if (!req.user) {
            return res.status(401).json({ error: 'Autenticación requerida' });
        }

        // Crear la nueva playlist
        const playlist = new Playlist({
            name: req.body.name,
            adminId: req.user.id,
            associatedProfiles: req.body.associatedProfiles || []
        });

        // Validar datos
        if (!playlist.name) {
            return res.status(422).json({ error: 'El nombre de la playlist es obligatorio' });
        }

        // Guardar en la base de datos
        const savedPlaylist = await playlist.save();
        
        res.status(201).header({
            'location': `/api/playlists/?id=${savedPlaylist.id}`
        }).json(savedPlaylist);
    } catch (error) {
        console.error('Error al crear la playlist:', error);
        res.status(422).json({ error: 'Error al crear la playlist' });
    }
};

/**
 * Obtener todas las playlists o una específica
 * @param {*} req 
 * @param {*} res 
 */
const playlistGet = async (req, res) => {
    try {
        // Si se proporciona un ID, obtener una playlist específica
        if (req.query && req.query.id) {
            const playlist = await Playlist.findById(req.query.id);
            
            if (!playlist) {
                return res.status(404).json({ error: "Playlist no encontrada" });
            }
            
            // Verificar que el usuario sea el propietario de la playlist o un usuario restringido
            // Verificar req.user antes de acceder a req.user.id
            const isAdmin = req.user && playlist.adminId === req.user.id;
            const isRestrictedUser = req.restrictedUserId && playlist.associatedProfiles.includes(req.restrictedUserId);
            
            if (!isAdmin && !isRestrictedUser) {
                return res.status(403).json({ error: "No tienes permiso para ver esta playlist" });
            }
            
            // Obtener conteo de videos
            const videoCount = await Video.countDocuments({ playlistId: playlist._id });
            
            // Devolver la playlist con el conteo de videos
            return res.status(200).json({
                ...playlist.toObject(),
                videoCount
            });
        } 
        
        // Si se proporciona un profileId, obtener playlists asociadas a ese perfil
        else if (req.query && req.query.profileId) {
            const playlists = await Playlist.find({ 
                associatedProfiles: { $in: [req.query.profileId] } 
            });
            
            // Para cada playlist, obtener el conteo de videos
            const playlistsWithCount = await Promise.all(playlists.map(async (playlist) => {
                const videoCount = await Video.countDocuments({ playlistId: playlist._id });
                return {
                    ...playlist.toObject(),
                    videoCount
                };
            }));
            
            return res.status(200).json(playlistsWithCount);
        } 
        
        // Si no se proporcionan parámetros, obtener todas las playlists del usuario
        else {
            // Verificar req.user antes de acceder a req.user.id
            if (!req.user && !req.restrictedUserId) {
                return res.status(401).json({ error: "Autenticación requerida" });
            }
            
            let playlists;
            if (req.user) {
                // Si es un administrador, obtener sus playlists
                playlists = await Playlist.find({ adminId: req.user.id });
            } else if (req.restrictedUserId) {
                // Si es un usuario restringido, obtener las playlists asociadas a su perfil
                playlists = await Playlist.find({ 
                    associatedProfiles: { $in: [req.restrictedUserId] } 
                });
            }
            
            // Para cada playlist, obtener el conteo de videos
            const playlistsWithCount = await Promise.all(playlists.map(async (playlist) => {
                const videoCount = await Video.countDocuments({ playlistId: playlist._id });
                return {
                    ...playlist.toObject(),
                    videoCount
                };
            }));
            
            return res.status(200).json(playlistsWithCount);
        }
    } catch (error) {
        console.error('Error al obtener las playlists:', error);
        res.status(500).json({ error: 'Error al obtener las playlists' });
    }
};

/**
 * Actualizar una playlist
 * @param {*} req 
 * @param {*} res 
 */
const playlistPatch = async (req, res) => {
    try {
        if (!req.query || !req.query.id) {
            return res.status(400).json({ error: "Se requiere el ID de la playlist" });
        }

        // Verificar que req.user existe antes de continuar
        if (!req.user) {
            return res.status(401).json({ error: "Autenticación requerida" });
        }

        const playlist = await Playlist.findById(req.query.id);
        
        if (!playlist) {
            return res.status(404).json({ error: "Playlist no encontrada" });
        }
        
        // Verificar que el usuario sea el propietario de la playlist
        if (playlist.adminId !== req.user.id) {
            return res.status(403).json({ error: "No tienes permiso para editar esta playlist" });
        }
        
        // Actualizar campos
        if (req.body.name) playlist.name = req.body.name;
        if (req.body.associatedProfiles) playlist.associatedProfiles = req.body.associatedProfiles;
        
        // Guardar cambios
        const updatedPlaylist = await playlist.save();
        
        res.status(200).json({
            message: "Playlist actualizada correctamente",
            data: updatedPlaylist
        });
    } catch (error) {
        console.error('Error al actualizar la playlist:', error);
        res.status(500).json({ error: 'Error al actualizar la playlist' });
    }
};

/**
 * Eliminar una playlist
 * @param {*} req 
 * @param {*} res 
 */
const playlistDelete = async (req, res) => {
    try {
        if (!req.query || !req.query.id) {
            return res.status(400).json({ error: "Se requiere el ID de la playlist" });
        }

        // Verificar que req.user existe antes de continuar
        if (!req.user) {
            return res.status(401).json({ error: "Autenticación requerida" });
        }

        const playlist = await Playlist.findById(req.query.id);
        
        if (!playlist) {
            return res.status(404).json({ error: "Playlist no encontrada" });
        }
        
        // Verificar que el usuario sea el propietario de la playlist
        if (playlist.adminId !== req.user.id) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta playlist" });
        }
        
        // Eliminar todos los videos asociados a esta playlist
        await Video.deleteMany({ playlistId: playlist._id });
        
        // Eliminar la playlist
        await playlist.deleteOne();
        
        res.status(200).json({ message: "Playlist y videos asociados eliminados correctamente" });
    } catch (error) {
        console.error('Error al eliminar la playlist:', error);
        res.status(500).json({ error: 'Error al eliminar la playlist' });
    }
};

module.exports = {
    playlistPost,
    playlistGet,
    playlistPatch,
    playlistDelete
};
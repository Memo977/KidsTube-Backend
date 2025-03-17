const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Restricted_users = require("../models/restricted_usersModel");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Crea un usuario restringido
 *
 * @param {*} req
 * @param {*} res
 */
const restricted_usersPost = async (req, res) => {
    let restricted_users = new Restricted_users();
    restricted_users.full_name = req.body.full_name;
    restricted_users.pin = req.body.pin;
    restricted_users.avatar = req.body.avatar;

    // Asociar el usuario restringido al usuario logueado
    restricted_users.AdminId = req.user.id;  // Aquí se usa el ID del usuario logueado

    try {
        const existingUser = await Restricted_users.findOne({ full_name: restricted_users.full_name });
        if (existingUser) {
            return res.status(409).json({ error: 'There is already a restricted user with this name' });
        }
        if (restricted_users.full_name && restricted_users.pin && restricted_users.avatar) {
            await restricted_users.save();
            res.status(201)
            res.header({
                'location': `/api/restricted_users/?id=${restricted_users.id}`
            });
            res.json(restricted_users);
        }
    } catch (error) {
        res.status(422).json({ error: 'There was an error saving the restricted user' });
        console.error('Error while saving the restricted user', error);
    }
};

/**
 * Elimina un usuario restringido
 *
 * @param {*} req
 * @param {*} res
 */
const restricted_usersDelete = async (req, res) => {
    if (req.query && req.query.id) {
        try {
            const restricted_users = await Restricted_users.findById(req.query.id).exec();
            if (!restricted_users) {
                res.status(404);
                console.log('Error while querying the restricted user');
                return res.json({ error: "Restricted user doesn't exist" });
            }

            // Validar que el usuario logueado es el AdminId del usuario restringido
            if (restricted_users.AdminId !== req.user.id) {
                return res.status(403).json({ error: "You are not authorized to delete this restricted user" });
            }

            await restricted_users.deleteOne();

            // Respuesta con mensaje de éxito
            res.status(200).json({ message: "Restricted user deleted successfully" });

        } catch (err) {
            res.status(422);
            console.log('Error while deleting the restricted user', err);
            res.json({ error: 'There was an error deleting the restricted user' });
        }
    } else {
        res.status(404).json({ error: "Restricted user doesn't exist" });
    }
};

/** 
 * Obtiene uno o todos los usuarios restringidos
 *
 * @param {*} req
 * @param {*} res
 */
const restricted_usersGet = async (req, res) => {
    if (req.query && req.query.pin) {
        // Buscar el usuario restringido por PIN
        try {
            const restrictedUser = await Restricted_users.findOne({ pin: req.query.pin });

            if (!restrictedUser) {
                return res.status(404).json({ error: "Invalid PIN" });
            }

            // Devolver los datos del perfil restringido
            res.status(200).json({
                full_name: restrictedUser.full_name,
                avatar: restrictedUser.avatar,
            });
        } catch (err) {
            console.error("Error while querying the restricted user", err);
            res.status(500).json({ error: "Internal server error" });
        }
    } else if (req.query && req.query.id) {
        // Obtener un usuario restringido por ID (para el administrador)
        try {
            const restrictedUser = await Restricted_users.findById(req.query.id);
            if (!restrictedUser) {
                return res.status(404).json({ error: "Restricted user not found" });
            }

            // Verificar que el usuario que realiza la acción es el AdminId
            if (restrictedUser.AdminId !== req.user.id) {
                return res.status(403).json({ error: "You are not authorized to access this restricted user" });
            }

            res.status(200).json(restrictedUser);
        } catch (err) {
            console.error("Error while querying the restricted user", err);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        // Obtener todos los usuarios restringidos (para el administrador)
        try {
            const restrictedUsers = await Restricted_users.find({ AdminId: req.user.id });
            res.status(200).json(restrictedUsers);
        } catch (err) {
            console.error("Error while querying the restricted users", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

/**
 * Actualiza un usuario restringido
 *
 * @param {*} req
 * @param {*} res
 */
const restricted_usersPatch = async (req, res) => {
    if (!req.query || !req.query.id) {
        return res.status(400).json({ error: "Bad request: ID parameter is required" });
    }

    try {
        const restrictedUser = await Restricted_users.findById(req.query.id);

        if (!restrictedUser) {
            return res.status(404).json({ error: "Restricted user doesn't exist" });
        }

        if (restrictedUser.AdminId !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to edit this restricted user" });
        }

        // Actualizar los campos proporcionados
        if (req.body.full_name) restrictedUser.full_name = req.body.full_name;
        if (req.body.pin) restrictedUser.pin = req.body.pin; // Permitir cambiar el PIN
        if (req.body.avatar) restrictedUser.avatar = req.body.avatar;

        const updatedRestrictedUser = await restrictedUser.save();

        // Respuesta con mensaje y datos actualizados
        res.status(200).json({
            message: "Restricted user updated successfully",
            data: updatedRestrictedUser,
        });
    } catch (err) {
        console.log('Error while updating the restricted user', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    restricted_usersPost,
    restricted_usersGet,
    restricted_usersPatch,
    restricted_usersDelete
};
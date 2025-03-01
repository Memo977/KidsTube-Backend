const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Restricted_users = require("../models/restricted_usersModel");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Creates a Restricted_users
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

module.exports = {
    restricted_usersPost
};
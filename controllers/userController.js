require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt'); // Reemplazamos CryptoJS por bcrypt
const saltRounds = 10; // Configuración estándar para bcrypt
app.use(express.static(path.join(__dirname, 'public')));
const User = require("../models/userModel");
const Restricted_users = require("../models/restricted_usersModel");
const { deleteSession } = require('./sessionController');
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

const nodemailer = require('nodemailer');

const isAtLeast18YearsOld = (birthdate) => {
  const today = new Date();
  const birthdateObj = new Date(birthdate);
  
  let age = today.getFullYear() - birthdateObj.getFullYear();
  const monthDifference = today.getMonth() - birthdateObj.getMonth();
  
  // If birthday hasn't occurred yet this year, subtract one year
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdateObj.getDate())) {
    age--;
  }
  
  return age >= 18;
};

// Configura el transporte con SMTP de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS
  }
});

const sendConfirmationEmail = (user) => {
  const confirmationUrl = `http://localhost:3000/api/users/confirm?id=${user._id}&register=true`;
  const mailOptions = {
    from: GMAIL_USER,
    to: user.email,
    subject: 'Confirm your email',
    html: `<p>Thank you for registering. Please confirm your email by clicking the link below:</p><p><a href="${confirmationUrl}">Confirm Email</a></p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

/**
 * Creates a user
 *
 * @param {*} req
 * @param {*} res
 */
const userPost = async (req, res) => {
  let user = new User();
  user.email = req.body.email;
  user.phone_number = req.body.phone_number;
  user.pin = req.body.pin;
  user.name = req.body.name;
  user.last_name = req.body.last_name;
  user.country = req.body.country;
  user.birthdate = req.body.birthdate;
  user.state = req.body.state;

  // Verifica que las contraseñas coincidan antes de hash
  if (req.body.password !== req.body.repeat_password) {
    return res.status(422).json({
      error: 'Passwords do not match'
    });
  }

  // Verifica si el usuario tiene al menos 18 años
  if (!isAtLeast18YearsOld(user.birthdate)) {
    return res.status(422).json({
      error: 'User must be at least 18 years old'
    });
  }

  if (user.email && req.body.password && user.phone_number && user.pin && user.name && user.last_name && user.birthdate) {
    try {
      // Primero verifica si el correo electrónico ya está registrado
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        return res.status(422).json({
          error: 'Email already registered'
        });
      }
      
      // Hash de contraseña con bcrypt
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      user.password = hashedPassword;
      // Ya no necesitamos almacenar repeat_password, pero mantenemos compatibilidad
      user.repeat_password = hashedPassword;
      
      // Guarda el usuario
      const savedUser = await user.save();
      
      if (savedUser.state === false) {
        sendConfirmationEmail(savedUser);
      }
      
      res.status(201).header({
        'location': `/api/users/?id=${savedUser.id}`
      }).json(savedUser);
    } catch (err) {
      console.log('Error while saving the user', err);
      res.status(422).json({
        error: 'There was an error saving the user'
      });
    }
  } else {
    res.status(422).json({
      error: 'No valid data provided for user'
    });
  }
};

/**
 * Delete a user
 *
 * @param {*} req
 * @param {*} res
 */
const userDelete = async (req, res) => {
  if (req.query && req.query.id) {
    try {
      const user = await User.findById(req.query.id).exec();
      if (!user) {
        return res.status(404).json({ error: "User doesn't exist" });
      }

      // Validar que el usuario logueado es el dueño de la cuenta
      if (user._id.toString() !== req.user.id) {
        return res.status(403).json({ error: "You are not authorized to delete this user" });
      }

      // Eliminar todos los usuarios restringidos asociados a este administrador
      await Restricted_users.deleteMany({ AdminId: user._id.toString() });

      // Eliminar sesiones del usuario administrador (opcional)
      await deleteSession(user.email);

      // Eliminar al usuario administrador
      await user.deleteOne();

      // Respuesta con mensaje de éxito
      return res.status(200).json({ message: "User deleted successfully" });

    } catch (err) {
      console.log('Error while deleting the user', err);
      return res.status(422).json({ error: 'There was an error deleting the user' });
    }
  } else {
    return res.status(404).json({ error: "User doesn't exist" });
  }
};

/** Get one or all users
*
* @param {*} req
* @param {*} res
*/
const userGet = (req, res) => {
  if (req.query && req.query.id) {
    // filter and get one video
    User.findById(req.query.id)
      .then((user) => {
        res.json(user);
      })
      .catch(err => {
        console.log('error while querying the user', err);
        res.status(404).json({ error: "User doesn't exist" });
      });
  } else {
    // get all videos
    User.find()
      .then(user => {
        res.json(user);
      })
      .catch(err => {
        res.status(422).json({ error: err.message });
      });
  }
};

const userGetEmail = function (email) {
  return User.findOne({ email });
};

/**
 * Updates a user
 *
 * @param {*} req
 * @param {*} res
 */
const userPatch = async (req, res) => {
  if (!req.query || !req.query.id) {
      return res.status(400).json({ error: "Bad request: ID parameter is required" });
  }

  try {
      const user = await User.findById(req.query.id);

      if (!user) {
          return res.status(404).json({ error: "User doesn't exist" });
      }

      // Validar que el usuario logueado es el dueño de la cuenta
      if (user._id.toString() !== req.user.id) {
          return res.status(403).json({ error: "You are not authorized to edit this user" });
      }

      // Actualizar los campos proporcionados
      if (req.body.email) user.email = req.body.email;
      
      // Si se actualiza la contraseña, hash con bcrypt
      if (req.body.password) {
        if (req.body.password !== req.body.repeat_password) {
          return res.status(422).json({ error: "Passwords do not match" });
        }
        user.password = await bcrypt.hash(req.body.password, saltRounds);
        user.repeat_password = user.password; // Mantener consistencia
      }
      
      if (req.body.phone_number) user.phone_number = req.body.phone_number;
      if (req.body.pin) user.pin = req.body.pin;
      if (req.body.name) user.name = req.body.name;
      if (req.body.last_name) user.last_name = req.body.last_name;
      if (req.body.country) user.country = req.body.country;
      if (req.body.birthdate) user.birthdate = req.body.birthdate;

      const updatedUser = await user.save();

      // Respuesta con mensaje y datos actualizados
      return res.status(200).json({
          message: "User updated successfully",
          data: updatedUser
      });

  } catch (err) {
      console.log('Error while updating the user', err);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

const confirmEmail = async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
      return res.status(400).json({ error: "ID parameter is required" });
  }

  try {
      const user = await User.findById(id);

      if (!user) {
          return res.status(404).json({ error: "User doesn't exist" });
      }

      user.state = true;
      await user.save();
      return res.status(200).sendFile(path.join(__dirname, 'views', 'confirmation.html'));

  } catch (err) {
      console.log('Error while confirming the email', err);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  userPost,
  userGet,
  userPatch,
  userDelete,
  userGetEmail,
  confirmEmail
};
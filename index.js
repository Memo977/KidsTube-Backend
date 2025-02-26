require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const cors = require("cors");
app.use(cors({
  domains: '*',
  methods: "*"
}));

const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Métodos de sesión
const { saveSession, getSession, deleteSession } = require('./controllers/sessionController.js');

// Métodos de usuarios
const { userPost, userGetEmail, confirmEmail } = require("./controllers/userController.js");

app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Login con JWT
app.post("/api/session", function (req, res, next) {
  if (req.body.username && req.body.password) {
    const savedUser = userGetEmail(req.body.username);
    savedUser.then(function (savedUser) {
      if (!savedUser) {
        return res.status(422).json({
          error: 'Invalid username or password'
        });
      }

      // Desencriptar la contraseña almacenada
      const bytes = CryptoJS.AES.decrypt(savedUser.password, 'secret key');
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

      // Comparar la contraseña en texto plano con la desencriptada
      if (req.body.username === savedUser.email && req.body.password === decryptedPassword) {
        if (savedUser.state === false) {
          return res.status(403).json({
            error: 'Tu cuenta no ha sido confirmada. Por favor, revisa tu correo para confirmar tu registro.'
          });
        }

        const token = jwt.sign({
          email: savedUser.email,
          name: savedUser.name,
          permission: ['create', 'edit', 'delete', 'get'],
          id: savedUser._id
        }, secretKey, { expiresIn: '24h' });

        saveSession(savedUser.email)
          .then(() => {
            res.status(201).json({
              token
            });
          })
          .catch(err => {
            console.log('Error saving session', err);
            res.status(500).json({
              error: 'Error saving session'
            });
          });
      } else {
        res.status(422).json({
          error: 'Invalid username or password'
        });
      }
    }).catch(function (err) {
      console.log('Error getting the saved user', err);
      res.status(422).send({
        error: "There was an error: " + err.message
      });
    });
  } else {
    res.status(422).json({
      error: 'Invalid username or password'
    });
  }
});

// Rutas de usuario
app.post("/api/users", userPost);
app.get("/api/users/confirm", confirmEmail);

app.listen(3000, () => console.log(`App listening on port 3000!`));
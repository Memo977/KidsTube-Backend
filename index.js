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

// Función para desencriptar valores
const decryptValue = (encryptedValue) => {
  const bytes = CryptoJS.AES.decrypt(encryptedValue, 'secret key');
  const originalValue = bytes.toString(CryptoJS.enc.Utf8);
  return originalValue;
};

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
      const decryptedPassword = decryptValue(savedUser.password);

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

// Middleware de autenticación basado en tokens
app.use(function (req, res, next) {
  let { id, register } = req.query;
  if (req.headers['register'] || register === "true") {
    next();
  } else {
    if (req.headers["authorization"]) {
      const token = req.headers['authorization'].split(' ')[1];
      try {
        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
            return res.status(401).send({
              error: "Unauthorized"
            });
          }
          req.user = decoded;  // Aquí se agrega la información del usuario al objeto `req`
          console.log('Welcome', decoded.name);
          next();
        });
      } catch (e) {
        res.status(422).send({
          error: "There was an error: " + e.message
        });
      }
    } else {
      res.status(401).send({
        error: "Unauthorized"
      });
    }
  }
});

// Ruta protegida para cerrar sesión
app.delete("/api/session", function (req, res) {
  if (req.headers["authorization"]) {
    const token = req.headers['authorization'].split(' ')[1];
    try {
      const decoded = jwt.verify(token, secretKey);
      deleteSession(decoded.email)
        .then((result) => {
          if (result.deletedCount > 0) {
            res.status(200).json({ message: "Logged out successfully" });
          } else {
            res.status(404).json({ message: "Session not found" });
          }
        })
        .catch(err => {
          console.error("Error deleting session", err);
          res.status(500).json({ error: "Error during logout" });
        });
    } catch(e) {
      res.status(401).json({ error: "Invalid token" });
    }
  } else {
    res.status(401).json({ error: "No authorization token provided" });
  }
});

// Rutas de usuario (no protegidas)
app.post("/api/users", userPost);
app.get("/api/users/confirm", confirmEmail);

app.listen(3000, () => console.log(`App listening on port 3000!`));
const crypto = require('crypto');
const Session = require("../models/sessionModel");

/**
 * Guarda una nueva sesión para un usuario
 * @param {string} username - Email del usuario
 * @returns {Promise} - Promesa con la sesión guardada
 */
const saveSession = async function (username) {
  const token = crypto.createHash('md5').update(username).digest("hex");
  // Insertar token en la tabla de sesiones
  const session = new Session();
  session.token = token;
  session.user = username;
  session.expire = new Date(new Date().setDate(new Date().getDate() + 1));
  return session.save();
};

/**
 * Obtiene una sesión por su token
 * @param {string} token - Token de sesión
 * @returns {Promise} - Promesa con la sesión encontrada
 */
const getSession = function (token) {
  return Session.findOne({ token });
};

/**
 * Elimina la sesión de un usuario
 * @param {string} username - Email del usuario
 * @returns {Promise} - Promesa con el resultado de la eliminación
 */
const deleteSession = function (username) {
  return Session.deleteOne({ user: username });
};

module.exports = {
  saveSession,
  getSession,
  deleteSession
};
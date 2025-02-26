const crypto = require('crypto');
const Session = require("../models/sessionModel");

const saveSession = async function (username) {
  const token = crypto.createHash('md5').update(username).digest("hex");
  // insert token to the session table
  const session = new Session();
  session.token = token;
  session.user = username;
  session.expire = new Date(new Date().setDate(new Date().getDate() + 1));
  return session.save();
};

const getSession = function (token) {
  return Session.findOne({ token });
};

const deleteSession = function (username) {
  return Session.deleteOne({ user: username });
};

module.exports = {
  saveSession,
  getSession,
  deleteSession
};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistedTokenSchema = new Schema({
  token: { type: String, required: true, unique: true },
  expireAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Crear índice TTL para que los tokens se eliminen automáticamente cuando expiren
blacklistedTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name: { type: String, required: true },
    // Array de IDs de usuarios restringidos a los que está asociada esta playlist
    associatedProfiles: [{ type: String }], 
    adminId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('playlist', playlistSchema);
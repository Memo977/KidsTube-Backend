const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    name: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    description: { type: String },
    playlistId: { type: Schema.Types.ObjectId, ref: 'playlist', required: true },
    adminId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Validación para URL de YouTube
videoSchema.path('youtubeUrl').validate(function(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
}, 'Por favor, introduce una URL válida de YouTube');

module.exports = mongoose.model('video', videoSchema);
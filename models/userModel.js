const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModel = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    repeat_password: { type: String, required: true },
    phone_number: { type: Number, required: true },
    pin: { type: String, required: true },
    name: { type: String, required: true },
    last_name: { type: String, required: true },
    country: { type: String, required: true },
    birthdate: { type: Date, required: true },
    state: { type: Boolean, default: false }
});

module.exports = mongoose.model('user', userModel);
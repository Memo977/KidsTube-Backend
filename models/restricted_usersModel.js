const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restricted_users = new Schema({
    full_name: { type: String, required: true },
    pin: { type: String, required: true },
    avatar: { type: [String], default: [
        'https://i.pinimg.com/564x/1b/a2/e6/1ba2e6d1d4874546c70c91f1024e17fb.jpg',
        'https://loodibee.com/wp-content/uploads/Netflix-avatar-3.png',
        'https://loodibee.com/wp-content/uploads/Netflix-avatar-4.png',
        'https://loodibee.com/wp-content/uploads/Netflix-avatar-9.png',
        'https://loodibee.com/wp-content/uploads/Netflix-avatar-2.png'
    ] },
    AdminId:{ type: String, required: true}
});

module.exports = mongoose.model('restricted_users', restricted_users);
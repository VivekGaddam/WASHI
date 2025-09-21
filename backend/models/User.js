const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed password for local auth
  googleId: { type: String }, // for Google OAuth users
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);

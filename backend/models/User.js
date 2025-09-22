const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },                // hashed password
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },                 // for Google OAuth users
});

module.exports = mongoose.model('User', userSchema);

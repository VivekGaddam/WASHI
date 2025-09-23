const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // hashed password for local auth
  googleId: { type: String }, // for Google OAuth users
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: function() { return this.role === 'admin'; }
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: function() { return this.role === 'admin'; }
    }
  },
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);

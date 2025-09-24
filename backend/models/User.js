const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "volunteer"],
      default: "user",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null, // only set for admins
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: function() { return this.role === 'admin'; } // Only required for admins
      },
      coordinates: {
        type: [Number],
        required: function() { return this.role === 'admin'; } // Only required for admins
      },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for geo queries
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);

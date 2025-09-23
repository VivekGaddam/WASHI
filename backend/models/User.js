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
      enum: ["user", "admin", "volunteer"], // adjust roles as needed
      default: "user",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: function() { return this.role === 'admin'; }
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
        required: function() { return this.role === 'admin'; }
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

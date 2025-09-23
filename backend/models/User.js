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
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community", // optional, if you have a Community collection
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

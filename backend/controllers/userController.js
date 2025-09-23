const User = require("../models/User");
const Report = require('../models/Report');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const reports = await Report.find({ user: req.user.id });

    res.json({
      user,
      reports,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const logoutUser = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

module.exports = { getProfile, logoutUser };
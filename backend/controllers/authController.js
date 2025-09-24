const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Department = require("../models/Department");

exports.register = async (req, res, next) => {
  console.log("Register function called");
  console.log("Received request body:", req.body);

  const { username, email, password, departmentName, role, location } = req.body;

  // For admins, require department
  if (role === "admin" && !departmentName) {
    return res.status(400).json({ message: "Department is required for admin users" });
  }

  // For admins, require valid location
  if (role === "admin") {
    if (
      !location ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      location.coordinates.some(coord => typeof coord !== "number")
    ) {
      return res.status(400).json({ message: "Admin must have valid location coordinates" });
    }
  }

  try {
    console.log("Checking for existing user...");
    let user = await User.findOne({ email });
    if (user) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }
    console.log("User does not exist, proceeding with registration.");

    console.log("Hashing password...");
    const hashed = await bcrypt.hash(password, 10);
    
    console.log("Location:", location);

    const newUser = {
      username,
      email,
      password: hashed,
      role,
      location: role === "admin" ? location : undefined, // save only if admin
    };

    // For admins, find department and link it
    if (role === "admin") {
      const departmentDoc = await Department.findOne({ name: departmentName });
      if (!departmentDoc) {
        return res.status(400).json({ message: `Department '${departmentName}' not found.` });
      }
      newUser.departmentId = departmentDoc._id;
    }

    console.log("New user object before saving:", newUser);

    user = new User(newUser);
    await user.save();
    console.log("User saved successfully.");
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in register function:", err);
    next(err);
  }
};


exports.login = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Invalid credentials" });

  // Fetch user with department + location
  const userWithDetails = await User.findById(req.user.id)
    .populate("departmentId", "name") // get department name
    .exec();

  console.log("User with details in login:", userWithDetails);

  const payload = {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    departmentId: userWithDetails?.departmentId?._id || null,
    departmentName: userWithDetails?.departmentId?.name || null,
    location: userWithDetails?.location || null,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, user: payload });
};

exports.logout = (req, res) => {
  // On the client side, the token should be deleted.
  // This server-side function is primarily for acknowledging the logout action.
  res.status(200).json({ message: "Logged out successfully" });
};

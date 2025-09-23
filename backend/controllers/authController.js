const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');

exports.register = async (req, res, next) => {
  console.log('Raw request body:', req.body);
  console.log('Register function called');
  console.log('Received request body:', req.body);
      const { username, email, password, departmentName, role, location } = req.body;
  
      if (role === 'admin' && !departmentName) {
        console.log('Admin user requires department');
        return res.status(400).json({ message: 'Department is required for admin users' });
      }
  
      try {
        console.log('Checking for existing user...');
        let user = await User.findOne({ email });
        if (user) {
          console.log('User already exists');
          return res.status(400).json({ message: 'User already exists' });
        }
        console.log('User does not exist, proceeding with registration.');
  
        console.log('Hashing password...');
        const hashed = await bcrypt.hash(password, 10);
        console.log('Password hashed.');
  
        const newUser = {
          username,
          email,
          password: hashed,
          role,
          isVerified: true, // for testing purposes
        };

        if (location) {
          newUser.location = location;
        }
  
        if (role === 'admin') {
          const department = await Department.findOne({ name: departmentName });
          if (!department) {
            return res.status(400).json({ message: 'Department not found.' });
          }
          newUser.departmentId = department._id;
        }
    console.log('New user object before saving:', newUser);
    console.log('Creating new user...');
    user = new User(newUser);
    await user.save();
    console.log('User saved successfully.');
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error in register function:', err);
    next(err);
  }
};
exports.login = async (req, res, next) => {
  // Passport local strategy handles authentication
  // This function issues JWT after successful login
  if (!req.user) return res.status(401).json({ message: 'Invalid credentials' });

  // Fetch the user again to get department and location information
  const userWithDetails = await User.findById(req.user.id).select('+departmentId +location'); // Select location as well
  console.log('User with details in login:', userWithDetails);

  const payload = {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    departmentId: userWithDetails ? userWithDetails.departmentId : null,
    location: userWithDetails ? userWithDetails.location : null // Include location
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, user: payload });
};

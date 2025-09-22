const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res, next) => {
  console.log('Register function called');
  const { fullName, email, password, department, role } = req.body;

  if (role === 'admin' && (!department || department.length === 0)) {
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
      fullName,
      email,
      password: hashed,
      role,
      isVerified: true // for testing purposes
    };

    if (role === 'admin') {
      newUser.department = department;
    }

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

  const payload = { id: req.user.id, email: req.user.email, role: req.user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token, user: payload });
};

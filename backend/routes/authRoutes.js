const express = require('express');
const passport = require('passport');
const { register, login } = require('../controllers/authController');
const User = require('../models/User'); 
const router = express.Router();
const bcrypt = require('bcryptjs');
// Registration route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role, communityId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      communityId,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Local login route using passport
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.logIn(user, err => {
      if (err) return next(err);
      return login(req, res, next);
    });
  })(req, res, next);
});

// Google OAuth auth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/google/failure',
  session: true,
}), (req, res) => {
  const payload = { id: req.user.id, email: req.user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  // For mobile app, you can send token as json or redirect with token as param
  res.json({ token, user: payload });
});

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

module.exports = router;

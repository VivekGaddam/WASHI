const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Registration route
router.post('/register', register);

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

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
  // Serialize user for session
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user)).catch(done);
  });

  // Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    const newUser = {
      googleId: profile.id,
      email: profile.emails[0].value,
      username: profile.displayName,
    };
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);
      user = await User.create(newUser);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }));

  // Local strategy
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'Incorrect email' });

      if (!user.password) return done(null, false, { message: 'No local login, use Google OAuth' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) return done(null, user);
      else return done(null, false, { message: 'Incorrect password' });
    } catch (err) {
      done(err);
    }
  }));
};
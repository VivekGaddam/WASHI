const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

// --- Route Imports ---
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const postRoutes = require('./routes/postRoutes');
dotenv.config({ path: path.resolve(__dirname, '.env') });
require('./config/passport')(passport);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session and Passport Middleware ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);
app.use('/departments', departmentRoutes);
app.use("/posts", postRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Hide stack trace in production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});


const PORT = process.env.PORT || 5001; // Using 5001 as the default

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

startServer();

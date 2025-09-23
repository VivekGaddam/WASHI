const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');
const { getProfile, logoutUser } = require('../controllers/userController');
 


router.get("/profile", protect, getProfile);
router.post("/logout", protect, logoutUser);

module.exports = router;

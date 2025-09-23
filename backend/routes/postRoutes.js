const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');

const {
  createReport,
  getFeed,
  addNote,
  updateStatus, // Assuming you will add this to your routes eventually
  likeReport,
  addComment // <-- Import the new controller function
} = require('../controllers/postController');

router.post('/', protect, createReport);

router.get('/feed', protect, getFeed);

router.post('/:id/notes', protect, addNote);

router.post('/:id/like', protect, likeReport);

// --- NEW: Route for adding a comment to a specific post/report ---
router.post('/:id/comments', protect, addComment);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');

const {
  createReport,
  getFeed,
  addNote,
  updateStatus,
  likeReport
} = require('../controllers/postController');

router.post('/', protect, createReport);

router.get('/feed', protect, getFeed);

router.post('/:id/notes', protect, addNote);

router.post('/:id/like', protect, likeReport);

module.exports = router;

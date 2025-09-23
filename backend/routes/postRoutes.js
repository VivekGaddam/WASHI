const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware.js');

const {
  createReport,
  getFeed,
  addNote,
  updateStatus
} = require('../controllers/postController');

router.post('/', protect, createReport);

router.get('/feed', protect, getFeed);

router.post('/:id/notes', protect, addNote);

router.patch('/:id/status', protect, updateStatus);

module.exports = router;

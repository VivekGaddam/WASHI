const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  addNoteToReport,
  likeReport,
  getReportNotes
} = require('../controllers/reportController');

// Import middleware
const {protect,admin} = require('../middlewares/authMiddleware.js');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

// A logged-in user can create a report
router.route('/')
  .post(protect, createReport);

// An admin can get all reports
router.route('/')
  .get(protect, admin, getReports);

// Admin-only routes for specific reports
router.route('/:id')
  .get(protect, admin, getReportById);


router.route('/:id/status')
  .put(protect, admin, updateReportStatus);

router.route('/:id/notes')
  .post(protect, admin, addNoteToReport)
  .get(getReportNotes);

router.route('/:id/like').post(protect, likeReport);

module.exports = router;

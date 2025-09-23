const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  assignDepartment,
  updateReportStatus,
  addNoteToReport,
  getReportsFeed,
  updateReportByUser,
  toggleUpvote
} = require('../controllers/reportController');

// Import middleware
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

// Users can fetch public feed (all reports) → MUST come before '/:id'
router.get('/feed', authMiddleware, getReportsFeed);

// A logged-in user can create a report
router.post('/', authMiddleware, createReport);

// Admin-only: get all reports
router.get('/', authMiddleware, adminMiddleware, getReports);

// Admin-only routes for specific reports
router.get('/:id', authMiddleware, adminMiddleware, getReportById);
router.put('/:id/assign', authMiddleware, adminMiddleware, assignDepartment);
router.put('/:id/status', authMiddleware, adminMiddleware, updateReportStatus);
router.post('/:id/notes', authMiddleware, adminMiddleware, addNoteToReport);

// User can update their own report
router.put('/:id', authMiddleware, updateReportByUser);

// User can upvote a report
router.post('/:id/upvote', authMiddleware, toggleUpvote);

module.exports = router;

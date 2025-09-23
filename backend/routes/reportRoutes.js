const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  assignDepartment,
  updateReportStatus,
  addNoteToReport
} = require('../controllers/reportController');

// Import middleware
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

// A logged-in user can create a report
router.route('/')
  .post(authMiddleware, createReport);

// An admin can get all reports
router.route('/')
  .get(authMiddleware, adminMiddleware, getReports);

// Admin-only routes for specific reports
router.route('/:id')
  .get(authMiddleware, adminMiddleware, getReportById);

router.route('/:id/assign')
  .put(authMiddleware, adminMiddleware, assignDepartment);

router.route('/:id/status')
  .put(authMiddleware, adminMiddleware, updateReportStatus);

router.route('/:id/notes')
  .post(authMiddleware, adminMiddleware, addNoteToReport);

module.exports = router;

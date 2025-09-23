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
const Report = require('../models/Report');
// Import middleware
const {protect,admin} = require('../middlewares/authMiddleware.js');

router.get("/all", async (req, res) => {
  try {
    const { search, category, status, priority } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.route('/')
  .post(protect, createReport);

// An admin can get all reports
router.route('/')
  .get(protect, admin, getReports);

// Admin-only routes for specific reports
router.route('/:id')
  .get(protect, admin, getReportById);

router.route('/:id/assign')
  .put(protect, admin, assignDepartment);

router.route('/:id/status')
  .put(protect, admin, updateReportStatus);

router.route('/:id/notes')
  .post(protect, admin, addNoteToReport);

module.exports = router;

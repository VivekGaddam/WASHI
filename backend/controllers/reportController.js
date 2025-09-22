const Report = require('../models/Report');
const axios = require('axios'); // Import axios

// Helper function to map AI priority score to enum
const mapPriorityScore = (score) => {
  if (score >= 7) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
};

// @desc    Create a new report by a logged-in user
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;

    // Validate required fields
    if (!title || !description || !category || !location || !location.coordinates) {
      return res.status(400).json({ message: 'Please include all required fields: title, description, category, and location with coordinates.' });
    }

    // Call AI service to get priority
    let priority = 'Medium'; // Default in case AI service fails
    try {
      const aiResponse = await axios.post('http://localhost:5002/prioritize', { text: description });
      const priorityScore = aiResponse.data.result.priority_score;
      if (priorityScore) {
        priority = mapPriorityScore(priorityScore);
      }
    } catch (aiError) {
      console.error('Error calling AI service:', aiError.message);
      // Continue with default priority if AI service fails
    }

    const newReport = new Report({
      title,
      description,
      category,
      location,
      priority,
      user: req.user.id, // User ID from authenticated request
      status: 'New', // Default status
    });

    const createdReport = await newReport.save();
    res.status(201).json(createdReport);

  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports with filtering
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  // TODO: Implement logic to get reports with filters will go here
  res.status(200).json({ success: true, message: 'Placeholder for fetching all reports.' });
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private/Admin
exports.getReportById = async (req, res, next) => {
  // TODO: Implement logic to get a single report will go here
  res.status(200).json({ success: true, message: `Placeholder for fetching report with ID: ${req.params.id}` });
};

// @desc    Assign a department to a report
// @route   PUT /api/reports/:id/assign
// @access  Private/Admin
exports.assignDepartment = async (req, res, next) => {
  // TODO: Implement logic to assign department will go here
  res.status(200).json({ success: true, message: `Placeholder for assigning department to report with ID: ${req.params.id}` });
};

// @desc    Update a report's status
// @route   PUT /api/reports/:id/status
// @access  Private/Admin
exports.updateReportStatus = async (req, res, next) => {
  // TODO: Implement logic to update status will go here
  res.status(200).json({ success: true, message: `Placeholder for updating status of report with ID: ${req.params.id}` });
};

// @desc    Add a note to a report
// @route   POST /api/reports/:id/notes
// @access  Private/Admin
exports.addNoteToReport = async (req, res, next) => {
  // TODO: Implement logic to add a note will go here
  res.status(200).json({ success: true, message: `Placeholder for adding a note to report with ID: ${req.params.id}` });
};

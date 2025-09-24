const Report = require('../models/Report');
const Department = require('../models/Department');
const axios = require('axios');

const ADMIN_LOCATION_RADIUS_KM = 5; // Default radius for admin report filtering in kilometers

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

    if (!title || !description || !category || !location || !location.coordinates) {
      return res.status(400).json({ message: 'Please include all required fields: title, description, category, and location with coordinates.' });
    }

    let priority = 'Medium';
    let assignedDepartment = null;

    try {
      const aiResponse = await axios.post('http://localhost:5002/prioritize', { text: description });
      const { priority_score, community_name } = aiResponse.data.result;

      if (priority_score) {
        priority = mapPriorityScore(priority_score);
      }

      if (community_name) {
        const department = await Department.findOne({ name: community_name });
        if (department) {
          assignedDepartment = department._id;
        } else {
          console.error(`Department not found for name: ${community_name}`);
        }
      }
    } catch (aiError) {
      console.error('Error calling AI service:', aiError.message);
    }

    const newReport = new Report({
      title,
      description,
      category,
      location,
      priority,
      assignedDepartment,
      user: req.user.id,
      status: 'New',
    });

    const createdReport = await newReport.save();
    res.status(201).json(createdReport);
  } catch (error) {
    next(error);
  }
};

// Helper for fetching reports with proper admin filtering
const _fetchReportsData = async (req, reportId = null) => {
  const { status, category, priority, latitude, longitude, radius, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (reportId) filter._id = reportId;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  // Admin filtering
  if (req.user.role === 'admin') {
    if (!req.user.departmentId) {
      throw new Error('Admin user must have a departmentId.');
    }
    filter.assignedDepartment = req.user.departmentId;

    // Apply location filter
    if (req.user.location && req.user.location.coordinates) {
      const adminLat = req.user.location.coordinates[1];
      const adminLng = req.user.location.coordinates[0];
      filter.location = {
        $geoWithin: {
          $centerSphere: [[adminLng, adminLat], ADMIN_LOCATION_RADIUS_KM / 6378.1], // radius in radians
        },
      };
    }
  }

  // Allow explicit location override via query (optional)
  if (latitude && longitude && radius) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad) || rad <= 0) {
      throw new Error('Invalid latitude, longitude, or radius for location filtering.');
    }

    filter.location = {
      $geoWithin: {
        $centerSphere: [[lng, lat], rad / 6378.1],
      },
    };
  }

  const startIndex = (page - 1) * limit;
  const total = await Report.countDocuments(filter);

  const reports = await Report.find(filter)
    .populate('user', 'username email')
    .populate('assignedDepartment', 'name')
    .populate('notes.addedBy', 'username email')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const pagination = {};
  if (startIndex + reports.length < total) {
    pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
  }
  if (startIndex > 0) {
    pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };
  }

  return { reports, total, pagination };
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  try {
    const { reports, total, pagination } = await _fetchReportsData(req);
    res.status(200).json({ success: true, count: reports.length, total, pagination, data: reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private/Admin
exports.getReportById = async (req, res, next) => {
  try {
    const { reports } = await _fetchReportsData(req, req.params.id);

    if (reports.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found or not authorized.' });
    }

    res.status(200).json({ success: true, data: reports[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a report's status
// @route   PUT /api/reports/:id/status
// @access  Private/Admin
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status: newStatus } = req.body;
    if (!newStatus) return res.status(400).json({ message: 'Please provide a status.' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    if (req.user.role === 'admin' && req.user.departmentId) {
      if (!report.assignedDepartment || report.assignedDepartment.toString() !== req.user.departmentId.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to update this report.' });
      }
    }

    const validTransitions = {
      'New': ['In Progress'],
      'In Progress': ['Resolved', 'Rejected'],
      'Resolved': ['Closed'],
      'Rejected': ['Closed'],
      'Closed': [],
    };

    if (!validTransitions[report.status]?.includes(newStatus)) {
      return res.status(400).json({ message: `Invalid status transition from '${report.status}' to '${newStatus}'.` });
    }

    report.status = newStatus;
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a note to a report
// @route   POST /api/reports/:id/notes
// @access  Private/Admin
exports.addNoteToReport = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text is required.' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    if (req.user.role === 'admin' && req.user.departmentId) {
      if (!report.assignedDepartment || report.assignedDepartment.toString() !== req.user.departmentId.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to add notes to this report.' });
      }
    }

    const newNote = { text, addedBy: req.user.id };
    report.notes.push(newNote);
    await report.save();

    const updatedReport = await Report.findById(req.params.id).populate('notes.addedBy', 'username email');
    const addedNote = updatedReport.notes[updatedReport.notes.length - 1];

    res.status(201).json(addedNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a report
// @route   POST /api/reports/:id/like
// @access  Private
exports.likeReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const userId = req.user.id;
    const userIndex = report.likes.indexOf(userId);

    if (userIndex === -1) {
      report.likes.push(userId);
    } else {
      report.likes.splice(userIndex, 1);
    }

    report.likeCount = report.likes.length;
    const updatedReport = await report.save();

    res.json(updatedReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const Report = require('../models/Report');

const ADMIN_LOCATION_RADIUS_KM = 5; // Default radius for admin report filtering in kilometers
const Department = require('../models/Department');
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

    // Call AI service to get priority and department
    let priority = 'Medium'; // Default in case AI service fails
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
      // Continue with default priority and no department if AI service fails
    }

    const newReport = new Report({
      title,
      description,
      category,
      location,
      priority,
      assignedDepartment,
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
const _fetchReportsData = async (req, reportId = null) => {
  const { status, category, priority, latitude, longitude, radius, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (reportId) filter._id = reportId;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  // Admin department filtering
  // Only return reports assigned to admin's department
  if (req.user.role === 'admin' && req.user.departmentId) {
    filter.assignedDepartment = req.user.departmentId;
  }

  // Admin location filtering (optional)
  if (req.user && req.user.role === 'admin' && req.user.location && req.user.location.coordinates) {
    const adminLat = req.user.location.coordinates[1]; // [lng, lat]
    const adminLng = req.user.location.coordinates[0];

    if (!latitude && !longitude && !radius) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [[adminLng, adminLat], ADMIN_LOCATION_RADIUS_KM / 6378.1]
        }
      };
    }
  }

  // Explicit location filtering from query
  if (latitude && longitude && radius) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(rad) || rad <= 0) {
      throw new Error('Invalid latitude, longitude, or radius for location filtering.');
    }

    filter.location = {
      $geoWithin: {
        $centerSphere: [[lng, lat], rad / 6378.1]
      }
    };
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Report.countDocuments(filter);

  const reports = await Report.find(filter)
    .populate('user', 'username email')
    .populate('assignedDepartment', 'name')
    .populate('notes.addedBy', 'username email')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const pagination = {};
  if (endIndex < total) pagination.next = { page: parseInt(page) + 1, limit: parseInt(limit) };
  if (startIndex > 0) pagination.prev = { page: parseInt(page) - 1, limit: parseInt(limit) };

  return { reports, total, pagination };
};


// @desc    Get all reports with filtering
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
  try {
    const { reports, total, pagination } = await _fetchReportsData(req);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      pagination,
      data: reports
    });
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
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const report = reports[0];

    // Authorization check: Only a user from the assigned department or a super admin can view
    if (req.user.role === 'admin' && req.user.departments && req.user.departments.length > 0) {
      const userDepartmentIds = req.user.departments.map(deptId => deptId.toString());
      if (!report.assignedDepartment || !userDepartmentIds.includes(report.assignedDepartment._id.toString())) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this report.' });
      }
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
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
  try {
    const { status: newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({ message: 'Please provide a status.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Authorization check
    if (req.user.role === 'admin' && req.user.departments && req.user.departments.length > 0) {
      const userDepartmentIds = req.user.departments.map(deptId => deptId.toString());
      if (!report.assignedDepartment || !userDepartmentIds.includes(report.assignedDepartment._id.toString())) {
        return res.status(403).json({ success: false, message: 'You are not authorized to update this report.' });
      }
    }

    const currentStatus = report.status;

    // Define valid status transitions
    const validTransitions = {
      'New': ['In Progress'],
      'In Progress': ['Resolved', 'Rejected'],
      'Resolved': ['Closed'],
      'Rejected': ['Closed'],
      'Closed': [], // No transitions from Closed
    };

    if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({ message: `Invalid status transition from '${currentStatus}' to '${newStatus}'.` });
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

    if (!text) {
      return res.status(400).json({ message: 'Note text is required.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Authorization check
    if (req.user.role === 'admin' && req.user.departments && req.user.departments.length > 0) {
      const userDepartmentIds = req.user.departments.map(deptId => deptId.toString());
      if (!report.assignedDepartment || !userDepartmentIds.includes(report.assignedDepartment._id.toString())) {
        return res.status(403).json({ success: false, message: 'You are not authorized to add notes to this report.' });
      }
    }

    const newNote = {
      text,
      addedBy: req.user.id,
    };

    report.notes.push(newNote);
    await report.save();

    // To return the populated addedBy field, we need to re-fetch or populate the last note
    const updatedReport = await Report.findById(req.params.id)
      .populate('notes.addedBy', 'fullName email');

    const addedNote = updatedReport.notes[updatedReport.notes.length - 1];

    res.status(201).json(addedNote);
  } catch (error) {
    next(error);
  }
};

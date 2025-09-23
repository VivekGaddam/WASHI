const axios = require('axios');
const Report = require('../models/Report');
const Department = require('../models/Department');

function mapPriorityScore(score) {
  if (score >= 0.7) return 'High';
  if (score >= 0.4) return 'Medium';
  return 'Low';
}

// @desc Create a new report
// @route POST /api/reports
// @access Private
exports.createReport = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description || !location?.coordinates) {
      return res.status(400).json({ message: 'Missing required fields or coordinates' });
    }

    let priority = 'Medium';
    let assignedDepartment = null;
    let category = 'General';

    try {
      // Call AI Flask service
      const aiResponse = await axios.post('http://localhost:5002/prioritize', { text: description });
      const { priority_score, community_name } = aiResponse.data.result;

      if (priority_score) priority = mapPriorityScore(priority_score);

      if (community_name) {
        category = community_name; // <-- category set here
        const department = await Department.findOne({ name: community_name });
        if (department) assignedDepartment = department._id;
      }
    } catch (err) {
      console.error('AI Service Error:', err.message);
    }

    const newReport = new Report({
      title,
      description,
      category,            // <-- AI decides
      location,
      priority,
      assignedDepartment,
      user: req.user.id,
      status: 'New',
    });

    const createdReport = await newReport.save();
    res.status(201).json(createdReport);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get feed sorted by proximity
// @route GET /api/reports/feed?lat=&lng=
// @access Private
exports.getFeed = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Missing latitude or longitude' });

    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 50000 // optional: 50km
        }
      }
    }).populate('user', 'username email')
      .populate('assignedDepartment', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Add note to a report
// @route POST /api/reports/:id/notes
// @access Private
exports.addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Note text required' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.notes.push({ text, addedBy: req.user.id });
    await report.save();

    res.status(201).json(report);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update report status
// @route PATCH /api/reports/:id/status
// @access Private/Admin
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    await report.save();

    res.json(report);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

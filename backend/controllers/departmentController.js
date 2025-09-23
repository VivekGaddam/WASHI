const Department = require('../models/Department');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const department = await Department.create({ name });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    // Handle duplicate key error for unique name
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department with this name already exists.' });
    }
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private/Admin
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    next(error);
  }
};

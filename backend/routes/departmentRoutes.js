const express = require('express');
const router = express.Router();
const { createDepartment, getDepartments } = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

router.route('/')
  .post(authMiddleware, adminMiddleware, createDepartment)
  .get(authMiddleware, adminMiddleware, getDepartments);

module.exports = router;

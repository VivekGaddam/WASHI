const express = require('express');
const router = express.Router();
const { createDepartment, getDepartments } = require('../controllers/departmentController');
const { protect,admin } = require('../middlewares/authMiddleware.js');


router.route('/')
  .post(protect, admin, createDepartment)
  .get(protect, getDepartments);

module.exports = router;

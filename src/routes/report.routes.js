const express = require('express');
const ReportController = require('../controllers/report.controller');
const authJWT = require('../middlewares/authJWT');
const roleAuth = require('../middlewares/roleAuth.js');
const router = express.Router();

router.route('/emp-report').get(authJWT.verifyToken, roleAuth.isAdmin, ReportController.getEmployeeRegReport);
router.route('/leave-report').get(authJWT.verifyToken, roleAuth.isAdmin, ReportController.getEmployeeLeaveReport);

module.exports = router;

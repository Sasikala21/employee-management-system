const express = require('express');
const leaveController = require('../controllers/leave.controller');
const authJWT = require('../middlewares/authJWT');
const roleAuth = require('../middlewares/roleAuth.js');
const router = express.Router();
const { leaveDataValidation } = require('../validators/leave.validator.js');

router.route('/request-leave').post(authJWT.verifyToken, roleAuth.isEmployee, leaveDataValidation, leaveController.requestLeave);
router.route('/leave-status/:leaveId').patch(leaveController.leaveRequestStatus);
router.route('/').get(authJWT.verifyToken, roleAuth.isAdmin, leaveController.getLeaveRequest);
router.route('/pending').get(authJWT.verifyToken, roleAuth.isAdmin, leaveController.getPendingLeaveRequest);
router.route('/leave-history').get(authJWT.verifyToken, roleAuth.isEmployee, leaveController.getLeaveById);

module.exports = router;
    
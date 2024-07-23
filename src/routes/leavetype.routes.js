const express = require('express');
const LeavetypeController = require('../controllers/leavetype.controller');
const authJWT = require('../middlewares/authJWT');
const roleAuth = require('../middlewares/roleAuth');
const router = express.Router();
const { leaveTypeDataValidation } = require('../validators/leavetype.validator');

router.route('/').get(authJWT.verifyToken, LeavetypeController.getAllLeavetypeList).post(authJWT.verifyToken, roleAuth.isAdmin, leaveTypeDataValidation, LeavetypeController.createOrUpdateLeavetype);
router.route('/:leaveTypeId').get(authJWT.verifyToken, roleAuth.isAdmin, LeavetypeController.getLeavetypeById).put(authJWT.verifyToken, roleAuth.isAdmin, leaveTypeDataValidation, LeavetypeController.createOrUpdateLeavetype).delete(authJWT.verifyToken, roleAuth.isAdmin, LeavetypeController.deleteLeavetypeById);

module.exports = router;

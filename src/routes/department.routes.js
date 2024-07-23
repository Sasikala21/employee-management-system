const express = require('express');
const DepartmentController = require('../controllers/department.controller');
const authJWT = require('../middlewares/authJWT');
const roleAuth = require('../middlewares/roleAuth');
const router = express.Router();
const { departmentDataValidation } = require('../validators/department.validator')

router.route('/').get(authJWT.verifyToken, roleAuth.isAdmin, DepartmentController.getAllDepartmentList).post(authJWT.verifyToken, roleAuth.isAdmin, departmentDataValidation, DepartmentController.createOrUpdateDepartment);
router.route('/:departmentId').get(authJWT.verifyToken, roleAuth.isAdmin, DepartmentController.getDepartmentById).put(authJWT.verifyToken, roleAuth.isAdmin, departmentDataValidation, DepartmentController.createOrUpdateDepartment).delete(authJWT.verifyToken, roleAuth.isAdmin, DepartmentController.deleteDepartmentById);

module.exports = router;

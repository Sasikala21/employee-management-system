const express = require('express');
const EmployeeController = require('../controllers/employee.controller');
const authJWT = require('../middlewares/authJWT');
const roleAuth = require('../middlewares/roleAuth.js');
const upload = require('../middlewares/upload.js');
const router = express.Router();
const { employeeDataValidation } = require('../validators/employee.validator.js');
router.route('/').get(authJWT.verifyToken, roleAuth.isAdmin, EmployeeController.getAllEmployeeList).post(authJWT.verifyToken, roleAuth.isAdmin, upload, employeeDataValidation, EmployeeController.createOrUpdateEmployee);
router.route('/:employeeId').get(EmployeeController.getEmployeeById).put(authJWT.verifyToken, roleAuth.isAdmin, upload, employeeDataValidation, EmployeeController.createOrUpdateEmployee).delete(authJWT.verifyToken, roleAuth.isAdmin, EmployeeController.deleteEmployeeById);

router.route('/currentUser').post(authJWT.verifyToken, EmployeeController.currentUser);
router.route('/change-password').post(authJWT.verifyToken, EmployeeController.changePassword);

router.route('/pdf').post(EmployeeController.generatepdf);
module.exports = router;

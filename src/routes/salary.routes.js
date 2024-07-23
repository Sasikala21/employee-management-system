const express = require('express');
const SalaryController = require('../controllers/salary.controller');
const authJWT = require('../middlewares/authJWT');
const roleAuth = require('../middlewares/roleAuth');
const router = express.Router();
const { salaryDataValidation } = require('../validators/salary.validator');

router.route('/').get(authJWT.verifyToken, roleAuth.isAdmin, SalaryController.getAllSalaryList).post(authJWT.verifyToken, roleAuth.isAdmin, salaryDataValidation, SalaryController.createOrUpdateSalary);
router.route('/salary-history').get(authJWT.verifyToken, roleAuth.isEmployee, SalaryController.getSalaryHistory);
router.route('/:salaryId').get(authJWT.verifyToken, roleAuth.isAdmin, SalaryController.getSalaryById).put(authJWT.verifyToken, roleAuth.isAdmin, salaryDataValidation, SalaryController.createOrUpdateSalary).delete(authJWT.verifyToken, roleAuth.isAdmin, SalaryController.deleteSalaryById);


module.exports = router;

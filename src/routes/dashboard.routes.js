const express = require('express');
const DashboardController = require('../controllers/dashboard.controller');
const authJWT = require('../middlewares/authJWT');
const roleAuth = require('../middlewares/roleAuth.js');
const router = express.Router();

router.route('/').get(authJWT.verifyToken, roleAuth.isAdmin, DashboardController.getDashboardCount);

module.exports = router;

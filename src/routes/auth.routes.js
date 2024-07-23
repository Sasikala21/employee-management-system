const express = require('express');
const authController = require('../controllers/auth.controller');
const authJWT = require('../middlewares/authJWT');
const router = express.Router();

router.route('/login').post(authController.login);
router.route('/logout').post(authJWT.verifyToken, authController.logout);
router.route('/changePassword').post(authJWT.verifyToken, authController.changePassword);
router.post('/forgotpassword', authController.forgotPassword);
router.post('/resetpassword', authController.resetPassword);

module.exports = router;

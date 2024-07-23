const EmployeeModel = require('../models/employee.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authJWT = require('../middlewares/authJWT');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const otpGenerator = require('otp-generator');
const otpStore = {};
const emailConfig = require('../middlewares/emailConfig.js');

const securePassword = require('../middlewares/bcrypt');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const employee = await EmployeeModel.findOne({ email });
  if (!employee) {
    return res.status(404).send({ message: 'Invalid Email !' });
  } else {
    const isPasswordMatch = await bcrypt.compare(password, employee.password);
    if (!isPasswordMatch) {
      return res.status(401).send({ status: 'Failure', statusCode: 401, message: 'Invalid Password' });
    } else {
      const accessToken = jwt.sign({ _id: employee._id },
        process.env.SECRET_KEY, {
        expiresIn: '1d', // 15 min
      });
      const refreshToken = jwt.sign({ _id: employee._id },
        process.env.SECRET_KEY, {
        expiresIn: '1d', // 1 day 
      });
      const decodedToken = jwt.decode(accessToken);
      const expirationTimestamp = decodedToken.exp;
      // authJWT.refreshToken(refreshToken);
      return res.status(200).send({
        statusCode: 200,
        message: "Login Successfully",
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiredAt: expirationTimestamp
      })
    }
  }
}

// logout employee
exports.logout = async (req, res) => {
  try {
    authJWT.invalidateToken(req.token);
    return res.status(200).send({ status: 'Success', statusCode: 200, message: "employee Logged Out Successfully" });
  } catch (error) {
    return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
  }
}

// exports.refreshToken = async (req, res) => {
//     let { refreshToken } = req.body;
//     if (!refreshToken)
//         return res.sendStatus(401);
//     // Verify the refresh token
//     jwt.verify(refreshToken, process.env.SECRET_KEY, (err, employee) => {
//         if (err) {
//             return res.sendStatus(403);
//         } else {
//             // Generate a new access token
//             const accessToken = jwt.sign({ _id: employee._id }, process.env.SECRET_KEY, { expiresIn: '15m' });
//             res.status(200).send({ accessToken });
//         }
//     });
// }

exports.changePassword = async (req, res) => {
  try {
    const employee = await EmployeeModel.findById(req.employeeId);
    if (!employee) {
      return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Employee not found' })
    } else {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const isPasswordMatch = await bcrypt.compare(oldPassword, employee.password);
      if (!isPasswordMatch) {
        return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Old password is incorrect' });
      } else {
        if (oldPassword !== newPassword) {
          if (newPassword !== confirmPassword) {
            return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'New password and confirm password do not match' });
          }
          const hashedNewPassword = await securePassword(newPassword);
          employee.password = hashedNewPassword;
          await employee.save();
          return res.status(200).send({ status: 'Success', statusCode: 200, message: 'Password was updated successfully' });
        } else {
          return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Old password should not same as new password!' });
        }
      }
    }
  } catch (error) {
    return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await EmployeeModel.findOne({ email: email });
  if (!user) {
    return res.status(403).send({ status: 'Failure', statusCode: 403, message: 'There is no account associated with this email!' });
  } else {
    const transporter = nodemailer.createTransport(emailConfig);
    const emailTemplatePath = path.join(__dirname, '..', '..', 'htmlTemplate', 'emailTemplate.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');
    const imgPath2 = path.join(__dirname, '..', '..', 'htmlTemplate','email.png');
    const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '30m' });
    const resetPasswordLink = `${process.env.RESET_PASSWORD_URL}/reset-password/?token=${token}&type=reset-password`;
    const emailContent = emailTemplate.replace('{{resetPasswordLink}}', resetPasswordLink).replace('{{to}}', user.email);
    const emailSent = await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Password Reset Email',
      text: 'Password Reset Email',
      attachments: [
        {
          filename: 'email.png',
          path: imgPath2,
          cid: 'email'
        }
      ],
      html: emailContent,
    });
    if (emailSent) {
      return res.status(201).send({
        status: 'Password reset email sent.',
        statusCode: 201,
        message: `Password reset link was sent to ${email}`
      });
    } else {
      return res.status(403).send({ status: 'Failure', statusCode: 403, message: 'Password reset failed, Email sending failed!' });
    }
  }
}

//reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await EmployeeModel.findOne({ email });
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    if (!user) {
      return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'User not found' });
    } else {
      const { error } = passwordValidation.validate({ newPassword: newPassword, confirmPassword: confirmPassword });
      if (error) {
        return res.status(400).send({ status: 'Failure', statusCode: 400, error: error.details[0].message });
      } else {
        if (newPassword !== confirmPassword) {
          return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'New password and confirm password do not match' });
        }
        const hashedNewPassword = await securePassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();
        return res.status(200).send({ status: 'Success', statusCode: 200, message: "Password Reset Successfully!" });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
  }
}
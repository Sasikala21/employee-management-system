require('dotenv').config();
const jwt = require("jsonwebtoken");
const invalidatedTokens = [];
const refreshTokens = [];
const EmployeeModel = require('../models/employee.model')

const verifyToken = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ status: 'Failure', statusCode: 403, message: 'Access denied! No token provided!' });
    }
    if (invalidatedTokens.includes(token)) {
        return res.status(401).json({ status: 'Failure', statusCode: 401, message: 'Invalid token!!!' });
    } 
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const employee = await EmployeeModel.findById(decoded._id).populate('department');
        req.employee = employee;
        req.employeeId = employee._id;
        req.token = token;
        req.exp = employee.exp;
        req.role = getRoleFromDepartment(employee.department);
        next();
    } catch (err) {
        return res.status(401).json({ status: 'Failure', statusCode: 401, message: 'Invalid token!' });
    }
};

const invalidateToken = (token) => {
    invalidatedTokens.push(token);
};

const refreshToken = (refreshToken) => {
    refreshTokens.push(refreshToken);
}

const getRoleFromDepartment = (department) => {
    if (department && department.departmentName === 'Admin') {
        return 'Admin';
    } else if (department && department.departmentName === 'HR') {
        return 'HR';
    }
    return 'Employee';
};

const authJWT = { verifyToken, invalidateToken, refreshToken };
module.exports = authJWT;
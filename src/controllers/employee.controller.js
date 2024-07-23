const EmployeeModel = require('../models/employee.model');
const DepartmentModel = require('../models/department.model');
const genericService = require('../services/generic.service');
const securePassword = require('../middlewares/bcrypt');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const generateDataToPDF = require('../middlewares/pdf')
exports.createOrUpdateEmployee = async (req, res) => {
    try {
        const employeeDetails = req.body;
        const departmentId = await DepartmentModel.findById(req.body.department);
        if (!departmentId) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Department not found' });
        }
        let leaveCreditsDetails = [];
        if(employeeDetails.leaveCredits) {
            employeeDetails.leaveCredits.forEach(leaveCreditsInfo => {
                let leaveCredits = {
                    casualLeave: leaveCreditsInfo.casualLeave,
                    lossOfPay: leaveCreditsInfo.lossOfPay,
                    sickLeave: leaveCreditsInfo.sickLeave,
                    plannedLeave: leaveCreditsInfo.plannedLeave,
                    totalLeave: leaveCreditsInfo.totalLeave
                }
                leaveCreditsDetails.push(leaveCredits);
            })
        }        
        if (req.params.employeeId) {
            const employeeId = req.params.employeeId;
            const updateEmployee = {
                firstName: employeeDetails.firstName,
                lastName: employeeDetails.lastName,
                department: departmentId,
                address: employeeDetails.address,
                country: employeeDetails.country,
                state: employeeDetails.state,
                city: employeeDetails.city,
                dateOfBirth: employeeDetails.dateOfBirth,
                dateOfJoining: employeeDetails.dateOfJoining,
                contactNumber: employeeDetails.contactNumber,
                leaveCredits: leaveCreditsDetails
            };
            if (req.file) {
                updateEmployee.employeeProfile = req.file.path;
            }  
            await genericService.update(EmployeeModel, employeeId, updateEmployee).then(data => {
                if (!data) {
                    res.status(404).send({
                        status: 'Failure', 
                        statusCode: 404,
                        message: 'Employee not found'
                    });
                } else {
                    return res.status(200).send({
                        status: 'Success', 
                        statusCode: 200,
                        message: "Employee Details updated Successfully!"
                    });
                }
            })
        } else {
            if (req.body.password !== req.body.confirmPassword) {
                return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Password & Confirm Password does not match!' });
            } else {
                const hashedPassword = await securePassword(req.body.password);
                const createEmployee = {
                    firstName: employeeDetails.firstName,
                    lastName: employeeDetails.lastName,
                    department: departmentId,
                    email: employeeDetails.email,
                    contactNumber: employeeDetails.contactNumber,
                    address: employeeDetails.address,
                    country: employeeDetails.country,
                    state: employeeDetails.state,
                    city: employeeDetails.city,
                    dateOfBirth: employeeDetails.dateOfBirth,
                    dateOfJoining: employeeDetails.dateOfJoining,
                    password: hashedPassword,
                    confirmPassword: hashedPassword,
                    leaveCredits: leaveCreditsDetails
                }
                if (req.file) {
                    createEmployee.employeeProfile = req.file.path;
                } else {
                    createEmployee.employeeProfile = ''
                }
                let empId;
                if (empId == null) {
                    empId = createEmployee._id;
                    const empSeqNo = await EmployeeModel.getNextSequenceValue("employee");
                    createEmployee.empId = "EMP_" + empSeqNo;
                    await genericService.create(EmployeeModel, createEmployee);
                    return res.status(201).send({
                        status: 'Success', 
                        statusCode: 201,
                        message: "Employee Created Successfully!"
                    });
                }
            }
        }
    } catch (err) {
        console.log(err,'err')
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: err.message });
    }
}

exports.getAllEmployeeList = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const limitValue = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const sortBy = req.query.sortBy || 'empId';
        const order = req.query.order || 'asc';
        const status = req.query.status;
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const regexOptions = 'i';
        const regex = new RegExp(searchQuery, regexOptions);
        const query = {
            $or: [
                { firstName: { $regex: regex } },
                { lastName: { $regex: regex } },
                { email: { $regex: regex } },
                { status: { $regex: regex } }
            ]
        };
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;
        const totalCount = await EmployeeModel.countDocuments(query);
        const nextPageCount = Math.max(0, totalCount - endIndex);
        const totalPages = Math.ceil(totalCount / limitValue);
        const employeesList = await EmployeeModel.find(query)
            .sort(sort)
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        const currentPageCount = employeesList.length;
        return res.status(200).send({
            data: employeesList,
            message: "Employee List retrieved Successfully",
            totalCount, currentPageCount, nextPageCount,
            totalPages, currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
        })
    } catch (error) {
        return res.status(500).json({ status: 'Failure', statusCode: 500, error: 'An error occurred while processing the request.' });
    }
}

exports.getEmployeeById = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        const getEmployee = await genericService.getById(EmployeeModel, employeeId);
        if (!getEmployee) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Employee not found' });
        }
        const employeeProfileFilename = getEmployee.employeeProfile.split('/').pop();
        const responseData = {
            ...getEmployee.toObject(),
            employeeProfile_file: employeeProfileFilename
        };

        return res.status(200).send({ data: responseData, status: 'Success', statusCode: 200, message: 'Employee retrieved successfully' });
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}

exports.deleteEmployeeById = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        const deleteEmployee = await genericService.getById(EmployeeModel, employeeId);
        if (!deleteEmployee) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Employee not found' });
        }
        await deleteEmployee.save();
        await genericService.deleteById(EmployeeModel, employeeId);
        return res.status(200).send({ status: 'Success', statusCode: 200, message: 'Employee deleted successfully' });
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}

exports.currentUser = async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.employeeId).populate('department');
        if (!employee) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'employee not found' });
        } else {
            const employeeData = {
                "empId": employee.empId,
                "firstName": employee.firstName,
                "lastName": employee.lastName,
                "email": employee.email,
                "contactNumber": employee.contactNumber,
                "department": employee.department ? employee.department.departmentName : null,
                "employeeProfile": employee.employeeProfile,
                "address": employee.address
            }
            return res.status(200).send({ status: 'Success', statusCode: 200, message: 'Employee Details Fetched Successfully!', employeeData });
        }
    } catch (error) {
        return res.status(500).send({ status: 'Failure', statusCode: 500, message: error.message });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.employeeId);
        if (!employee) {
            return res.status(404).send({ status: 'Failure', message: 'Employee not found!' });
        } else {
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;
            const confirmPassword = req.body.confirmPassword;
            const isPasswordMatch = await bcrypt.compare(oldPassword, employee.password);
            if (!isPasswordMatch) {
                return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'Old password is incorrect' });
            } else {
                if (oldPassword !== newPassword) {
                    if (newPassword !== confirmPassword) {
                        return res.status(400).send({ status: 'Failure', statusCode: 400, message: 'New password and confirm password do not match' });
                    }
                    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
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
}

exports.generatepdf = async (req, res) => {
    try {
        const limitValue = parseInt(req.query.limit);
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'firstName';
        const order = req.query.order || 'asc';
        const status = req.query.status;
        const query = {};
        if (status) {
            query.status = { $regex: status, $options: 'i' };
        }
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;
        const employeesList = await EmployeeModel.find(query)
            .sort(sort)
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        const doc = new PDFDocument();
        const fileName = 'employee_list.pdf';

        // Setting the response headers for a PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // Creating a write stream to pipe the PDF to the response
        doc.pipe(res);

        // Adding table header
        const tableHeaders = ['First Name', 'Last Name', 'Email', 'Status'];
        const tableData = employeesList.map(employee => [employee.firstName, employee.lastName, employee.email, employee.status]);

        // Using pdfkit-table to create a table in the PDF
        doc.table({
            headers: tableHeaders,
            rows: tableData,
            fontSize: 10,
            width: 600,
            startY: 50,
            margin: { top: 30 },
        });

        // Ending the document
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
}

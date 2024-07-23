const LeaveModel = require('../models/leave.model');
const LeaveTypeModel = require('../models/leavetype.model');
const EmployeeModel = require('../models/employee.model')
const genericService = require('../services/generic.service')
const moment = require('moment');
const calculateLeaveDays = require('../middlewares/calculateDays');

exports.requestLeave = async (req, res) => {
    try {
        const { fromDate, toDate, description } = req.body;
        const leaveType = await LeaveTypeModel.findById(req.body.leaveType);
        if (!leaveType) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'LeaveType Not Found' });
        }
        const employee = await EmployeeModel.findById(req.employeeId);
        if (!employee) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Employee Not Found' });
        }
        const leaveDays = calculateLeaveDays(fromDate, toDate);

        if (leaveType.leaveTypeName === Casual && employee.leaveCredits[0].casualLeave >= leaveDays) {
            employee.leaveCredits[0].casualLeave -= leaveDays;
        } else if (leaveType.leaveTypeName === Sick && employee.leaveCredits[0].sickLeave >= leaveDays) {
            employee.leaveCredits[0].sickLeave -= leaveDays;
        } else if (leaveType.leaveTypeName === Planned && employee.leaveCredits[0].plannedLeave >= leaveDays) {
            employee.leaveCredits[0].plannedLeave -= leaveDays;
        } else {
            return res.status(400).json({ message: 'Invalid Leave Type' });
        }
        await employee.save();
        
        const createLeaveRequest = {
            leaveType: leaveType,
            fromDate: fromDate,
            toDate: toDate,
            description: description,
            employee: employee,
        }
        await genericService.create(LeaveModel, createLeaveRequest);
        return res.status(201).send({
            message: "Leave Request Created Successfully!"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: error.message
        });
    }
}

exports.leaveRequestStatus = async (req, res) => {
    try {
        const leaveRequest = await LeaveModel.findById(req.params.leaveId).populate('employee').populate('leaveType');
        if (!leaveRequest) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'LeaveRequest Not Found' });
        } else {
            const leaveId = req.params.leaveId;
              // Find the employee by ID
            const employee = await EmployeeModel.findById(leaveRequest.employee._id);
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            const leaveStatus = req.body.leaveStatus;
            const updatedLeaveStatus = await genericService.update(LeaveModel, leaveId, { leaveStatus });
            if (!updatedLeaveStatus) {
                return res.status(404).send({
                    message: 'Leave not found'
                });
            } else {
                if(leaveStatus === 'Rejected') {

                    const leaveDays = calculateLeaveDays(leaveRequest.fromDate, leaveRequest.toDate);

                    if (leaveRequest.leaveType.leaveTypeName === "Casual") {
                        employee.leaveCredits[0].casualLeave += leaveDays;
                    } else if (leaveRequest.leaveType.leaveTypeName === "Sick" ) {
                        employee.leaveCredits[0].sickLeave += leaveDays;
                    } else if (leaveRequest.leaveType.leaveTypeName === "Planned" ) {
                        employee.leaveCredits[0].plannedLeave += leaveDays;
                    } else {
                        return res.status(400).json({ message: 'Invalid Leave Type' });
                    }
                    await employee.save();
                } 
                res.send({ message: "Leave Status updated successfully", updatedLeaveStatus })
            }
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: error.message
        });
    }
}

exports.getLeaveRequest = async (req, res) => {
    try {
        const limitValue = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'leaveStatus';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const searchQuery = req.query.search;
        const regexOptions = 'i';
        const regex = new RegExp(searchQuery, regexOptions);
        const whereClause = {}
        const query = {
            $or: [
                { "leaveType.leaveTypeName": regex },
                { "employee.firstName": regex },
                { leaveStatus: regex }
            ]
        }
        const totalCount = await LeaveModel.countDocuments(query);
        const leaveRequest = await LeaveModel.find(query)
            .skip((page - 1) * limitValue)
            .limit(limitValue)
            .populate('employee', '_id empId firstName createdAt')
            .populate('leaveType', 'leaveTypeName');
        const leaverequestlist = leaveRequest.map((record) => ({
            leaveId: record._id,
            leaveType: record.leaveType ? record.leaveType.leaveTypeName : null,
            fromDate: moment(record.fromDate).format('YYYY-MM-DD'),
            toDate: moment(record.toDate).format('YYYY-MM-DD'),
            leaveStatus: record.leaveStatus,
            employeeId: record.employee._id,
            firstName: record.employee.firstName,
            empId: record.employee ? record.employee.empId : null,
            createdAt: moment(record.employee.createdAt).format('YYYY-MM-DD HH:mm:ss')
        }));
        if (leaverequestlist.length == 0) {
            return res.status(200).send({
                message: "No Records Found!",
                data: leaverequestlist
            })
        }
        const currentPageCount = leaverequestlist.length;
        return res.status(200).json({
            data: leaverequestlist,
            currentPage: page,
            currentPageCount,
            totalPages: Math.ceil(totalCount / limitValue),
            totalItems: totalCount,
            message: 'LeaveRequest retrieved Successfully'
        });
    } catch (error) {
        console.log(error, 'error')
        return res.status(500).send({
            message: error.message
        })
    }
}

exports.getPendingLeaveRequest = async (req, res) => {
    try {
        const limitValue = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'leaveStatus';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const searchQuery = req.query.search;
        const regexOptions = 'i';
        const regex = new RegExp(searchQuery, regexOptions);
        const query = {
            $or: [
                { "leaveType.leaveTypeName": regex },
                { "employee.firstName": regex },
                { leaveStatus: regex }
            ]
        }
        const leaveRequest = await LeaveModel.find(query).where({ leaveStatus: 'Pending' })
            .populate('employee', '_id empId firstName createdAt')
            .populate('leaveType', 'leaveTypeName');
        const leaverequestlist = leaveRequest.map((record) => ({
            leaveId: record._id,
            leaveType: record.leaveType ? record.leaveType.leaveTypeName : null,
            fromDate: moment(record.fromDate).format('YYYY-MM-DD'),
            toDate: moment(record.toDate).format('YYYY-MM-DD'),
            leaveStatus: record.leaveStatus,
            employeeId: record.employee._id,
            empId: record.employee ? record.employee.empId : null,
            firstName: record.employee.firstName,
            createdAt: moment(record.employee.createdAt).format('YYYY-MM-DD HH:mm:ss')
        }));
        if (leaverequestlist.length == 0) {
            return res.status(200).send({
                message: "No Records Found!",
                data: leaverequestlist
            })
        }
        const totalCount = await LeaveModel.countDocuments(query);
        const currentPageCount = leaverequestlist.length;
        return res.status(200).json({
            data: leaverequestlist,
            currentPage: page,
            currentPageCount,
            totalPages: Math.ceil(totalCount / limitValue),
            totalItems: totalCount,
            message: 'LeaveRequest retrieved Successfully'
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message
        })
    }
}

exports.getLeaveById = async (req, res) => {
    try {
        const employeeId = req.employeeId;

        const employeeDetails = await EmployeeModel.findById(employeeId).populate('department');

        if (!employeeDetails) {
            return res.status(404).send({
                message: 'Employee not found'
            });
        }
        const page = parseInt(req.query.page);
        const limitValue = parseInt(req.query.limit);
        const query = {};
        const totalCount = await LeaveModel.countDocuments(query);
        const leaveDetails = await LeaveModel.find(query)
            .where({ employee: employeeId }).populate('leaveType')
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        if (!leaveDetails || leaveDetails.length === 0) {
            return res.status(404).send({
                message: 'No leave details found for the employee'
            });
        }

        const leaveHistory = leaveDetails.map(leave => ({
            id: leave._id,
            department: employeeDetails.department.departmentName,
            firstName: employeeDetails.firstName,
            email: employeeDetails.email,
            remark: leave.remark,
            leaveType: leave.leaveType.leaveTypeName,
            fromDate: new Date(leave.fromDate).toISOString().split('T')[0],
            toDate: new Date(leave.toDate).toISOString().split('T')[0],
            description: leave.description,
            leaveStatus: leave.leaveStatus,
            createdAt: new Date(leave.createdAt).toISOString().split('T')[0], // Extracting date part
            updatedAt: new Date(leave.updatedAt).toISOString().split('T')[0] // Extracting date part
        }));
        const currentPageCount = leaveHistory.length;
        return res.status(200).json({
            data: leaveHistory,
            currentPage: page,
            currentPageCount,
            totalPages: Math.ceil(totalCount / limitValue),
            totalItems: totalCount,
            message: 'Leave details retrieved successfully'
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};
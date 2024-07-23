const EmployeeModel = require('../models/employee.model');
const LeaveModel = require('../models/leave.model');

exports.getEmployeeRegReport = async (req, res) => {
    try {
        const limitValue = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const sortBy = req.query.sortBy || 'firstName';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const searchQuery = req.query.search;
        const regexOptions = 'i';
        const regex = new RegExp(searchQuery, regexOptions);
        const query = {
            $or: [
                { email: regex },
                { firstName: regex },
                { lastName: regex },
                { empId: regex }
            ],
            dateOfJoining: { $gte: new Date(req.query.fromDate), $lte: new Date(req.query.toDate) }
        }
        const totalCount = await EmployeeModel.countDocuments(query);
        // const registrationReport = await EmployeeModel.find(query).where({
        //     dateOfJoining: { $gte: fromDate, $lte: toDate }
        // }).select('empId firstName lastName dateOfJoining')
        const registrationReport = await EmployeeModel.find(query)
            .select('empId firstName lastName dateOfJoining')
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        const currentPageCount = registrationReport.length;
        if (registrationReport.length < 0) {
            return res.status(200).send({
                message: "No Records Found!",
                data: registrationReport
            })
        } else {
            return res.status(200).json({
                statusCode: 200,
                status: 'Success',
                data: registrationReport,
                currentPage: page,
                currentPageCount,
                totalPages: Math.ceil(totalCount / limitValue),
                totalCount: totalCount,
                message: 'Employee Registration Report generated Successfully!'
            });
        }
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
}

exports.getEmployeeLeaveReport = async (req, res) => {
    try {
        if (!req.query.fromDate) {
            return res.status(400).json({ status: 'Failure', statusCode: 400, message: 'From date is required!' });
        } else if (!req.query.toDate) {
            return res.status(400).json({ status: 'Failure', statusCode: 400, message: 'To date is required!' });
        }
        const limitValue = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const sortBy = req.query.sortBy || 'firstName';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const searchQuery = req.query.search;
        const regexOptions = 'i';
        const regex = new RegExp(searchQuery, regexOptions);
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const query = {
            // $or: [
            //     { email: regex },
            //     { firstName: regex },
            //     { lastName: regex },
            //     { empId: regex },
            // ],
            fromDate: { $gte: new Date(fromDate) },
            toDate: { $lte: new Date(toDate) }
        }
        const totalCount = await LeaveModel.countDocuments(query);
        const leaveBetweenReport = await LeaveModel.find(query)
            .skip((page - 1) * limitValue).limit(limitValue)
            .populate('employee', 'empId firstName lastName')
            .populate('leaveType', 'leaveTypeName');
        const leaveReport = leaveBetweenReport.map((record) => ({
            leaveType: record.leaveType ? record.leaveType.leaveTypeName : null,
            fromDate: record.fromDate,
            toDate: record.toDate,
            description: record.description,
            leaveStatus: record.leaveStatus,
            empId: record.employee ? record.employee.empId : null,
            firstName: record.employee ? record.employee.firstName : null,
            lastName: record.employee ? record.employee.lastName : null
        }));
        const currentPageCount = leaveReport.length;
        if (leaveReport.length < 0) {
            return res.status(404).send({
                status: 'Failure',
                message: "No Records Found!",
                data: leaveReport
            })
        } else {
            res.status(200).json({
                status: 'Success',
                data: leaveReport,
                currentPage: page,
                currentPageCount,
                totalPages: Math.ceil(totalCount / limitValue),
                totalCount: totalCount,
                message: 'Leave Report generated Successfully!'
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: 'error', message: 'Internal Server Error' })
    }
}
const DepartmentModel = require('../models/department.model');
const LeaveTypeModel = require('../models/leavetype.model');
const EmployeeModel = require('../models/employee.model');
const LeaveModel = require('../models/leave.model');
exports.getDashboardCount = async(req,res) => {
    try{
        const leavetypeCount = await LeaveTypeModel.find().countDocuments();
        const departmentCount = await DepartmentModel.find().countDocuments();
        const employeeCount = await EmployeeModel.find().countDocuments();
        const leaveRequestCount = await LeaveModel.find().countDocuments();
        const approvedLeaveRequestCount = await LeaveModel.find({ leaveStatus: "Approved" }).countDocuments();
        const rejectedLeaveRequestCount = await LeaveModel.find({ leaveStatus: "Rejected" }).countDocuments();
        const newLeaveRequestCount = await LeaveModel.find({ leaveStatus: "Pending" }).countDocuments();

        dashboardCount = {
            leavetypeCount,
            departmentCount,
            employeeCount,
            leaveRequestCount,
            approvedLeaveRequestCount,
            rejectedLeaveRequestCount,
            newLeaveRequestCount
        }
        return res.status(200).send({
            data: dashboardCount,
            message: "Dashboard Counts retrieved Successfully"
        })
    } catch(error) {
        return res.status(500).send({
            message: error.message
        })
    }
}

    
const SalaryModel = require('../models/salary.model');
const DepartmentModel = require('../models/department.model');
const EmployeeModel = require('../models/employee.model');
const genericService = require('../services/generic.service');

exports.createOrUpdateSalary = async (req, res) => {
    try {
        const departmentId = await DepartmentModel.findById({_id: req.body.department});
        if (!departmentId) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Department not found' });
        }
        const empId = await EmployeeModel.findOne({ _id: req.body.employee });
        if (!empId) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Employee ID not found' });
        }
        if (req.params.salaryId) {
            const salaryId = req.params.salaryId;
            const updateSalary = {
                department: departmentId,
                employee: empId,
                salary: req.body.salary,
                allowanceSalary: req.body.allowanceSalary,
                totalSalary: req.body.totalSalary
            }
            console.log(updateSalary);
            await genericService.update(SalaryModel, salaryId, updateSalary).then(data => {
                if (!data) {
                    res.status(404).send({
                        status: 'Failure',
                        statusCode: 404,
                        message: 'Salary Details not found'
                    });
                } else {
                    return res.status(200).send({
                        status: 'Success',
                        statusCode: 200,
                        message: "Salary Details updated successfully!"
                    });
                }
            })
        } else {
            const createSalary = {
                department: departmentId,
                employee: empId,
                salary: req.body.salary,
                allowanceSalary: req.body.allowanceSalary,
                totalSalary: req.body.totalSalary
            }
            await genericService.create(SalaryModel, createSalary);
            return res.status(201).send({
                status: 'Success',
                statusCode: 201,
                message: "Salary Created Successfully!"
            });
        }
    } catch (err) {
        res.status(500).send({ status: 'Error', message: err.message, statusCode: 500 });
    }
}
exports.getAllSalaryList = async (req, res) => {
    try {
        const limitValue = parseInt(req.query.limit); 
        const page = parseInt(req.query.page); 
        const sortBy = req.query.sortBy || 'salary'; 
        const order = req.query.order || 'asc'; 
        const status = req.query.status; 
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const query = {};
        if (status) {
            query.status = { $regex: status, $options: 'i' }; 
        }

        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;

        const totalCount = await SalaryModel.countDocuments(query);
       
        const salaryDetails = await SalaryModel.find(query)
            .sort(sort)
            .skip((page - 1) * limitValue)
            .limit(limitValue)
            .populate('department', 'departmentName')
            .populate('employee', 'firstName'); 

        const currentPageCount = salaryDetails.length;
        const totalPages = Math.ceil(currentPageCount / limitValue);
        const nextPageCount = Math.max(0, totalCount - endIndex);

        res.status(200).json({
            data: salaryDetails,
            totalCount,
            currentPageCount, nextPageCount,
            totalPages, currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
};
exports.getSalaryById = async (req, res) => {
    const salaryId = req.params.salaryId;
    const salary = await genericService.getById(SalaryModel, salaryId);
    if (!salary) {
        return res.status(404).json({ error: 'Salary not found' });
    }
    await genericService.getById(SalaryModel, salaryId);
    return res.status(200).json({ message: 'Salary details fetched successfully', salary });
}

exports.getSalaryHistory = async (req, res) => {
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
        const query = {}
        const totalCount = await SalaryModel.countDocuments(query);
        const salaryDetails = await SalaryModel.find(query)
        .where({ employee: employeeId })
        .skip((page - 1) * limitValue)
        .limit(limitValue);
        if (!salaryDetails || salaryDetails.length === 0) {
            return res.status(404).send({
                message: 'No salary details found for the employee'
            });
        }

        const salaryHistory = salaryDetails.map(salary => ({
            id: salary._id,
            department: salary.department,
            department: employeeDetails.department.departmentName,
            firstName: employeeDetails.firstName,
            email: employeeDetails.email,
            empId: employeeDetails.empId,
            salary: salary.salary,
            allowanceSalary: salary.allowanceSalary,
            totalSalary: salary.totalSalary,
            createdAt: new Date(salary.createdAt).toISOString().split('T')[0], // Extracting date part
        }));
        const currentPageCount = salaryHistory.length;
        return res.status(200).json({
            data: salaryHistory,
            currentPage: page,
            currentPageCount,
            totalPages: Math.ceil(totalCount / limitValue),
            totalItems: totalCount,
            message: 'Salary details retrieved successfully'
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};

// Update a salary status by id in the request
exports.updateStatusSalary = async (req, res) => {
    try {
        if (!req.body) {
            res.status(400).send({
                message: "Data to update can not be empty!"
            });
        }
        const salaryId = req.params.salaryId;
        const status = req.body.status;
        const updatedSalary = await genericService.updateStatus(SalaryModel, salaryId, status);
        if (!updatedSalary) {
            return res.status(404).send({
                message: 'Salary not found'
            });
        } else {
            res.send({ message: "Salary Status updated successfully." })
        }
    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

// Delete a salary with the specified id in the request
exports.deleteSalaryById = async (req, res) => {
    const salaryId = req.params.salaryId;
    const salary = await genericService.getById(SalaryModel, salaryId);
    if (!salary) {
        return res.status(404).json({ error: 'Salary not found' });
    }
    await genericService.deleteById(SalaryModel, salaryId);
    return res.status(200).json({ message: 'Salary deleted successfully' });
}

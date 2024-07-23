const DepartmentModel = require('../models/department.model');
const genericService = require('../services/generic.service');
exports.createOrUpdateDepartment = async (req, res) => {
    try {
        const departmentName = await DepartmentModel.findOne({ departmentName: req.body.departmentName });
        if (req.params.departmentId) {
            const departmentId = req.params.departmentId;
            const updateDepartment = {
                departmentName: req.body.departmentName
            }
            await genericService.update(DepartmentModel, departmentId, updateDepartment).then(data => {
                if (!data) {
                    return res.status(404).send({ status:'Failure', message: 'Department not found', statusCode: 404 });
                } else {
                    return res.status(200).send({ status:'Success', message: "Department Updated Successfully!", statusCode: 200 });
                }
            })
        } else {
            if (departmentName) {
                return res.status(409).send({ status: 'Failure', statusCode: 409, message: 'Department Already Exists' });
            }
            const createDepartment = {
                departmentName: req.body.departmentName
            }
            await genericService.create(DepartmentModel, createDepartment);
            return res.status(201).send({ status:'Success', message: "Department Created Successfully!", statusCode: 201 });
        }
    } catch (err) {
        res.status(500).send({ status: 'Failure', statusCode: 500, message: err.message });
    }
}

exports.getAllDepartmentList = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const limitValue = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const sortBy = req.query.sortBy || 'departmentName';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const regexOptions = 'i';
        const regex = new RegExp(searchQuery, regexOptions);
        const query = {
            $or: [
                { departmentName: { $regex: regex } },
                { status: { $regex: regex } }
            ]
        };
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;
        const totalCount = await DepartmentModel.countDocuments(query);
        const nextPageCount = Math.max(0, totalCount - endIndex);
        const totalPages = Math.ceil(totalCount / limitValue);
        const department = await DepartmentModel.find(query)
            .sort(sort)
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        const currentPageCount = department.length;
        if (department.length === 0) {
            return res.status(200).send({ message: "No Records Found"});
        } else {
            return res.status(200).send({
                status: 'Success',
                statusCode: 200,
                data: department,
                message: "Department List retrieved Successfully",
                totalCount, currentPageCount, nextPageCount,
                totalPages, currentPage: page,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            })
        }

    } catch (error) {
        res.status(500).json({ status: 'Failure', statusCode: 500, error: 'An error occurred while processing the request.' });
    }
};

// Find a single department with an id
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await genericService.getById(DepartmentModel, req.params.departmentId);
        if (!department) {
            return res.status(404).json({ status: 'Failure', statusCode: 404, message: "Department not found" });
        }
        return res.status(200).json({ status: 'Sucess', statusCode: 200, message: "Fetched Successfully", department });
    } catch (error) {
        return res.status(500).json({ status: 'Failure', statusCode: 500, message: error.message });
    }
};

// Update a department status by id in the request
exports.updateStatusDepartment = async (req, res) => {
    try {
        if (!req.body) {
            res.status(400).send({
                message: "Data to update can not be empty!"
            });
        }
        const id = req.params.departmentId;
        const status = req.body.status;
        const updatedDepartment = await genericService.updateStatus(DepartmentModel, id, status);
        if (!updatedDepartment) {
            return res.status(404).send({ status: 'Failure', statusCode: 404, message: 'Department not found' });
        } else {
            res.send({ status: 'Sucess', statusCode: 200, message: "Department Status updated successfully." })
        }
    } catch (err) {
        res.status(500).send({ status: 'Failure', statusCode: 500, message: err.message });
    }
};

exports.deleteDepartmentById = async (req, res) => {
    try {
        const departmentId = req.params.departmentId;
        const department = await genericService.getById(DepartmentModel, departmentId);
        if (!department) {
            return res.status(404).json({ status: 'Failure', statusCode: 404, error: 'Department not found' });
        }
        await genericService.deleteById(DepartmentModel, departmentId);
        return res.status(200).json({ status: 'Sucess', statusCode: 200, message: 'Department deleted successfully' });
    } catch (error) {
        return res.status(500).json({ status: 'Failure', statusCode: 500,  message: 'Internal Server Error' });
    }
}

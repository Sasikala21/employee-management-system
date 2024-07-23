const LeaveTypeModel = require('../models/leavetype.model');
const genericService = require('../services/generic.service');

exports.createOrUpdateLeavetype = async (req, res) => {
    try {
        const leaveTypeName = await LeaveTypeModel.findOne({ leaveTypeName: req.body.leaveTypeName });
        if (req.params.leaveTypeId) {
            const leaveTypeId = req.params.leaveTypeId;
            const updateLeaveType = {
                leaveTypeName: req.body.leaveTypeName
            }
            await genericService.update(LeaveTypeModel, leaveTypeId, updateLeaveType).then(data => {
                if (!data) {
                    res.status(404).send({
                        message: 'LeaveType not found'
                    });
                } else {
                    return res.status(200).send({
                        message: "LeaveType updated Successfully!"
                    });
                }
            })
        } else {
            if (leaveTypeName) {
                return res.status(404).send({ status: 'Failure', statusCode: 409, message: 'LeaveType Already Exists' });
            }
            const createLeaveType = {
                leaveTypeName: req.body.leaveTypeName
            }
            await genericService.create(LeaveTypeModel, createLeaveType);
            return res.status(201).send({
                message: "LeaveType Created Successfully!"
            });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: err.message });
    }
}

exports.getAllLeavetypeList = async (req, res) => {
    try {
        const searchQuery = req.query.search;
        const limitValue = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const sortBy = req.query.sortBy || 'leavetypeName';
        const order = req.query.order || 'asc';
        const startIndex = (page - 1) * limitValue;
        const endIndex = page * limitValue;
        const regexOptions = 'i';
        const regex = new RegExp(searchQuery, regexOptions);
        const query = {
            $or: [
                { leaveTypeName: { $regex: regex } },
                { status: { $regex: regex } }
            ]
        };
        const sort = {};
        sort[sortBy] = order === 'asc' ? 1 : -1;
        const totalCount = await LeaveTypeModel.countDocuments(query);
        const nextPageCount = Math.max(0, totalCount - endIndex);
        const totalPages = Math.ceil(totalCount / limitValue);
        const leavetypeList = await LeaveTypeModel.find(query)
            .sort(sort)
            .skip((page - 1) * limitValue)
            .limit(limitValue);
        const currentPageCount = leavetypeList.length;
        return res.status(200).send({
            data: leavetypeList,
            message: "Leavetype List retrieved Successfully",
            totalCount, currentPageCount, nextPageCount,
            totalPages, currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null,
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
};

// Find a single leavetype with an id
exports.getLeavetypeById = async (req, res) => {
    try {
        const leavetype = await genericService.getById(LeaveTypeModel, req.params.leaveTypeId);
        if (!leavetype) {
            res.status(404).json({ message: "LeaveType not found" });
        }
        res.status(200).json({ message: "Fetched Successfully", leavetype });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Update a leavetype status by id in the request
exports.updateStatusLeavetype = async (req, res) => {
    try {
        if (!req.body) {
            res.status(400).send({
                message: "Data to update can not be empty!"
            });
        }
        const id = req.params.leaveTypeId;
        const status = req.body.status;
        const updatedLeaveType = await genericService.updateStatus(LeaveTypeModel, id, status);
        if (!updatedLeaveType) {
            return res.status(404).send({
                message: 'LeaveType not found'
            });
        } else {
            res.send({ message: "LeaveType Status updated successfully." })
        }
    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

// Delete a leavetype with the specified id in the request
exports.deleteLeavetypeById = async (req, res) => {
    try {
        const leavetype = await genericService.getById(LeaveTypeModel, req.params.leaveTypeId);
        if (!leavetype) {
            res.status(404).json({ message: "LeaveType not found" });
        }
        await genericService.deleteById(LeaveTypeModel, leavetype);
        return res.status(200).json({ message: 'LeaveType deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


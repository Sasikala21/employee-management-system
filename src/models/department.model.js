const mongoose = require('mongoose');
const DepartmentSchema =  new mongoose.Schema({
    departmentName: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        maxLength: 50
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }},
    {timestamps : true, versionKey: false},
);

var Department = new mongoose.model('Department', DepartmentSchema);
module.exports = Department;
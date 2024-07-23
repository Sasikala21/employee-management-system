const mongoose = require('mongoose');
const applyLeaveSchema =  new mongoose.Schema({
    leaveType: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Leavetype",
        required: [true, 'leavetype is required'],
        default: null
    },
    fromDate: {
        type: Date,
        required: [true, 'from date is required'],
        default: null
    },
    toDate: {
        type: Date,
        required: [true, 'to date is required'],
        default: null
    },
    description: {
        type: String,
        maxLength: 250,
        required:[true, 'description is required'],
        default: null
    },
    leaveStatus: {
        type: String,
        required: [true, 'Leave Status is required'],
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    remark: {
        type: String,
        default: ''
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: [true, 'employee is required'],
        default: null
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

var Leave = new mongoose.model('Leave', applyLeaveSchema);
module.exports = Leave;
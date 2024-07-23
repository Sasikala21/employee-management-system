const mongoose = require('mongoose');
const EmployeeSequence = require('./sequence.model')
const EmployeeSchema = new mongoose.Schema({
    empId: {
        type: String,
        unique: true,
    },
    firstName: {
        type: String,
        trim: true,
        required: [true, 'firstName is required']
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, 'lastName is required']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: [true, 'department is required'],
        default: null
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    contactNumber: {
        type: String,
        required: [true, 'contactNumber is required'],
        unique: true,
    },
    address: {
        type: String,
        required: [true, 'address is required'],
        trim: true,
        default: null,
    },
    country: {
        type: String,
        required: [true, 'country is required'],
        trim: true,
        default: null
    },
    state: {
        type: String,
        required: [true, 'state is required'],
        trim: true,
        default: null
    },
    city: {
        type: String,
        required: [true, 'city is required'],
        trim: true,
        default: null
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'DateOfBirth is required']
    },
    dateOfJoining: {
        type: Date,
        required: [true, 'DateOfJoining is required']
    },
    employeeProfile: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        trim: true,
        default: null
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    leaveCredits: [
        {
            casualLeave:{
                type: Number,
                default: 0,
            },
            lossOfPay:{
                type: Number,
                default: 0,
            },
            sickLeave:{
                type: Number,
                default: 0,
            },
            plannedLeave: {
                type: Number,
                default:0,
            },
            totalLeave: {
                type: Number,
                default: 0
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
},
    { timestamps: true, versionKey: false },
);


EmployeeSchema.statics.getNextSequenceValue = async function (sequenceName) {
    const sequenceDocument = await EmployeeSequence.findOneAndUpdate(
        { type: sequenceName },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.sequenceValue.toString().padStart(3, '0');
}

var Employee = new mongoose.model('Employee', EmployeeSchema);
module.exports = Employee;

const mongoose = require('mongoose');
const SalarySchema =  new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null
    },
    salary: {
        type: Number,
        maxLength:6
    },
    allowanceSalary: {
        type: Number,
        maxLength:6
    },
    totalSalary: {
        type: Number,
        maxLength:6
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

var Salary = new mongoose.model('Salary', SalarySchema);
module.exports = Salary;
const mongoose = require('mongoose');
const LeavetypeSchema =  new mongoose.Schema({
    leaveTypeName: {
        type: String,
        required: true,
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

var Leavetype = new mongoose.model('Leavetype', LeavetypeSchema);
module.exports = Leavetype;
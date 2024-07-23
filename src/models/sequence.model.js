const mongoose = require('mongoose');

const SequenceSchema = new mongoose.Schema(
    {
        type: { 
            type: String, 
            required: true
        },
        sequenceValue: {
            type: Number, 
            default: 0 
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Sequence', SequenceSchema);
const Joi = require('joi');

const leaveTypeValidation = Joi.object ({
    leaveTypeName :Joi.string().min(3).max(30).trim().required().messages({
        'string.empty': 'Enter the leaveTypeName',
        'any.required': 'leaveTypeName is required',
        'string.min': "LeaveTypeName should be at least 3 characters long",
        'string.max': "LeaveTypeName should not exceed 30 characters",
    })
});
const leaveTypeDataValidation = async (req, res, next) => {
    const { error } = leaveTypeValidation.validate(req.body);
    if (error) {
        const errorMessage = error.errors && error.errors[Object.keys(error.errors)[0]].message || error.message;
        res.status(500).json({ status: 'Failure', message: errorMessage, statusCode: 500 });
    } else {
        next();
    }
};

module.exports = { leaveTypeDataValidation };

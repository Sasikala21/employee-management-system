const Joi = require('joi');

const leaveValidation = Joi.object({
    leaveType: Joi.string().required().messages({
        'string.empty': 'Select any one of the leavetype',
        'any.required': 'LeaveType is required',
    }),
    fromDate: Joi.date().required().messages({
        'string.empty': 'Select any fromdate',
        'any.required': 'Fromdate is required',
    }),
    // toDate: Joi.date().greater(Joi.ref('fromDate')).required().messages({
    toDate: Joi.date().required().messages({
        'string.empty': 'Select any toDate',
        'any.required': 'ToDate is required',
    }),
    description: Joi.string().min(5).max(100).required().messages({
        'string.empty': 'Enter the description',
        'any.required': 'Description is required',
        'string.min': "Description should be at least 5 characters long",
        'string.max': "Description should not exceed 100 characters",
    })
})


const leaveDataValidation = async (req, res, next) => {
    const { error } = leaveValidation.validate(req.body);
    if (error) {
        const errorMessage = error.errors && error.errors[Object.keys(error.errors)[0]].message || error.message;
        res.status(500).json({ status: 'Failure', message: errorMessage, statusCode: 500 });
    } else {
        next();
    }
};

module.exports = { leaveDataValidation };

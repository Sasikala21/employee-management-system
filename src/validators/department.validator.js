const Joi = require('joi');

const departmentValidation = Joi.object ({
    departmentName :Joi.string().min(2).max(30).trim().required().messages({
        'string.empty': 'Enter the departmentName',
        'any.required': 'departmentName is required',
        'string.min': "DepartmentName should be at least 2 characters long",
        'string.max': "DepartmentName should not exceed 30 characters",
    })
});
const departmentDataValidation = async (req, res, next) => {
    const { error } = departmentValidation.validate(req.body);
    if (error) {
        const errorMessage = error.errors && error.errors[Object.keys(error.errors)[0]].message || error.message;
        res.status(500).json({ status: 'Failure', message: errorMessage, statusCode: 500 });
    } else {
        next();
    }
};

module.exports = { departmentDataValidation };

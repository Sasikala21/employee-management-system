const Joi = require('joi');

const salaryValidation = Joi.object ({
    department: Joi.string().required().messages({
        'string.empty': 'Select any one of the Department',
        'any.required': 'Department is required',
    }),
    employee: Joi.string().required().messages({
        'string.empty': 'Select any one of the employee',
        'any.required': 'Employee is required',
    }),
    salary: Joi.number().min(4).required().messages({
        'number.empty': 'Enter the Salary',
        'any.required': 'Salary is required',
        'number.min': "Salary should have atleast 4 minimum digits",
    }),
    allowanceSalary: Joi.number().min(4).required().messages({
        'number.empty': 'Enter the AllowanceSalary',
        'any.required': 'Allowance Salary is required',
        'number.min': "Allowance Salary should have atleast 4 minimum digits",
    }),
    totalSalary: Joi.number().required()
});
const salaryDataValidation = async (req, res, next) => {
    const { error } = salaryValidation.validate(req.body);
    if (error) {
        const errorMessage = error.errors && error.errors[Object.keys(error.errors)[0]].message || error.message;
        res.status(500).json({ status: 'Failure', message: errorMessage, statusCode: 500 });
    } else {
        next();
    }
};

module.exports = { salaryDataValidation };

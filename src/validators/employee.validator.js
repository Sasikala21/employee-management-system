const Joi = require('joi');

const employeeValidation = Joi.object({
    empId: Joi.string().optional(),
    firstName: Joi.string().min(3).max(30).trim().required().messages({
        'string.empty': 'Enter the firstname',
        'any.required': 'Firstname is required',
        'string.min': "Firstname should be at least 3 characters long",
        'string.max': "Firstname should not exceed 30 characters",
    }),
    lastName: Joi.string().min(3).max(30).trim().required().messages({
        'string.empty': 'Enter the lastName',
        'any.required': 'LastName is required',
        'string.min': "LastName should be at least 3 characters long",
        'string.max': "LastName should not exceed 30 characters",
    }),
    email: Joi.string().max(255).email().required().messages({
        'string.empty': 'Enter the email',
        'any.required': 'Email is required',
        'string.email': 'Invalid email format'
    }),
    department: Joi.string().required().messages({
        'string.empty': 'Select any one of the Department',
        'any.required': 'Department is required',
    }),
    contactNumber: Joi.string().length(10).required().messages({
        'string.empty': 'Enter the contactNumber',
        'any.required': 'ContactNumber is required',
    }),
    address: Joi.string().min(5).max(150).required().messages({
        'string.empty': 'Enter the address',
        'any.required': 'Address is required',
        'string.min': "Address should be at least 5 characters long",
        'string.max': "Address should not exceed 150 characters"
    }),
    country: Joi.string().min(3).max(100).required().messages({
        'string.empty': 'Enter the Country',
        'any.required': 'Country is required',
        'string.min': "Country should be at least 3 characters long",
        'string.max': "Country should not exceed 100 characters"
    }),
    state: Joi.string().min(3).max(100).required().messages({
        'string.empty': 'Enter the State',
        'any.required': 'State is required',
        'string.min': "State should be at least 3 characters long",
        'string.max': "State should not exceed 100 characters"
    }),
    city: Joi.string().min(3).max(100).required().messages({
        'string.empty': 'Enter the City',
        'any.required': 'City is required',
        'string.min': "City should be at least 3 characters long",
        'string.max': "City should not exceed 100 characters"
    }),
    dateOfBirth: Joi.string().required().messages({
        'string.empty': 'Enter the dateOfBirth',
        'any.required': 'DateOfBirth is required',
    }),
    dateOfJoining: Joi.string().required().messages({
        'string.empty': 'Enter the dateOfJoining',
        'any.required': 'DateOfJoining is required',
    }),
    employeeProfile: Joi.string(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
        .message("Password must have at least one uppercase letter, one lowercase letter, one special character, and one number. Minimum length is 8 characters."),
    confirmPassword: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
        .message('Confirm Password must have at least one uppercase letter, one lowercase letter, one special character, and one number. Minimum length is 8 characters.'),
    leaveCredits: Joi.array().items(
        Joi.object({
            casualLeave: Joi.number().required().messages({
                'number.empty':'Enter the casual leave credit'
            }),
            lossOfPay: Joi.number().required().messages({
                'number.empty':'Enter the lossofpay leave credit'
            }),
            sickLeave: Joi.number().required().messages({
                'number.empty':'Enter the sickleave leave credit'
            }),
            plannedLeave: Joi.number().required().messages({
                'number.empty':'Enter the planned leave credit'
            }),
            annualLeave: Joi.number().required().messages({
                'number.empty':'Enter the annual leave credit'
            })
        }).required().messages({
            'any.required': 'Leave Credits is required',
        })
    )
});

const employeeDataValidation = async (req, res, next) => {
    const { error } = employeeValidation.validate(req.body);
    if (error) {
        console.log(error,'error')
        const errorMessage = error.errors && error.errors[Object.keys(error.errors)[0]].message || error.message;
        res.status(500).json({ status: 'Failure', message: errorMessage, statusCode: 500 });
    } else {
        next();
    }
};
module.exports = { employeeDataValidation };

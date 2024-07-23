const isAdmin = async (req, res, next) => {
    if (req.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ status: 'Failure', statusCode: 403, message: 'Access denied! You do not have the required role!' });
    }
}

const isEmployee = async (req, res, next) => {
    if (req.role !== 'Admin') {
        next();
    } else {
        res.status(403).json({ status: 'Failure', statusCode: 403, message: 'Access denied! You do not have the required role!' });
    }
}

module.exports = { isAdmin, isEmployee };
const { validationResult } = require('express-validator');

const checkErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            if (!acc[error.path]) {
                acc[error.path] = [];
            }
            acc[error.path].push({
                value: error.value,
                message: error.msg,
                type: error.type
            });
            return acc;
        }, {});

        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors,
            errorCount: errors.array().length
        });
    }

    next();
};

module.exports = {
    checkErrors
};
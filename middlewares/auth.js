const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(401).json({
            messgae: 'Token is not provided',
            field: 'Authorization'
        });
    }

    try {
        const token = authorization.split(' ')[1];
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.payload = payload;
    } catch (err) {
        console.log(err);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: err.name
            })
        }

        return res.status(500).json({
            message: 'Something went wrong',
            error: err.message
        })
    }

    return next();
}

module.exports = {
    isAuthenticated
}
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err);
        return res.sendStatus(403);
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).send({ message: 'Forbidden: Role information is missing.' });
        }

        const userRole = req.user.role.trim().toLowerCase();
        const requiredRoles = roles.map(role => role.trim().toLowerCase());

        if (requiredRoles.includes(userRole)) {
            next(); // User has the required role, proceed
        } else {
            res.status(403).send({ message: `Forbidden: Your role (${req.user.role}) is not authorized to access this resource.` });
        }
    };
};

module.exports = { verifyToken, checkRole };

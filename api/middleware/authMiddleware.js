const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {


    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.sendStatus(401);
    }

    try {
        // --- FINAL DIAGNOSTIC LOG ---
        console.log('--- VERIFYING TOKEN ---');
        console.log(`Value of JWT_SECRET: [${process.env.JWT_SECRET}]`);
        console.log(`Type of JWT_SECRET: [${typeof process.env.JWT_SECRET}]`);
        // ----------------------------
        const user = jwt.verify(token, process.env.JWT_SECRET);

        req.user = user;
        next();
    } catch (err) {
        console.error('--- CRITICAL ERROR IN verifyToken MIDDLEWARE ---');
        console.error('JWT Verification Error:', err.message);
        console.error('Full Error Object:', JSON.stringify(err, null, 2));
        return res.status(403).send({ message: 'Forbidden: Invalid token.', error: err.message });
    }
};

const checkRole = (requiredRoleIds) => {
    return (req, res, next) => {
        try {
            // 1. Log everything for clear debugging
            console.log('[Auth Check] Verifying role ID...');
            console.log('[Auth Check] User from token:', JSON.stringify(req.user, null, 2));
            console.log('[Auth Check] Required role IDs:', requiredRoleIds);

            // 2. Basic validation
            if (!req.user || req.user.id_Rol === undefined) {
                console.error('[Auth Check] FAILED: User object or role ID is missing.');
                return res.status(403).send({ message: 'Forbidden: Missing user role ID information.' });
            }

            const userRoleId = req.user.id_Rol;

            // 3. Check if the user's role ID is in the list of required role IDs
            if (requiredRoleIds.includes(userRoleId)) {
                console.log(`[Auth Check] SUCCESS: Role ID '${userRoleId}' is authorized.`);
                next(); // Role is valid, proceed to the route handler
            } else {
                console.error(`[Auth Check] FAILED: Role ID '${userRoleId}' is not in the required list:`, requiredRoleIds);
                res.status(403).send({ message: `Forbidden: Your role ID (${userRoleId}) is not authorized.` });
            }
        } catch (err) {
            // This is the ultimate safety net to catch any unexpected error in this middleware.
            console.error('--- CRITICAL ERROR IN checkRole MIDDLEWARE ---');
            console.error(err);
            res.status(500).send({ message: 'A critical error occurred during authentication.' });
        }
    };
};

module.exports = { verifyToken, checkRole };

// Main async function to control startup sequence
const start = async () => {

    // --- Global Error Handlers (Ultimate Safety Net) ---
    process.on('uncaughtException', (error) => {
        console.error('--- FATAL: UNCAUGHT EXCEPTION ---');
        console.error(error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('--- FATAL: UNHANDLED REJECTION ---');
        console.error('Reason:', reason);
        console.error('Promise:', promise);
        process.exit(1);
    });

    console.log(`--- [${new Date().toISOString()}] SERVER SCRIPT START ---`);
    require('dotenv').config();

    // --- Environment Variable Validation ---
    if (!process.env.JWT_SECRET) {
        console.error('--- FATAL: JWT_SECRET is not defined in .env file. ---');
        process.exit(1);
    }

    // --- Module Imports ---
    const express = require('express');
    const cors = require('cors');
    const { poolPromise } = require('./config/db');

    // --- Route Imports ---
    const authRoutes = require('./routes/auth');
    const userRoutes = require('./routes/users');
    const centerRoutes = require('./routes/centers');
    const appointmentRoutes = require('./routes/appointments');
    const ninoRoutes = require('./routes/ninos');
    const rolesRoutes = require('./routes/roles');
    const locationRoutes = require('./routes/locations');
    const dashboardRoutes = require('./routes/dashboard');
    const vaccineLotRoutes = require('./routes/vaccine-lots');
    const inventoryRoutes = require('./routes/inventory');
    const availabilityRoutes = require('./routes/availability');
    const vaccinationRoutes = require('./routes/vaccinations');
    const otherRoutes = require('./routes/other');

    try {
        console.log('[DB] Awaiting database connection pool...');
        await poolPromise;
        console.log('[DB] Database connection pool is ready.');

        const app = express();
        const port = process.env.PORT || 3001;

        // --- Middleware Setup ---
        const allowedOrigins = [
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/
        ];

        app.use(cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.some(regex => regex.test(origin))) {
                    return callback(null, true);
                } else {
                    console.error(`[CORS ERROR] Origin not allowed: ${origin}`);
                    return callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));
        app.use(express.json());
        app.use((req, res, next) => {
            console.log(`[API IN] ${req.method} ${req.originalUrl}`);
            next();
        });

        // --- API Route Setup ---
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
const doctorRoutes = require('./routes/doctor');
app.use('/api/doctor', doctorRoutes);
        app.use('/api/vaccination-centers', centerRoutes);
        app.use('/api/appointments', appointmentRoutes);
        app.use('/api/roles', rolesRoutes);
        app.use('/api/ninos', ninoRoutes);
        app.use('/api/locations', locationRoutes);
        app.use('/api/dashboard', dashboardRoutes);
        app.use('/api/vaccine-lots', vaccineLotRoutes);
        app.use('/api/inventory', inventoryRoutes);
        app.use('/api/availability', availabilityRoutes);
        app.use('/api/vaccinations', vaccinationRoutes);
        app.use('/api', otherRoutes);
        app.get('/', (req, res) => res.send('Vaccination System API is running!'));

        // --- Global Error Handler ---
        app.use((err, req, res, next) => {
            console.error('Global Error Handler caught:', err);
            if (err.message === 'Not allowed by CORS') {
                return res.status(403).json({ message: 'Not allowed by CORS' });
            }
            res.status(500).json({ message: 'An unexpected error occurred on the server.' });
        });

        // --- Start Server ---
        app.listen(port, () => {
            console.log(`[SERVER READY] Vaccination API server listening at http://localhost:${port}`);
        });

        // --- Diagnostic Heartbeat ---
        setInterval(() => {
            console.log(`[HEARTBEAT] Server is alive. Current time: ${new Date().toISOString()}`);
        }, 10000); // Log every 10 seconds

    } catch (err) {
        console.error('[FATAL STARTUP ERROR] Could not start server.');
        console.error(err);
        process.exit(1);
    }
};

// Execute the startup function
start();
// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db'); // Import poolConnect

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const centerRoutes = require('./routes/centers');
const appointmentRoutes = require('./routes/appointments');
const ninoRoutes = require('./routes/ninos');
const rolesRoutes = require('./routes/roles');
const locationRoutes = require('./routes/locations');
const dashboardRoutes = require('./routes/dashboard');
const vaccineLotRoutes = require('./routes/vaccine-lots');
const availabilityRoutes = require('./routes/availability');
const vaccinationRoutes = require('./routes/vaccinations');
const otherRoutes = require('./routes/other');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for frontend
const allowedOrigins = /^http:\/\/(localhost|127\.0\.0\.1|(\d{1,3}\.){3}\d{1,3}):\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.test(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json());

// --- Request Logger Middleware ---
app.use((req, res, next) => {
  console.log(`[API IN] ${req.method} ${req.originalUrl}`);
  next();
});

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vaccination-centers', centerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/ninos', ninoRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vaccine-lots', vaccineLotRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api', otherRoutes); // For /vaccines, /tutors, etc.

// Basic route
app.get('/', (req, res) => {
  res.send('Vaccination System API is running!');
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('Global Error Handler caught:', err);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ message: 'Not allowed by CORS' });
    }
    res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});

// --- Server Initialization ---
const startServer = async () => {
    try {
        await poolPromise; // Ensure the database connection is established
        
        app.listen(port, () => {
            console.log(`[SERVER READY] Vaccination API server listening at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('[FATAL ERROR] Failed to connect to SQL Server or start server:', err);
        process.exit(1); // Exit if DB connection fails
    }
};

startServer();
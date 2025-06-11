// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for frontend
const allowedOrigins = /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/;

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

// Database configuration for Azure SQL Database
const dbConfig = {
    server: process.env.DB_AZURE_SERVER_NAME,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_OPTIONS_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_OPTIONS_TRUST_SERVER_CERTIFICATE === 'true'
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    port: 1433 // Default port for Azure SQL
};

// --- JWT Verification Middleware ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (token == null) {
        return res.sendStatus(401); // Unauthorized - no token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.sendStatus(403); // Forbidden - token is not valid
        }
        req.user = user; // Add decoded user payload to request object
        next(); // Proceed to the next middleware or route handler
    });
};

// --- Role-Based Access Control (RBAC) Middleware ---
const checkRole = (roles) => {
    return (req, res, next) => {
        // req.user should be populated by verifyToken middleware
        if (!req.user || !req.user.role) {
            return res.status(403).send({ message: 'Forbidden: Role information is missing.' });
        }

        const userRole = req.user.role;
        if (roles.includes(userRole)) {
            next(); // User has the required role, proceed
        } else {
            res.status(403).send({ message: `Forbidden: Your role (${userRole}) is not authorized to access this resource.` });
        }
    };
};

// --- Authentication Endpoints ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body; // 'email' field from frontend can be email or ID

    if (!email || !password) {
        return res.status(400).send({ message: 'Login identifier and password are required.' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('LoginIdentifier', sql.NVarChar, email)
            .execute('usp_GetUserForAuth');

        if (result.recordset.length === 0) {
            // User not found or not active
            return res.status(401).send({ message: 'Invalid credentials or user is inactive.' });
        }

        const user = result.recordset[0];

        // Compare the provided password with the hashed password from the database
        const passwordMatch = await bcrypt.compare(password, user.Clave);
        if (!passwordMatch) {
            return res.status(401).send({ message: 'Invalid credentials.' });
        }

                // Generate JWT
                        const token = jwt.sign(
            { id: user.id_Usuario, email: user.Email, role: user.NombreRol }, // Use NombreRol from stored procedure
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send token and user info back to the client
        res.json({
            token,
            user: {
                id: user.id_Usuario,
                email: user.Email,
                role: user.NombreRol // Use NombreRol here as well
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send({ message: 'Server error during login.' });
    }
});

// --- User Management Endpoints (Admin Only) ---

// POST /api/users - Create a new user
app.post('/api/users', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id_Rol, Cedula_Usuario, Email, Clave } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Clave, saltRounds);

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Rol', sql.Int, id_Rol)
            .input('Cedula_Usuario', sql.NVarChar(15), Cedula_Usuario)
            .input('Email', sql.NVarChar(100), Email)
            .input('Clave', sql.NVarChar(255), hashedPassword)
            .execute('usp_CreateUser');

        res.status(201).json({ message: 'User created successfully.', userId: result.recordset[0].id_Usuario });
    } catch (err) {
        console.error('SQL error on POST /api/users:', err);
        res.status(500).send({ message: 'Failed to create user.', error: err.message });
    }
});

// GET /api/users - Get all users
app.get('/api/users', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetAllUsers');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/users:', err);
        res.status(500).send({ message: 'Failed to retrieve users.', error: err.message });
    }
});

// GET /api/users/:id - Get a single user by ID
app.get('/api/users/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Usuario', sql.Int, id)
            .execute('usp_GetUserById');

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve user.', error: err.message });
    }
});

// PUT /api/users/:id - Update a user
app.put('/api/users/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Rol, id_Estado, Cedula_Usuario, Email } = req.body;

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Usuario', sql.Int, id)
            .input('id_Rol', sql.Int, id_Rol)
            .input('id_Estado', sql.Int, id_Estado)
            .input('Cedula_Usuario', sql.NVarChar(15), Cedula_Usuario)
            .input('Email', sql.NVarChar(100), Email)
            .execute('usp_UpdateUser');

        res.status(200).send({ message: 'User updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to update user.', error: err.message });
    }
});

// DELETE /api/users/:id - Soft delete a user
app.delete('/api/users/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Usuario', sql.Int, id)
            .execute('usp_DeleteUser');

        res.status(200).send({ message: 'User deactivated successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/users/:id:', err);
        res.status(500).send({ message: 'Failed to deactivate user.', error: err.message });
    }
});

// --- API ROUTES ---

// Basic route
app.get('/', (req, res) => {
  res.send('Vaccination System API is running!');
});

// --- User Endpoints ---

// GET all users (Admin only)
app.get('/api/users', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetUsers');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/users:', err);
        res.status(500).send({ message: 'Failed to retrieve users.', error: err.message });
    }
});

// --- Tutor Endpoints ---
// POST /api/tutors - Register a new Tutor and associated User with a hashed password
app.post('/api/tutors', async (req, res) => {
    console.log(`Accessed POST /api/tutors with body: ${JSON.stringify(req.body)}`);
    try {
        const { Nombres, Apellidos, TipoIdentificacion, NumeroIdentificacion, Telefono, Direccion, Email, Password, Username } = req.body;
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);
        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            .input('Nombres', sql.NVarChar(100), Nombres)
            .input('Apellidos', sql.NVarChar(100), Apellidos)
            .input('TipoIdentificacion', sql.NVarChar(50), TipoIdentificacion)
            .input('NumeroIdentificacion', sql.NVarChar(50), NumeroIdentificacion)
            .input('Telefono', sql.NVarChar(20), Telefono)
            .input('Direccion', sql.NVarChar(255), Direccion)
            .input('Email', sql.NVarChar(100), Email)
            .input('Clave', sql.NVarChar(255), hashedPassword) // User's hashed password
            .input('Username', sql.NVarChar(50), Username);
        const result = await request.execute('usp_RegisterTutor');
        // usp_RegisterTutor might return the new tutor's ID or user ID
        res.status(201).json({ message: 'Tutor registered successfully.', data: result.recordset });
    } catch (err) {
        console.error('SQL error on POST /api/tutors:', err);
        res.status(500).send({ message: 'Failed to register tutor.', error: err.message });
    }
});

app.get('/api/tutors/:tutorId/ninos', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    console.log(`Accessed GET /api/tutors/:tutorId/ninos with params: ${JSON.stringify(req.params)}`);
    try {
        const { tutorId } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Tutor', sql.Int, tutorId)
            .execute('usp_GetNinosByTutor');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/tutors/:tutorId/ninos:', err);
        res.status(500).send({ message: 'Failed to retrieve ninos for tutor.', error: err.message });
    }
});

// --- Nino Endpoints ---
app.post('/api/ninos', [verifyToken, checkRole(['Tutor', 'Administrador'])], async (req, res) => {
    console.log(`Accessed POST /api/ninos with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Tutor, Nombres, Apellidos, Genero, CodigoIdentificacionPropio, FechaNacimiento, PaisNacimiento } = req.body;
        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            .input('id_Tutor', sql.Int, id_Tutor)
            .input('Nombres', sql.NVarChar(100), Nombres)
            .input('Apellidos', sql.NVarChar(100), Apellidos)
            .input('Genero', sql.Char(1), Genero)
            .input('CodigoIdentificacionPropio', sql.NVarChar(18), CodigoIdentificacionPropio)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .input('PaisNacimiento', sql.NVarChar(100), PaisNacimiento);
        const result = await request.execute('usp_RegisterNino');
        res.status(201).json({ message: 'Nino registered successfully.', data: result.recordset });
    } catch (err) {
        console.error('SQL error on POST /api/ninos:', err);
        res.status(500).send({ message: 'Failed to register nino.', error: err.message });
    }
});

app.get('/api/ninos/:ninoId', [verifyToken, checkRole(['Administrador', 'Medico', 'Tutor'])], async (req, res) => {
    console.log(`Accessed GET /api/ninos/:ninoId with params: ${JSON.stringify(req.params)}`);
    try {
        const { ninoId } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Nino', sql.Int, ninoId)
            .execute('usp_GetNinoDetailsById');
        res.json(result.recordset.length > 0 ? result.recordset[0] : null);
    } catch (err) {
        console.error('SQL error on GET /api/ninos/:ninoId:', err);
        res.status(500).send({ message: 'Failed to retrieve nino details.', error: err.message });
    }
});

app.get('/api/ninos/:ninoId/appointments', [verifyToken, checkRole(['Administrador', 'Medico', 'Tutor'])], async (req, res) => {
    console.log(`Accessed GET /api/ninos/:ninoId/appointments with params: ${JSON.stringify(req.params)}`);
    try {
        const { ninoId } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Nino', sql.Int, ninoId)
            .execute('usp_GetAppointmentsByNino');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/ninos/:ninoId/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// PUT /api/ninos/:id - Update a child's record
app.put('/api/ninos/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombres, Apellidos, FechaNacimiento, Genero, CodigoIdentificacionPropio, id_CentroSaludAsignado } = req.body;

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Nino', sql.Int, id)
            .input('Nombres', sql.NVarChar(100), Nombres)
            .input('Apellidos', sql.NVarChar(100), Apellidos)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .input('Genero', sql.Char(1), Genero)
            .input('CodigoIdentificacionPropio', sql.NVarChar(20), CodigoIdentificacionPropio)
            .input('id_CentroSaludAsignado', sql.Int, id_CentroSaludAsignado)
            .execute('usp_UpdateNino');

        res.status(200).send({ message: 'Child record updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/ninos/:id:', err);
        res.status(500).send({ message: 'Failed to update child record.', error: err.message });
    }
});

// DELETE /api/ninos/:id - Delete a child's record
app.delete('/api/ninos/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Nino', sql.Int, id)
            .execute('usp_DeleteNino');

        res.status(200).send({ message: 'Child record deleted successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/ninos/:id:', err);
        res.status(500).send({ message: 'Failed to delete child record.', error: err.message });
    }
});

// --- Dashboard Endpoints ---
app.get('/api/dashboard/stats', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetDashboardStats');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/dashboard/stats:', err);
        res.status(500).send({ message: 'Failed to retrieve dashboard stats.', error: err.message });
    }
});

// --- Vaccine Lot Endpoints ---
app.get('/api/vaccine-lots/active', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera'])], async (req, res) => {
    console.log('Accessed GET /api/vaccine-lots/active endpoint');
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetActiveVaccineLots');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccine-lots/active:', err);
        res.status(500).send({ message: 'Failed to retrieve active vaccine lots.', error: err.message });
    }
});

app.post('/api/vaccine-lots', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    console.log(`Accessed POST /api/vaccine-lots with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Vacuna, NumeroLote, FechaFabricacion, FechaVencimiento, CantidadInicial, id_CentroVacunacion } = req.body;
        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('NumeroLote', sql.NVarChar(50), NumeroLote)
            .input('FechaFabricacion', sql.Date, FechaFabricacion)
            .input('FechaVencimiento', sql.Date, FechaVencimiento)
            .input('CantidadInicial', sql.Int, CantidadInicial)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion);
        const result = await request.execute('usp_AddVaccineLot');
        res.status(201).json({ message: 'Vaccine lot added successfully.', data: result.recordset });
    } catch (err) {
        console.error('SQL error on POST /api/vaccine-lots:', err);
        res.status(500).send({ message: 'Failed to add vaccine lot.', error: err.message });
    }
});

// --- Appointment Endpoints ---
// GET /api/appointments - Get all appointments
app.get('/api/appointments', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetAllAppointments');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// GET /api/appointments/:id - Get a single appointment by ID
app.get('/api/appointments/:id', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador', 'Tutor'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Cita', sql.Int, id)
            .execute('usp_GetAppointmentById');
        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'Appointment not found.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/appointments/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve appointment.', error: err.message });
    }
});

// PUT /api/appointments/:id - Update an appointment
app.put('/api/appointments/:id', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Vacuna, id_CentroVacunacion, Fecha, Hora, id_EstadoCita } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Cita', sql.Int, id)
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('Fecha', sql.Date, Fecha)
            .input('Hora', sql.Time, Hora)
            .input('id_EstadoCita', sql.Int, id_EstadoCita)
            .execute('usp_UpdateAppointment');
        res.status(200).send({ message: 'Appointment updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:id:', err);
        res.status(500).send({ message: 'Failed to update appointment.', error: err.message });
    }
});

// DELETE /api/appointments/:id - Delete an appointment
app.delete('/api/appointments/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Cita', sql.Int, id)
            .execute('usp_DeleteAppointment');
        res.status(200).send({ message: 'Appointment deleted successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/appointments/:id:', err);
        res.status(500).send({ message: 'Failed to delete appointment.', error: err.message });
    }
});

app.post('/api/appointments', [verifyToken, checkRole(['Tutor', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    console.log(`Accessed POST /api/appointments with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Nino, id_CentroVacunacion, id_Vacuna, FechaCita, HoraCita } = req.body;
        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            .input('id_Nino', sql.Int, id_Nino)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('FechaCita', sql.Date, FechaCita)
            .input('HoraCita', sql.Time, HoraCita); // Assuming HoraCita is TIME type in SP
        const result = await request.execute('usp_ScheduleAppointment');
        res.status(201).json({ message: 'Appointment scheduled successfully.', data: result.recordset });
    } catch (err) {
        console.error('SQL error on POST /api/appointments:', err);
        res.status(500).send({ message: 'Failed to schedule appointment.', error: err.message });
    }
});

app.put('/api/appointments/:appointmentId/status', [verifyToken, checkRole(['Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    console.log(`Accessed PUT /api/appointments/:appointmentId/status with params: ${JSON.stringify(req.params)} and body: ${JSON.stringify(req.body)}`);
    try {
        const { appointmentId } = req.params;
        const { id_EstadoCita } = req.body;
        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            .input('id_Cita', sql.Int, appointmentId)
            .input('id_EstadoCita', sql.Int, id_EstadoCita);
        await request.execute('usp_UpdateAppointmentStatus');
        res.json({ message: 'Appointment status updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:appointmentId/status:', err);
        res.status(500).send({ message: 'Failed to update appointment status.', error: err.message });
    }
});

// --- Vaccination Endpoints ---
app.post('/api/vaccinations', [verifyToken, checkRole(['Medico', 'Enfermera'])], async (req, res) => {
    console.log(`Accessed POST /api/vaccinations with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Cita, id_LoteVacuna, FechaAplicacion, EdadAlVacunar, id_PersonalSalud, Observaciones } = req.body;
        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            .input('id_Cita', sql.Int, id_Cita)
            .input('id_LoteVacuna', sql.Int, id_LoteVacuna)
            .input('FechaAplicacion', sql.Date, FechaAplicacion)
            .input('EdadAlVacunar', sql.NVarChar(50), EdadAlVacunar) // Or INT if it's just age in months/years
            .input('id_PersonalSalud', sql.Int, id_PersonalSalud)
            .input('Observaciones', sql.NVarChar(sql.MAX), Observaciones);
        await request.execute('usp_RecordVaccination');
        res.status(201).json({ message: 'Vaccination recorded successfully.' });
    } catch (err) {
        console.error('SQL error on POST /api/vaccinations:', err);
        res.status(500).send({ message: 'Failed to record vaccination.', error: err.message });
    }
});

// --- Auth Endpoints ---
app.post('/api/auth/login', async (req, res) => {
    console.log(`Accessed POST /api/auth/login with body: ${JSON.stringify(req.body)}`);
    try {
        const { LoginIdentifier, Password } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('LoginIdentifier', sql.NVarChar(100), LoginIdentifier)
            .execute('usp_GetUserForAuth');

        if (result.recordset.length === 0) {
            return res.status(401).send({ message: 'Authentication failed. User not found or not active.' });
        }

        const user = result.recordset[0];

        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(Password, user.Clave);

        if (!passwordMatch) {
            return res.status(401).send({ message: 'Authentication failed. Invalid credentials.' });
        }

        // Passwords match, create JWT
        const token = jwt.sign(
            { id: user.id_Usuario, role: user.NombreRol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Omit password from the user object before sending response
        const { Clave, ...userWithoutPassword } = user;

        res.json({ 
            message: 'Authentication successful.', 
            token: token,
            user: userWithoutPassword 
        });

    } catch (err) {
        console.error('SQL error on POST /api/auth/login:', err);
        res.status(500).send({ message: 'Failed to authenticate user.', error: err.message });
    }
});

// --- General GET Endpoints ---

app.get('/api/tutors', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    console.log('Accessed GET /api/tutors endpoint');
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetAllTutors');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/tutors:', err);
        res.status(500).send({ message: 'Failed to retrieve tutors.', error: err.message });
    }
});

app.get('/api/vaccines', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador', 'Tutor'])], async (req, res) => {
    console.log('Accessed GET /api/vaccines endpoint');
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetAllVaccines');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccines:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccines.', error: err.message });
    }
});

// POST /api/vaccines - Create a new vaccine
app.post('/api/vaccines', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id_Fabricante, Nombre, DosisLimite, Tipo, Descripcion } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Fabricante', sql.Int, id_Fabricante)
            .input('Nombre', sql.NVarChar(100), Nombre)
            .input('DosisLimite', sql.Int, DosisLimite)
            .input('Tipo', sql.NVarChar(50), Tipo)
            .input('Descripcion', sql.NVarChar, Descripcion)
            .execute('usp_CreateVaccine');
        res.status(201).json({ message: 'Vaccine created successfully.', vaccineId: result.recordset[0].id_Vacuna });
    } catch (err) {
        console.error('SQL error on POST /api/vaccines:', err);
        res.status(500).send({ message: 'Failed to create vaccine.', error: err.message });
    }
});

// GET /api/vaccines/:id - Get a single vaccine by ID
app.get('/api/vaccines/:id', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador', 'Tutor'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Vacuna', sql.Int, id)
            .execute('usp_GetVaccineById');
        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'Vaccine not found.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/vaccines/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccine.', error: err.message });
    }
});

// PUT /api/vaccines/:id - Update a vaccine
app.put('/api/vaccines/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Fabricante, Nombre, DosisLimite, Tipo, Descripcion } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Vacuna', sql.Int, id)
            .input('id_Fabricante', sql.Int, id_Fabricante)
            .input('Nombre', sql.NVarChar(100), Nombre)
            .input('DosisLimite', sql.Int, DosisLimite)
            .input('Tipo', sql.NVarChar(50), Tipo)
            .input('Descripcion', sql.NVarChar, Descripcion)
            .execute('usp_UpdateVaccine');
        res.status(200).send({ message: 'Vaccine updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/vaccines/:id:', err);
        res.status(500).send({ message: 'Failed to update vaccine.', error: err.message });
    }
});

// DELETE /api/vaccines/:id - Delete a vaccine
app.delete('/api/vaccines/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_Vacuna', sql.Int, id)
            .execute('usp_DeleteVaccine');
        res.status(200).send({ message: 'Vaccine deleted successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/vaccines/:id:', err);
        res.status(500).send({ message: 'Failed to delete vaccine.', error: err.message });
    }
});

app.get('/api/vaccination-centers', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador', 'Tutor'])], async (req, res) => {
    console.log('Accessed GET /api/vaccination-centers endpoint');
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetAllVaccinationCenters');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccination-centers:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccination centers.', error: err.message });
    }
});

// POST /api/vaccination-centers - Create a new vaccination center
app.post('/api/vaccination-centers', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { NombreCentro, NombreCorto, Direccion, Telefono, Director, Web } = req.body;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('NombreCentro', sql.NVarChar(100), NombreCentro)
            .input('NombreCorto', sql.NVarChar(50), NombreCorto)
            .input('Direccion', sql.NVarChar(200), Direccion)
            .input('Telefono', sql.NVarChar(20), Telefono)
            .input('Director', sql.NVarChar(100), Director)
            .input('Web', sql.NVarChar(100), Web)
            .execute('usp_CreateVaccinationCenter');
        res.status(201).json({ message: 'Vaccination center created successfully.', centerId: result.recordset[0].id_CentroVacunacion });
    } catch (err) {
        console.error('SQL error on POST /api/vaccination-centers:', err);
        res.status(500).send({ message: 'Failed to create vaccination center.', error: err.message });
    }
});

// GET /api/vaccination-centers/:id - Get a single vaccination center by ID
app.get('/api/vaccination-centers/:id', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador', 'Tutor'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_CentroVacunacion', sql.Int, id)
            .execute('usp_GetVaccinationCenterById');
        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'Vaccination center not found.' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/vaccination-centers/:id:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccination center.', error: err.message });
    }
});

// PUT /api/vaccination-centers/:id - Update a vaccination center
app.put('/api/vaccination-centers/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { NombreCentro, NombreCorto, Direccion, Telefono, Director, Web } = req.body;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_CentroVacunacion', sql.Int, id)
            .input('NombreCentro', sql.NVarChar(100), NombreCentro)
            .input('NombreCorto', sql.NVarChar(50), NombreCorto)
            .input('Direccion', sql.NVarChar(200), Direccion)
            .input('Telefono', sql.NVarChar(20), Telefono)
            .input('Director', sql.NVarChar(100), Director)
            .input('Web', sql.NVarChar(100), Web)
            .execute('usp_UpdateVaccinationCenter');
        res.status(200).send({ message: 'Vaccination center updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/vaccination-centers/:id:', err);
        res.status(500).send({ message: 'Failed to update vaccination center.', error: err.message });
    }
});

// DELETE /api/vaccination-centers/:id - Delete a vaccination center
app.delete('/api/vaccination-centers/:id', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_CentroVacunacion', sql.Int, id)
            .execute('usp_DeleteVaccinationCenter');
        res.status(200).send({ message: 'Vaccination center deleted successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/vaccination-centers/:id:', err);
        res.status(500).send({ message: 'Failed to delete vaccination center.', error: err.message });
    }
});


// --- SERVER STARTUP ---

// Function to connect to the database and start the server
async function startServer() {
    console.log('[SERVER START] Attempting to start server and connect to database...');
    try {
        console.log('[DB CONFIG] Database configuration being used:', {
            server: dbConfig.server,
            database: dbConfig.database,
            user: dbConfig.user,
            options: dbConfig.options,
            port: dbConfig.port
        });
        console.log('[DB CONNECT] Attempting to connect to SQL Server...');
        await sql.connect(dbConfig); // Establishes the connection pool
        console.log('[DB SUCCESS] Connected to SQL Server successfully!');

        const server = app.listen(port, () => {
            console.log(`[SERVER READY] Vaccination API server listening at http://localhost:${port}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('[SERVER ERROR] An error occurred:', error);
            process.exit(1);
        });

    } catch (err) {
        console.error('[FATAL ERROR] Failed to connect to SQL Server or start server:', err);
        process.exit(1); // Exit the process if DB connection fails
    }
}

// Start the server
startServer();


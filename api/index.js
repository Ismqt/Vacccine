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

// --- Authentication Endpoints ---

app.post('/api/auth/login', async (req, res) => {
    const { LoginIdentifier: email } = req.body;
    const password = req.body.Password || req.body.password;

    if (!email || !password) {
        return res.status(400).send({ message: 'Login identifier and password are required.' });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('LoginIdentifier', sql.NVarChar, email)
            .execute('usp_GetUserForAuth');

        if (result.recordset.length === 0) {
            return res.status(401).send({ message: 'Invalid credentials or user is inactive.' });
        }

        const user = result.recordset[0];

        const passwordMatch = await bcrypt.compare(password, user.Clave);
        if (!passwordMatch) {
            return res.status(401).send({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id_Usuario, email: user.Email, role: user.NombreRol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token, user: { id: user.id_Usuario, email: user.Email, role: user.NombreRol } });

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

// GET /api/roles - Get all roles
app.get('/api/roles', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT id_Rol, Rol FROM Rol');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/roles:', err);
        res.status(500).send({ message: 'Failed to retrieve roles.', error: err.message });
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

// --- Vaccination Center Endpoints ---

// GET /api/vaccination-centers - Get all vaccination centers
app.get('/api/vaccination-centers', verifyToken, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute('usp_GetAllVaccinationCenters');

    console.log('Raw data from DB:', JSON.stringify(result.recordset, null, 2));
    
    // Map database columns to frontend-friendly keys to avoid breaking the client
    const centers = result.recordset.map(center => ({
      id_CentroVacunacion: center.id_CentroVacunacion,
      Nombre: center.NombreCentro, // Aliasing from DB name to frontend name
      Direccion: center.Direccion,
      Provincia: center.Provincia,
      Municipio: center.Municipio,
      Telefono: center.Telefono,
      Director: center.Director,
      Web: center.Web,
      Capacidad: center.Capacidad,
      Estado: center.NombreEstado // Corrected to match the final stored procedure
    }));

    res.json(centers);
  } catch (err) {
    console.error('SQL error on GET /api/vaccination-centers:', err);
    res.status(500).send({ message: 'Failed to retrieve vaccination centers.', error: err.message });
  }
});

// --- Appointment Endpoints ---

// GET /api/appointments - Get appointments based on user role
app.get('/api/appointments', verifyToken, async (req, res) => {
    console.log('[DEBUG] /api/appointments user:', req.user);
    try {
        const { id: userId, role } = req.user;
        const pool = await sql.connect(dbConfig);
                const request = pool.request();

        if (role.toLowerCase() === 'tutor') {
            request.input('id_Usuario', sql.Int, userId);
        } else if (!['administrador', 'medico'].includes(role.toLowerCase())) {
            return res.status(403).send({ message: 'Your role is not authorized to view appointments.' });
        }
        // For admins and medicos, id_Usuario will be null, and the SP will return all appointments.

        const result = await request.execute('usp_GetAllAppointments');
        res.json(result.recordset);

    } catch (err) {
        console.error('SQL error on GET /api/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// --- Vaccination Center Endpoints ---

// GET /api/vaccination-centers - Get all vaccination centers
app.get('/api/vaccination-centers', verifyToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetAllVaccinationCenters');

        console.log('Raw data from DB:', JSON.stringify(result.recordset, null, 2));
        
        // Map database columns to frontend-friendly keys to avoid breaking the client
        const centers = result.recordset.map(center => ({
            id_CentroVacunacion: center.id_CentroVacunacion,
            Nombre: center.NombreCentro, // Aliasing from DB name to frontend name
            Direccion: center.Direccion,
            Provincia: center.Provincia,
            Municipio: center.Municipio,
            Telefono: center.Telefono,
            Director: center.Director,
            Web: center.Web,
            Capacidad: center.Capacidad,
            Estado: center.NombreEstado // Corrected to match the final stored procedure
        }));

        res.json(centers);
    } catch (err) {
        console.error('SQL error on GET /api/vaccination-centers:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccination centers.', error: err.message });
    }
});

// --- Vaccine Endpoints ---

// GET /api/vaccines - Get all vaccines
app.get('/api/vaccines', verifyToken, async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetVaccines');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccines:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccines.', error: err.message });
    }
});

// --- Tutor Endpoints ---
// POST /api/tutors - Register a new Tutor and associated User with a hashed password
app.post('/api/tutors', async (req, res) => {
    console.log(`Accessed POST /api/tutors with body: ${JSON.stringify(req.body)}`);

    const { Nombres, Apellidos, TipoIdentificacion, NumeroIdentificacion, Telefono, Direccion, Email, Username } = req.body;
    const password = req.body.Password || req.body.password;

    if (!Nombres || !Apellidos || !NumeroIdentificacion || !Email || !password || !Username) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Cedula_Tutor', sql.NVarChar(15), NumeroIdentificacion)
            .input('Nombres_Tutor', sql.NVarChar(100), Nombres)
            .input('Apellidos_Tutor', sql.NVarChar(100), Apellidos)
            .input('Telefono_Tutor', sql.NVarChar(20), Telefono)
            .input('Email_Tutor', sql.NVarChar(100), Email) // Using main email for both tutor contact and user login
            .input('Direccion_Tutor', sql.NVarChar(200), Direccion)
            .input('Email_Usuario', sql.NVarChar(100), Email)
            .input('Clave_Usuario', sql.NVarChar(255), hashedPassword)
            .output('OutputMessage', sql.NVarChar(255))
            .output('New_id_Usuario', sql.Int)
            .output('New_id_Tutor', sql.Int)
            .execute('usp_RegisterTutor');

        res.status(201).json({
            message: result.output.OutputMessage || 'Tutor registered successfully.',
            userId: result.output.New_id_Usuario,
            tutorId: result.output.New_id_Tutor
        });

    } catch (err) {
        console.error('SQL error on POST /api/tutors:', err);
        const errorMessage = err.originalError?.info?.message || err.message;
        res.status(500).send({ message: 'Failed to register tutor.', error: errorMessage });
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

// GET /api/tutors/:userId/children - Get all children for a specific tutor
app.get('/api/tutors/:userId/children', [verifyToken, checkRole(['Tutor', 'Administrador', 'Medico'])], async (req, res) => {
    console.log(`Accessed GET /api/tutors/:userId/children with params: ${JSON.stringify(req.params)}`);
    try {
        const { userId } = req.params;

        // Security check: A tutor can only view their own children.
        if (req.user.role === 'Tutor' && req.user.id.toString() !== userId) {
            return res.status(403).send({ message: 'Forbidden: You can only view your own children.' });
        }

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Tutor', sql.Int, userId)
            .execute('usp_GetNinosByTutor');
        
        // Map the results to match the frontend's expected structure
        const children = result.recordset.map(child => ({
            id_Nino: child.id_Nino,
            Nombres: child.NinoNombres,
            Apellidos: child.NinoApellidos
        }));

        res.json(children);
    } catch (err) {
        console.error(`SQL error on GET /api/tutors/${req.params.userId}/children:`, err);
        res.status(500).send({ message: 'Failed to retrieve children for tutor.', error: err.message });
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
        
        if (result.recordset.length === 0) {
            return res.status(404).send({ message: 'Nino not found.' });
        }
        res.json(result.recordset[0]);

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

// --- Appointment Endpoints ---
app.post('/api/appointments', [verifyToken], async (req, res) => {
    console.log(`Accessed POST /api/appointments with body: ${JSON.stringify(req.body)}`);
    try {
        const { id_Nino, id_Vacuna, id_CentroVacunacion, FechaCita, HoraCita } = req.body;
        const id_UsuarioRegistraCita = req.user.id;

        if (!id_Vacuna || !id_CentroVacunacion || !FechaCita || !HoraCita) {
            return res.status(400).send({ message: 'Missing required appointment fields.' });
        }

        // Create a Date object for the time component, as the tedious driver expects an object.
        // Using a neutral date '1970-01-01' to ensure only the time is relevant.
        const timeAsDateObject = new Date(`1970-01-01T${HoraCita}:00`);

        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            // Handle optional id_Nino, passing null if not provided or explicitly null.
            .input('id_Nino', sql.Int, (id_Nino === undefined || id_Nino === null) ? null : id_Nino)
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('Fecha', sql.Date, FechaCita) // Pass date string directly
            .input('Hora', sql.Time, timeAsDateObject) // Pass Date object for time
            .input('id_UsuarioRegistraCita', sql.Int, id_UsuarioRegistraCita)
            // Set RequiereTutor based on whether id_Nino is present
            .input('RequiereTutor', sql.Bit, (id_Nino === undefined || id_Nino === null) ? 0 : 1)
            .output('OutputMessage', sql.NVarChar(255))
            .output('New_id_Cita', sql.Int);

        const result = await request.execute('usp_ScheduleAppointment');

        if (result.output.New_id_Cita) {
            res.status(201).json({
                message: result.output.OutputMessage,
                appointmentId: result.output.New_id_Cita
            });
        } else {
            // If the SP returns an error message in the output parameter without raising an error
            res.status(400).json({ message: result.output.OutputMessage });
        }

    } catch (err) {
        console.error('SQL error on POST /api/appointments:', err);
        const errorMessage = err.originalError?.info?.message || err.message;
        res.status(500).send({ message: 'Failed to schedule appointment.', error: errorMessage });
    }
});

// GET /api/appointments - Get all appointments
app.get('/api/appointments', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador', 'Tutor'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().execute('usp_GetAllAppointments');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
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

// --- Location Endpoints ---

// GET /api/locations/provinces - Get all provinces
app.get('/api/locations/provinces', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT id_Provincia, Nombre FROM Provincia ORDER BY Nombre');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/locations/provinces:', err);
        res.status(500).send({ message: 'Failed to retrieve provinces.', error: err.message });
    }
});

// GET /api/locations/municipalities/:provinceId - Get municipalities by province
app.get('/api/locations/municipalities/:provinceId', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera', 'Digitador'])], async (req, res) => {
    try {
        const { provinceId } = req.params;
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id_Provincia', sql.Int, provinceId)
            .execute('usp_GetMunicipiosByProvincia');
        res.json(result.recordset);
    } catch (err) {
        console.error(`SQL error on GET /api/locations/municipalities/${req.params.provinceId}:`, err);
        res.status(500).send({ message: 'Failed to retrieve municipalities.', error: err.message });
    }
});

// --- Vaccination Center Management Endpoints ---

// GET /api/centers/statuses - Get all center statuses
app.get('/api/centers/statuses', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT id_Estado, NombreEstado FROM EstadosCentro');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/centers/statuses:', err);
        res.status(500).send({ message: 'Failed to retrieve center statuses.', error: err.message });
    }
});

// POST /api/vaccination-centers - Create a new vaccination center
app.post('/api/vaccination-centers', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { NombreCentro, Direccion, id_Provincia, id_Municipio, Telefono, Director, Web, Capacidad, id_Estado } = req.body;
        
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('NombreCentro', sql.NVarChar(100), NombreCentro)
            .input('Direccion', sql.NVarChar(200), Direccion)
            .input('id_Provincia', sql.Int, id_Provincia)
            .input('id_Municipio', sql.Int, id_Municipio)
            .input('Telefono', sql.NVarChar(20), Telefono)
            .input('Director', sql.NVarChar(100), Director)
            .input('Web', sql.NVarChar(100), Web)
            .input('Capacidad', sql.Int, Capacidad)
            .input('id_Estado', sql.Int, id_Estado)
            .execute('usp_CreateVaccinationCenter');
        
        res.status(201).send({ message: 'Vaccination center created successfully.' });
    } catch (err) {
        console.error('SQL error on POST /api/vaccination-centers:', err);
        res.status(500).send({ message: 'Failed to create vaccination center.', error: err.message });
    }
});

// PUT /api/vaccination-centers/:id - Update a vaccination center
app.put('/api/vaccination-centers/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { NombreCentro, Direccion, id_Provincia, id_Municipio, Telefono, Director, Web, Capacidad, id_Estado } = req.body;

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_CentroVacunacion', sql.Int, id)
            .input('NombreCentro', sql.NVarChar(100), NombreCentro)
            .input('Direccion', sql.NVarChar(200), Direccion)
            .input('id_Provincia', sql.Int, id_Provincia)
            .input('id_Municipio', sql.Int, id_Municipio)
            .input('Telefono', sql.NVarChar(20), Telefono)
            .input('Director', sql.NVarChar(100), Director)
            .input('Web', sql.NVarChar(100), Web)
            .input('Capacidad', sql.Int, Capacidad)
            .input('id_Estado', sql.Int, id_Estado)
            .query(`
                UPDATE CentroVacunacion
                SET NombreCentro = @NombreCentro,
                    Direccion = @Direccion,
                    id_Provincia = @id_Provincia,
                    id_Municipio = @id_Municipio,
                    Telefono = @Telefono,
                    Director = @Director,
                    Web = @Web,
                    Capacidad = @Capacidad,
                    id_Estado = @id_Estado
                WHERE id_CentroVacunacion = @id_CentroVacunacion
            `);

        res.status(200).send({ message: 'Vaccination center updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/vaccination-centers/:id:', err);
        res.status(500).send({ message: 'Failed to update vaccination center.', error: err.message });
    }
});

// DELETE /api/vaccination-centers/:id - Soft delete a vaccination center (set status to Inactivo)
app.delete('/api/vaccination-centers/:id', [verifyToken, checkRole(['Administrador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);

        const statusResult = await pool.request()
            .input('NombreEstado', sql.NVarChar, 'Inactivo')
            .query('SELECT id_Estado FROM EstadosCentro WHERE NombreEstado = @NombreEstado');
        
        if (statusResult.recordset.length === 0) {
            return res.status(500).send({ message: 'Could not find "Inactivo" status in database.' });
        }
        const inactivoStatusId = statusResult.recordset[0].id_Estado;

        await pool.request()
            .input('id_CentroVacunacion', sql.Int, id)
            .input('id_Estado', sql.Int, inactivoStatusId)
            .query('UPDATE CentroVacunacion SET id_Estado = @id_Estado WHERE id_CentroVacunacion = @id_CentroVacunacion');

        res.status(200).send({ message: 'Vaccination center deactivated successfully.' });
    } catch (err) {
        console.error('SQL error on DELETE /api/vaccination-centers/:id:', err);
        res.status(500).send({ message: 'Failed to deactivate vaccination center.', error: err.message });
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
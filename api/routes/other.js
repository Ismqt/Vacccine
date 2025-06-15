const express = require('express');
const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Vaccine Endpoints ---

// GET /api/vaccines - Get all vaccines
router.get('/vaccines', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_GetVaccines');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccines:', err);
        res.status(500).send({ message: 'Failed to retrieve vaccines.', error: err.message });
    }
});

// --- Tutor Endpoints ---
// POST /api/tutors - Register a new Tutor and associated User with a hashed password
router.post('/tutors', async (req, res) => {
    console.log(`Accessed POST /api/tutors with body: ${JSON.stringify(req.body)}`);

    const { Nombres, Apellidos, TipoIdentificacion, NumeroIdentificacion, Telefono, Direccion, Email, Username } = req.body;
    const password = req.body.Password || req.body.password;

    if (!Nombres || !Apellidos || !NumeroIdentificacion || !Email || !password || !Username) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const pool = await poolPromise;
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

router.get('/tutors/:tutorId/ninos', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    console.log(`Accessed GET /api/tutors/:tutorId/ninos with params: ${JSON.stringify(req.params)}`);
    try {
        const { tutorId } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Tutor', sql.Int, tutorId)
            .execute('usp_GetNinosByTutorId');

        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/tutors/:tutorId/ninos:', err);
        res.status(500).send({ message: 'Failed to retrieve children.', error: err.message });
    }
});

module.exports = router;

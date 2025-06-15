const express = require('express');
const { sql, poolPromise } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/availability - Add a new availability slot
router.post('/', [verifyToken, checkRole(['Administrador', 'Personal del Centro de Vacunación'])], async (req, res) => {
    try {
        const { id_CentroVacunacion, Fecha, HoraInicio, HoraFin, CuposTotales } = req.body;

        if (!id_CentroVacunacion || !Fecha || !HoraInicio || !HoraFin || !CuposTotales) {
            return res.status(400).send({ message: 'All fields are required.' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('Fecha', sql.Date, Fecha)
            .input('HoraInicio', sql.Time, HoraInicio)
            .input('HoraFin', sql.Time, HoraFin)
            .input('CuposTotales', sql.Int, CuposTotales)
            .execute('usp_AddAvailability');

        res.status(201).send({ message: 'Availability slot created successfully.' });
    } catch (err) {
        console.error('SQL error on POST /api/availability:', err);
        res.status(500).send({ message: 'Failed to create availability slot.', error: err.message });
    }
});

module.exports = router;

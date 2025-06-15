const express = require('express');
const { sql, poolPromise } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/appointments - Get appointments based on user role
router.get('/', verifyToken, async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id_Usuario', sql.Int, userId)
            .input('RolName', sql.NVarChar(50), role)
            .execute('usp_GetAllAppointments');

        res.json(result.recordset);

    } catch (err) {
        console.error('SQL error on GET /api/appointments:', err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// PUT /:id - Update an existing appointment
router.put('/:id', [verifyToken, checkRole(['Administrador', 'Digitador'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Vacuna, id_CentroVacunacion, Fecha, Hora, id_EstadoCita } = req.body;
        const pool = await poolPromise;

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

// POST /api/appointments/:id/record - Record a vaccination
router.post('/:id/record', [verifyToken, checkRole(['Administrador', 'Personal del Centro de Vacunación'])], async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            id_PersonalSalud_Usuario, 
            id_LoteAplicado, 
            NombreCompletoPersonalAplicado, 
            DosisAplicada, 
            EdadAlMomento, 
            NotasAdicionales, 
            Alergias 
        } = req.body;

        const pool = await poolPromise;
        const request = pool.request()
            .input('id_Cita', sql.Int, id)
            .input('id_PersonalSalud_Usuario', sql.Int, id_PersonalSalud_Usuario)
            .input('id_LoteAplicado', sql.Int, id_LoteAplicado)
            .input('NombreCompletoPersonalAplicado', sql.NVarChar(100), NombreCompletoPersonalAplicado)
            .input('DosisAplicada', sql.NVarChar(50), DosisAplicada)
            .input('EdadAlMomento', sql.NVarChar(20), EdadAlMomento)
            .input('NotasAdicionales', sql.NVarChar(sql.MAX), NotasAdicionales)
            .input('Alergias', sql.NVarChar(sql.MAX), Alergias)
            .output('OutputMessage', sql.NVarChar(255));

        await request.execute('usp_RecordVaccination');

        const outputMessage = request.parameters.OutputMessage.value;
        res.status(200).send({ message: outputMessage });

    } catch (err) {
        console.error('SQL error on POST /api/appointments/:id/record:', err);
        res.status(500).send({ message: 'Failed to record vaccination.', error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const poolPromise = require('../config/db');
const sql = require('mssql');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// Role IDs: Assuming Doctor is 3 (adjust if necessary)
const DOCTOR_ROLE = 2;

// GET doctor's appointments
router.get('/appointments', [verifyToken, checkRole([DOCTOR_ROLE])], async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Doctor', sql.Int, req.user.id_Doctor) // Assuming id_Doctor is in the token
            .execute('usp_GetDoctorAppointments');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// GET available appointment statuses
router.get('/statuses', [verifyToken, checkRole([DOCTOR_ROLE])], async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_GetAppointmentStatuses');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// GET active vaccine lots for the doctor's center
router.get('/lots', [verifyToken, checkRole([DOCTOR_ROLE])], async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_CentroVacunacion', sql.Int, req.user.id_CentroVacunacion) // Assuming id_CentroVacunacion is in the token
            .execute('usp_GetActiveVaccineLots');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// POST to update appointment status or record vaccination
router.put('/appointments/:id/update', [verifyToken, checkRole([DOCTOR_ROLE])], async (req, res) => {
    const id_Cita = req.params.id;
    const { id_EstadoCita, id_Lote } = req.body;
    const id_Doctor = req.user.id; // This is the user ID of the doctor

    if (!id_EstadoCita) {
        return res.status(400).send({ message: 'New status ID is required.' });
    }

    // Business Logic: if status is 'Realizada' (assuming ID 4), use usp_RecordVaccination
    // Otherwise, use usp_UpdateAppointmentStatus
    const REALIZADA_STATUS_ID = 4; // IMPORTANT: Adjust this ID to your actual 'Realizada' or 'Asistida' status ID

    try {
        const pool = await poolPromise;
        let result;

        if (parseInt(id_EstadoCita, 10) === REALIZADA_STATUS_ID) {
            if (!id_Lote) {
                return res.status(400).send({ message: 'Lote ID is required to record a vaccination.' });
            }
            // Call usp_RecordVaccination
            result = await pool.request()
                .input('id_Cita', sql.Int, id_Cita)
                .input('id_Lote', sql.Int, id_Lote)
                .input('id_PersonalSalud', sql.Int, id_Doctor)
                .output('OutputMessage', sql.NVarChar(255))
                .execute('usp_RecordVaccination');
        } else {
            // Call usp_UpdateAppointmentStatus for other status changes
            result = await pool.request()
                .input('id_Cita', sql.Int, id_Cita)
                .input('id_NuevoEstadoCita', sql.Int, id_EstadoCita)
                .input('id_UsuarioModifica', sql.Int, id_Doctor)
                .output('OutputMessage', sql.NVarChar(255))
                .execute('usp_UpdateAppointmentStatus');
        }

        res.status(200).send({ message: result.output.OutputMessage });

    } catch (err) {
        res.status(500).send({ message: err.message, details: err.originalError ? err.originalError.info.message : null });
    }
});

module.exports = router;

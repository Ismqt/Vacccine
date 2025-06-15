const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// GET /active - Get all active vaccine lots
router.get('/active', [verifyToken, checkRole(['Administrador', 'Medico', 'Enfermera'])], async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_GetActiveVaccineLots');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error on GET /api/vaccine-lots/active:', err);
        res.status(500).send({ message: 'Failed to retrieve active vaccine lots.', error: err.message });
    }
});

// POST / - Add a new vaccine lot
router.post('/', [verifyToken, checkRole(['Administrador', 'Medico'])], async (req, res) => {
    try {
        const { id_Vacuna, NumeroLote, FechaFabricacion, FechaVencimiento, CantidadInicial, id_CentroVacunacion } = req.body;
        const pool = await poolPromise;
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

module.exports = router;

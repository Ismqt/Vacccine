const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { LoginIdentifier: email } = req.body;
    const password = req.body.Password || req.body.password;

    if (!email || !password) {
        return res.status(400).send({ message: 'Login identifier and password are required.' });
    }

    try {
        const pool = await poolPromise;
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

module.exports = router;

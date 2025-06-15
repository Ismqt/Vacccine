const sql = require('mssql');
require('dotenv').config(); // Ensure environment variables are loaded

const dbConfig = {
    server: process.env.DB_AZURE_SERVER_NAME,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: true, // Required for Azure SQL
        trustServerCertificate: true, // Switched to true for local development to bypass certificate validation issues.
        connectionTimeout: 30000 // 30-second timeout
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    port: 1433
};

// --- Configuration Validation ---
if (!dbConfig.server || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
    console.error('--- [DB FATAL] Database configuration is missing from environment variables. ---');
    console.error('Please ensure DB_AZURE_SERVER_NAME, DB_DATABASE, DB_USER, and DB_PASSWORD are set in your .env file.');
    process.exit(1); // Exit immediately if critical configuration is missing
}

// --- Connection Pool ---
const pool = new sql.ConnectionPool(dbConfig);

// Attach an error handler to the pool to catch and log any connection errors
pool.on('error', err => {
    console.error('[DB POOL ERROR] An error occurred in the database connection pool:', err);
});

const poolPromise = pool.connect();

// --- Direct Promise-Level Debugging ---
// This is a diagnostic step to see if any handler will fire.
poolPromise.then(p => {
    console.log('[DIAGNOSTIC LOG] db.js: pool.connect() promise resolved successfully.');
    return p;
}).catch(err => {
    console.error('[DIAGNOSTIC LOG] db.js: pool.connect() promise was rejected.');
    console.error('[DIAGNOSTIC LOG] The error is:', err);
});

module.exports = {
    sql,
    poolPromise
};

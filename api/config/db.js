const sql = require('mssql');

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

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('[DB SUCCESS] Connected to SQL Server successfully!');
        return pool;
    })
    .catch(err => console.error('[DB FAILED] Database Connection Failed! Bad Config: ', err));

module.exports = {
    sql,
    poolPromise
};

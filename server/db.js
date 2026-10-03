const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const poolConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
};

// Enable SSL encryption if connecting to cloud MySQL providers (e.g. TiDB Cloud, Aiven, Railway)
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

// Create connection pool
const pool = mysql.createPool(poolConfig);

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`Database connection pool established successfully to ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

module.exports = pool;

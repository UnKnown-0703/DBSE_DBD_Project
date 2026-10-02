const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection pool established successfully.');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

module.exports = pool;

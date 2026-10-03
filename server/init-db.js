const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDb() {
    console.log('====================================================');
    console.log('   College ERP Database Initializer (Schema & Seed)  ');
    console.log('====================================================');
    
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        let sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing database schema creation...');
        // Execute schema SQL (multipleStatements is enabled on pool)
        await db.query(sql);
        console.log('Schema tables created successfully.');

        // Now run seed script
        console.log('Seeding initial data (users, courses, departments)...');
        require('./seed.js');
    } catch (err) {
        // If error is about CREATE DATABASE privilege on managed cloud databases, run table statements only
        if (err.message && (err.message.includes('Access denied') || err.message.includes('CREATE DATABASE'))) {
            console.log('Note: Managed cloud MySQL detected. Creating tables within target database...');
            try {
                const schemaPath = path.join(__dirname, 'schema.sql');
                let sql = fs.readFileSync(schemaPath, 'utf8');
                // Remove CREATE DATABASE and USE statements
                sql = sql.replace(/CREATE DATABASE[\s\S]*?USE\s+\w+;/i, '');
                await db.query(sql);
                console.log('Schema tables created successfully.');
                require('./seed.js');
                return;
            } catch (innerErr) {
                console.error('Error creating tables:', innerErr.message);
                process.exit(1);
            }
        }
        console.error('Initialization error:', err.message);
        process.exit(1);
    }
}

initDb();

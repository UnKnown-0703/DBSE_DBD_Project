const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Registration Route
router.post('/register', async (req, res) => {
    const { 
        name, 
        email, 
        password, 
        role, 
        phone, 
        date_of_birth,
        department_id,
        // Student specific
        roll_number,
        enrollment_year,
        semester,
        // Faculty specific
        employee_id,
        designation,
        qualification
    } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Check if user email already exists
        const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'A user with this email address already exists.' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const [userResult] = await connection.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, role, phone || null, date_of_birth || null]
        );
        const newUserId = userResult.insertId;

        if (role === 'student') {
            if (!roll_number || !department_id) {
                throw new Error('Roll number and department are required for student registration.');
            }
            // Check roll number unique
            const [existingRoll] = await connection.query('SELECT user_id FROM students WHERE roll_number = ?', [roll_number]);
            if (existingRoll.length > 0) {
                throw new Error('A student with this roll number already exists.');
            }

            // Insert student
            await connection.query(
                'INSERT INTO students (user_id, roll_number, department_id, enrollment_year, semester) VALUES (?, ?, ?, ?, ?)',
                [newUserId, roll_number, department_id, enrollment_year || new Date().getFullYear(), semester || 1]
            );

            // 1. Initialize No Dues
            await connection.query('INSERT INTO no_dues (student_id) VALUES (?)', [newUserId]);

            // 2. Initialize default unpaid fee invoice
            await connection.query(
                'INSERT INTO fees (student_id, fee_type, amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
                [newUserId, 'Tuition Fee - Semester ' + (semester || 1), 3200.00, '2026-08-01', 'unpaid']
            );

            // 3. Initialize default hostel allocation (Block A, Room 101)
            // Fetch first available hostel
            const [hostels] = await connection.query('SELECT id FROM hostels WHERE occupied < capacity LIMIT 1');
            if (hostels.length > 0) {
                await connection.query(
                    'INSERT INTO hostel_bookings (student_id, hostel_id, booking_date, status) VALUES (?, ?, CURRENT_DATE, "approved")',
                    [newUserId, hostels[0].id]
                );
                // Update hostel occupied count
                await connection.query('UPDATE hostels SET occupied = occupied + 1 WHERE id = ?', [hostels[0].id]);
            }
        } else if (role === 'faculty') {
            if (!employee_id || !department_id) {
                throw new Error('Employee ID and department are required for faculty registration.');
            }
            // Check employee ID unique
            const [existingEmp] = await connection.query('SELECT user_id FROM faculty WHERE employee_id = ?', [employee_id]);
            if (existingEmp.length > 0) {
                throw new Error('A faculty member with this employee ID already exists.');
            }

            // Insert faculty
            await connection.query(
                'INSERT INTO faculty (user_id, employee_id, department_id, designation, qualification) VALUES (?, ?, ?, ?, ?)',
                [newUserId, employee_id, department_id, designation || 'Assistant Professor', qualification || 'M.Tech']
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Registration successful! You can now log in.' });
    } catch (err) {
        await connection.rollback();
        console.error('Registration error:', err.message);
        res.status(400).json({ error: err.message || 'Error executing registration.' });
    } finally {
        connection.release();
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, email, password } = req.body;
    const identifier = username || email;

    if (!identifier || !password) {
        return res.status(400).json({ error: 'Please provide username/email and password.' });
    }

    try {
        // Find user by email, student roll number, or faculty employee id
        const [users] = await db.query(
            `SELECT u.* FROM users u
             LEFT JOIN students s ON u.id = s.user_id
             LEFT JOIN faculty f ON u.id = f.user_id
             WHERE u.email = ? OR s.roll_number = ? OR f.employee_id = ?`,
            [identifier, identifier, identifier]
        );
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username/email or password.' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Fetch additional profile data based on role
        let profileDetails = {};
        if (user.role === 'student') {
            const [students] = await db.query(
                `SELECT s.*, d.name as department_name, d.code as department_code 
                 FROM students s 
                 JOIN departments d ON s.department_id = d.id 
                 WHERE s.user_id = ?`,
                [user.id]
            );
            if (students.length > 0) {
                profileDetails = students[0];
            }
        } else if (user.role === 'faculty') {
            const [faculty] = await db.query(
                `SELECT f.*, d.name as department_name, d.code as department_code 
                 FROM faculty f 
                 JOIN departments d ON f.department_id = d.id 
                 WHERE f.user_id = ?`,
                [user.id]
            );
            if (faculty.length > 0) {
                profileDetails = faculty[0];
            }
        }

        // Sign JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET || 'college_erp_jwt_secret_token_123!@#',
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                date_of_birth: user.date_of_birth,
                ...profileDetails
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'college_erp_jwt_secret_token_123!@#');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = {
    router,
    authenticateToken
};

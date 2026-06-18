const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken } = require('./auth');

// Middleware to check if user is Admin or Faculty
const isStaff = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
        return res.status(403).json({ error: 'Access denied. Administrators and Faculty only.' });
    }
    next();
};

router.use(authenticateToken);
router.use(isStaff);

// Bulk Register Endpoint
router.post('/bulk-register', async (req, res) => {
    const { users: rows } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: 'Please provide a non-empty array of users under the key "users".' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Fetch all departments for code-to-id mapping
        const [depts] = await connection.query('SELECT id, code FROM departments');
        const deptMap = {};
        depts.forEach(d => {
            deptMap[d.code.toUpperCase()] = d.id;
        });

        // If logged-in user is faculty, fetch their department ID
        let facultyDeptId = null;
        if (req.user.role === 'faculty') {
            const [fac] = await connection.query('SELECT department_id FROM faculty WHERE user_id = ?', [req.user.id]);
            if (fac.length > 0) {
                facultyDeptId = fac[0].department_id;
            }
        }

        // Fetch first available hostel for automatic student allocation
        const [hostels] = await connection.query('SELECT id FROM hostels WHERE occupied < capacity LIMIT 1');
        const defaultHostelId = hostels.length > 0 ? hostels[0].id : null;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = i + 1; // 1-indexed for reporting to the user

            // Core field validation
            if (!row.name || !row.email) {
                throw new Error(`Row ${rowIndex}: Name and Email are required.`);
            }

            // Enforce role restrictions
            let userRole = row.role ? row.role.toLowerCase() : 'student';
            if (req.user.role === 'faculty') {
                // Faculty members can ONLY import students
                userRole = 'student';
            } else if (userRole !== 'student' && userRole !== 'faculty' && userRole !== 'admin') {
                throw new Error(`Row ${rowIndex} (${row.name}): Invalid role "${row.role}". Must be 'student' or 'faculty'.`);
            }

            // Check if user email already exists
            const [existingEmail] = await connection.query('SELECT id FROM users WHERE email = ?', [row.email]);
            if (existingEmail.length > 0) {
                throw new Error(`Row ${rowIndex} (${row.name}): Email "${row.email}" is already registered.`);
            }

            // Determine Department ID
            let deptId = null;
            if (req.user.role === 'faculty') {
                deptId = facultyDeptId;
            } else {
                if (!row.department_code) {
                    throw new Error(`Row ${rowIndex} (${row.name}): Department Code is required.`);
                }
                deptId = deptMap[row.department_code.toUpperCase()];
                if (!deptId) {
                    throw new Error(`Row ${rowIndex} (${row.name}): Department Code "${row.department_code}" is invalid.`);
                }
            }

            // Handle password defaults
            let defaultPass = row.password;
            if (!defaultPass) {
                if (userRole === 'student') defaultPass = row.roll_number;
                else if (userRole === 'faculty') defaultPass = row.employee_id;
                
                // Fallback if still empty
                if (!defaultPass) defaultPass = 'Welcome123';
            }

            // Hash password
            const passwordHash = await bcrypt.hash(defaultPass, 10);

            // Insert core user record
            const [userResult] = await connection.query(
                'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
                [row.name, row.email, passwordHash, userRole, row.phone || null, row.date_of_birth || null]
            );
            const newUserId = userResult.insertId;

            // Role specific records
            if (userRole === 'student') {
                if (!row.roll_number) {
                    throw new Error(`Row ${rowIndex} (${row.name}): Roll Number is required for students.`);
                }

                // Check roll number uniqueness
                const [existingRoll] = await connection.query('SELECT user_id FROM students WHERE roll_number = ?', [row.roll_number]);
                if (existingRoll.length > 0) {
                    throw new Error(`Row ${rowIndex} (${row.name}): Roll Number "${row.roll_number}" is already registered.`);
                }

                // Insert Student Profile
                const semester = parseInt(row.semester) || 1;
                await connection.query(
                    'INSERT INTO students (user_id, roll_number, department_id, enrollment_year, semester) VALUES (?, ?, ?, ?, ?)',
                    [newUserId, row.roll_number, deptId, parseInt(row.enrollment_year) || new Date().getFullYear(), semester]
                );

                // Initialize Student Dues & Clearance
                await connection.query('INSERT INTO no_dues (student_id) VALUES (?)', [newUserId]);

                // Initialize Tuition Fee Invoice
                await connection.query(
                    'INSERT INTO fees (student_id, fee_type, amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
                    [newUserId, 'Tuition Fee - Semester ' + semester, 3500.00, '2026-08-01', 'unpaid']
                );

                // Initialize Hostel Assignment if vacancy exists
                if (defaultHostelId) {
                    await connection.query(
                        'INSERT INTO hostel_bookings (student_id, hostel_id, booking_date, status) VALUES (?, ?, CURRENT_DATE, "approved")',
                        [newUserId, defaultHostelId]
                    );
                    await connection.query('UPDATE hostels SET occupied = occupied + 1 WHERE id = ?', [defaultHostelId]);
                }

            } else if (userRole === 'faculty') {
                if (!row.employee_id) {
                    throw new Error(`Row ${rowIndex} (${row.name}): Employee ID is required for faculty.`);
                }

                // Check employee ID uniqueness
                const [existingEmp] = await connection.query('SELECT user_id FROM faculty WHERE employee_id = ?', [row.employee_id]);
                if (existingEmp.length > 0) {
                    throw new Error(`Row ${rowIndex} (${row.name}): Employee ID "${row.employee_id}" is already registered.`);
                }

                // Insert Faculty Profile
                await connection.query(
                    'INSERT INTO faculty (user_id, employee_id, department_id, designation, qualification) VALUES (?, ?, ?, ?, ?)',
                    [newUserId, row.employee_id, deptId, row.designation || 'Assistant Professor', row.qualification || 'M.Tech']
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: `Successfully registered ${rows.length} users in bulk!` });

    } catch (err) {
        await connection.rollback();
        console.error('Bulk registration error:', err.message);
        res.status(400).json({ error: err.message || 'Error processing bulk registration.' });
    } finally {
        connection.release();
    }
});

module.exports = router;

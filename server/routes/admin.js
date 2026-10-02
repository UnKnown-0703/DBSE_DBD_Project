const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken } = require('./auth');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};

router.use(authenticateToken);

// 7. Announcements GET (Exposed to all authenticated users: student, faculty, admin)
router.get('/announcements', async (req, res) => {
    try {
        const [notices] = await db.query(
            `SELECT a.*, u.name as creator_name FROM announcements a 
             JOIN users u ON a.created_by = u.id 
             ORDER BY a.created_at DESC`
        );
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching announcements.' });
    }
});

router.use(isAdmin);

// 1. Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [[{ count: students }]] = await db.query('SELECT COUNT(*) as count FROM students');
        const [[{ count: faculty }]] = await db.query('SELECT COUNT(*) as count FROM faculty');
        const [[{ count: courses }]] = await db.query('SELECT COUNT(*) as count FROM courses');
        const [[{ count: departments }]] = await db.query('SELECT COUNT(*) as count FROM departments');
        const [[{ count: activeTickets }]] = await db.query('SELECT COUNT(*) as count FROM support_tickets WHERE status != "resolved"');
        const [[{ count: infraTickets }]] = await db.query('SELECT COUNT(*) as count FROM infrastructure_tickets WHERE status = "open"');

        res.json({
            students,
            faculty,
            courses,
            departments,
            activeTickets,
            infraTickets
        });
    } catch (err) {
        console.error('Stats fetch error:', err);
        res.status(500).json({ error: 'Server error fetching stats.' });
    }
});

// 2. Manage Users (Get list of all users by role)
router.get('/users/:role', async (req, res) => {
    const { role } = req.params;
    try {
        let query = '';
        if (role === 'student') {
            query = `
                SELECT u.id, u.name, u.email, u.phone, u.date_of_birth, u.created_at,
                       s.roll_number, s.enrollment_year, s.semester, s.current_gpa,
                       d.name as department_name, d.id as department_id
                FROM users u
                JOIN students s ON u.id = s.user_id
                JOIN departments d ON s.department_id = d.id
                WHERE u.role = 'student'
            `;
        } else if (role === 'faculty') {
            query = `
                SELECT u.id, f.faculty_name AS name, u.email, u.phone, u.date_of_birth, u.created_at,
                       f.employee_id, f.designation, f.qualification,
                       d.name as department_name, d.id as department_id
                FROM users u
                JOIN faculty f ON u.id = f.user_id
                JOIN departments d ON f.department_id = d.id
                WHERE u.role = 'faculty'
            `;
        } else {
            query = `SELECT id, name, email, phone, date_of_birth, created_at FROM users WHERE role = 'admin'`;
        }

        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ error: 'Server error fetching users.' });
    }
});

// 3. Create a user (student/faculty)
router.post('/users', async (req, res) => {
    const { name, email, password, role, phone, date_of_birth, department_id, roll_number, enrollment_year, semester, employee_id, designation, qualification } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Name, email, password and role are required fields.' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert into users
        const [userResult] = await connection.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, role, phone || null, date_of_birth || null]
        );
        const newUserId = userResult.insertId;

        // Insert into role specific tables
        if (role === 'student') {
            if (!roll_number || !department_id || !enrollment_year) {
                throw new Error('Roll number, department ID, and enrollment year are required for student accounts.');
            }
            await connection.query(
                'INSERT INTO students (user_id, roll_number, department_id, enrollment_year, semester) VALUES (?, ?, ?, ?, ?)',
                [newUserId, roll_number, department_id, enrollment_year, semester || 1]
            );

            // Initialize digital No Dues clearance records
            await connection.query(
                'INSERT INTO no_dues (student_id) VALUES (?)',
                [newUserId]
            );
        } else if (role === 'faculty') {
            if (!employee_id || !department_id || !designation || !qualification) {
                throw new Error('Employee ID, department ID, designation, and qualification are required for faculty accounts.');
            }
            await connection.query(
                'INSERT INTO faculty (user_id, faculty_name, employee_id, department_id, designation, qualification) VALUES (?, ?, ?, ?, ?, ?)',
                [newUserId, name, employee_id, department_id, designation, qualification]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'User created successfully.', userId: newUserId });
    } catch (err) {
        await connection.rollback();
        console.error('Create user error:', err.message);
        res.status(400).json({ error: err.message || 'Error creating user.' });
    } finally {
        connection.release();
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error deleting user.' });
    }
});

// 4. Departments CRUD
router.get('/departments', async (req, res) => {
    try {
        const [departments] = await db.query('SELECT * FROM departments');
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching departments.' });
    }
});

router.post('/departments', async (req, res) => {
    const { name, code, description } = req.body;
    try {
        await db.query('INSERT INTO departments (name, code, description) VALUES (?, ?, ?)', [name, code, description]);
        res.status(201).json({ message: 'Department created successfully.' });
    } catch (err) {
        res.status(400).json({ error: 'Error creating department (code must be unique).' });
    }
});

// 5. Courses CRUD
router.get('/courses', async (req, res) => {
    try {
        const [courses] = await db.query(
            `SELECT c.*, d.name as department_name FROM courses c 
             JOIN departments d ON c.department_id = d.id`
        );
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching courses.' });
    }
});

router.post('/courses', async (req, res) => {
    const { course_code, name, credits, department_id, description } = req.body;
    try {
        await db.query(
            'INSERT INTO courses (course_code, name, credits, department_id, description) VALUES (?, ?, ?, ?, ?)',
            [course_code, name, credits, department_id, description]
        );
        res.status(201).json({ message: 'Course created successfully.' });
    } catch (err) {
        res.status(400).json({ error: 'Error creating course.' });
    }
});

// 6. Course Offerings CRUD
router.get('/offerings', async (req, res) => {
    try {
        const [offerings] = await db.query(
            `SELECT co.id, co.semester, co.academic_year, co.schedule, co.classroom, co.exam_date,
                    c.name as course_name, c.course_code, COALESCE(f.faculty_name, u.name) as faculty_name
             FROM course_offerings co
             JOIN courses c ON co.course_id = c.id
             JOIN users u ON co.faculty_id = u.id
             LEFT JOIN faculty f ON u.id = f.user_id`
        );
        res.json(offerings);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching course offerings.' });
    }
});

router.post('/offerings', async (req, res) => {
    const { course_id, faculty_id, semester, academic_year, schedule, classroom, exam_date } = req.body;
    try {
        await db.query(
            `INSERT INTO course_offerings (course_id, faculty_id, semester, academic_year, schedule, classroom, exam_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [course_id, faculty_id, semester, academic_year, schedule, classroom, exam_date || null]
        );
        res.status(201).json({ message: 'Class offering registered successfully.' });
    } catch (err) {
        res.status(400).json({ error: 'Error registering class offering.' });
    }
});

// 7. Announcements CRUD
router.post('/announcements', async (req, res) => {
    const { title, content, target_role } = req.body;
    try {
        await db.query(
            'INSERT INTO announcements (title, content, target_role, created_by) VALUES (?, ?, ?, ?)',
            [title, content, target_role || 'all', req.user.id]
        );
        res.status(201).json({ message: 'Announcement published.' });
    } catch (err) {
        res.status(400).json({ error: 'Error posting announcement.' });
    }
});

// 8. Infrastructure Maintenance Tickets
router.get('/infra-tickets', async (req, res) => {
    try {
        const [tickets] = await db.query(
            `SELECT it.*, u.name as student_name FROM infrastructure_tickets it
             JOIN users u ON it.student_id = u.id
             ORDER BY it.created_at DESC`
        );
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching infrastructure tickets.' });
    }
});

router.put('/infra-tickets/:id/resolve', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE infrastructure_tickets SET status = "resolved" WHERE id = ?', [id]);
        res.json({ message: 'Ticket resolved.' });
    } catch (err) {
        res.status(500).json({ error: 'Error resolving ticket.' });
    }
});

module.exports = router;

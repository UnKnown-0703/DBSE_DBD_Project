const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Middleware to check student role
const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
};

router.use(authenticateToken);
router.use(isStudent);

// 1. Profile Details
router.get('/profile', async (req, res) => {
    try {
        const [student] = await db.query(
            `SELECT u.id, u.name, u.email, u.phone, u.date_of_birth, u.created_at,
                    s.roll_number, s.enrollment_year, s.semester, s.current_gpa,
                    d.name as department_name, d.code as department_code
             FROM users u
             JOIN students s ON u.id = s.user_id
             JOIN departments d ON s.department_id = d.id
             WHERE u.id = ?`,
            [req.user.id]
        );
        res.json(student[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching profile.' });
    }
});

router.put('/profile', async (req, res) => {
    const { phone, date_of_birth } = req.body;
    try {
        await db.query(
            'UPDATE users SET phone = ?, date_of_birth = ? WHERE id = ?',
            [phone, date_of_birth, req.user.id]
        );
        res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating profile.' });
    }
});

// 2. Academic Registration & Offered Courses
router.get('/registration/offered', async (req, res) => {
    try {
        // Fetch student's department and semester
        const [[studentInfo]] = await db.query('SELECT department_id, semester FROM students WHERE user_id = ?', [req.user.id]);
        
        // Fetch offerings for this department and semester that they are NOT already enrolled in
        const [offered] = await db.query(
            `SELECT co.id, co.semester, co.academic_year, co.schedule, co.classroom,
                    c.name as course_name, c.course_code, c.credits, u.name as faculty_name
             FROM course_offerings co
             JOIN courses c ON co.course_id = c.id
             JOIN users u ON co.faculty_id = u.id
             WHERE c.department_id = ? AND co.semester = ?
               AND co.id NOT IN (
                   SELECT course_offering_id FROM enrollments WHERE student_id = ? AND status != 'dropped'
               )`,
            [studentInfo.department_id, studentInfo.semester, req.user.id]
        );
        res.json(offered);
    } catch (err) {
        console.error('Offered courses error:', err);
        res.status(500).json({ error: 'Error fetching registration courses.' });
    }
});

router.post('/registration/enroll', async (req, res) => {
    const { offeringId } = req.body;
    try {
        await db.query(
            `INSERT INTO enrollments (student_id, course_offering_id, status) 
             VALUES (?, ?, 'enrolled')
             ON DUPLICATE KEY UPDATE status = 'enrolled'`,
            [req.user.id, offeringId]
        );
        res.json({ message: 'Enrolled in course successfully.' });
    } catch (err) {
        console.error('Enroll error:', err);
        res.status(400).json({ error: 'Failed to enroll in course.' });
    }
});

router.post('/registration/drop', async (req, res) => {
    const { offeringId } = req.body;
    try {
        await db.query(
            'UPDATE enrollments SET status = "dropped" WHERE student_id = ? AND course_offering_id = ?',
            [req.user.id, offeringId]
        );
        res.json({ message: 'Dropped course successfully.' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to drop course.' });
    }
});

// 3. Time Tables & Enrolled Courses
router.get('/timetable', async (req, res) => {
    try {
        const [timetable] = await db.query(
            `SELECT co.id, co.schedule, co.classroom, c.name as course_name, c.course_code, u.name as faculty_name
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             JOIN users u ON co.faculty_id = u.id
             WHERE e.student_id = ? AND e.status = 'enrolled'`,
            [req.user.id]
        );
        res.json(timetable);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching timetable.' });
    }
});

// 4. Attendance Register
router.get('/attendance', async (req, res) => {
    try {
        // Enrolled courses
        const [enrolled] = await db.query(
            `SELECT co.id as offering_id, c.name as course_name, c.course_code, c.credits,
                    (SELECT COUNT(*) FROM attendance a WHERE a.student_id = ? AND a.course_offering_id = co.id AND a.status = 'present') as present_count,
                    (SELECT COUNT(*) FROM attendance a WHERE a.student_id = ? AND a.course_offering_id = co.id) as total_count
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             WHERE e.student_id = ? AND e.status = 'enrolled'`,
            [req.user.id, req.user.id, req.user.id]
        );

        // Detailed attendance logs
        const [logs] = await db.query(
            `SELECT a.date, a.status, c.course_code, c.name as course_name
             FROM attendance a
             JOIN course_offerings co ON a.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             WHERE a.student_id = ?
             ORDER BY a.date DESC`,
            [req.user.id]
        );

        res.json({ summary: enrolled, logs });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching attendance.' });
    }
});

// 5. My CGPA & Transcripts
router.get('/academics/gpa', async (req, res) => {
    try {
        const [grades] = await db.query(
            `SELECT e.grade, e.status, co.semester, co.academic_year,
                    c.course_code, c.name as course_name, c.credits
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             WHERE e.student_id = ? AND e.status = 'enrolled'`,
            [req.user.id]
        );
        res.json(grades);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching academic grades.' });
    }
});

// 6. Fee Payments
router.get('/fees', async (req, res) => {
    try {
        const [fees] = await db.query(
            'SELECT * FROM fees WHERE student_id = ? ORDER BY due_date ASC',
            [req.user.id]
        );
        res.json(fees);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching fees.' });
    }
});

router.post('/fees/:id/pay', async (req, res) => {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const mockTxnId = 'TXN_MOCK_' + Math.random().toString(36).substring(2, 11).toUpperCase();
    
    try {
        await db.query(
            `UPDATE fees 
             SET status = "paid", payment_method = ?, transaction_id = ?, payment_date = CURRENT_TIMESTAMP
             WHERE id = ? AND student_id = ?`,
            [paymentMethod || 'Net Banking', mockTxnId, id, req.user.id]
        );
        res.json({ message: 'Payment simulated successfully.', transactionId: mockTxnId });
    } catch (err) {
        res.status(500).json({ error: 'Payment processing failed.' });
    }
});

// 7. Hostel Management
router.get('/hostel', async (req, res) => {
    try {
        // Active room booking
        const [booking] = await db.query(
            `SELECT hb.status, hb.booking_date, h.block_name, h.room_number, h.warden_name, h.warden_phone, h.capacity, h.occupied
             FROM hostel_bookings hb
             JOIN hostels h ON hb.hostel_id = h.id
             WHERE hb.student_id = ?`,
            [req.user.id]
        );

        // List of all hostel assets
        const [rooms] = await db.query('SELECT * FROM hostels');

        res.json({
            activeBooking: booking[0] || null,
            availableRooms: rooms
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching hostel details.' });
    }
});

router.post('/hostel/book', async (req, res) => {
    const { hostelId } = req.body;
    try {
        // Validate hostel room capacity
        const [rooms] = await db.query('SELECT capacity, occupied FROM hostels WHERE id = ?', [hostelId]);
        if (rooms.length === 0) {
            return res.status(404).json({ error: 'Hostel room not found.' });
        }
        if (rooms[0].occupied >= rooms[0].capacity) {
            return res.status(400).json({ error: 'This room is already fully occupied.' });
        }

        await db.query(
            `INSERT INTO hostel_bookings (student_id, hostel_id, booking_date, status) 
             VALUES (?, ?, CURRENT_DATE, 'pending')
             ON DUPLICATE KEY UPDATE hostel_id = VALUES(hostel_id), status = 'pending'`,
            [req.user.id, hostelId]
        );
        res.json({ message: 'Hostel booking request submitted. Awaiting approval.' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to request hostel booking.' });
    }
});

// 8. Hallticket Generator (Verifies >75% attendance)
router.get('/hallticket', async (req, res) => {
    try {
        // Fetch student credentials
        const [[studentInfo]] = await db.query(
            `SELECT s.roll_number, s.semester, u.name as student_name, d.name as department_name
             FROM students s
             JOIN users u ON s.user_id = u.id
             JOIN departments d ON s.department_id = d.id
             WHERE s.user_id = ?`,
            [req.user.id]
        );

        // Fetch enrolled classes and compute attendance percentage
        const [enrolled] = await db.query(
            `SELECT co.id as offering_id, co.classroom, co.exam_date, co.schedule,
                    c.name as course_name, c.course_code,
                    (SELECT COUNT(*) FROM attendance a WHERE a.student_id = ? AND a.course_offering_id = co.id AND a.status = 'present') as present_count,
                    (SELECT COUNT(*) FROM attendance a WHERE a.student_id = ? AND a.course_offering_id = co.id) as total_count
             FROM enrollments e
             JOIN course_offerings co ON e.course_offering_id = co.id
             JOIN courses c ON co.course_id = c.id
             WHERE e.student_id = ? AND e.status = 'enrolled'`,
            [req.user.id, req.user.id, req.user.id]
        );

        // Compute eligibility per subject (Rule: Attendance percentage must be >= 75%)
        let eligible = true;
        const examSchedule = enrolled.map(subj => {
            const pct = subj.total_count > 0 ? (subj.present_count / subj.total_count) * 100 : 100.0;
            const subjectEligible = pct >= 75.0;
            if (!subjectEligible) eligible = false;

            return {
                course_code: subj.course_code,
                course_name: subj.course_name,
                exam_date: subj.exam_date,
                attendance_percentage: pct.toFixed(1),
                classroom: subj.classroom,
                eligible: subjectEligible
            };
        });

        res.json({
            student_name: studentInfo.student_name,
            roll_number: studentInfo.roll_number,
            department: studentInfo.department_name,
            semester: studentInfo.semester,
            eligible,
            examSeat: eligible ? 'Seat B-' + (100 + (req.user.id % 50)) : null,
            schedule: examSchedule
        });
    } catch (err) {
        console.error('Hallticket error:', err);
        res.status(500).json({ error: 'Error generating hallticket.' });
    }
});

// 9. Career Choice / Placements
router.get('/placements', async (req, res) => {
    try {
        const [drives] = await db.query(
            `SELECT cp.*, ca.status as application_status, ca.application_date 
             FROM career_placements cp
             LEFT JOIN career_applications ca ON cp.id = ca.placement_id AND ca.student_id = ?
             ORDER BY cp.deadline ASC`,
            [req.user.id]
        );
        res.json(drives);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching placements.' });
    }
});

router.post('/placements/:id/apply', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(
            `INSERT INTO career_applications (student_id, placement_id, status, application_date) 
             VALUES (?, ?, 'applied', CURRENT_DATE)
             ON DUPLICATE KEY UPDATE status = 'applied'`,
            [req.user.id, id]
        );
        res.json({ message: 'Application submitted successfully.' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to apply for drive.' });
    }
});

// 10. Infrastructure Maintenance Related
router.get('/infra-tickets', async (req, res) => {
    try {
        const [tickets] = await db.query(
            'SELECT * FROM infrastructure_tickets WHERE student_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching maintenance complaints.' });
    }
});

router.post('/infra-tickets', async (req, res) => {
    const { locationType, locationName, issueDescription } = req.body;
    if (!locationType || !locationName || !issueDescription) {
        return res.status(400).json({ error: 'Please provide location type, name, and description.' });
    }
    try {
        await db.query(
            'INSERT INTO infrastructure_tickets (student_id, location_type, location_name, issue_description) VALUES (?, ?, ?, ?)',
            [req.user.id, locationType, locationName, issueDescription]
        );
        res.status(201).json({ message: 'Complaint registered successfully.' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to register maintenance complaint.' });
    }
});

// 11. Library Search & Borrow history
router.get('/library/books', async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM library_books';
        let params = [];
        if (search) {
            query += ' WHERE title LIKE ? OR author LIKE ? OR category LIKE ?';
            const term = `%${search}%`;
            params = [term, term, term];
        }
        const [books] = await db.query(query, params);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: 'Error searching library catalog.' });
    }
});

router.get('/library/borrows', async (req, res) => {
    try {
        const [borrows] = await db.query(
            `SELECT lb.*, b.title, b.author, b.isbn 
             FROM library_borrows lb
             JOIN library_books b ON lb.book_id = b.id
             WHERE lb.student_id = ?
             ORDER BY lb.issue_date DESC`,
            [req.user.id]
        );
        res.json(borrows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching library borrows.' });
    }
});

router.post('/library/borrow/:id', async (req, res) => {
    const { id } = req.params; // book_id
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
        const [books] = await connection.query('SELECT available_copies FROM library_books WHERE id = ?', [id]);
        if (books.length === 0) {
            throw new Error('Book not found.');
        }
        if (books[0].available_copies <= 0) {
            throw new Error('No available copies left.');
        }

        // Create checkout record
        await connection.query(
            `INSERT INTO library_borrows (student_id, book_id, issue_date, due_date, status) 
             VALUES (?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'borrowed')`,
            [req.user.id, id]
        );

        // Update counts
        await connection.query('UPDATE library_books SET available_copies = available_copies - 1 WHERE id = ?', [id]);
        
        await connection.commit();
        res.json({ message: 'Book checked out successfully.' });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message || 'Error borrowing book.' });
    } finally {
        connection.release();
    }
});

router.post('/library/return/:id', async (req, res) => {
    const { id } = req.params; // borrow transaction ID
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [borrows] = await connection.query('SELECT * FROM library_borrows WHERE id = ? AND student_id = ?', [id, req.user.id]);
        if (borrows.length === 0) {
            throw new Error('Borrow record not found.');
        }
        if (borrows[0].status === 'returned') {
            throw new Error('Book already returned.');
        }

        // Set return date
        await connection.query(
            'UPDATE library_borrows SET return_date = CURRENT_DATE, status = "returned" WHERE id = ?',
            [id]
        );

        // Replenish stock
        await connection.query('UPDATE library_books SET available_copies = available_copies + 1 WHERE id = ?', [borrows[0].book_id]);

        await connection.commit();
        res.json({ message: 'Book returned successfully.' });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: err.message || 'Error returning book.' });
    } finally {
        connection.release();
    }
});

// 12. No Dues clearance check
router.get('/nodue', async (req, res) => {
    try {
        const [clearance] = await db.query('SELECT * FROM no_dues WHERE student_id = ?', [req.user.id]);
        
        // Calculate status dynamically: if all cleared, mark overall as cleared
        let record = clearance[0];
        if (record) {
            const allCleared = record.library_dues === 'cleared' &&
                               record.hostel_dues === 'cleared' &&
                               record.sports_dues === 'cleared' &&
                               record.accounts_dues === 'cleared';
            const status = allCleared ? 'cleared' : 'pending';
            if (record.status !== status) {
                await db.query('UPDATE no_dues SET status = ? WHERE student_id = ?', [status, req.user.id]);
                record.status = status;
            }
        }
        res.json(record || null);
    } catch (err) {
        res.status(500).json({ error: 'Error checking clearance status.' });
    }
});

// 13. Transportation Details
router.get('/transport', async (req, res) => {
    try {
        const [enrollment] = await db.query(
            `SELECT tr.* FROM student_transport st
             JOIN transport_routes tr ON st.route_id = tr.id
             WHERE st.student_id = ?`,
            [req.user.id]
        );
        const [routes] = await db.query('SELECT * FROM transport_routes');

        res.json({
            enrolledRoute: enrollment[0] || null,
            allRoutes: routes
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching transportation.' });
    }
});

router.post('/transport/enroll', async (req, res) => {
    const { routeId } = req.body;
    try {
        await db.query(
            `INSERT INTO student_transport (student_id, route_id) 
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE route_id = VALUES(route_id)`,
            [req.user.id, routeId]
        );
        res.json({ message: 'Bus route allocation updated.' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to update route enrollment.' });
    }
});

// 14. Support Tickets (Helpdesk Queries)
router.get('/support-tickets', async (req, res) => {
    try {
        const [tickets] = await db.query(
            'SELECT * FROM support_tickets WHERE student_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching support tickets.' });
    }
});

router.post('/support-tickets', async (req, res) => {
    const { title, category, description } = req.body;
    if (!title || !category || !description) {
        return res.status(400).json({ error: 'Please provide title, category and description.' });
    }
    try {
        await db.query(
            'INSERT INTO support_tickets (student_id, title, category, description) VALUES (?, ?, ?, ?)',
            [req.user.id, title, category, description]
        );
        res.status(201).json({ message: 'Support ticket submitted.' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to submit support ticket.' });
    }
});

// 15. Courses catalog lookup
router.get('/courses', async (req, res) => {
    try {
        const [[studentInfo]] = await db.query('SELECT department_id FROM students WHERE user_id = ?', [req.user.id]);
        const [courses] = await db.query(
            `SELECT c.*, d.name as department_name 
             FROM courses c
             JOIN departments d ON c.department_id = d.id
             WHERE c.department_id = ?`,
            [studentInfo.department_id]
        );
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching course catalog.' });
    }
});

module.exports = router;

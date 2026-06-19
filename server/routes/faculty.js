const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Middleware to check faculty role
const isFaculty = (req, res, next) => {
    if (req.user.role !== 'faculty') {
        return res.status(403).json({ error: 'Access denied. Faculty only.' });
    }
    next();
};

router.use(authenticateToken);
router.use(isFaculty);

// 1. Get courses taught by this faculty member
router.get('/courses', async (req, res) => {
    try {
        const [courses] = await db.query(
            `SELECT co.id, co.semester, co.academic_year, co.schedule, co.classroom,
                    c.name as course_name, c.course_code, c.credits
             FROM course_offerings co
             JOIN courses c ON co.course_id = c.id
             WHERE co.faculty_id = ?`,
            [req.user.id]
        );
        res.json(courses);
    } catch (err) {
        console.error('Faculty courses error:', err);
        res.status(500).json({ error: 'Error fetching assigned courses.' });
    }
});

// 2. Get students enrolled in a specific course offering
router.get('/classes/:offeringId/students', async (req, res) => {
    const { offeringId } = req.params;
    try {
        // Verify this faculty teaches this offering
        const [offering] = await db.query('SELECT id FROM course_offerings WHERE id = ? AND faculty_id = ?', [offeringId, req.user.id]);
        if (offering.length === 0) {
            return res.status(403).json({ error: 'Access denied. You do not teach this course offering.' });
        }

        const [students] = await db.query(
            `SELECT u.id as user_id, u.name, u.email, s.roll_number, e.grade, e.status as enrollment_status,
                    (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id AND a.course_offering_id = ? AND a.status = 'present') as present_count,
                    (SELECT COUNT(*) FROM attendance a WHERE a.student_id = u.id AND a.course_offering_id = ?) as total_count
             FROM enrollments e
             JOIN students s ON e.student_id = s.user_id
             JOIN users u ON s.user_id = u.id
             WHERE e.course_offering_id = ?`,
            [offeringId, offeringId, offeringId]
        );
        res.json(students);
    } catch (err) {
        console.error('Fetch class students error:', err);
        res.status(500).json({ error: 'Error fetching class students.' });
    }
});

// 3. Mark attendance for multiple students
router.post('/classes/:offeringId/attendance', async (req, res) => {
    const { offeringId } = req.params;
    const { date, records } = req.body; // records: [{ student_id: 1, status: 'present'/'absent'/'late' }]

    if (!date || !records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Date and records array are required.' });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Verify faculty teaches this class
        const [offering] = await connection.query('SELECT id FROM course_offerings WHERE id = ? AND faculty_id = ?', [offeringId, req.user.id]);
        if (offering.length === 0) {
            throw new Error('You do not teach this course offering.');
        }

        for (const record of records) {
            await connection.query(
                `INSERT INTO attendance (student_id, course_offering_id, date, status) 
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE status = VALUES(status)`,
                [record.student_id, offeringId, date, record.status]
            );
        }

        await connection.commit();
        res.json({ message: 'Attendance records saved successfully.' });
    } catch (err) {
        await connection.rollback();
        console.error('Save attendance error:', err);
        res.status(400).json({ error: err.message || 'Error saving attendance.' });
    } finally {
        connection.release();
    }
});

// 4. Input grades for a student
router.put('/classes/:offeringId/grades', async (req, res) => {
    const { offeringId } = req.params;
    const { student_id, grade } = req.body;

    if (!student_id || !grade) {
        return res.status(400).json({ error: 'Student ID and grade letter are required.' });
    }

    try {
        // Verify faculty teaches this class
        const [offering] = await db.query('SELECT id FROM course_offerings WHERE id = ? AND faculty_id = ?', [offeringId, req.user.id]);
        if (offering.length === 0) {
            return res.status(403).json({ error: 'Access denied. You do not teach this course offering.' });
        }

        await db.query(
            'UPDATE enrollments SET grade = ? WHERE student_id = ? AND course_offering_id = ?',
            [grade, student_id, offeringId]
        );

        // Calculate and update the student's CGPA based on all completed grades
        const [grades] = await db.query(
            `SELECT e.grade, c.credits 
             FROM enrollments e 
             JOIN course_offerings co ON e.course_offering_id = co.id 
             JOIN courses c ON co.course_id = c.id 
             WHERE e.student_id = ? AND e.grade IS NOT NULL`,
            [student_id]
        );

        if (grades.length > 0) {
            const gradePoints = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
            let totalCredits = 0;
            let weightedGPA = 0;
            
            for (const item of grades) {
                const points = gradePoints[item.grade.toUpperCase()] || 0.0;
                weightedGPA += points * item.credits;
                totalCredits += item.credits;
            }
            
            const newGPA = totalCredits > 0 ? (weightedGPA / totalCredits).toFixed(2) : 0.00;
            await db.query('UPDATE students SET current_gpa = ? WHERE user_id = ?', [newGPA, student_id]);
        }

        res.json({ message: 'Grade updated successfully.' });
    } catch (err) {
        console.error('Update grade error:', err);
        res.status(500).json({ error: 'Error updating student grade.' });
    }
});

// 5. Get students in the same department as the advisor (faculty)
router.get('/department/students', async (req, res) => {
    try {
        const [students] = await db.query(
            `SELECT u.id, u.name, u.email, u.phone, s.roll_number, s.enrollment_year, s.semester, s.current_gpa
             FROM users u
             JOIN students s ON u.id = s.user_id
             WHERE s.department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [req.user.id]
        );
        res.json(students);
    } catch (err) {
        console.error('Faculty department students error:', err);
        res.status(500).json({ error: 'Error fetching department students.' });
    }
});

// 6. Get academic support tickets in the same department
router.get('/department/tickets', async (req, res) => {
    try {
        const [tickets] = await db.query(
            `SELECT st.*, u.name as student_name, s.roll_number
             FROM support_tickets st
             JOIN users u ON st.student_id = u.id
             JOIN students s ON u.id = s.user_id
             WHERE s.department_id = (SELECT department_id FROM faculty WHERE user_id = ?)
               AND st.category = 'Academic'
             ORDER BY st.created_at DESC`,
            [req.user.id]
        );
        res.json(tickets);
    } catch (err) {
        console.error('Faculty department tickets error:', err);
        res.status(500).json({ error: 'Error fetching department support tickets.' });
    }
});

// 7. Update support ticket status
router.put('/tickets/:ticketId', async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required.' });
    }

    try {
        // Verify the student is in the same department as the faculty
        const [ticket] = await db.query(
            `SELECT st.id 
             FROM support_tickets st
             JOIN students s ON st.student_id = s.user_id
             WHERE st.id = ? 
               AND s.department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [ticketId, req.user.id]
        );

        if (ticket.length === 0) {
            return res.status(403).json({ error: 'Access denied. You can only resolve academic tickets for students in your department.' });
        }

        await db.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, ticketId]);
        res.json({ message: 'Ticket status updated successfully.' });
    } catch (err) {
        console.error('Update ticket status error:', err);
        res.status(500).json({ error: 'Error updating ticket status.' });
    }
});

// 8. Get faculty peers (other faculty in same department)
router.get('/department/peers', async (req, res) => {
    try {
        const [peers] = await db.query(
            `SELECT u.id, u.name, u.email, u.phone, f.employee_id, f.designation, f.qualification
             FROM users u
             JOIN faculty f ON u.id = f.user_id
             WHERE f.department_id = (SELECT department_id FROM faculty WHERE user_id = ?)
               AND f.user_id != ?`,
            [req.user.id, req.user.id]
        );
        res.json(peers);
    } catch (err) {
        console.error('Faculty department peers error:', err);
        res.status(500).json({ error: 'Error fetching department faculty peers.' });
    }
});

// 9. Update faculty profile
router.put('/profile', async (req, res) => {
    const { phone, qualification } = req.body;
    try {
        if (phone) {
            await db.query('UPDATE users SET phone = ? WHERE id = ?', [phone, req.user.id]);
        }
        if (qualification) {
            await db.query('UPDATE faculty SET qualification = ? WHERE user_id = ?', [qualification, req.user.id]);
        }
        res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
        console.error('Faculty profile update error:', err);
        res.status(500).json({ error: 'Error updating profile details.' });
    }
});

// 10. Get department students No Dues records
router.get('/department/nodues', async (req, res) => {
    try {
        const [nodues] = await db.query(
            `SELECT u.name, s.roll_number, s.semester, nd.*
             FROM users u
             JOIN students s ON u.id = s.user_id
             JOIN no_dues nd ON s.user_id = nd.student_id
             WHERE s.department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [req.user.id]
        );
        res.json(nodues);
    } catch (err) {
        console.error('Faculty department nodues error:', err);
        res.status(500).json({ error: 'Error fetching department student no-dues records.' });
    }
});

// 11. Update student No Dues record
router.put('/nodues/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const { library_dues, hostel_dues, sports_dues, accounts_dues } = req.body;

    if (!library_dues || !hostel_dues || !sports_dues || !accounts_dues) {
        return res.status(400).json({ error: 'All dues categories (library, hostel, sports, accounts) statuses are required.' });
    }

    try {
        // Verify student is in faculty's department
        const [student] = await db.query(
            `SELECT user_id FROM students 
             WHERE user_id = ? 
               AND department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [studentId, req.user.id]
        );

        if (student.length === 0) {
            return res.status(403).json({ error: 'Access denied. You can only clear dues for students in your department.' });
        }

        const allCleared = library_dues === 'cleared' &&
                           hostel_dues === 'cleared' &&
                           sports_dues === 'cleared' &&
                           accounts_dues === 'cleared';
        const overallStatus = allCleared ? 'cleared' : 'pending';

        await db.query(
            `UPDATE no_dues 
             SET library_dues = ?, hostel_dues = ?, sports_dues = ?, accounts_dues = ?, status = ?
             WHERE student_id = ?`,
            [library_dues, hostel_dues, sports_dues, accounts_dues, overallStatus, studentId]
        );

        res.json({ message: 'No dues record updated successfully.' });
    } catch (err) {
        console.error('Update student dues error:', err);
        res.status(500).json({ error: 'Error updating student dues record.' });
    }
});

// 12. Delete student from department roster (and system)
router.delete('/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
        // Verify student is in faculty's department
        const [student] = await db.query(
            `SELECT user_id FROM students 
             WHERE user_id = ? 
               AND department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [studentId, req.user.id]
        );

        if (student.length === 0) {
            return res.status(403).json({ error: 'Access denied. You can only remove students in your department.' });
        }

        // Delete user (cascades to students, no_dues, enrollments, attendance)
        await db.query('DELETE FROM users WHERE id = ?', [studentId]);
        res.json({ message: 'Student removed from department roster successfully.' });
    } catch (err) {
        console.error('Delete student error:', err);
        res.status(500).json({ error: 'Error deleting student from roster.' });
    }
});

// 13. Delete academic support ticket
router.delete('/tickets/:ticketId', async (req, res) => {
    const { ticketId } = req.params;
    try {
        // Verify ticket belongs to department student
        const [ticket] = await db.query(
            `SELECT st.id 
             FROM support_tickets st
             JOIN students s ON st.student_id = s.user_id
             WHERE st.id = ? 
               AND s.department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [ticketId, req.user.id]
        );

        if (ticket.length === 0) {
            return res.status(403).json({ error: 'Access denied. You can only delete support tickets for students in your department.' });
        }

        await db.query('DELETE FROM support_tickets WHERE id = ?', [ticketId]);
        res.json({ message: 'Support ticket deleted successfully.' });
    } catch (err) {
        console.error('Delete ticket error:', err);
        res.status(500).json({ error: 'Error deleting support ticket.' });
    }
});

// 14. Get course catalog filtering by faculty department
router.get('/courses/catalog', async (req, res) => {
    try {
        const [courses] = await db.query(
            `SELECT c.id, c.course_code, c.name, c.credits, c.description
             FROM courses c
             WHERE c.department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [req.user.id]
        );
        res.json(courses);
    } catch (err) {
        console.error('Fetch course catalog error:', err);
        res.status(500).json({ error: 'Error fetching course catalog.' });
    }
});

// 15. Offer a course (create new course offering)
router.post('/courses/offer', async (req, res) => {
    const { course_id, semester, academic_year, schedule, classroom, exam_date } = req.body;
    if (!course_id || !semester || !academic_year || !schedule || !classroom) {
        return res.status(400).json({ error: 'Course ID, semester, academic year, schedule, and classroom are required.' });
    }

    try {
        // Verify course belongs to faculty's department
        const [course] = await db.query(
            `SELECT id FROM courses 
             WHERE id = ? AND department_id = (SELECT department_id FROM faculty WHERE user_id = ?)`,
            [course_id, req.user.id]
        );
        if (course.length === 0) {
            return res.status(403).json({ error: 'Access denied. You can only offer courses belonging to your department.' });
        }

        const [result] = await db.query(
            `INSERT INTO course_offerings (course_id, faculty_id, semester, academic_year, schedule, classroom, exam_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [course_id, req.user.id, semester, academic_year, schedule, classroom, exam_date || null]
        );
        res.json({ message: 'Course offering created successfully.', offeringId: result.insertId });
    } catch (err) {
        console.error('Create course offering error:', err);
        res.status(500).json({ error: 'Error creating course offering.' });
    }
});

module.exports = router;


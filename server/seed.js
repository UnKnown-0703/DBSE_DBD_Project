const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
    console.log('Seeding database started...');
    
    try {
        // Clear existing data (in reverse order of dependencies)
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE career_applications');
        await db.query('TRUNCATE TABLE career_placements');
        await db.query('TRUNCATE TABLE infrastructure_tickets');
        await db.query('TRUNCATE TABLE support_tickets');
        await db.query('TRUNCATE TABLE student_transport');
        await db.query('TRUNCATE TABLE transport_routes');
        await db.query('TRUNCATE TABLE no_dues');
        await db.query('TRUNCATE TABLE library_borrows');
        await db.query('TRUNCATE TABLE library_books');
        await db.query('TRUNCATE TABLE hostel_bookings');
        await db.query('TRUNCATE TABLE hostels');
        await db.query('TRUNCATE TABLE fees');
        await db.query('TRUNCATE TABLE announcements');
        await db.query('TRUNCATE TABLE attendance');
        await db.query('TRUNCATE TABLE enrollments');
        await db.query('TRUNCATE TABLE course_offerings');
        await db.query('TRUNCATE TABLE courses');
        await db.query('TRUNCATE TABLE faculty');
        await db.query('TRUNCATE TABLE students');
        await db.query('TRUNCATE TABLE departments');
        await db.query('TRUNCATE TABLE users');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('Cleared existing data.');

        // Hash password helper
        const hashPassword = async (pwd) => {
            return await bcrypt.hash(pwd, 10);
        };

        // 1. Create Users
        const adminPass = await hashPassword('AdminPassword123');
        const facultyPass = await hashPassword('FacultyPassword123');
        const studentPass = await hashPassword('StudentPassword123');

        // Admin User
        const [adminResult] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            ['System Administrator', 'admin@college.edu', adminPass, 'admin', '+91 99999 88888', '1985-05-15']
        );
        const adminId = adminResult.insertId;

        // Faculty Users
        const [f1Result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            ['Dr. Indiana Jones', 'prof.jones@college.edu', facultyPass, 'faculty', '+91 88888 77777', '1975-07-07']
        );
        const f1UserId = f1Result.insertId;

        const [f2Result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            ['Dr. Sarah Smith', 'prof.smith@college.edu', facultyPass, 'faculty', '+91 77777 66666', '1980-12-12']
        );
        const f2UserId = f2Result.insertId;

        // Student Users
        const [s1Result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            ['Alice Johnson', 'student.alice@college.edu', studentPass, 'student', '+91 98765 00001', '2005-01-20']
        );
        const s1UserId = s1Result.insertId;

        const [s2Result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            ['Bob Miller', 'student.bob@college.edu', studentPass, 'student', '+91 98765 00002', '2004-11-05']
        );
        const s2UserId = s2Result.insertId;

        const [s3Result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, phone, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
            ['Charlie Davis', 'student.charlie@college.edu', studentPass, 'student', '+91 98765 00003', '2005-03-15']
        );
        const s3UserId = s3Result.insertId;

        console.log('Seeded core users.');

        // 2. Create Departments
        const [deptCS] = await db.query(
            'INSERT INTO departments (name, code, description) VALUES (?, ?, ?)',
            ['Computer Science & Engineering', 'CSE', 'Department of Computing Science']
        );
        const csDeptId = deptCS.insertId;

        const [deptEE] = await db.query(
            'INSERT INTO departments (name, code, description) VALUES (?, ?, ?)',
            ['Electrical Engineering', 'EE', 'Department of Electrical & Electronic Engineering']
        );
        const eeDeptId = deptEE.insertId;

        const [deptME] = await db.query(
            'INSERT INTO departments (name, code, description) VALUES (?, ?, ?)',
            ['Mechanical Engineering', 'ME', 'Department of Mechanical Engineering']
        );
        const meDeptId = deptME.insertId;

        console.log('Seeded departments.');

        // 3. Link Students
        await db.query(
            'INSERT INTO students (user_id, roll_number, department_id, enrollment_year, semester, current_gpa) VALUES (?, ?, ?, ?, ?, ?)',
            [s1UserId, 'CSE2024001', csDeptId, 2024, 3, 3.82]
        );
        await db.query(
            'INSERT INTO students (user_id, roll_number, department_id, enrollment_year, semester, current_gpa) VALUES (?, ?, ?, ?, ?, ?)',
            [s2UserId, 'CSE2024002', csDeptId, 2024, 3, 3.25]
        );
        await db.query(
            'INSERT INTO students (user_id, roll_number, department_id, enrollment_year, semester, current_gpa) VALUES (?, ?, ?, ?, ?, ?)',
            [s3UserId, 'EE2024001', eeDeptId, 2024, 3, 3.50]
        );

        // 4. Link Faculty
        await db.query(
            'INSERT INTO faculty (user_id, employee_id, department_id, designation, qualification) VALUES (?, ?, ?, ?, ?)',
            [f1UserId, 'FAC-CSE-001', csDeptId, 'Professor', 'Ph.D. in Computer Science']
        );
        await db.query(
            'INSERT INTO faculty (user_id, employee_id, department_id, designation, qualification) VALUES (?, ?, ?, ?, ?)',
            [f2UserId, 'FAC-EE-001', eeDeptId, 'Associate Professor', 'Ph.D. in Electrical Engineering']
        );

        console.log('Linked students and faculty.');

        // 5. Create Courses
        const [c1] = await db.query(
            'INSERT INTO courses (course_code, name, credits, department_id, description) VALUES (?, ?, ?, ?, ?)',
            ['CSE202', 'Database Management Systems', 4, csDeptId, 'Relational databases, SQL, normalization, index structures.']
        );
        const cse202Id = c1.insertId;

        const [c2] = await db.query(
            'INSERT INTO courses (course_code, name, credits, department_id, description) VALUES (?, ?, ?, ?, ?)',
            ['CSE101', 'Introduction to Programming', 4, csDeptId, 'Basic programming concepts using Javascript/C++.']
        );
        const cse101Id = c2.insertId;

        const [c3] = await db.query(
            'INSERT INTO courses (course_code, name, credits, department_id, description) VALUES (?, ?, ?, ?, ?)',
            ['CSE303', 'Software Engineering', 3, csDeptId, 'Agile methodologies, system architectures, quality assurance.']
        );
        const cse303Id = c3.insertId;

        const [c4] = await db.query(
            'INSERT INTO courses (course_code, name, credits, department_id, description) VALUES (?, ?, ?, ?, ?)',
            ['EE204', 'Signals and Systems', 4, eeDeptId, 'Continuous and discrete time signals, Fourier transform, filter designs.']
        );
        const ee204Id = c4.insertId;

        const [c5] = await db.query(
            'INSERT INTO courses (course_code, name, credits, department_id, description) VALUES (?, ?, ?, ?, ?)',
            ['ME101', 'Engineering Mechanics', 3, meDeptId, 'Statics and dynamics of structures and machines.']
        );
        const me101Id = c5.insertId;

        console.log('Seeded courses.');

        // 6. Create Course Offerings
        const [offering1] = await db.query(
            'INSERT INTO course_offerings (course_id, faculty_id, semester, academic_year, schedule, classroom, exam_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cse202Id, f1UserId, 3, '2025-2026', 'Mon/Wed 10:00 AM - 11:30 AM', 'Room 101', '2026-06-22']
        );
        const off1Id = offering1.insertId;

        const [offering2] = await db.query(
            'INSERT INTO course_offerings (course_id, faculty_id, semester, academic_year, schedule, classroom, exam_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [cse303Id, f1UserId, 3, '2025-2026', 'Tue/Thu 09:00 AM - 10:30 AM', 'Room 102', '2026-06-23']
        );
        const off2Id = offering2.insertId;

        const [offering3] = await db.query(
            'INSERT INTO course_offerings (course_id, faculty_id, semester, academic_year, schedule, classroom, exam_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [ee204Id, f2UserId, 3, '2025-2026', 'Tue/Thu 11:00 AM - 12:30 PM', 'Room 204', '2026-06-24']
        );
        const off3Id = offering3.insertId;

        console.log('Seeded course offerings.');

        // 7. Seed Enrollments
        // Alice in CS202 and CS303
        await db.query('INSERT INTO enrollments (student_id, course_offering_id, grade, status) VALUES (?, ?, ?, ?)', [s1UserId, off1Id, 'A', 'enrolled']);
        await db.query('INSERT INTO enrollments (student_id, course_offering_id, grade, status) VALUES (?, ?, ?, ?)', [s1UserId, off2Id, null, 'enrolled']);

        // Bob in CS202 only
        await db.query('INSERT INTO enrollments (student_id, course_offering_id, grade, status) VALUES (?, ?, ?, ?)', [s2UserId, off1Id, 'B+', 'enrolled']);

        // Charlie in EE204
        await db.query('INSERT INTO enrollments (student_id, course_offering_id, grade, status) VALUES (?, ?, ?, ?)', [s3UserId, off3Id, 'A-', 'enrolled']);

        console.log('Seeded enrollments.');

        // 8. Seed Attendance (CS202 on a few dates)
        const dates = ['2026-06-01', '2026-06-03', '2026-06-08', '2026-06-10'];
        for (const date of dates) {
            // Alice CS202 attendance (present all)
            await db.query('INSERT INTO attendance (student_id, course_offering_id, date, status) VALUES (?, ?, ?, ?)', [s1UserId, off1Id, date, 'present']);
            // Bob CS202 attendance (absent on 06-03, present others)
            const bobStatus = date === '2026-06-03' ? 'absent' : 'present';
            await db.query('INSERT INTO attendance (student_id, course_offering_id, date, status) VALUES (?, ?, ?, ?)', [s2UserId, off1Id, date, bobStatus]);
        }
        // Alice CS303 attendance (present)
        await db.query('INSERT INTO attendance (student_id, course_offering_id, date, status) VALUES (?, ?, ?, ?)', [s1UserId, off2Id, '2026-06-02', 'present']);
        await db.query('INSERT INTO attendance (student_id, course_offering_id, date, status) VALUES (?, ?, ?, ?)', [s1UserId, off2Id, '2026-06-09', 'absent']);

        // Charlie EE204 attendance
        await db.query('INSERT INTO attendance (student_id, course_offering_id, date, status) VALUES (?, ?, ?, ?)', [s3UserId, off3Id, '2026-06-02', 'present']);
        await db.query('INSERT INTO attendance (student_id, course_offering_id, date, status) VALUES (?, ?, ?, ?)', [s3UserId, off3Id, '2026-06-09', 'present']);

        console.log('Seeded attendance records.');

        // 9. Seed Announcements
        await db.query(
            'INSERT INTO announcements (title, content, target_role, created_by) VALUES (?, ?, ?, ?)',
            ['Welcome to the New Academic Semester!', 'Welcome back students and faculty! The classes for Fall 2026 start today. Make sure to complete registration.', 'all', adminId]
        );
        await db.query(
            'INSERT INTO announcements (title, content, target_role, created_by) VALUES (?, ?, ?, ?)',
            ['Midterm Exams Schedule Released', 'The exams timetable has been updated in your Hallticket panel. Please make sure your attendance is above 75%.', 'student', adminId]
        );
        await db.query(
            'INSERT INTO announcements (title, content, target_role, created_by) VALUES (?, ?, ?, ?)',
            ['Faculty Council Meeting', 'A meeting of all department heads and faculty members is scheduled for Friday at 3 PM in the board room.', 'faculty', adminId]
        );

        console.log('Seeded announcements.');

        // 10. Seed Fees
        // Alice fees
        await db.query(
            'INSERT INTO fees (student_id, fee_type, amount, due_date, status, payment_method, transaction_id, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [s1UserId, 'Tuition Fee - Sem 3', 3500.00, '2026-07-01', 'unpaid', null, null, null]
        );
        await db.query(
            'INSERT INTO fees (student_id, fee_type, amount, due_date, status, payment_method, transaction_id, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [s1UserId, 'Library Membership Fee', 150.00, '2026-05-01', 'paid', 'Credit Card', 'TXN_ALICE_001', '2026-04-28 10:30:00']
        );
        // Bob fees
        await db.query(
            'INSERT INTO fees (student_id, fee_type, amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [s2UserId, 'Tuition Fee - Sem 3', 3500.00, '2026-07-01', 'unpaid']
        );
        await db.query(
            'INSERT INTO fees (student_id, fee_type, amount, due_date, status, payment_method, transaction_id, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [s2UserId, 'Hostel Rent - Block B', 800.00, '2026-05-10', 'paid', 'Net Banking', 'TXN_BOB_002', '2026-05-08 14:20:00']
        );
        // Charlie fees
        await db.query(
            'INSERT INTO fees (student_id, fee_type, amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [s3UserId, 'Tuition Fee - Sem 3', 3200.00, '2026-07-01', 'unpaid']
        );

        console.log('Seeded fees database.');

        // 11. Seed Hostels
        const [h1Result] = await db.query(
            'INSERT INTO hostels (block_name, room_number, capacity, occupied, warden_name, warden_phone) VALUES (?, ?, ?, ?, ?, ?)',
            ['Satpura Hostel (A-Block)', 'Room 101', 2, 1, 'Prof. Ramesh Kumar', '+91 99999 11111']
        );
        const h1Id = h1Result.insertId;

        const [h2Result] = await db.query(
            'INSERT INTO hostels (block_name, room_number, capacity, occupied, warden_name, warden_phone) VALUES (?, ?, ?, ?, ?, ?)',
            ['Satpura Hostel (A-Block)', 'Room 102', 2, 0, 'Prof. Ramesh Kumar', '+91 99999 11111']
        );
        const h2Id = h2Result.insertId;

        // Allocations & Bookings
        // Alice resides in h1
        await db.query(
            'INSERT INTO hostel_bookings (student_id, hostel_id, booking_date, status) VALUES (?, ?, ?, ?)',
            [s1UserId, h1Id, '2026-05-01', 'approved']
        );
        // Bob requested room 101 (pending)
        await db.query(
            'INSERT INTO hostel_bookings (student_id, hostel_id, booking_date, status) VALUES (?, ?, ?, ?)',
            [s2UserId, h1Id, '2026-06-01', 'pending']
        );

        console.log('Seeded hostels data.');

        // 12. Seed Library Books
        const [b1Result] = await db.query(
            'INSERT INTO library_books (title, author, category, isbn, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)',
            ['Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', '978-0262033848', 5, 4]
        );
        const b1Id = b1Result.insertId;

        const [b2Result] = await db.query(
            'INSERT INTO library_books (title, author, category, isbn, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)',
            ['Database System Concepts', 'Abraham Silberschatz', 'Computer Science', '978-0073523309', 4, 3]
        );
        const b2Id = b2Result.insertId;

        const [b3Result] = await db.query(
            'INSERT INTO library_books (title, author, category, isbn, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?)',
            ['The Art of Electronics', 'Paul Horowitz', 'Electrical', '978-0521809269', 3, 3]
        );
        const b3Id = b3Result.insertId;

        // Borrows
        // Alice borrowed Book 1
        await db.query(
            'INSERT INTO library_borrows (student_id, book_id, issue_date, due_date, return_date, status, fine_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [s1UserId, b1Id, '2026-06-01', '2026-06-15', null, 'borrowed', 0.00]
        );
        // Bob borrowed Book 2 and returned it
        await db.query(
            'INSERT INTO library_borrows (student_id, book_id, issue_date, due_date, return_date, status, fine_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [s2UserId, b2Id, '2026-05-15', '2026-05-29', '2026-05-28', 'returned', 0.00]
        );

        console.log('Seeded library catalogs and transactions.');

        // 13. Seed No Dues
        await db.query(
            'INSERT INTO no_dues (student_id, library_dues, hostel_dues, sports_dues, accounts_dues, status) VALUES (?, ?, ?, ?, ?, ?)',
            [s1UserId, 'cleared', 'pending', 'cleared', 'pending', 'pending']
        );
        await db.query(
            'INSERT INTO no_dues (student_id, library_dues, hostel_dues, sports_dues, accounts_dues, status) VALUES (?, ?, ?, ?, ?, ?)',
            [s2UserId, 'cleared', 'cleared', 'cleared', 'cleared', 'cleared']
        );
        await db.query(
            'INSERT INTO no_dues (student_id, library_dues, hostel_dues, sports_dues, accounts_dues, status) VALUES (?, ?, ?, ?, ?, ?)',
            [s3UserId, 'pending', 'pending', 'pending', 'pending', 'pending']
        );

        console.log('Seeded no dues status records.');

        // 14. Seed Transport Routes
        const [r1Result] = await db.query(
            'INSERT INTO transport_routes (route_name, bus_number, driver_name, driver_phone, stops) VALUES (?, ?, ?, ?, ?)',
            ['Route 1 - East Bengaluru Express', 'KA-03-EM-8821', 'Mr. Johnathan Baker', '+91 90000 55555', 'Hebbal (7:00 AM) -> Hennur (7:20 AM) -> Silk Board (7:50 AM) -> College Campus (8:20 AM)']
        );
        const r1Id = r1Result.insertId;

        const [r2Result] = await db.query(
            'INSERT INTO transport_routes (route_name, bus_number, driver_name, driver_phone, stops) VALUES (?, ?, ?, ?, ?)',
            ['Route 2 - South Bengaluru Shuttle', 'KA-05-SP-4412', 'Mr. Ramesh Shinde', '+91 90000 44444', 'JP Nagar (7:10 AM) -> Jayanagar (7:30 AM) -> Koramangala (7:50 AM) -> College Campus (8:25 AM)']
        );
        const r2Id = r2Result.insertId;

        // Transport Enrollment
        await db.query(
            'INSERT INTO student_transport (student_id, route_id) VALUES (?, ?)',
            [s1UserId, r1Id]
        );
        await db.query(
            'INSERT INTO student_transport (student_id, route_id) VALUES (?, ?)',
            [s2UserId, r2Id]
        );

        console.log('Seeded transport routes and enrollments.');

        // 15. Seed Support Tickets
        await db.query(
            'INSERT INTO support_tickets (student_id, title, category, description, status) VALUES (?, ?, ?, ?, ?)',
            [s1UserId, 'Wi-Fi connectivity dropouts in Room 101', 'IT', 'The student network connection drops every 10 minutes in the Satpura A-Block.', 'open']
        );
        await db.query(
            'INSERT INTO support_tickets (student_id, title, category, description, status) VALUES (?, ?, ?, ?, ?)',
            [s2UserId, 'Incorrect grade entry for Database Lab', 'Academic', 'Prof. Jones typed in B- in the portal but my grade card shows a different scale. Requesting review.', 'resolved']
        );

        // 16. Seed Infrastructure Maintenance Tickets
        await db.query(
            'INSERT INTO infrastructure_tickets (student_id, location_type, location_name, issue_description, status) VALUES (?, ?, ?, ?, ?)',
            [s1UserId, 'classroom', 'Room 101', 'The whiteboard is cracked on the right corner, making it hard to read formulas.', 'open']
        );

        console.log('Seeded helpdesk support tickets.');

        // 17. Seed Placements / Careers
        const [p1Result] = await db.query(
            'INSERT INTO career_placements (company_name, job_title, eligibility, package_lpa, deadline, description) VALUES (?, ?, ?, ?, ?, ?)',
            ['Google India', 'Software Development Engineer (SDE)', 'CGPA >= 8.0, Computer Science or Electrical branch, No active backlogs.', 28.50, '2026-07-10', 'Full-time engineer position under the Core Systems and Cloud teams based in Bengaluru/Hyderabad. Coding rounds begin in mid-July.']
        );
        const p1Id = p1Result.insertId;

        const [p2Result] = await db.query(
            'INSERT INTO career_placements (company_name, job_title, eligibility, package_lpa, deadline, description) VALUES (?, ?, ?, ?, ?, ?)',
            ['Deloitte Consulting', 'Technology Analyst', 'CGPA >= 6.5, Any Engineering major, strong logical reasoning and communication skills.', 9.20, '2026-07-25', 'Associate consultant roles involving enterprise software integrations, advisory, and solution delivery. Open for all branches.']
        );
        const p2Id = p2Result.insertId;

        // Seed Applications
        // Alice applied to Google
        await db.query(
            'INSERT INTO career_applications (student_id, placement_id, status, application_date) VALUES (?, ?, ?, ?)',
            [s1UserId, p1Id, 'interviewing', '2026-06-10']
        );
        // Bob applied to Deloitte
        await db.query(
            'INSERT INTO career_applications (student_id, placement_id, status, application_date) VALUES (?, ?, ?, ?)',
            [s2UserId, p2Id, 'applied', '2026-06-11']
        );

        console.log('Seeded career placements.');
        console.log('Seeding database completed successfully!');
    } catch (err) {
        console.error('Seeding database failed:', err);
    } finally {
        process.exit();
    }
}

seed();

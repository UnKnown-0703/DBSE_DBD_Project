-- College ERP Database Schema

CREATE DATABASE IF NOT EXISTS college_erp;
USE college_erp;

-- 1. Users Table (Core authentication and profile info)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'student') NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT
);

-- 3. Students Table (Extends users table)
CREATE TABLE IF NOT EXISTS students (
    user_id INT PRIMARY KEY,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    department_id INT NOT NULL,
    enrollment_year INT NOT NULL,
    semester INT DEFAULT 1,
    current_gpa DECIMAL(3, 2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 4. Faculty Table (Extends users table)
CREATE TABLE IF NOT EXISTS faculty (
    user_id INT PRIMARY KEY,
    faculty_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    department_id INT NOT NULL,
    designation VARCHAR(50) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 5. Courses Table (Course catalog definition)
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    credits INT NOT NULL,
    department_id INT NOT NULL,
    description TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 6. Course Offerings Table (Specific classes taught in a semester)
CREATE TABLE IF NOT EXISTS course_offerings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    faculty_id INT NOT NULL,
    semester INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    schedule VARCHAR(100) NOT NULL, -- e.g. "Mon/Wed 10:00 AM - 11:30 AM"
    classroom VARCHAR(50) NOT NULL,
    exam_date DATE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(user_id) ON DELETE CASCADE
);

-- 7. Enrollments Table (Students registered for course offerings)
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_offering_id INT NOT NULL,
    grade VARCHAR(5) DEFAULT NULL, -- e.g. A, B, C, D, F, or NULL if not graded yet
    status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_offering (student_id, course_offering_id)
);

-- 8. Attendance Table (Daily attendance tracker)
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_offering_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance_record (student_id, course_offering_id, date)
);

-- 9. Announcements Table (Campus notices)
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    target_role ENUM('all', 'faculty', 'student') DEFAULT 'all',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Fees Table (Invoices and payment records)
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    fee_type VARCHAR(100) NOT NULL, -- e.g. "Tuition Fee Sem 3", "Hostel Fee"
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
    payment_method VARCHAR(50) DEFAULT NULL,
    transaction_id VARCHAR(100) DEFAULT NULL,
    payment_date TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- 11. Hostels Table (Hostel room assets)
CREATE TABLE IF NOT EXISTS hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    block_name VARCHAR(50) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    occupied INT DEFAULT 0,
    warden_name VARCHAR(100) NOT NULL,
    warden_phone VARCHAR(20) NOT NULL,
    UNIQUE KEY unique_block_room (block_name, room_number)
);

-- 12. Hostel Bookings Table (Student room allotments)
CREATE TABLE IF NOT EXISTS hostel_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    hostel_id INT NOT NULL,
    booking_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_hostel_booking (student_id) -- A student can only have 1 active booking/request
);

-- 13. Library Books Table (Library inventory)
CREATE TABLE IF NOT EXISTS library_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    isbn VARCHAR(30) UNIQUE NOT NULL,
    total_copies INT NOT NULL,
    available_copies INT NOT NULL
);

-- 14. Library Borrows Table (Student checked-out books)
CREATE TABLE IF NOT EXISTS library_borrows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    book_id INT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE DEFAULT NULL,
    status ENUM('borrowed', 'returned') DEFAULT 'borrowed',
    fine_amount DECIMAL(6, 2) DEFAULT 0.00,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE
);

-- 15. No Dues Clearance Table (Digital clearance status)
CREATE TABLE IF NOT EXISTS no_dues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL UNIQUE,
    library_dues ENUM('pending', 'cleared') DEFAULT 'pending',
    hostel_dues ENUM('pending', 'cleared') DEFAULT 'pending',
    sports_dues ENUM('pending', 'cleared') DEFAULT 'pending',
    accounts_dues ENUM('pending', 'cleared') DEFAULT 'pending',
    status ENUM('pending', 'cleared') DEFAULT 'pending',
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- 16. Transport Routes Table (Bus management)
CREATE TABLE IF NOT EXISTS transport_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    bus_number VARCHAR(20) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    stops TEXT NOT NULL
);

-- 17. Student Transport Enrollment Table
CREATE TABLE IF NOT EXISTS student_transport (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL UNIQUE,
    route_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE
);

-- 18. Support Tickets Table (IT and admin helpdesk)
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('IT', 'Academic', 'Hostel', 'Other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- 19. Infrastructure Maintenance Tickets Table
CREATE TABLE IF NOT EXISTS infrastructure_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    location_type ENUM('classroom', 'lab', 'canteen', 'sports') NOT NULL,
    location_name VARCHAR(50) NOT NULL,
    issue_description TEXT NOT NULL,
    status ENUM('open', 'resolved') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- 20. Placements Table (Career job listings)
CREATE TABLE IF NOT EXISTS career_placements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    eligibility TEXT NOT NULL,
    package_lpa DECIMAL(4, 2) NOT NULL,
    deadline DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Career Applications Table (Student job applications)
CREATE TABLE IF NOT EXISTS career_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    placement_id INT NOT NULL,
    status ENUM('applied', 'interviewing', 'selected', 'rejected') DEFAULT 'applied',
    application_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (placement_id) REFERENCES career_placements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_placement (student_id, placement_id)
);

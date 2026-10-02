# College ERP Dashboard: A Unified Academic & Operations Management Portal

An integrated, role-based educational ERP platform designed to unify university administrative workflows, academic scheduling, attendance tracking, fee settlements, campus housing, digital library checkouts, transport routes, placement drives, and digital No Dues clearance.

Developed for **KLH Bachupally Campus, Department of Computer Science & Engineering**  
Course: **Database Systems Engineering and Distributed Backend Development (25CS1302E)**  
Academic Program: **PBL 2026-27**  
**Team ID:** 5 | **Section:** S5

---

## 👥 Project Team & Guidance
* **T.B.S. Sunil** (`2520030605`)
* **V. Prem Kumar** (`2520030479`)

**Project Guide & Mentor:**  
**Dr. D. Ramya Krishna**, Professor / Faculty Mentor, Department of Computer Science and Engineering  
Portfolio: [ramyakrishnad.github.io](https://ramyakrishnad.github.io/)

---

## 📑 Project Documentation
The comprehensive academic project documentation (matching the university 109-page format, rubrics, and guide evaluation criteria) is available in both Word and Markdown formats:
* **Word Document (Exact 109 Pages - `.docx`):** [`College_ERP_Project_Report_109_Pages.docx`](./College_ERP_Project_Report_109_Pages.docx)
* **Markdown Document (`.md`):** [`College_ERP_Documentation.md`](./College_ERP_Documentation.md)
* **Project Presentation (`.pptx`):** [`College_ERP_Dashboard_Presentation.pptx`](./College_ERP_Dashboard_Presentation.pptx)

---

## 🚀 Key Features

### 🎓 1. Student Workspace (15+ Sub-modules)
* **Real-time Attendance Tracker:** Course-wise attendance percentages, attended/total classes, and warning badges if attendance dips below 75%.
* **Academic Schedule:** Dynamic weekly timetable showing course codes, timing, classrooms, and instructors.
* **Continuous Evaluation & CGPA:** Real-time view of grade cards, internal assessment scores, and GPA metrics.
* **Fee Invoicing & Checkout:** Invoices for tuition/hostel fees with interactive online payment simulation and transaction receipts.
* **Digital 'No Dues' Clearance:** Live dashboard displaying clearance indicators across Library, Hostel, Sports, and Accounts.
* **Examination Hall Ticket:** Dynamic admit card generation with subject schedules and financial clearance seals.
* **Campus Facilities:** Digital library book search and borrow logs, hostel room allocations, and bus transport routes.
* **Career Placements:** Corporate recruitment drives, eligibility rules, salary packages (LPA), and direct applications.
* **Two-Tier Helpdesk:** Incident ticketing for IT/academic support and physical infrastructure repairs.

### 👨‍🏫 2. Faculty Advisory Console
* **Assigned Teaching Portfolios:** Direct access to course offerings, syllabi, and student rosters.
* **Daily Attendance Logger Grid:** Matrix view allowing instructors to submit and update daily student presence in seconds.
* **Continuous Grade Entry:** Streamlined input panel for recording internal and end-term letter grades.
* **Student Onboarding & De-registration:** Register department students or remove withdrawn students with cascading database cleanup.
* **Digital No Dues Clearance Matrix:** One-click toggles to grant departmental clearances for library, hostel, sports, and accounts.
* **Attendance Defaulters Filter:** Dynamic filter isolating students falling below the statutory 75% attendance threshold.

### 🏛️ 3. Centralized Administrator Console
* **Macro Institutional KPIs:** Real-time metrics tracking total students, active faculty, courses, departments, and active complaints.
* **User Directory Management (CRUD):** Complete control over Students, Faculty, and Admin accounts.
* **Master Course Catalog:** Add, edit, and delete academic courses and credit allocations across all departments.
* **Campus Announcements Broadcast:** Multi-tier official notice broadcasting filtered by target audience.
* **Bulk Spreadsheet Onboarding:** Batch ingestion of students and faculty via Excel (`.xlsx`) files with atomic database transactions.

---

## 🛠️ Technology Stack
* **Frontend:** React 19, Vite, React Router v7, React Context API, Tailwind CSS, Lucide-React
* **Backend:** Node.js, Express.js, JWT (JSON Web Tokens), BcryptJS
* **Database:** MySQL 8.0 (21 normalized tables with `ON DELETE CASCADE` referential integrity)
* **Spreadsheet Engine:** SheetJS (`xlsx`) for batch user import
* **Testing:** Postman, Newman CLI, Chrome DevTools
* **Automation:** PowerShell scripts (`run-db.ps1`, `start-project.ps1`) and Windows Batch launchers

---

## ⚡ Quickstart Guide

### 1. Start Local MySQL Database
Run PowerShell as Administrator in the project root:
```powershell
.\run-db.ps1
```

### 2. Seed Database Schema & Demo Data
In a separate terminal, navigate to the `server` directory:
```bash
cd server
npm run seed
```

### 3. Launch Full-Stack Application
In the project root, execute:
```powershell
.\start-project.ps1
```
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📋 Default Test Accounts
* **Admin:** `admin@college.edu` / `AdminPassword123`
* **Faculty (Dr. Prasad Babu):** `prasadbabu@college.edu` / `Prasadbabu123` *(or `FacultyPassword123`)*
* **Student (T.B.S. Sunil):** `sunil@college.edu` (Roll No: `2520030605`) / `SunilPassword123` *(or `StudentPassword123`)*

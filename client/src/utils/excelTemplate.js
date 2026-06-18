import * as XLSX from 'xlsx';

export const downloadStudentTemplate = () => {
  const headers = [
    {
      name: "Alice Johnson",
      email: "alice.johnson@college.edu",
      password: "Password123", // Optional: if empty, default to Roll Number
      phone: "+91 98765 00001",
      date_of_birth: "2005-01-20", // YYYY-MM-DD
      roll_number: "CSE2026101",
      enrollment_year: 2026,
      semester: 1,
      department_code: "CSE" // Must match an existing department code e.g. CSE, EE
    }
  ];

  const ws = XLSX.utils.json_to_sheet(headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Student Template");
  
  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // name
    { wch: 30 }, // email
    { wch: 15 }, // password
    { wch: 18 }, // phone
    { wch: 15 }, // date_of_birth
    { wch: 15 }, // roll_number
    { wch: 18 }, // enrollment_year
    { wch: 10 }, // semester
    { wch: 18 }  // department_code
  ];

  XLSX.writeFile(wb, "student_import_template.xlsx");
};

export const downloadFacultyTemplate = () => {
  const headers = [
    {
      name: "Dr. Sarah Smith",
      email: "sarah.smith@college.edu",
      password: "Password123", // Optional: if empty, default to Employee ID
      phone: "+91 77777 66666",
      date_of_birth: "1980-12-12",
      employee_id: "EMP2026001",
      designation: "Assistant Professor",
      qualification: "Ph.D. in Computer Science",
      department_code: "CSE"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Faculty Template");

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // name
    { wch: 30 }, // email
    { wch: 15 }, // password
    { wch: 18 }, // phone
    { wch: 15 }, // date_of_birth
    { wch: 15 }, // employee_id
    { wch: 22 }, // designation
    { wch: 25 }, // qualification
    { wch: 18 }  // department_code
  ];

  XLSX.writeFile(wb, "faculty_import_template.xlsx");
};

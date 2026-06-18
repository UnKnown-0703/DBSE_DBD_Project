import xlsxwriter
import os

def generate_samples():
    project_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Generate Student Sample Excel
    student_file = os.path.join(project_dir, 'student_sample.xlsx')
    student_wb = xlsxwriter.Workbook(student_file)
    student_ws = student_wb.add_worksheet('Students')
    
    student_headers = ['name', 'email', 'password', 'phone', 'date_of_birth', 'roll_number', 'enrollment_year', 'semester', 'department_code']
    student_data = [
        ['Sujai Kumar', 'sujai.student@gmail.com', 'Welcome123', '+91 94400 01065', '2005-05-25', 'CSE25200305', 2026, 1, 'CSE'],
        ['Alice Miller', 'alice.miller@college.edu', 'Welcome123', '+91 98765 00010', '2005-01-20', 'CSE25200306', 2026, 1, 'CSE'],
        ['Bob Davis', 'bob.davis@college.edu', 'Welcome123', '+91 98765 00011', '2004-11-05', 'EE25200301', 2026, 1, 'EE']
    ]
    
    # Format headers (bold and colored background)
    header_format = student_wb.add_format({
        'bold': True,
        'bg_color': '#3B82F6',
        'color': '#FFFFFF',
        'border': 1
    })
    
    # Set column widths
    student_ws.set_column('A:B', 25)
    student_ws.set_column('C:E', 15)
    student_ws.set_column('F:F', 18)
    student_ws.set_column('G:I', 15)
    
    # Write student headers
    for col, header in enumerate(student_headers):
        student_ws.write(0, col, header, header_format)
        
    # Write student data
    for row, row_data in enumerate(student_data):
        for col, val in enumerate(row_data):
            student_ws.write(row + 1, col, val)
            
    student_wb.close()
    print(f"Generated Student Import Sample: {student_file}")

    # 2. Generate Faculty Sample Excel
    faculty_file = os.path.join(project_dir, 'faculty_sample.xlsx')
    faculty_wb = xlsxwriter.Workbook(faculty_file)
    faculty_ws = faculty_wb.add_worksheet('Faculty')
    
    faculty_headers = ['name', 'email', 'password', 'phone', 'date_of_birth', 'employee_id', 'designation', 'qualification', 'department_code']
    faculty_data = [
        ['Dr. Alan Turing', 'prof.turing@college.edu', 'Welcome123', '+91 77777 66661', '1975-06-23', 'EMP2026501', 'Professor', 'Ph.D. in Mathematics', 'CSE'],
        ['Dr. Sarah Smith', 'prof.smith@college.edu', 'Welcome123', '+91 77777 66662', '1980-12-12', 'EMP2026502', 'Associate Professor', 'Ph.D. in Electrical Engineering', 'EE']
    ]
    
    # Format headers (bold and colored background)
    fac_header_format = faculty_wb.add_format({
        'bold': True,
        'bg_color': '#10B981',
        'color': '#FFFFFF',
        'border': 1
    })
    
    # Set column widths
    faculty_ws.set_column('A:B', 25)
    faculty_ws.set_column('C:E', 15)
    faculty_ws.set_column('F:F', 18)
    faculty_ws.set_column('G:I', 20)
    
    # Write faculty headers
    for col, header in enumerate(faculty_headers):
        faculty_ws.write(0, col, header, fac_header_format)
        
    # Write faculty data
    for row, row_data in enumerate(faculty_data):
        for col, val in enumerate(row_data):
            faculty_ws.write(row + 1, col, val)
            
    faculty_wb.close()
    print(f"Generated Faculty Import Sample: {faculty_file}")

if __name__ == "__main__":
    generate_samples()

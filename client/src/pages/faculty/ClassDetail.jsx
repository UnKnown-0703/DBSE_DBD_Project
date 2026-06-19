import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Check, Calendar, Award, CheckSquare, Save, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const ClassDetail = () => {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);

  // Tabs: "attendance" or "grades"
  const [activeTab, setActiveTab] = useState('attendance');

  // Attendance marking states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSuccess, setAttendanceSuccess] = useState('');

  // Grading states
  const [gradingStudentId, setGradingStudentId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('A');
  const [gradingSuccess, setGradingSuccess] = useState('');

  const fetchClassRoster = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch roster
      const response = await fetch(`http://127.0.0.1:5000/api/faculty/classes/${offeringId}/students`, { headers });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setStudents(data);

      // Initialize attendance records (defaulting all students to present)
      const initialRecords = {};
      data.forEach(s => {
        initialRecords[s.user_id] = 'present';
      });
      setAttendanceRecords(initialRecords);

      // Extract course header details from teaching schedule list
      const coursesRes = await fetch('http://127.0.0.1:5000/api/faculty/courses', { headers });
      const coursesData = await coursesRes.json();
      const course = coursesData.find(c => c.id === parseInt(offeringId));
      if (course) setCourseDetails(course);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching roster:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassRoster();
  }, [offeringId]);

  // Toggle present/absent state
  const handleToggleAttendance = (studentId) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  // Submit attendance list
  const handleSaveAttendance = async () => {
    setAttendanceError('');
    setAttendanceSuccess('');

    const recordsPayload = Object.keys(attendanceRecords).map(userId => ({
      student_id: parseInt(userId),
      status: attendanceRecords[userId]
    }));

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/faculty/classes/${offeringId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: attendanceDate,
          records: recordsPayload
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setAttendanceSuccess('Attendance roster saved successfully.');
      fetchClassRoster(); // Refresh stats percentages
    } catch (err) {
      setAttendanceError(err.message || 'Error saving attendance.');
    }
  };

  // Submit student grade
  const handleSaveGrade = async (studentId) => {
    setGradingSuccess('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/faculty/classes/${offeringId}/grades`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: studentId,
          grade: selectedGrade
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setGradingSuccess('Grade updated successfully.');
      setGradingStudentId(null);
      fetchClassRoster(); // Refresh list to show new grades and GPA
    } catch (err) {
      alert(err.message || 'Error updating grade.');
    }
  };

  const handleExportExcel = () => {
    if (!students || students.length === 0) {
      alert("No students registered in this class roster to export.");
      return;
    }

    // Format data for sheet
    const formatted = students.map(s => {
      const pct = s.total_count > 0 ? (s.present_count / s.total_count) * 100 : 100.0;
      return {
        'Roll Number': s.roll_number,
        'Student Name': s.name,
        'Email Address': s.email,
        'Attendance Percentage': `${pct.toFixed(1)}%`,
        'Present Count': s.present_count,
        'Total Classes': s.total_count,
        'Assigned Grade': s.grade || 'Not Graded',
        'Status': s.enrollment_status
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Roster');

    // Generate buffer & trigger download
    const filename = `${courseDetails?.course_code || 'Class'}_Roster.xlsx`.replace(/\s+/g, '_');
    XLSX.writeFile(workbook, filename);
  };

  if (loading) {
    return <div style={styles.loading}>Loading student records...</div>;
  }

  return (
    <div className="main-content">
      {/* Header Back Button */}
      <button onClick={() => navigate('/faculty/dashboard')} style={styles.backBtn}>
        <ArrowLeft size={16} />
        <span>Back to Classes</span>
      </button>

      <div className="header-row" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={styles.pageTitle} className="title-gradient">
            {courseDetails?.course_name || 'Class Administration'}
          </h1>
          <p style={styles.pageSubtitle}>
            {courseDetails?.course_code} • {courseDetails?.schedule} • {courseDetails?.classroom}
          </p>
        </div>
        <button onClick={handleExportExcel} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileSpreadsheet size={16} />
          <span>Export Roster to Excel</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{ ...styles.tab, ...(activeTab === 'attendance' ? styles.tabActive : {}) }}
        >
          <CheckSquare size={16} />
          <span>Daily Attendance</span>
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          style={{ ...styles.tab, ...(activeTab === 'grades' ? styles.tabActive : {}) }}
        >
          <Award size={16} />
          <span>Evaluation & Gradebook</span>
        </button>
      </div>

      {/* Attendance Workspace */}
      {activeTab === 'attendance' && (
        <div className="glass-card" style={styles.card}>
          <div style={styles.attendanceHeader}>
            <div style={styles.dateSelector}>
              <Calendar size={18} style={{ color: 'var(--secondary)' }} />
              <span style={styles.label}>Select Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="input-field"
                style={styles.dateInput}
              />
            </div>

            <button onClick={handleSaveAttendance} className="btn btn-primary">
              <Save size={16} />
              <span>Save Attendance</span>
            </button>
          </div>

          {attendanceError && <div className="alert alert-danger" style={{ marginTop: '1rem' }}>{attendanceError}</div>}
          {attendanceSuccess && <div className="alert alert-success" style={{ marginTop: '1rem' }}>{attendanceSuccess}</div>}

          <div className="table-container" style={{ marginTop: '1.5rem' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Overall Attendance</th>
                  <th style={{ textAlign: 'center' }}>Mark Status (Present / Absent)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isPresent = attendanceRecords[student.user_id] === 'present';
                  const pct = student.total_count > 0 ? (student.present_count / student.total_count) * 100 : 100.0;
                  return (
                    <tr key={student.user_id}>
                      <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>{student.roll_number}</td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{student.name}</td>
                      <td>{student.email}</td>
                      <td>
                        <span className={`badge ${pct >= 75.0 ? 'badge-success' : 'badge-danger'}`}>
                          {pct.toFixed(1)}% ({student.present_count}/{student.total_count})
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleAttendance(student.user_id)}
                          style={{
                            ...styles.toggleBtn,
                            ...(isPresent ? styles.toggleBtnPresent : styles.toggleBtnAbsent)
                          }}
                        >
                          {isPresent ? 'Present' : 'Absent'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gradebook Workspace */}
      {activeTab === 'grades' && (
        <div className="glass-card" style={styles.card}>
          <h3 style={styles.cardTitle}>Student Grades Roster</h3>
          <p style={styles.cardDesc}>Enter end-term evaluations. Grade submissions update student CGPA averages immediately.</p>
          
          {gradingSuccess && <div className="alert alert-success">{gradingSuccess}</div>}

          <div className="table-container" style={{ marginTop: '1.25rem' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Assigned Grade</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.user_id}>
                    <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>{student.roll_number}</td>
                    <td style={{ fontWeight: '600', color: '#fff' }}>{student.name}</td>
                    <td>{student.email}</td>
                    <td>
                      {gradingStudentId === student.user_id ? (
                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="input-field"
                          style={styles.gradeSelect}
                        >
                          {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`badge ${student.grade ? 'badge-info' : 'badge-danger'}`} style={styles.gradeBadge}>
                          {student.grade || 'Not Graded'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {gradingStudentId === student.user_id ? (
                        <div style={styles.actionGroup}>
                          <button
                            onClick={() => handleSaveGrade(student.user_id)}
                            className="btn btn-primary"
                            style={styles.actionBtn}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setGradingStudentId(null)}
                            className="btn btn-secondary"
                            style={styles.actionBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setGradingStudentId(student.user_id);
                            setSelectedGrade(student.grade || 'A');
                          }}
                          className="btn btn-secondary"
                          style={styles.editGradeBtn}
                        >
                          Edit Grade
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  loading: {
    padding: '3rem',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
  },
  pageSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    marginTop: '0.2rem',
  },
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    margin: '1.25rem 0',
    borderBottom: '1px solid var(--border-glass)',
    paddingBottom: '0.5rem',
  },
  tab: {
    padding: '0.5rem 1.25rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'var(--transition-smooth)',
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: '#fff',
    borderBottom: '2px solid var(--primary)',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  attendanceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  dateSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  dateInput: {
    width: '180px',
    background: '#131b2e',
    fontSize: '0.9rem',
  },
  toggleBtn: {
    padding: '0.45rem 1.25rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100px',
    transition: 'var(--transition-smooth)',
  },
  toggleBtnPresent: {
    backgroundColor: 'var(--success-bg)',
    color: '#6ee7b7',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  toggleBtnAbsent: {
    backgroundColor: 'var(--error-bg)',
    color: '#fca5a5',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
  },
  cardDesc: {
    fontSize: '0.825rem',
    color: 'var(--text-secondary)',
    marginTop: '0.15rem',
  },
  gradeBadge: {
    fontSize: '0.8rem',
    padding: '0.35rem 0.75rem',
  },
  gradeSelect: {
    width: '90px',
    background: '#131b2e',
    padding: '0.35rem 0.5rem',
    fontSize: '0.85rem',
  },
  editGradeBtn: {
    padding: '0.45rem 1rem',
    fontSize: '0.8rem',
  },
  actionGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
  }
};

export default ClassDetail;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Layers, Plus, X, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const ManageCourses = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('department');
  
  // Lists
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Department Form fields
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Course Form fields
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState('4');
  const [courseDeptId, setCourseDeptId] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  // Offering Form fields
  const [offeringCourseId, setOfferingCourseId] = useState('');
  const [offeringFacultyId, setOfferingFacultyId] = useState('');
  const [offeringSem, setOfferingSem] = useState('3');
  const [offeringYear, setOfferingYear] = useState('2025-2026');
  const [offeringSchedule, setOfferingSchedule] = useState('');
  const [offeringClassroom, setOfferingClassroom] = useState('');
  const [offeringExamDate, setOfferingExamDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const deptsRes = await fetch(`${API_BASE_URL}/api/admin/departments`, { headers });
      const deptsData = await deptsRes.json();
      setDepartments(deptsData);
      if (deptsData.length > 0) {
        setCourseDeptId(deptsData[0].id.toString());
      }

      const coursesRes = await fetch(`${API_BASE_URL}/api/admin/courses`, { headers });
      const coursesData = await coursesRes.json();
      setCourses(coursesData);
      if (coursesData.length > 0) {
        setOfferingCourseId(coursesData[0].id.toString());
      }

      const offeringsRes = await fetch(`${API_BASE_URL}/api/admin/offerings`, { headers });
      const offeringsData = await offeringsRes.json();
      setOfferings(offeringsData);

      // Fetch faculty users list for class offerings registration
      const facultyRes = await fetch(`${API_BASE_URL}/api/admin/users/faculty`, { headers });
      const facultyData = await facultyRes.json();
      setFaculty(facultyData);
      if (facultyData.length > 0) {
        setOfferingFacultyId(facultyData[0].id.toString());
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching academic data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setError('');
    setSuccess('');
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setCourseCode('');
    setCourseName('');
    setCourseDesc('');
    setOfferingSchedule('');
    setOfferingClassroom('');
    setOfferingExamDate('');
    setShowModal(true);
  };

  const handleCreateDepartment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: deptName, code: deptCode, description: deptDesc })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess('Department registered successfully.');
      fetchData();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_code: courseCode,
          name: courseName,
          credits: parseInt(courseCredits),
          department_id: parseInt(courseDeptId),
          description: courseDesc
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess('Course syllabus added to catalog.');
      fetchData();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateOffering = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/offerings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: parseInt(offeringCourseId),
          faculty_id: parseInt(offeringFacultyId),
          semester: parseInt(offeringSem),
          academic_year: offeringYear,
          schedule: offeringSchedule,
          classroom: offeringClassroom,
          exam_date: offeringExamDate
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess('Active class offering registered and scheduled.');
      fetchData();
      setTimeout(() => setShowModal(false), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'department') handleCreateDepartment();
    else if (activeTab === 'course') handleCreateCourse();
    else if (activeTab === 'offering') handleCreateOffering();
  };

  return (
    <div className="main-content">
      <div className="header-row">
        <div>
          <h1 style={styles.pageTitle} className="title-gradient">Academics & Courses</h1>
          <p style={styles.pageSubtitle}>Configure college curriculum and assign schedules</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add {activeTab === 'department' ? 'Department' : activeTab === 'course' ? 'Course' : 'Offering'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('department')}
          style={{ ...styles.tab, ...(activeTab === 'department' ? styles.tabActive : {}) }}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab('course')}
          style={{ ...styles.tab, ...(activeTab === 'course' ? styles.tabActive : {}) }}
        >
          Course Catalog
        </button>
        <button
          onClick={() => setActiveTab('offering')}
          style={{ ...styles.tab, ...(activeTab === 'offering' ? styles.tabActive : {}) }}
        >
          Active Class Offerings
        </button>
      </div>

      {/* List Card */}
      <div className="glass-card" style={styles.listCard}>
        {loading ? (
          <div style={styles.loading}>Loading academic syllabus...</div>
        ) : (
          <div className="table-container">
            {activeTab === 'department' && (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Dept Code</th>
                    <th>Department Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>{d.code}</td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{d.name}</td>
                      <td>{d.description || 'No description provided.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'course' && (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credits</th>
                    <th>Department</th>
                    <th>Syllabus Details</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>{c.course_code}</td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{c.name}</td>
                      <td>{c.credits} Credits</td>
                      <td><span className="badge badge-info">{c.department_name}</span></td>
                      <td>{c.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'offering' && (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course Title</th>
                    <th>Faculty Instructor</th>
                    <th>Semester</th>
                    <th>Weekly Schedule</th>
                    <th>Classroom</th>
                    <th>Exam Date</th>
                  </tr>
                </thead>
                <tbody>
                  {offerings.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>{o.course_code}</td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{o.course_name}</td>
                      <td>{o.faculty_name}</td>
                      <td>Semester {o.semester} <span style={{ color: 'var(--text-muted)' }}>({o.academic_year})</span></td>
                      <td>{o.schedule}</td>
                      <td>{o.classroom}</td>
                      <td>{o.exam_date ? new Date(o.exam_date).toLocaleDateString() : 'TBD'}</td>
                    </tr>
                  ))}
                  {offerings.length === 0 && (
                    <tr>
                      <td colSpan={7} style={styles.emptyRow}>No active course offerings registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={styles.modal}>
            <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
              <X size={20} />
            </button>
            
            <h2 style={styles.modalTitle}>
              Add New {activeTab === 'department' ? 'Department' : activeTab === 'course' ? 'Course' : 'Class Offering'}
            </h2>
            <p style={styles.modalDesc}>Fill in the required academic fields below.</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              {error && (
                <div className="alert alert-danger" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
              {success && <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>{success}</div>}

              {activeTab === 'department' && (
                <div style={styles.formGrid}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Department Name</label>
                    <input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Civil Engineering"
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Dept Code (Unique)</label>
                    <input
                      type="text"
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      className="input-field"
                      placeholder="e.g. CIV"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Description</label>
                    <textarea
                      rows="3"
                      value={deptDesc}
                      onChange={(e) => setDeptDesc(e.target.value)}
                      className="input-field"
                      placeholder="Enter a brief summary..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'course' && (
                <div style={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label">Course Code (Unique)</label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="input-field"
                      placeholder="e.g. CSE304"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course Title</label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Web Technologies"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Credits</label>
                    <select
                      value={courseCredits}
                      onChange={(e) => setCourseCredits(e.target.value)}
                      className="input-field"
                      style={{ background: '#131b2e' }}
                    >
                      {['1','2','3','4','5'].map(c => (
                        <option key={c} value={c}>{c} Credits</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      value={courseDeptId}
                      onChange={(e) => setCourseDeptId(e.target.value)}
                      className="input-field"
                      style={{ background: '#131b2e' }}
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Syllabus / Description</label>
                    <textarea
                      rows="3"
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      className="input-field"
                      placeholder="Describe the course curriculum..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'offering' && (
                <div style={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label">Select Course</label>
                    <select
                      value={offeringCourseId}
                      onChange={(e) => setOfferingCourseId(e.target.value)}
                      className="input-field"
                      style={{ background: '#131b2e' }}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.course_code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Faculty Instructor</label>
                    <select
                      value={offeringFacultyId}
                      onChange={(e) => setOfferingFacultyId(e.target.value)}
                      className="input-field"
                      style={{ background: '#131b2e' }}
                    >
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      value={offeringSem}
                      onChange={(e) => setOfferingSem(e.target.value)}
                      className="input-field"
                      style={{ background: '#131b2e' }}
                    >
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <input
                      type="text"
                      value={offeringYear}
                      onChange={(e) => setOfferingYear(e.target.value)}
                      className="input-field"
                      placeholder="2025-2026"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Schedule Timings</label>
                    <input
                      type="text"
                      value={offeringSchedule}
                      onChange={(e) => setOfferingSchedule(e.target.value)}
                      className="input-field"
                      placeholder="Mon/Wed 10:00 AM - 11:30 AM"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Classroom / Lab Location</label>
                    <input
                      type="text"
                      value={offeringClassroom}
                      onChange={(e) => setOfferingClassroom(e.target.value)}
                      className="input-field"
                      placeholder="Room 302 / Lab A"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Exam Date (Optional)</label>
                    <input
                      type="date"
                      value={offeringExamDate}
                      onChange={(e) => setOfferingExamDate(e.target.value)}
                      className="input-field"
                      style={{ background: '#131b2e' }}
                    />
                  </div>
                </div>
              )}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
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
    marginBottom: '1.25rem',
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
    transition: 'var(--transition-smooth)',
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: '#fff',
    borderBottom: '2px solid var(--primary)',
  },
  listCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: 'var(--text-secondary)',
  },
  emptyRow: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  modal: {
    maxWidth: '550px',
  },
  closeBtn: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  modalTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#fff',
  },
  modalDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginTop: '0.15rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
  }
};

export default ManageCourses;

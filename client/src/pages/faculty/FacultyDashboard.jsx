import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  ArrowRight, 
  Bell, 
  User, 
  Clock, 
  CheckCircle, 
  Save,
  Trash2,
  Upload,
  FileSpreadsheet,
  X,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { downloadStudentTemplate } from '../../utils/excelTemplate';

const FacultyDashboard = () => {
  const { token, user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Tabs: 'teaching', 'advisory', 'profile'
  const [activeTab, setActiveTab] = useState('teaching');
  
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advisory States
  const [nodues, setNodues] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  
  // Profile / Peers States
  const [peers, setPeers] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Edit Profile States
  const [phone, setPhone] = useState(user?.phone || '');
  const [qualification, setQualification] = useState(user?.qualification || '');
  
  // Register Student Modal & Form States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentDob, setNewStudentDob] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentEnrollYear, setNewStudentEnrollYear] = useState(new Date().getFullYear().toString());
  const [newStudentSemester, setNewStudentSemester] = useState('1');
  const [registeringStudent, setRegisteringStudent] = useState(false);

  // Bulk upload states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUsers, setBulkUsers] = useState([]);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Course Offering States
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [offeringSemester, setOfferingSemester] = useState('1');
  const [offeringAcademicYear, setOfferingAcademicYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear()+1}`);
  const [offeringSchedule, setOfferingSchedule] = useState('');
  const [offeringClassroom, setOfferingClassroom] = useState('');
  const [offeringExamDate, setOfferingExamDate] = useState('');
  const [offeringSubmitting, setOfferingSubmitting] = useState(false);
  const [offeringError, setOfferingError] = useState('');
  const [offeringSuccess, setOfferingSuccess] = useState('');

  // Feedback Messages
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch teaching dashboard data on mount
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch courses taught
        const coursesRes = await fetch('http://127.0.0.1:5000/api/faculty/courses', { headers });
        if (coursesRes.status === 401 || coursesRes.status === 403) {
          logout();
          navigate('/login');
          return;
        }
        const coursesData = await coursesRes.json();
        if (Array.isArray(coursesData)) {
          setCourses(coursesData);
        } else {
          setCourses([]);
        }

        // Fetch notices for faculty
        const announceRes = await fetch('http://127.0.0.1:5000/api/admin/announcements', { headers });
        if (announceRes.status === 401 || announceRes.status === 403) {
          logout();
          navigate('/login');
          return;
        }
        const announceData = await announceRes.json();
        if (Array.isArray(announceData)) {
          setAnnouncements(announceData.filter(a => a.target_role === 'all' || a.target_role === 'faculty'));
        } else {
          setAnnouncements([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching faculty data:', err);
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [token]);

  // Fetch data dynamically based on active tab
  useEffect(() => {
    if (activeTab === 'advisory') {
      fetchAdvisoryData();
    } else if (activeTab === 'profile') {
      fetchProfileData();
    }
    setSuccess('');
    setError('');
  }, [activeTab]);

  const fetchAdvisoryData = async () => {
    setAdvisoryLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch department student No Dues records
      const noduesRes = await fetch('http://127.0.0.1:5000/api/faculty/department/nodues', { headers });
      if (noduesRes.status === 401 || noduesRes.status === 403) {
        logout();
        navigate('/login');
        return;
      }
      const noduesData = await noduesRes.json();
      if (Array.isArray(noduesData)) {
        setNodues(noduesData);
      } else {
        setNodues([]);
      }

      // Fetch department academic support tickets
      const ticketRes = await fetch('http://127.0.0.1:5000/api/faculty/department/tickets', { headers });
      if (ticketRes.status === 401 || ticketRes.status === 403) {
        logout();
        navigate('/login');
        return;
      }
      const ticketData = await ticketRes.json();
      if (Array.isArray(ticketData)) {
        setTickets(ticketData);
      } else {
        setTickets([]);
      }

      setAdvisoryLoading(false);
    } catch (err) {
      console.error('Error fetching advisory data:', err);
      setAdvisoryLoading(false);
    }
  };

  const fetchProfileData = async () => {
    setProfileLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const peersRes = await fetch('http://127.0.0.1:5000/api/faculty/department/peers', { headers });
      if (peersRes.status === 401 || peersRes.status === 403) {
        logout();
        navigate('/login');
        return;
      }
      const peersData = await peersRes.json();
      if (Array.isArray(peersData)) {
        setPeers(peersData);
      } else {
        setPeers([]);
      }
      setProfileLoading(false);
    } catch (err) {
      console.error('Error fetching peers data:', err);
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/faculty/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone, qualification })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Update auth context state and localstorage
      updateProfile({ phone, qualification });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Error updating profile.');
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    setSuccess('');
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/faculty/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Update locally
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      setSuccess('Support ticket status updated.');
    } catch (err) {
      setError(err.message || 'Error updating ticket status.');
    }
  };

  const handleToggleDue = async (studentId, category, currentStatus) => {
    setSuccess('');
    setError('');
    const record = nodues.find(n => n.student_id === studentId);
    if (!record) return;

    const payload = {
      library_dues: record.library_dues,
      hostel_dues: record.hostel_dues,
      sports_dues: record.sports_dues,
      accounts_dues: record.accounts_dues
    };
    payload[category] = currentStatus === 'cleared' ? 'pending' : 'cleared';

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/faculty/nodues/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const allCleared = payload.library_dues === 'cleared' &&
                         payload.hostel_dues === 'cleared' &&
                         payload.sports_dues === 'cleared' &&
                         payload.accounts_dues === 'cleared';

      setNodues(prev => prev.map(n => n.student_id === studentId ? { ...n, ...payload, status: allCleared ? 'cleared' : 'pending' } : n));
      setSuccess('Student dues clearance updated.');
    } catch (err) {
      setError(err.message || 'Error updating dues.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;
    setSuccess('');
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/faculty/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setTickets(prev => prev.filter(t => t.id !== ticketId));
      setSuccess('Support ticket deleted successfully.');
    } catch (err) {
      setError(err.message || 'Error deleting support ticket.');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from your department directory? This will delete their database user account.')) return;
    setSuccess('');
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/faculty/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setNodues(prev => prev.filter(n => n.student_id !== studentId));
      setSuccess('Student removed from department roster successfully.');
    } catch (err) {
      setError(err.message || 'Error removing student.');
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setRegisteringStudent(true);

    const payload = {
      name: newStudentName,
      email: newStudentEmail,
      password: newStudentPassword,
      role: 'student',
      phone: newStudentPhone,
      date_of_birth: newStudentDob || null,
      department_id: user.department_id, // Faculty member's own department
      roll_number: newStudentRoll,
      enrollment_year: parseInt(newStudentEnrollYear) || new Date().getFullYear(),
      semester: parseInt(newStudentSemester) || 1
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess(`Student ${newStudentName} registered successfully!`);
      setShowRegisterModal(false);
      
      // Reset form
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPassword('');
      setNewStudentPhone('');
      setNewStudentDob('');
      setNewStudentRoll('');
      setNewStudentEnrollYear(new Date().getFullYear().toString());
      setNewStudentSemester('1');

      // Refresh student list
      fetchAdvisoryData();
    } catch (err) {
      setError(err.message || 'Error registering student.');
    } finally {
      setRegisteringStudent(false);
    }
  };

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkFile(file);
    setBulkError('');
    setBulkSuccess('');
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          throw new Error('The uploaded file is empty.');
        }

        // Quick verification of columns
        const firstRow = data[0];
        const requiredFields = ['name', 'email', 'roll_number'];

        for (const field of requiredFields) {
          if (!(field in firstRow) && !(field.toUpperCase() in firstRow)) {
            throw new Error(`Missing required column: "${field}"`);
          }
        }

        // Standardize keys (lowercase)
        const standardized = data.map(item => {
          const newItem = {};
          Object.keys(item).forEach(key => {
            newItem[key.toLowerCase()] = item[key];
          });
          newItem.role = 'student';
          return newItem;
        });

        setBulkUsers(standardized);
      } catch (err) {
        setBulkError(err.message || 'Failed to parse Excel file. Check format.');
        setBulkUsers([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (bulkUsers.length === 0) {
      setBulkError('No valid student records to import.');
      return;
    }

    setBulkSubmitting(true);
    setBulkError('');
    setBulkSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/bulk/bulk-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ users: bulkUsers })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setBulkSuccess(data.message || 'Students imported successfully!');
      setBulkUsers([]);
      setBulkFile(null);
      fetchAdvisoryData();

      setTimeout(() => {
        setShowBulkModal(false);
      }, 1500);
    } catch (err) {
      setBulkError(err.message || 'Error executing bulk registration.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('http://127.0.0.1:5000/api/faculty/courses/catalog', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (Array.isArray(data)) {
        setCatalog(data);
        if (data.length > 0) {
          setSelectedCatalogId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching course catalog:', err);
      setOfferingError('Failed to load course catalog.');
    }
  };

  const handleCreateOffering = async (e) => {
    e.preventDefault();
    if (!selectedCatalogId) {
      setOfferingError('Please select a course from the catalog.');
      return;
    }
    setOfferingSubmitting(true);
    setOfferingError('');
    setOfferingSuccess('');

    const payload = {
      course_id: parseInt(selectedCatalogId),
      semester: parseInt(offeringSemester),
      academic_year: offeringAcademicYear,
      schedule: offeringSchedule,
      classroom: offeringClassroom,
      exam_date: offeringExamDate || null
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/faculty/courses/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setOfferingSuccess('Course offering created successfully!');
      
      // Refresh teaching courses list
      const coursesRes = await fetch('http://127.0.0.1:5000/api/faculty/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      }

      // Reset offering form fields
      setOfferingSchedule('');
      setOfferingClassroom('');
      setOfferingExamDate('');
      
      setTimeout(() => {
        setShowOfferingModal(false);
        setOfferingSuccess('');
      }, 1500);
    } catch (err) {
      setOfferingError(err.message || 'Error creating course offering.');
    } finally {
      setOfferingSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Faculty Dashboard...</div>;
  }

  return (
    <div className="main-content">
      <div className="header-row">
        <div>
          <h1 style={styles.pageTitle} className="title-gradient">Welcome, {user.name}</h1>
          <p style={styles.pageSubtitle}>
            {user.designation} • {user.department_name} ({user.department_code})
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('teaching')}
          style={{ ...styles.tab, ...(activeTab === 'teaching' ? styles.tabActive : {}) }}
        >
          <BookOpen size={16} />
          <span>Teaching Portfolio</span>
        </button>
        <button
          onClick={() => setActiveTab('advisory')}
          style={{ ...styles.tab, ...(activeTab === 'advisory' ? styles.tabActive : {}) }}
        >
          <Users size={16} />
          <span>Department Advisory</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{ ...styles.tab, ...(activeTab === 'profile' ? styles.tabActive : {}) }}
        >
          <User size={16} />
          <span>My Profile & Peers</span>
        </button>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}
      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Teaching Portfolio View */}
      {activeTab === 'teaching' && (
        <div style={styles.twoColumnGrid}>
          {/* Left Column: Teaching Schedule Classes */}
          <div style={styles.column}>
            <div className="glass-card" style={styles.moduleCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={styles.sectionTitle}>Your Assigned Classes</h3>
                <button 
                  onClick={() => {
                    setShowOfferingModal(true);
                    fetchCatalog();
                  }}
                  className="btn btn-primary" 
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                >
                  + Add Course Offering
                </button>
              </div>
              <p style={styles.sectionDesc}>Select a class offering below to manage student attendance logs and grading sheets.</p>
              
              <div style={styles.coursesList}>
                {courses.map((course) => (
                  <div key={course.id} style={styles.courseItem} className="glass-card">
                    <div style={styles.courseHeader}>
                      <div style={styles.courseBadge}>
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h4 style={styles.courseCode}>{course.course_code}</h4>
                        <h3 style={styles.courseName}>{course.course_name}</h3>
                      </div>
                    </div>
                    
                    <div style={styles.courseInfoGrid}>
                      <div style={styles.infoCol}>
                        <span style={styles.infoLabel}>Weekly Schedule</span>
                        <span style={styles.infoVal}>{course.schedule}</span>
                      </div>
                      <div style={styles.infoCol}>
                        <span style={styles.infoLabel}>Classroom</span>
                        <span style={styles.infoVal}>{course.classroom}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/faculty/class/${course.id}`)}
                      className="btn btn-primary"
                      style={styles.manageBtn}
                    >
                      <span>Manage Class</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
                {courses.length === 0 && (
                  <p style={styles.emptyText}>You are not currently assigned to teach any classes this semester.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Notices Panel */}
          <div style={styles.column}>
            <div className="glass-card" style={styles.moduleCard}>
              <div style={styles.noticesHeader}>
                <Bell size={18} style={{ color: 'var(--secondary)' }} />
                <h3>Faculty Announcements</h3>
              </div>

              <div style={styles.announcementList}>
                {announcements.map((ann) => (
                  <div key={ann.id} style={styles.announceItem}>
                    <div style={styles.announceMeta}>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        {ann.target_role}
                      </span>
                      <span style={styles.announceDate}>
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={styles.announceTitle}>{ann.title}</h4>
                    <p style={styles.announceContent}>{ann.content}</p>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p style={styles.emptyText}>No active faculty announcements.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Advisory View */}
      {activeTab === 'advisory' && (
        <div style={styles.twoColumnGrid}>
          {/* Left Column: Academic Support Tickets */}
          <div style={styles.column}>
            <div className="glass-card" style={styles.moduleCard}>
              <h3 style={styles.sectionTitle}>Academic Support Tickets</h3>
              <p style={styles.sectionDesc}>Address and resolve academic queries raised by students in your department.</p>

              {advisoryLoading ? (
                <p style={styles.emptyText}>Loading advisory dashboard...</p>
              ) : (
                <div style={styles.ticketList}>
                  {tickets.map(t => (
                    <div key={t.id} style={styles.ticketItem} className="glass-card">
                      <div style={styles.ticketHeader}>
                        <span style={styles.ticketStudent}>{t.student_name} ({t.roll_number})</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge ${
                            t.status === 'resolved' ? 'badge-success' : 
                            t.status === 'in_progress' ? 'badge-info' : 'badge-danger'
                          }`}>
                            {t.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <button 
                            onClick={() => handleDeleteTicket(t.id)}
                            style={styles.deleteIconBtn}
                            title="Delete Support Ticket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 style={styles.ticketTitle}>{t.title}</h4>
                      <p style={styles.ticketDescText}>{t.description}</p>
                      
                      {t.status !== 'resolved' && (
                        <div style={styles.ticketActions}>
                          {t.status === 'open' && (
                            <button 
                              onClick={() => handleUpdateTicketStatus(t.id, 'in_progress')}
                              className="btn btn-secondary" 
                              style={styles.actionBtn}
                            >
                              <Clock size={14} />
                              <span>Set In Progress</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateTicketStatus(t.id, 'resolved')}
                            className="btn btn-primary" 
                            style={styles.actionBtn}
                          >
                            <CheckCircle size={14} />
                            <span>Mark Resolved</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p style={styles.emptyText}>No academic support tickets raised by department students.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Students No Dues Directory */}
          <div style={styles.column}>
            <div className="glass-card" style={styles.moduleCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={styles.sectionTitle}>Department Digital Clearance</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setShowBulkModal(true)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                  >
                    Bulk Import
                  </button>
                  <button 
                    onClick={() => setShowRegisterModal(true)}
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                  >
                    + Register Student
                  </button>
                </div>
              </div>
              <p style={styles.sectionDesc}>View and toggle student No Dues statuses. Click a pill to change status, or use the trash icon to delete student.</p>
              
              {advisoryLoading ? (
                <p style={styles.emptyText}>Loading clearance directory...</p>
              ) : (
                <div style={styles.studentList}>
                  {nodues.map(s => (
                    <div key={s.student_id} style={styles.studentItem}>
                      <div style={styles.studentMeta}>
                        <h4 style={styles.studentName}>{s.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={styles.studentRoll}>{s.roll_number}</span>
                          <button 
                            onClick={() => handleDeleteStudent(s.student_id)}
                            style={styles.deleteIconBtn}
                            title="Remove Student from System"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div style={styles.studentDetailRow}>
                        <span>Semester {s.semester}</span>
                        <span className={`badge ${s.status === 'cleared' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                          Clearance: {s.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div style={styles.duesGrid}>
                        <button 
                          onClick={() => handleToggleDue(s.student_id, 'library_dues', s.library_dues)}
                          style={{
                            ...styles.dueBadge,
                            ...(s.library_dues === 'cleared' ? styles.dueBadgeCleared : styles.dueBadgePending)
                          }}
                          title="Click to toggle Library Dues status"
                        >
                          Library
                        </button>
                        <button 
                          onClick={() => handleToggleDue(s.student_id, 'hostel_dues', s.hostel_dues)}
                          style={{
                            ...styles.dueBadge,
                            ...(s.hostel_dues === 'cleared' ? styles.dueBadgeCleared : styles.dueBadgePending)
                          }}
                          title="Click to toggle Hostel Dues status"
                        >
                          Hostel
                        </button>
                        <button 
                          onClick={() => handleToggleDue(s.student_id, 'sports_dues', s.sports_dues)}
                          style={{
                            ...styles.dueBadge,
                            ...(s.sports_dues === 'cleared' ? styles.dueBadgeCleared : styles.dueBadgePending)
                          }}
                          title="Click to toggle Sports Dues status"
                        >
                          Sports
                        </button>
                        <button 
                          onClick={() => handleToggleDue(s.student_id, 'accounts_dues', s.accounts_dues)}
                          style={{
                            ...styles.dueBadge,
                            ...(s.accounts_dues === 'cleared' ? styles.dueBadgeCleared : styles.dueBadgePending)
                          }}
                          title="Click to toggle Accounts Dues status"
                        >
                          Accounts
                        </button>
                      </div>
                    </div>
                  ))}
                  {nodues.length === 0 && (
                    <p style={styles.emptyText}>No students registered in your department.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Profile & Peers View */}
      {activeTab === 'profile' && (
        <div style={styles.twoColumnGrid}>
          {/* Left Column: Edit Profile */}
          <div style={styles.column}>
            <div className="glass-card" style={styles.moduleCard}>
              <h3 style={styles.sectionTitle}>Update Advisor Profile</h3>
              <p style={styles.sectionDesc}>Edit your contact information and qualification details.</p>
              
              <form onSubmit={handleUpdateProfile} style={styles.form}>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    value={user.employee_id}
                    className="input-field"
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="text"
                    value={user.email}
                    className="input-field"
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)' }}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Qualification Details</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                  <Save size={16} />
                  <span>Save Profile Updates</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Peers Directory */}
          <div style={styles.column}>
            <div className="glass-card" style={styles.moduleCard}>
              <h3 style={styles.sectionTitle}>Department Faculty Peers</h3>
              <p style={styles.sectionDesc}>Directory of other instructors in your department.</p>

              {profileLoading ? (
                <p style={styles.emptyText}>Loading peer list...</p>
              ) : (
                <div style={styles.peerList}>
                  {peers.map(p => (
                    <div key={p.id} style={styles.peerItem}>
                      <div style={styles.peerHeader}>
                        <h4 style={styles.peerName}>{p.name}</h4>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{p.designation}</span>
                      </div>
                      <p style={styles.peerQual}>{p.qualification}</p>
                      <p style={styles.peerContact}>{p.email} • {p.phone || 'No phone'}</p>
                    </div>
                  ))}
                  {peers.length === 0 && (
                    <p style={styles.emptyText}>No other faculty registered in this department.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Student Modal */}
      {showRegisterModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card" style={styles.modalContent}>
            <h3 style={styles.sectionTitle}>Register New Student</h3>
            <p style={styles.sectionDesc}>Add a new student directly into your department roster.</p>
            
            <form onSubmit={handleRegisterStudent} style={styles.form}>
              <div style={styles.formGrid2}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    value={newStudentRoll}
                    onChange={(e) => setNewStudentRoll(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    value={newStudentDob}
                    onChange={(e) => setNewStudentDob(e.target.value)}
                    className="input-field"
                    style={{ background: '#131b2e' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Enrollment Year</label>
                  <input
                    type="text"
                    value={newStudentEnrollYear}
                    onChange={(e) => setNewStudentEnrollYear(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    value={newStudentSemester}
                    onChange={(e) => setNewStudentSemester(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowRegisterModal(false)} 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={registeringStudent}
                >
                  {registeringStudent ? 'Registering...' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Bulk Student Import */}
      {showBulkModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card" style={{ ...styles.modalContent, maxWidth: '650px' }}>
            <button onClick={() => { setShowBulkModal(false); setBulkUsers([]); setBulkFile(null); }} style={styles.closeBtn}>
              <X size={20} />
            </button>
            <h3 style={styles.sectionTitle}>Bulk Student Import (Excel)</h3>
            <p style={styles.sectionDesc}>Download the template, fill it out, and upload to register multiple students directly in your department.</p>

            <div style={styles.templateDownloads}>
              <button onClick={downloadStudentTemplate} className="btn btn-secondary" style={styles.templateBtn}>
                <FileSpreadsheet size={16} />
                <span>Student Template</span>
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bulkError && (
                <div className="alert alert-danger" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>
                  <AlertTriangle size={16} />
                  <span>{bulkError}</span>
                </div>
              )}
              {bulkSuccess && <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>{bulkSuccess}</div>}

              <div className="form-group">
                <label className="form-label">Choose Excel File</label>
                <div style={styles.fileInputWrapper}>
                  <Upload size={18} style={styles.fileIcon} />
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleBulkFileChange}
                    style={styles.fileInput}
                    required={!bulkFile}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {bulkFile ? bulkFile.name : 'Select .xlsx or .xls file'}
                  </span>
                </div>
              </div>

              {bulkUsers.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#fff' }}>
                    Previewing {bulkUsers.length} Students
                  </h4>
                  <div style={styles.previewContainer}>
                    <table style={styles.previewTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Roll Number</th>
                          <th>Sem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkUsers.slice(0, 5).map((u, index) => (
                          <tr key={index}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.roll_number}</td>
                            <td>{u.semester || 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bulkUsers.length > 5 && (
                      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                        ... and {bulkUsers.length - 5} more students
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => { setShowBulkModal(false); setBulkUsers([]); setBulkFile(null); }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={bulkSubmitting || bulkUsers.length === 0}
                >
                  {bulkSubmitting ? 'Importing...' : `Import ${bulkUsers.length} Students`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Course Offering */}
      {showOfferingModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-card" style={styles.modalContent}>
            <button onClick={() => setShowOfferingModal(false)} style={styles.closeBtn}>
              <X size={20} />
            </button>
            <h3 style={styles.sectionTitle}>Add Course Offering</h3>
            <p style={styles.sectionDesc}>Create a new class offering for your department this semester.</p>

            <form onSubmit={handleCreateOffering} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {offeringError && <div className="alert alert-danger" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>{offeringError}</div>}
              {offeringSuccess && <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>{offeringSuccess}</div>}

              <div className="form-group">
                <label className="form-label">Select Course</label>
                <select
                  value={selectedCatalogId}
                  onChange={(e) => setSelectedCatalogId(e.target.value)}
                  className="input-field"
                  required
                >
                  {catalog.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} - {c.name} ({c.credits} Credits)
                    </option>
                  ))}
                  {catalog.length === 0 && (
                    <option value="">No courses available in department catalog</option>
                  )}
                </select>
              </div>

              <div style={styles.formGrid2}>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={offeringSemester}
                    onChange={(e) => setOfferingSemester(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2025-2026"
                    value={offeringAcademicYear}
                    onChange={(e) => setOfferingAcademicYear(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Weekly Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Mon/Wed 10:00 AM - 11:30 AM"
                  value={offeringSchedule}
                  onChange={(e) => setOfferingSchedule(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div style={styles.formGrid2}>
                <div className="form-group">
                  <label className="form-label">Classroom</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101"
                    value={offeringClassroom}
                    onChange={(e) => setOfferingClassroom(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Exam Date</label>
                  <input
                    type="date"
                    value={offeringExamDate}
                    onChange={(e) => setOfferingExamDate(e.target.value)}
                    className="input-field"
                    style={{ background: '#131b2e' }}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowOfferingModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={offeringSubmitting || catalog.length === 0}
                >
                  {offeringSubmitting ? 'Creating...' : 'Create Offering'}
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
  loading: {
    padding: '3rem',
    textAlign: 'center',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
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
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  moduleCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#fff',
  },
  sectionDesc: {
    fontSize: '0.825rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
    marginTop: '0.15rem',
  },
  coursesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  courseItem: {
    padding: '1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  courseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  courseBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--secondary)',
  },
  courseCode: {
    fontSize: '0.8rem',
    color: 'var(--secondary)',
    fontWeight: '700',
  },
  courseName: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#fff',
  },
  courseInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '0.75rem',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  infoVal: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    marginTop: '0.15rem',
  },
  manageBtn: {
    padding: '0.65rem',
    fontSize: '0.85rem',
    width: '100%',
  },
  noticesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
  },
  announcementList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  announceItem: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  announceMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  announceDate: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  announceTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  announceContent: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '2rem 1rem',
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
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  ticketItem: {
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderRadius: 'var(--radius-md)',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketStudent: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--secondary)',
  },
  ticketTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
  },
  ticketDescText: {
    fontSize: '0.825rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  ticketActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  actionBtn: {
    padding: '0.4rem 0.75rem',
    fontSize: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  studentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  studentItem: {
    padding: '0.85rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  studentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  studentRoll: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--secondary)',
  },
  studentDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  studentContact: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  peerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  peerItem: {
    padding: '0.85rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  peerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peerName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  peerQual: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  peerContact: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  duesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '0.4rem',
    marginTop: '0.5rem',
  },
  dueBadge: {
    padding: '0.35rem 0.2rem',
    borderRadius: '4px',
    fontSize: '0.725rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    border: '1px solid transparent',
    transition: 'var(--transition-smooth)',
  },
  dueBadgeCleared: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#34d399',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  dueBadgePending: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#f87171',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  deleteIconBtn: {
    background: 'transparent',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    padding: '0.2rem',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-smooth)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  modalContent: {
    maxWidth: '560px',
    width: '100%',
    backgroundColor: '#0c101d',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: '2rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
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
  templateDownloads: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
  },
  templateBtn: {
    padding: '0.5rem 0.85rem',
    fontSize: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  fileInputWrapper: {
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius)',
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.01)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  fileIcon: {
    color: 'var(--primary)',
  },
  fileInput: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  previewContainer: {
    maxHeight: '180px',
    overflowY: 'auto',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  previewTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.75rem',
    textAlign: 'left',
  }
};

export default FacultyDashboard;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Bell, Calendar, GraduationCap, CreditCard, Building2, Clock, 
  BookOpen, UserCheck, AlertTriangle, Briefcase, Award, MapPin, 
  User, CheckCircle, Ticket, ShieldAlert, AlertOctagon, Printer, 
  CheckSquare, Wrench, Send, Book, BookmarkCheck, RefreshCw, Phone, LifeBuoy,
  Download, FileText, HelpCircle
} from 'lucide-react';

const StudentWorkspace = ({ tab }) => {
  const { token, user, updateProfile } = useContext(AuthContext);

  // Shared Data States
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [coursesCatalog, setCoursesCatalog] = useState([]);
  const [fees, setFees] = useState([]);
  const [hostelInfo, setHostelInfo] = useState(null);
  const [hallticketInfo, setHallticketInfo] = useState(null);
  const [infraTickets, setInfraTickets] = useState([]);
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [libraryBorrows, setLibraryBorrows] = useState([]);
  const [noDuesInfo, setNoDuesInfo] = useState(null);
  const [transportInfo, setTransportInfo] = useState(null);
  const [supportTickets, setSupportTickets] = useState([]);
  const [registrationOffered, setRegistrationOffered] = useState([]);
  const [grades, setGrades] = useState([]);
  const [studentMaterials, setStudentMaterials] = useState([]);
  const [studentQuizzes, setStudentQuizzes] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState([]);

  // Form & Interaction States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [payMethod, setPayMethod] = useState('Net Banking');
  const [payCardNum, setPayCardNum] = useState('');
  const [processingPay, setProcessingPay] = useState(false);

  // Profile Form
  const [phoneInput, setPhoneInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Helpdesk forms
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCat, setTicketCat] = useState('IT');
  const [ticketDesc, setTicketDesc] = useState('');
  const [infraLocType, setInfraLocType] = useState('classroom');
  const [infraLocName, setInfraLocName] = useState('');
  const [infraDesc, setInfraDesc] = useState('');

  const loadAllData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Profile
      const profileRes = await fetch('http://127.0.0.1:5000/api/student/profile', { headers });
      const profileData = await profileRes.json();
      setProfile(profileData);
      setPhoneInput(profileData.phone || '');
      setDobInput(profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '');

      // Notices
      const announceRes = await fetch('http://127.0.0.1:5000/api/admin/announcements', { headers });
      const announceData = await announceRes.json();
      setAnnouncements(announceData.filter(a => a.target_role === 'all' || a.target_role === 'student'));

      // Timetable
      const timetableRes = await fetch('http://127.0.0.1:5000/api/student/timetable', { headers });
      const timetableData = await timetableRes.json();
      setTimetable(timetableData);

      // Attendance
      const attendanceRes = await fetch('http://127.0.0.1:5000/api/student/attendance', { headers });
      const attendanceData = await attendanceRes.json();
      setAttendanceSummary(attendanceData.summary || []);
      setAttendanceLogs(attendanceData.logs || []);

      // Placements
      const placementsRes = await fetch('http://127.0.0.1:5000/api/student/placements', { headers });
      const placementsData = await placementsRes.json();
      setPlacements(placementsData);

      // Courses Catalog
      const coursesRes = await fetch('http://127.0.0.1:5000/api/student/courses', { headers });
      const coursesData = await coursesRes.json();
      setCoursesCatalog(coursesData);

      // Fees
      const feesRes = await fetch('http://127.0.0.1:5000/api/student/fees', { headers });
      const feesData = await feesRes.json();
      setFees(feesData);

      // Hostel info
      const hostelRes = await fetch('http://127.0.0.1:5000/api/student/hostel', { headers });
      const hostelData = await hostelRes.json();
      setHostelInfo(hostelData);

      // Hallticket
      const htRes = await fetch('http://127.0.0.1:5000/api/student/hallticket', { headers });
      const htData = await htRes.json();
      setHallticketInfo(htData);

      // Infra tickets
      const infraRes = await fetch('http://127.0.0.1:5000/api/student/infra-tickets', { headers });
      const infraData = await infraRes.json();
      setInfraTickets(infraData);

      // Library checkouts
      const borrowsRes = await fetch('http://127.0.0.1:5000/api/student/library/borrows', { headers });
      const borrowsData = await borrowsRes.json();
      setLibraryBorrows(borrowsData);

      // No dues clearance
      const ndRes = await fetch('http://127.0.0.1:5000/api/student/nodue', { headers });
      const ndData = await ndRes.json();
      setNoDuesInfo(ndData);

      // Transport route
      const transRes = await fetch('http://127.0.0.1:5000/api/student/transport', { headers });
      const transData = await transRes.json();
      setTransportInfo(transData);

      // Helpdesk support tickets
      const ticketsRes = await fetch('http://127.0.0.1:5000/api/student/support-tickets', { headers });
      const ticketsData = await ticketsRes.json();
      setSupportTickets(ticketsData);

      // offered registration courses
      const regOfferedRes = await fetch('http://127.0.0.1:5000/api/student/registration/offered', { headers });
      const regOfferedData = await regOfferedRes.json();
      setRegistrationOffered(regOfferedData);

      // Library books catalog
      const libBooksRes = await fetch('http://127.0.0.1:5000/api/student/library/books', { headers });
      const libBooksData = await libBooksRes.json();
      setLibraryBooks(libBooksData);

      // Academic GPA and grades
      const gpaRes = await fetch('http://127.0.0.1:5000/api/student/academics/gpa', { headers });
      const gpaData = await gpaRes.json();
      setGrades(Array.isArray(gpaData) ? gpaData : []);

      // Materials, Quizzes & Assignments published by faculty
      try {
        const mats = JSON.parse(localStorage.getItem('erp_global_materials') || '[]');
        setStudentMaterials(mats);
        const qzs = JSON.parse(localStorage.getItem('erp_global_published_quizzes') || '[]');
        setStudentQuizzes(qzs);
        const asg = JSON.parse(localStorage.getItem('erp_global_assignments') || '[]');
        setStudentAssignments(asg);
      } catch (e) {
        console.error('Error loading materials/quizzes bridge:', e);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading workspace data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [tab]);

  // Flash Alert Helpers
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };
  const triggerError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // 1. Enrollment
  const handleEnroll = async (offeringId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/student/registration/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ offeringId })
      });
      if (!response.ok) throw new Error('Enrollment failed.');
      triggerSuccess('Registered for course successfully.');
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  const handleDrop = async (offeringId) => {
    if (!window.confirm('Drop course?')) return;
    try {
      const response = await fetch('http://127.0.0.1:5000/api/student/registration/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ offeringId })
      });
      if (!response.ok) throw new Error('Drop failed.');
      triggerSuccess('Course dropped.');
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  // 2. Placements
  const handleApplyPlacement = async (driveId, company) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/student/placements/${driveId}/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Apply failed.');
      triggerSuccess(`Applied for ${company} successfully.`);
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  // 3. Pay Dues Simulation
  const handlePayFee = (fee) => {
    setSelectedFee(fee);
    setPaySuccess('');
    setShowPayModal(true);
  };

  const [paySuccess, setPaySuccess] = useState('');
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setProcessingPay(true);
    setTimeout(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/student/fees/${selectedFee.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ paymentMethod: payMethod })
        });
        const data = await response.json();
        if (response.ok) {
          setPaySuccess(`Payment cleared! Invoice TXN ID: ${data.transactionId}`);
          loadAllData();
          setTimeout(() => setShowPayModal(false), 2000);
        }
      } catch (err) { triggerError('Payment failed.'); }
      finally { setProcessingPay(false); }
    }, 1500);
  };

  // 4. Hostel Booking
  const handleBookHostel = async (hostelId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/student/hostel/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hostelId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      triggerSuccess(data.message);
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  // 5. Library Searches & Checkout simulation
  const handleLibrarySearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/student/library/books?search=${searchQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLibraryBooks(data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleLibraryBorrow = async (bookId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/student/library/borrow/${bookId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      triggerSuccess('Book checked out from library. Return in 14 days.');
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  const handleLibraryReturn = async (borrowId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/student/library/return/${borrowId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      triggerSuccess('Book returned to library inventory.');
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  // 6. Transport routes selector
  const handleEnrollTransport = async (routeId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/student/transport/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ routeId })
      });
      if (!response.ok) throw new Error('Route selector failed.');
      triggerSuccess('Bus route seat allocation updated.');
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  // 7. IT Support ticket
  const handlePostTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/student/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: ticketTitle, category: ticketCat, description: ticketDesc })
      });
      if (!response.ok) throw new Error('Helpdesk ticket submission failed.');
      triggerSuccess('Support ticket submitted to helpdesk.');
      setTicketTitle('');
      setTicketDesc('');
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  // 8. Facilities complaints
  const handlePostInfraComplaint = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/api/student/infra-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ locationType: infraLocType, locationName: infraLocName, issueDescription: infraDesc })
      });
      if (!response.ok) throw new Error('Facilities complaint failed.');
      triggerSuccess('Maintenance ticket registered successfully.');
      setInfraLocName('');
      setInfraDesc('');
      loadAllData();
    } catch (err) { triggerError(err.message); }
  };

  // 9. Profile settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone: phoneInput, date_of_birth: dobInput })
      });
      if (response.ok) {
        updateProfile({ phone: phoneInput, date_of_birth: dobInput });
        triggerSuccess('Contact information updated in profile.');
        loadAllData();
      }
    } catch (err) { triggerError('Profile update failed.'); }
    finally { setSavingProfile(false); }
  };

  if (loading) {
    return <div style={styles.loading}>Synchronizing student records...</div>;
  }

  // Attendance metrics
  let totalPres = 0, totalCls = 0;
  attendanceSummary.forEach(s => { totalPres += s.present_count; totalCls += s.total_count; });
  const globalAttendancePct = totalCls > 0 ? (totalPres / totalCls) * 100 : 100.0;
  const unpaidFeeCount = fees.filter(f => f.status === 'unpaid').length;

  return (
    <div className="main-content">
      {/* Notifications banner */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {/* RENDER DYNAMIC WORKSPACE COMPONENT PANEL */}
      
      {/* 1. STUDENT DASHBOARD (HOME) */}
      {tab === 'dashboard' && (
        <div>
          <div className="header-row">
            <div>
              <h1 className="title-gradient">Student Workspace</h1>
              <p style={styles.sub}>Roll No: {profile?.roll_number} • Semester {profile?.semester} • {profile?.department_name}</p>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="glass-card" style={styles.dashCard}>
              <span style={styles.dashLabel}>Cumulative CGPA</span>
              <h2 style={styles.dashVal}>{parseFloat(profile?.current_gpa || 0).toFixed(2)}</h2>
            </div>
            <div className="glass-card" style={styles.dashCard}>
              <span style={styles.dashLabel}>Global Attendance</span>
              <h2 style={{ ...styles.dashVal, color: globalAttendancePct >= 75 ? 'var(--success)' : 'var(--error)' }}>
                {globalAttendancePct.toFixed(1)}%
              </h2>
            </div>
            <div className="glass-card" style={styles.dashCard}>
              <span style={styles.dashLabel}>Pending Bills</span>
              <h2 style={styles.dashVal}>{unpaidFeeCount}</h2>
            </div>
            <div className="glass-card" style={styles.dashCard}>
              <span style={styles.dashLabel}>Hostel Assigned</span>
              <h2 style={{ ...styles.dashVal, fontSize: '1.2rem', marginTop: '0.5rem' }}>
                {hostelInfo?.activeBooking ? `${hostelInfo.activeBooking.block_name} ${hostelInfo.activeBooking.room_number}` : 'None'}
              </h2>
            </div>
          </div>

          <div style={styles.splitGrid}>
            <div className="glass-card">
              <h3 style={styles.panelTitle}>Notice Feed</h3>
              <div style={styles.scroller}>
                {announcements.map(notice => (
                  <div key={notice.id} style={styles.listItem}>
                    <div style={styles.metaRow}>
                      <span className="badge badge-info">{notice.target_role}</span>
                      <span style={styles.mutedText}>{new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 style={styles.itemTitle}>{notice.title}</h4>
                    <p style={styles.itemDesc}>{notice.content}</p>
                  </div>
                ))}
                {announcements.length === 0 && <p style={styles.emptyText}>No recent notices from office.</p>}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={styles.panelTitle}>Timetable Timeline</h3>
              <div style={styles.scroller}>
                {timetable.map(c => (
                  <div key={c.id} style={styles.listItem}>
                    <span style={styles.timeTag}>{c.schedule}</span>
                    <h4 style={styles.itemTitle}>{c.course_name} ({c.course_code})</h4>
                    <p style={styles.itemDesc}>Classroom: {c.classroom} • Instructor: {c.faculty_name}</p>
                  </div>
                ))}
                {timetable.length === 0 && <p style={styles.emptyText}>No lectures registered.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACADEMIC REGISTRATION */}
      {tab === 'registration' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Available Course Offerings</h3>
            <div style={styles.scroller}>
              {registrationOffered.map(c => (
                <div key={c.id} style={styles.listItemFlex}>
                  <div>
                    <span style={styles.timeTag}>{c.course_code} • {c.credits} Credits</span>
                    <h4 style={styles.itemTitle}>{c.course_name}</h4>
                    <p style={styles.itemDesc}>{c.schedule} • {c.classroom}</p>
                  </div>
                  <button onClick={() => handleEnroll(c.id)} className="btn btn-primary">Enroll</button>
                </div>
              ))}
              {registrationOffered.length === 0 && <p style={styles.emptyText}>No offered classes in this semester.</p>}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Enrolled Classes</h3>
            <div style={styles.scroller}>
              {timetable.map(c => (
                <div key={c.id} style={styles.listItemFlex}>
                  <div>
                    <span style={styles.timeTag}>{c.course_code}</span>
                    <h4 style={styles.itemTitle}>{c.course_name}</h4>
                    <p style={styles.itemDesc}>Instructor: {c.faculty_name}</p>
                  </div>
                  <button onClick={() => handleDrop(c.id)} className="btn btn-danger">Drop</button>
                </div>
              ))}
              {timetable.length === 0 && <p style={styles.emptyText}>Enroll in offered classes to register.</p>}
            </div>
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE REGISTER */}
      {tab === 'attendance' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Course-wise Percentages</h3>
            <div style={styles.scroller}>
              {attendanceSummary.map(c => {
                const pct = c.total_count > 0 ? (c.present_count / c.total_count) * 100 : 100.0;
                return (
                  <div key={c.offering_id} style={styles.listItem}>
                    <div style={styles.metaRow}>
                      <h4 style={styles.itemTitle}>{c.course_name} ({c.course_code})</h4>
                      <strong style={{ color: pct >= 75 ? 'var(--success)' : 'var(--error)' }}>{pct.toFixed(1)}%</strong>
                    </div>
                    <p style={styles.itemDesc}>Marked: {c.present_count} present out of {c.total_count} sessions.</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Check-in History Logs</h3>
            <div style={styles.scroller}>
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr><th>Date</th><th>Course</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.map((log, i) => (
                      <tr key={i}>
                        <td>{new Date(log.date).toLocaleDateString()}</td>
                        <td>{log.course_code}</td>
                        <td><span className={`badge ${log.status === 'present' ? 'badge-success' : 'badge-danger'}`}>{log.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CAREER CHOICE / PLACEMENTS */}
      {tab === 'careers' && (
        <div style={styles.splitGrid}>
          {placements.map(drive => {
            const applied = !!drive.application_status;
            return (
              <div key={drive.id} className="glass-card" style={styles.careerCard}>
                <h3 style={styles.itemTitle}>{drive.company_name}</h3>
                <h4 style={styles.careerDesg}>{drive.job_title}</h4>
                <div style={styles.careerMeta}>
                  <span>CTC: {drive.package_lpa} LPA</span>
                  <span>Criteria: {drive.eligibility}</span>
                </div>
                <p style={styles.itemDesc} style={{ margin: '0.75rem 0', fontSize: '0.8rem' }}>{drive.description}</p>
                {applied ? (
                  <span className="badge badge-success" style={{ width: '100%', textAlign: 'center', padding: '0.5rem' }}>
                    APPLIED ({drive.application_status})
                  </span>
                ) : (
                  <button onClick={() => handleApplyPlacement(drive.id, drive.company_name)} className="btn btn-primary" style={{ width: '100%' }}>
                    Apply Placement
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. COURSES CATALOG, MATERIALS & QUIZZES */}
      {tab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={styles.panelTitle}>Department Course Catalog</h3>
            <div style={styles.splitGrid}>
              {coursesCatalog.map(c => (
                <div key={c.id} className="glass-card">
                  <span style={styles.timeTag}>{c.course_code} • {c.credits} Credits</span>
                  <h3 style={{ ...styles.itemTitle, margin: '0.25rem 0 0.5rem 0' }}>{c.name}</h3>
                  <p style={styles.itemDesc}>{c.description || 'Core syllabus details pending board updates.'}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.splitGrid}>
            <div className="glass-card">
              <h3 style={styles.panelTitle}>Lecture Materials & Notes</h3>
              <div style={styles.scroller}>
                {studentMaterials.map(m => (
                  <div key={m.id} style={styles.listItemFlex}>
                    <div>
                      <span className="badge badge-info">{m.category}</span>
                      <h4 style={styles.itemTitle}>{m.title}</h4>
                      <p style={styles.itemDesc}>{m.fileName} • {m.size} • {m.uploadedAt}</p>
                    </div>
                    <a href={m.fileUrl || '#'} download={m.fileName} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Download size={14} /> Download
                    </a>
                  </div>
                ))}
                {studentMaterials.length === 0 && <p style={styles.emptyText}>No materials uploaded yet.</p>}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={styles.panelTitle}>Active Quizzes & Assessments</h3>
              <div style={styles.scroller}>
                {studentQuizzes.map(q => (
                  <div key={q.id} style={styles.listItemFlex}>
                    <div>
                      <span className="badge badge-warning">{q.durationMinutes} Mins</span>
                      <h4 style={styles.itemTitle}>{q.title}</h4>
                      <p style={styles.itemDesc}>Total Marks: {q.totalMarks} • Due: {q.dueDate}</p>
                    </div>
                    <button onClick={() => alert(`Starting Quiz: ${q.title}. Questions: ${q.questions?.length || 0}`)} className="btn btn-primary">
                      Take Quiz
                    </button>
                  </div>
                ))}
                {studentQuizzes.length === 0 && <p style={styles.emptyText}>No published quizzes available.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FEE PAYMENTS */}
      {tab === 'fees' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Pending Invoices</h3>
            <div style={styles.scroller}>
              {fees.filter(f => f.status === 'unpaid').map(fee => (
                <div key={fee.id} style={styles.listItemFlex}>
                  <div>
                    <h4 style={styles.itemTitle}>{fee.fee_type}</h4>
                    <span style={styles.mutedText}>Due: {new Date(fee.due_date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <strong style={styles.itemTitle}>${parseFloat(fee.amount).toFixed(2)}</strong>
                    <button onClick={() => handlePayFee(fee)} className="btn btn-primary">Pay Dues</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Receipt Logs</h3>
            <div style={styles.scroller}>
              {fees.filter(f => f.status === 'paid').map(fee => (
                <div key={fee.id} style={styles.listItem}>
                  <div style={styles.metaRow}>
                    <h4 style={styles.itemTitle}>{fee.fee_type}</h4>
                    <span className="badge badge-success">PAID</span>
                  </div>
                  <p style={styles.itemDesc}>Method: {fee.payment_method} • Amount: ${parseFloat(fee.amount).toFixed(2)}</p>
                  <p style={styles.mutedText} style={{ fontSize: '0.7rem' }}>Receipt Transaction ID: {fee.transaction_id}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. HOSTEL MANAGEMENT */}
      {tab === 'hostels' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Room Allocation</h3>
            {hostelInfo?.activeBooking ? (
              <div style={styles.hostelBox}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <Building2 size={32} style={{ color: 'var(--primary)' }} />
                  <h4 style={{ marginTop: '0.25rem' }}>{hostelInfo.activeBooking.block_name}</h4>
                  <h3>Room {hostelInfo.activeBooking.room_number}</h3>
                </div>
                <div style={styles.metaRow} style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span>Warden Name:</span>
                  <strong>{hostelInfo.activeBooking.warden_name}</strong>
                </div>
                <div style={styles.metaRow} style={{ fontSize: '0.85rem' }}>
                  <span>Warden Phone:</span>
                  <strong>{hostelInfo.activeBooking.warden_phone}</strong>
                </div>
              </div>
            ) : (
              <p style={styles.emptyText}>Lodging request pending. Submit room choice from right list.</p>
            )}
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Campus Dorms Catalog</h3>
            <div style={styles.scroller}>
              {hostelInfo?.availableRooms.map(room => (
                <div key={room.id} style={styles.listItemFlex}>
                  <div>
                    <h4 style={styles.itemTitle}>{room.block_name}</h4>
                    <span style={styles.mutedText}>Room {room.room_number} • Occupancy: {room.occupied}/{room.capacity}</span>
                  </div>
                  <button
                    onClick={() => handleBookHostel(room.id)}
                    className="btn btn-secondary"
                    disabled={room.occupied >= room.capacity || hostelInfo?.activeBooking}
                  >
                    Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. HALLTICKET GENERATION */}
      {tab === 'hallticket' && (
        <div className="glass-card">
          <h3 style={styles.panelTitle}>Examination Admission Slip</h3>
          {hallticketInfo?.eligible ? (
            <div style={styles.slipCard}>
              <div style={styles.slipHeader}>
                <h2>College ERP Seat Card</h2>
                <button onClick={() => window.print()} className="btn btn-secondary"><Printer size={14} /> Print</button>
              </div>
              <div style={styles.slipGrid}>
                <div><strong>Student:</strong> {hallticketInfo.student_name}</div>
                <div><strong>Roll No:</strong> {hallticketInfo.roll_number}</div>
                <div><strong>Exam Seating:</strong> {hallticketInfo.examSeat}</div>
                <div><strong>Branch:</strong> {hallticketInfo.department}</div>
              </div>
              <div className="table-container" style={{ marginTop: '1.5rem' }}>
                <table className="premium-table">
                  <thead><tr><th>Subject</th><th>Exam Date</th><th>Seat Location</th></tr></thead>
                  <tbody>
                    {hallticketInfo.schedule.map((s, i) => (
                      <tr key={i}>
                        <td>{s.course_name} ({s.course_code})</td>
                        <td>{s.exam_date ? new Date(s.exam_date).toLocaleDateString() : 'TBD'}</td>
                        <td>{s.classroom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={styles.debarredBanner}>
              <AlertOctagon size={48} style={{ color: 'var(--error)' }} />
              <h3>ADMISSION CARD BLOCKED</h3>
              <p>Your seat allocation is withheld because attendance in one or more subjects is below 75%.</p>
            </div>
          )}
        </div>
      )}

      {/* 9. INFRASTRUCTURE RELATED COMPLAINTS */}
      {tab === 'infrastructure' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Submit Maintenance Ticket</h3>
            <form onSubmit={handlePostInfraComplaint} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Resource Type</label>
                <select value={infraLocType} onChange={e => setInfraLocType(e.target.value)} className="input-field" style={{ background: '#131b2e' }}>
                  <option value="classroom">Classroom</option>
                  <option value="lab">Science/CS Lab</option>
                  <option value="sports">Athletics gym</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location Room/Block Name</label>
                <input type="text" value={infraLocName} onChange={e => setInfraLocName(e.target.value)} className="input-field" placeholder="Room 101" required />
              </div>
              <div className="form-group">
                <label className="form-label">Detail malfunction</label>
                <textarea rows="3" value={infraDesc} onChange={e => setInfraDesc(e.target.value)} className="input-field" placeholder="Explain issue..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Submit Ticket</button>
            </form>
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Maintenance Logs</h3>
            <div style={styles.scroller}>
              {infraTickets.map(t => (
                <div key={t.id} style={styles.listItem}>
                  <div style={styles.metaRow}>
                    <span className="badge badge-info">{t.location_type}</span>
                    <span className={`badge ${t.status === 'resolved' ? 'badge-success' : 'badge-danger'}`}>{t.status}</span>
                  </div>
                  <h4 style={styles.itemTitle}>{t.location_name}</h4>
                  <p style={styles.itemDesc}>"{t.issue_description}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. LIBRARY WORKSPACE */}
      {tab === 'library' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Search Library Books</h3>
            <form onSubmit={handleLibrarySearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field" placeholder="Search title or author..." />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <div style={styles.scroller}>
              {libraryBooks.map(b => (
                <div key={b.id} style={styles.listItemFlex}>
                  <div>
                    <h4 style={styles.itemTitle}>{b.title}</h4>
                    <span style={styles.mutedText}>Author: {b.author} • Available: {b.available_copies}/{b.total_copies}</span>
                  </div>
                  <button onClick={() => handleLibraryBorrow(b.id)} className="btn btn-secondary" disabled={b.available_copies <= 0}>
                    Borrow
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Checked Out Logs</h3>
            <div style={styles.scroller}>
              {libraryBorrows.map(lb => (
                <div key={lb.id} style={styles.listItem}>
                  <div style={styles.metaRow}>
                    <h4 style={styles.itemTitle}>{lb.title}</h4>
                    <span className={`badge ${lb.status === 'returned' ? 'badge-success' : 'badge-warning'}`}>{lb.status}</span>
                  </div>
                  <p style={styles.itemDesc}>Due: {new Date(lb.due_date).toLocaleDateString()}</p>
                  {lb.status === 'borrowed' && (
                    <button onClick={() => handleLibraryReturn(lb.id)} className="btn btn-secondary" style={{ marginTop: '0.5rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      Return Book
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. CGPA TRANSCRIPT */}
      {tab === 'gpa' && (
        <div className="glass-card">
          <h3 style={styles.panelTitle}>Academic Transcript Card</h3>
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="premium-table">
              <thead>
                <tr><th>Sem</th><th>Year</th><th>Subject Code</th><th>Subject Name</th><th>Credits</th><th>Letter Grade</th></tr>
              </thead>
              <tbody>
                {grades.map((item, index) => (
                  <tr key={index}>
                    <td>Sem {item.semester}</td>
                    <td>{item.academic_year}</td>
                    <td style={{ fontWeight: '700' }}>{item.course_code}</td>
                    <td style={{ color: '#fff' }}>{item.course_name}</td>
                    <td>{item.credits} Credits</td>
                    <td>
                      <span className={`badge ${item.grade ? 'badge-success' : 'badge-warning'}`}>
                        {item.grade || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 12. NO DUES Clearance */}
      {tab === 'nodues' && (
        <div className="glass-card" style={{ maxWidth: '500px' }}>
          <h3 style={styles.panelTitle}>Office Clearance Checkpoints</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={styles.chkRow}>
              <span>Library Clearance:</span>
              <span className={`badge ${noDuesInfo?.library_dues === 'cleared' ? 'badge-success' : 'badge-danger'}`}>{noDuesInfo?.library_dues}</span>
            </div>
            <div style={styles.chkRow}>
              <span>Hostel Block Dues:</span>
              <span className={`badge ${noDuesInfo?.hostel_dues === 'cleared' ? 'badge-success' : 'badge-danger'}`}>{noDuesInfo?.hostel_dues}</span>
            </div>
            <div style={styles.chkRow}>
              <span>Sports Board Clearance:</span>
              <span className={`badge ${noDuesInfo?.sports_dues === 'cleared' ? 'badge-success' : 'badge-danger'}`}>{noDuesInfo?.sports_dues}</span>
            </div>
            <div style={styles.chkRow}>
              <span>Finance Accounts Clearance:</span>
              <span className={`badge ${noDuesInfo?.accounts_dues === 'cleared' ? 'badge-success' : 'badge-danger'}`}>{noDuesInfo?.accounts_dues}</span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.chkRow}>
              <strong>Overall Clearance Status:</strong>
              <span className={`badge ${noDuesInfo?.status === 'cleared' ? 'badge-success' : 'badge-danger'}`}>{noDuesInfo?.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* 13. STUDENT PROFILE */}
      {tab === 'profile' && (
        <div style={styles.splitGrid}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={styles.avatar}>{profile?.name.charAt(0).toUpperCase()}</div>
            <h2 style={{ marginTop: '0.5rem' }}>{profile?.name}</h2>
            <p style={styles.mutedText}>{profile?.roll_number} • Sem {profile?.semester}</p>
            <p style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--secondary)' }}>CGPA: {parseFloat(profile?.current_gpa || 0).toFixed(2)}</p>
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Edit Contact Details</h3>
            <form onSubmit={handleSaveProfile} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="input-field" required />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" value={dobInput} onChange={e => setDobInput(e.target.value)} className="input-field" style={{ background: '#131b2e' }} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={savingProfile}>
                Save Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 14. MY TRANSPORTATION */}
      {tab === 'transport' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Bus Route Allocation</h3>
            {transportInfo?.enrolledRoute ? (
              <div>
                <h4 style={styles.itemTitle}>{transportInfo.enrolledRoute.route_name}</h4>
                <p style={styles.itemDesc}>Bus Plate: {transportInfo.enrolledRoute.bus_number}</p>
                <p style={styles.itemDesc}>Driver: {transportInfo.enrolledRoute.driver_name} ({transportInfo.enrolledRoute.driver_phone})</p>
                <div style={styles.stopsBox} style={{ marginTop: '1rem' }}>
                  <strong>Timings schedule:</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{transportInfo.enrolledRoute.stops}</p>
                </div>
              </div>
            ) : (
              <p style={styles.emptyText}>No bus route seat allocated yet.</p>
            )}
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Active Bus Routes</h3>
            <div style={styles.scroller}>
              {transportInfo?.allRoutes.map(r => (
                <div key={r.id} style={styles.listItemFlex}>
                  <div>
                    <h4 style={styles.itemTitle}>{r.route_name}</h4>
                    <span style={styles.mutedText}>Bus: {r.bus_number}</span>
                  </div>
                  <button onClick={() => handleEnrollTransport(r.id)} className="btn btn-secondary">Select</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 15. SUPPORT SUPPORT TICKETS */}
      {tab === 'support' && (
        <div style={styles.splitGrid}>
          <div className="glass-card">
            <h3 style={styles.panelTitle}>Open Support Query</h3>
            <form onSubmit={handlePostTicket} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Query Subject</label>
                <input type="text" value={ticketTitle} onChange={e => setTicketTitle(e.target.value)} className="input-field" placeholder="Wi-Fi dropout in dorm" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select value={ticketCat} onChange={e => setTicketCat(e.target.value)} className="input-field" style={{ background: '#131b2e' }}>
                  <option value="IT">IT Support</option>
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Detail explanation</label>
                <textarea rows="3" value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} className="input-field" placeholder="Explain details..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Submit Ticket</button>
            </form>
          </div>

          <div className="glass-card">
            <h3 style={styles.panelTitle}>Ticket logs</h3>
            <div style={styles.scroller}>
              {supportTickets.map(t => (
                <div key={t.id} style={styles.listItem}>
                  <div style={styles.metaRow}>
                    <span style={styles.timeTag}>{t.category}</span>
                    <span className={`badge ${t.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span>
                  </div>
                  <h4 style={styles.itemTitle}>{t.title}</h4>
                  <p style={styles.itemDesc}>"{t.description}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 16. WEEKLY CLASS TIMETABLE GRID */}
      {tab === 'timetable' && (
        <div style={styles.timetableGrid}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
            const classes = timetable.filter(c => {
              const str = c.schedule.toLowerCase();
              if (day === 'Monday' && str.includes('mon')) return true;
              if (day === 'Tuesday' && str.includes('tue')) return true;
              if (day === 'Wednesday' && str.includes('wed')) return true;
              if (day === 'Thursday' && str.includes('thu')) return true;
              if (day === 'Friday' && str.includes('fri')) return true;
              return false;
            });
            return (
              <div key={day} className="glass-card" style={{ padding: '1rem', minHeight: '300px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>{day}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {classes.map((c, i) => (
                    <div key={i} style={styles.miniClassItem}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: '700' }}>{c.schedule.split(' ').slice(1).join(' ')}</span>
                      <h5 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>{c.course_name}</h5>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.classroom}</span>
                    </div>
                  ))}
                  {classes.length === 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No lectures.</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL (MOCK) */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <button onClick={() => !processingPay && setShowPayModal(false)} style={styles.closeBtn}>
              <X size={18} />
            </button>
            <h3 style={{ marginBottom: '1rem' }}>Secure Checkout Gateway</h3>
            
            {paySuccess ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <CheckCircle size={40} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>{paySuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment}>
                <div style={styles.invoiceSummary}>
                  <span>Billing Statement</span>
                  <h4>{selectedFee?.fee_type}</h4>
                  <h2>${parseFloat(selectedFee?.amount || 0).toFixed(2)}</h2>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="input-field" style={{ background: '#131b2e' }}>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI / GPay">UPI Wallet / QR</option>
                  </select>
                </div>

                {payMethod === 'Credit Card' && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" placeholder="Card Number" className="input-field" value={payCardNum} onChange={e => setPayCardNum(e.target.value)} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input type="text" placeholder="MM/YY" className="input-field" required />
                      <input type="password" placeholder="CVV" className="input-field" maxLength="3" required />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={processingPay}>
                  {processingPay ? 'Connecting merchant gateway...' : `Clear Dues $${parseFloat(selectedFee?.amount || 0).toFixed(2)}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  loading: { padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' },
  pageTitle: { fontSize: '1.75rem', fontWeight: '700' },
  sub: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' },
  dashCard: { padding: '1rem', minHeight: '90px' },
  dashLabel: { fontSize: '0.75rem', color: 'var(--text-secondary)' },
  dashVal: { fontSize: '1.8rem', fontWeight: '700', color: '#fff', marginTop: '0.25rem' },
  splitGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '1rem', alignItems: 'start' },
  panelTitle: { fontSize: '1.05rem', fontWeight: '600', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' },
  scroller: { maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  listItem: { padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px' },
  listItemFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px', gap: '1rem' },
  metaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  mutedText: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  itemTitle: { fontSize: '0.85rem', fontWeight: '600', color: '#fff' },
  itemDesc: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' },
  timeTag: { fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: '700' },
  emptyText: { fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' },
  careerCard: { padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '8px' },
  careerDesg: { fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' },
  careerMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' },
  hostelBox: { padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px' },
  slipCard: { padding: '1.5rem', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: '8px' },
  slipHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1rem' },
  slipGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' },
  debarredBanner: { textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  chkRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' },
  divider: { height: '1px', background: 'var(--border)', margin: '0.75rem 0' },
  avatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', margin: '0 auto' },
  timetableGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' },
  miniClassItem: { padding: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  invoiceSummary: { padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', marginBottom: '1rem' },
  closeBtn: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }
};

export default StudentWorkspace;

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/api';
import { 
  Home, BookOpen, Users, Calendar, Award, HelpCircle, FileText, 
  Clock, Bell, BarChart3, Ticket, LifeBuoy, UserCheck, Plus, 
  Search, Filter, CheckCircle2, AlertTriangle, XCircle, CheckSquare, 
  Edit3, Trash2, Download, Upload, MessageSquare, Send, Eye, 
  ChevronRight, RefreshCw, X, ShieldAlert, Check, FileCheck, Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';

const FacultyWorkspace = ({ tab = 'dashboard' }) => {
  const { token, user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  // Core Data States
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [nodues, setNodues] = useState([]);
  const [peers, setPeers] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [defaulterCourseFilter, setDefaulterCourseFilter] = useState('all');
  const [defaulterThreshold, setDefaulterThreshold] = useState('75');
  const [defaulterSearch, setDefaulterSearch] = useState('');

  // Toast / Feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Notification Bell State
  const [showNotifications, setShowNotifications] = useState(false);

  // -------------------------------------------------------------
  // PERSISTENT EXTENDED STORAGE (Quizzes, Assignments, Materials, Assessments)
  // -------------------------------------------------------------
  const [quizzes, setQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem(`erp_quizzes_${user?.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'q-1',
          courseId: 'all',
          title: 'Unit 1: Relational Algebra & SQL Basics',
          duration: 30,
          totalMarks: 20,
          published: true,
          dueDate: '2026-09-30',
          questions: [
            {
              id: '1',
              question: 'Which SQL clause is used to filter records after aggregation?',
              options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
              correct: 1,
              marks: 10
            },
            {
              id: '2',
              question: 'What is the primary key constraint in a relational database?',
              options: ['Allows duplicate values', 'Must be NULL', 'Uniquely identifies each record', 'Links two tables together'],
              correct: 2,
              marks: 10
            }
          ],
          submissions: [
            { studentId: 7, studentName: 'Tata Bharghava Sai Sunil', score: 20, submittedAt: '2026-09-12 10:30 AM' }
          ]
        }
      ];
      return list.map(q => ({
        ...q,
        submissions: (q.submissions || []).filter(s => !s.studentName?.includes('Alice') && !s.studentName?.includes('Bob'))
      }));
    } catch { return []; }
  });

  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem(`erp_assignments_${user?.id}`);
      const list = saved ? JSON.parse(saved) : [
        {
          id: 'a-1',
          courseId: 'all',
          title: 'Assignment 1: Database Normalization (3NF & BCNF)',
          description: 'Normalize the given hospital schema into 3NF and BCNF with functional dependencies list.',
          maxMarks: 50,
          deadline: '2026-09-28',
          status: 'Active',
          submissions: [
            { studentId: 7, studentName: 'Tata Bharghava Sai Sunil', file: 'Sunil_DBMS_Assign1.pdf', submittedAt: '2026-09-13', status: 'Submitted', score: null, feedback: '' }
          ]
        }
      ];
      return list.map(a => {
        const filtered = (a.submissions || []).filter(s => !s.studentName?.includes('Alice') && !s.studentName?.includes('Bob'));
        return {
          ...a,
          submissions: filtered.length > 0 ? filtered : [
            { studentId: 7, studentName: 'Tata Bharghava Sai Sunil', file: 'Sunil_DBMS_Assign1.pdf', submittedAt: '2026-09-13', status: 'Submitted', score: null, feedback: '' }
          ]
        };
      });
    } catch { return []; }
  });

  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem(`erp_materials_${user?.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'm-1',
          courseId: 'all',
          title: 'Lecture 01: DBMS Architecture & ACID Properties',
          category: 'Lecture Notes',
          fileUrl: '#',
          fileName: 'Lecture01_DBMS_Overview.pdf',
          size: '2.4 MB',
          uploadedAt: '2026-09-01'
        },
        {
          id: 'm-2',
          courseId: 'all',
          title: 'Complete Course Syllabus & Grading Scheme 2026',
          category: 'Syllabus',
          fileUrl: '#',
          fileName: 'Course_Syllabus_2026.pdf',
          size: '650 KB',
          uploadedAt: '2026-08-25'
        }
      ];
    } catch { return []; }
  });

  const [assessments, setAssessments] = useState(() => {
    try {
      const saved = localStorage.getItem(`erp_assessments_${user?.id}`);
      return saved ? JSON.parse(saved) : [
        { id: 'as-1', courseOfferingId: 'all', title: 'Midterm Exam 1', type: 'Midterm', maxMarks: 50, date: '2026-09-15' },
        { id: 'as-2', courseOfferingId: 'all', title: 'Assignment 1', type: 'Assignment', maxMarks: 50, date: '2026-09-28' },
        { id: 'as-3', courseOfferingId: 'all', title: 'Lab Practical', type: 'Lab', maxMarks: 30, date: '2026-10-05' }
      ];
    } catch { return []; }
  });

  // Save changes to localStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`erp_quizzes_${user.id}`, JSON.stringify(quizzes));
      // Also write to global student quiz bridge
      localStorage.setItem('erp_global_published_quizzes', JSON.stringify(quizzes.filter(q => q.published)));
    }
  }, [quizzes, user]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`erp_assignments_${user.id}`, JSON.stringify(assignments));
      localStorage.setItem('erp_global_assignments', JSON.stringify(assignments));
    }
  }, [assignments, user]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`erp_materials_${user.id}`, JSON.stringify(materials));
      localStorage.setItem('erp_global_materials', JSON.stringify(materials));
    }
  }, [materials, user]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`erp_assessments_${user.id}`, JSON.stringify(assessments));
    }
  }, [assessments, user]);

  // Purge any legacy dummy submissions from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      setAssignments(prev => {
        const cleaned = prev.map(a => {
          const filtered = (a.submissions || []).filter(s => !s.studentName?.includes('Alice') && !s.studentName?.includes('Bob'));
          return {
            ...a,
            submissions: filtered.length > 0 ? filtered : [
              { studentId: 7, studentName: 'Tata Bharghava Sai Sunil', file: 'Sunil_DBMS_Assign1.pdf', submittedAt: '2026-09-13', status: 'Submitted', score: null, feedback: '' }
            ]
          };
        });
        localStorage.setItem(`erp_assignments_${user.id}`, JSON.stringify(cleaned));
        localStorage.setItem('erp_global_assignments', JSON.stringify(cleaned));
        return cleaned;
      });

      setQuizzes(prev => {
        const cleaned = prev.map(q => ({
          ...q,
          submissions: (q.submissions || []).filter(s => !s.studentName?.includes('Alice') && !s.studentName?.includes('Bob'))
        }));
        localStorage.setItem(`erp_quizzes_${user.id}`, JSON.stringify(cleaned));
        localStorage.setItem('erp_global_published_quizzes', JSON.stringify(cleaned.filter(q => q.published)));
        return cleaned;
      });
    }
  }, [user?.id]);

  // -------------------------------------------------------------
  // FETCH ALL BACKEND DATA
  // -------------------------------------------------------------
  const loadFacultyData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Courses taught
      const coursesRes = await fetch(`${API_BASE_URL}/api/faculty/courses`, { headers });
      const coursesData = await coursesRes.json();
      const loadedCourses = Array.isArray(coursesData) ? coursesData : [];
      setCourses(loadedCourses);

      // 2. Course Catalog for Department
      const catRes = await fetch(`${API_BASE_URL}/api/faculty/courses/catalog`, { headers });
      const catData = await catRes.json();
      setCatalog(Array.isArray(catData) ? catData : []);

      // 3. Department Students
      const studentsRes = await fetch(`${API_BASE_URL}/api/faculty/department/students`, { headers });
      const studentsData = await studentsRes.json();
      setAllStudents(Array.isArray(studentsData) ? studentsData : []);

      // 4. Announcements
      const annRes = await fetch(`${API_BASE_URL}/api/admin/announcements`, { headers });
      const annData = await annRes.json();
      if (Array.isArray(annData)) {
        setAnnouncements(annData.filter(a => a.target_role === 'all' || a.target_role === 'faculty'));
      }

      // 5. Academic Support Tickets
      const ticketsRes = await fetch(`${API_BASE_URL}/api/faculty/department/tickets`, { headers });
      const ticketsData = await ticketsRes.json();
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);

      // 6. No Dues
      const noduesRes = await fetch(`${API_BASE_URL}/api/faculty/department/nodues`, { headers });
      const noduesData = await noduesRes.json();
      setNodues(Array.isArray(noduesData) ? noduesData : []);

      // 7. Peers
      const peersRes = await fetch(`${API_BASE_URL}/api/faculty/department/peers`, { headers });
      const peersData = await peersRes.json();
      setPeers(Array.isArray(peersData) ? peersData : []);

      // 8. Low Attendance Records (< 75%)
      const defRes = await fetch(`${API_BASE_URL}/api/faculty/attendance/defaulters`, { headers });
      const defData = await defRes.json();
      setDefaulters(Array.isArray(defData) ? defData : []);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load faculty data:', err);
      showToast('Error connecting to server. Using cached data.', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, [token]);

  // -------------------------------------------------------------
  // DERIVED METRICS & STATS
  // -------------------------------------------------------------
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = allStudents.length;
    const pendingTickets = tickets.filter(t => t.status !== 'resolved').length;
    const pendingGrading = assignments.reduce((acc, a) => acc + (a.submissions?.filter(s => s.status === 'Submitted').length || 0), 0);
    const upcomingExams = courses.filter(c => c.exam_date && new Date(c.exam_date) >= new Date()).length;
    const activeQuizzes = quizzes.filter(q => q.published).length;

    return { totalCourses, totalStudents, pendingTickets, pendingGrading, upcomingExams, activeQuizzes };
  }, [courses, allStudents, tickets, assignments, quizzes]);

  // Notifications calculation
  const notifications = useMemo(() => {
    const items = [];
    if (stats.pendingTickets > 0) {
      items.push({ id: 'n1', title: 'Pending Student Queries', desc: `${stats.pendingTickets} queries waiting for response`, tab: 'queries', time: 'Today' });
    }
    if (stats.pendingGrading > 0) {
      items.push({ id: 'n2', title: 'Pending Submissions', desc: `${stats.pendingGrading} assignments ready to be reviewed`, tab: 'materials', time: '1h ago' });
    }
    if (courses.length > 0) {
      items.push({ id: 'n3', title: 'Teaching Schedule', desc: `You have classes scheduled: ${courses[0]?.course_name}`, tab: 'timetable', time: 'Daily' });
    }
    if (announcements.length > 0) {
      items.push({ id: 'n4', title: 'Campus Notice', desc: announcements[0]?.title, tab: 'announcements', time: 'Recent' });
    }
    return items;
  }, [stats, courses, announcements]);

  // -------------------------------------------------------------
  // TAB 2: COURSE MANAGEMENT MODALS & HANDLERS
  // -------------------------------------------------------------
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  const [courseForm, setCourseForm] = useState({
    course_id: '',
    semester: '1',
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    schedule: 'Mon / Wed 10:00 AM - 11:30 AM',
    classroom: 'Room 304, Tech Block',
    exam_date: ''
  });

  const handleCreateOffering = async (e) => {
    e.preventDefault();
    if (!courseForm.course_id || !courseForm.schedule || !courseForm.classroom) {
      showToast('Please fill all required course fields.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/courses/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Course offering created successfully!');
      setShowAddCourseModal(false);
      loadFacultyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateOffering = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/courses/offerings/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Course schedule updated successfully!');
      setShowEditCourseModal(false);
      loadFacultyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteOffering = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/courses/offerings/${deletingCourseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Course offering removed.');
      setShowDeleteCourseModal(false);
      loadFacultyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // TAB 3: STUDENT MANAGEMENT (Search & Details Modal)
  // -------------------------------------------------------------
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  const filteredStudents = useMemo(() => {
    return allStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            s.roll_number.toLowerCase().includes(studentSearch.toLowerCase());
      return matchesSearch;
    });
  }, [allStudents, studentSearch]);

  // -------------------------------------------------------------
  // TAB 4: ATTENDANCE MANAGEMENT
  // -------------------------------------------------------------
  const [attCourseId, setAttCourseId] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attLecture, setAttLecture] = useState('Lecture 1 (Morning)');
  const [attRoster, setAttRoster] = useState([]);
  const [attStatuses, setAttStatuses] = useState({});
  const [attLoading, setAttLoading] = useState(false);
  const [attSaving, setAttSaving] = useState(false);
  const [attHistory, setAttHistory] = useState([]);
  const [attViewMode, setAttViewMode] = useState('mark'); // 'mark' or 'history'

  // Load roster when course is selected
  useEffect(() => {
    if (!attCourseId && courses.length > 0) {
      setAttCourseId(courses[0].id.toString());
    }
  }, [courses]);

  useEffect(() => {
    if (attCourseId) {
      loadRosterForAttendance(attCourseId);
      loadAttendanceHistory(attCourseId);
    }
  }, [attCourseId]);

  const loadRosterForAttendance = async (offeringId) => {
    try {
      setAttLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/faculty/classes/${offeringId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAttRoster(data);
        const initial = {};
        data.forEach(s => { initial[s.user_id] = 'present'; });
        setAttStatuses(initial);
      }
      setAttLoading(false);
    } catch (err) {
      console.error(err);
      setAttLoading(false);
    }
  };

  const loadAttendanceHistory = async (offeringId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/classes/${offeringId}/attendance/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAttHistory(data);
    } catch (err) { console.error(err); }
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    attRoster.forEach(s => { updated[s.user_id] = 'present'; });
    setAttStatuses(updated);
    showToast('All students set to Present.');
  };

  const handleToggleAttendance = (studentId, status) => {
    setAttStatuses(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!attCourseId || attRoster.length === 0) {
      showToast('No students to record attendance for.', 'error');
      return;
    }
    try {
      setAttSaving(true);
      const recordsPayload = Object.keys(attStatuses).map(uid => ({
        student_id: parseInt(uid),
        status: attStatuses[uid]
      }));

      const res = await fetch(`${API_BASE_URL}/api/faculty/classes/${attCourseId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ date: attDate, records: recordsPayload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Attendance recorded for ${recordsPayload.length} students on ${attDate}!`);
      setAttSaving(false);
      loadAttendanceHistory(attCourseId);
    } catch (err) {
      showToast(err.message, 'error');
      setAttSaving(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 5: GRADES & MARKS MANAGEMENT
  // -------------------------------------------------------------
  const [gradesCourseId, setGradesCourseId] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [marksInput, setMarksInput] = useState({});
  const [savingGrades, setSavingGrades] = useState(false);
  const [showAddAssessmentModal, setShowAddAssessmentModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ title: '', type: 'Midterm', maxMarks: 50, date: '' });

  useEffect(() => {
    if (!gradesCourseId && courses.length > 0) {
      setGradesCourseId(courses[0].id.toString());
    }
  }, [courses]);

  const handleCreateAssessment = (e) => {
    e.preventDefault();
    if (!newAssessment.title || !newAssessment.maxMarks) {
      showToast('Please provide assessment title and max marks.', 'error');
      return;
    }
    const created = {
      id: `as-${Date.now()}`,
      courseOfferingId: gradesCourseId,
      title: newAssessment.title,
      type: newAssessment.type,
      maxMarks: parseFloat(newAssessment.maxMarks),
      date: newAssessment.date || new Date().toISOString().split('T')[0]
    };
    setAssessments(prev => [created, ...prev]);
    setSelectedAssessment(created.id);
    setShowAddAssessmentModal(false);
    setNewAssessment({ title: '', type: 'Midterm', maxMarks: 50, date: '' });
    showToast(`Assessment "${created.title}" created successfully.`);
  };

  const handleSaveMarks = async (studentId, rawMark, maxMark) => {
    const mark = parseFloat(rawMark);
    if (isNaN(mark) || mark < 0 || mark > maxMark) {
      showToast(`Marks must be between 0 and ${maxMark}.`, 'error');
      return;
    }

    // Determine letter grade
    const pct = (mark / maxMark) * 100;
    let letter = 'F';
    if (pct >= 90) letter = 'A';
    else if (pct >= 80) letter = 'B';
    else if (pct >= 70) letter = 'C';
    else if (pct >= 60) letter = 'D';

    try {
      setSavingGrades(true);
      const res = await fetch(`${API_BASE_URL}/api/faculty/classes/${gradesCourseId}/grades`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ student_id: studentId, grade: letter })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Save to local marks input
      setMarksInput(prev => ({ ...prev, [studentId]: mark }));
      showToast(`Saved score: ${mark}/${maxMark} (${letter}) and synced with student CGPA.`);
      setSavingGrades(false);
      loadRosterForAttendance(gradesCourseId);
    } catch (err) {
      showToast(err.message, 'error');
      setSavingGrades(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 6: QUIZZES MANAGEMENT
  // -------------------------------------------------------------
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    courseId: 'all',
    duration: 30,
    dueDate: '',
    questions: [
      { id: '1', question: '', options: ['', '', '', ''], correct: 0, marks: 10 }
    ]
  });

  const handleAddQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { id: `${Date.now()}`, question: '', options: ['', '', '', ''], correct: 0, marks: 10 }
      ]
    }));
  };

  const handleSaveQuiz = (publish = false) => {
    if (!quizForm.title) {
      showToast('Please enter a quiz title.', 'error');
      return;
    }
    const totalMarks = quizForm.questions.reduce((acc, q) => acc + (parseFloat(q.marks) || 0), 0);
    const newQ = {
      id: `q-${Date.now()}`,
      courseId: quizForm.courseId,
      title: quizForm.title,
      duration: parseInt(quizForm.duration) || 30,
      totalMarks,
      published: publish,
      dueDate: quizForm.dueDate || '2026-10-15',
      questions: quizForm.questions,
      submissions: []
    };
    setQuizzes(prev => [newQ, ...prev]);
    setShowCreateQuizModal(false);
    setQuizForm({
      title: '',
      courseId: 'all',
      duration: 30,
      dueDate: '',
      questions: [{ id: '1', question: '', options: ['', '', '', ''], correct: 0, marks: 10 }]
    });
    showToast(publish ? 'Quiz published to students!' : 'Quiz saved as draft.');
  };

  const handleTogglePublishQuiz = (quizId) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === quizId) {
        const next = !q.published;
        showToast(next ? 'Quiz published to students.' : 'Quiz unpublished.');
        return { ...q, published: next };
      }
      return q;
    }));
  };

  // -------------------------------------------------------------
  // TAB 7: ASSIGNMENTS & MATERIALS
  // -------------------------------------------------------------
  const [showAddAssignModal, setShowAddAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ title: '', courseId: 'all', description: '', deadline: '', maxMarks: 50 });
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: '', courseId: 'all', category: 'Lecture Notes', fileName: '' });

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!assignForm.title || !assignForm.deadline) {
      showToast('Please fill all assignment details.', 'error');
      return;
    }
    const created = {
      id: `a-${Date.now()}`,
      courseId: assignForm.courseId,
      title: assignForm.title,
      description: assignForm.description,
      maxMarks: parseFloat(assignForm.maxMarks),
      deadline: assignForm.deadline,
      status: 'Active',
      submissions: []
    };
    setAssignments(prev => [created, ...prev]);
    setShowAddAssignModal(false);
    setAssignForm({ title: '', courseId: 'all', description: '', deadline: '', maxMarks: 50 });
    showToast('Assignment published to students!');
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!materialForm.title || !materialForm.fileName) {
      showToast('Please provide a title and file name.', 'error');
      return;
    }
    const created = {
      id: `m-${Date.now()}`,
      courseId: materialForm.courseId,
      title: materialForm.title,
      category: materialForm.category,
      fileName: materialForm.fileName,
      fileUrl: '#',
      size: '1.8 MB',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setMaterials(prev => [created, ...prev]);
    setShowAddMaterialModal(false);
    setMaterialForm({ title: '', courseId: 'all', category: 'Lecture Notes', fileName: '' });
    showToast('Study material added to course repository.');
  };

  // -------------------------------------------------------------
  // TAB 8: ANNOUNCEMENTS MANAGEMENT
  // -------------------------------------------------------------
  const [showAddAnnounceModal, setShowAddAnnounceModal] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ title: '', content: '', target_role: 'all' });

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceForm.title || !announceForm.content) {
      showToast('Please provide title and content.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(announceForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Announcement broadcasted to portal notice feeds!');
      setShowAddAnnounceModal(false);
      setAnnounceForm({ title: '', content: '', target_role: 'all' });
      loadFacultyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Could not delete announcement.');
      showToast('Announcement removed.');
      loadFacultyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // TAB 9: TIMETABLE
  // -------------------------------------------------------------
  const [timetableDays, setTimetableDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [selectedDayView, setSelectedDayView] = useState('All');

  // -------------------------------------------------------------
  // TAB 12: STUDENT QUERIES & REPLIES
  // -------------------------------------------------------------
  const [ticketFilter, setTicketFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);

  const filteredTickets = useMemo(() => {
    if (ticketFilter === 'all') return tickets;
    return tickets.filter(t => t.status === ticketFilter);
  }, [tickets, ticketFilter]);

  const handleSendReply = async (ticketId) => {
    if (!replyText.trim()) {
      showToast('Please type a reply message.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ replyMessage: replyText, status: 'resolved' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast('Reply sent and query marked as resolved!');
      setReplyText('');
      setActiveTicket(null);
      loadFacultyData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // TAB 13: PROFILE & EDIT
  // -------------------------------------------------------------
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileQual, setProfileQual] = useState(user?.qualification || '');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/faculty/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone: profilePhone, qualification: profileQual })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      updateProfile({ phone: profilePhone, qualification: profileQual });
      showToast('Profile details updated successfully.');
      setShowEditProfileModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // RENDER SECTIONS
  // -------------------------------------------------------------

  return (
    <div className="main-content" style={styles.container}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)'
        }}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeTitle}>Welcome, {user?.faculty_name || user?.name || 'Professor'}</h1>
          <p style={styles.welcomeSubtitle}>
            {user?.designation || 'Faculty Member'} • {user?.department_name || 'Academic Faculty'} ({user?.employee_id || 'FAC'})
          </p>
        </div>

        <div style={styles.headerActions}>
          <button 
            style={styles.notifBtn} 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && <span style={styles.notifBadge}>{notifications.length}</span>}
          </button>

          <button style={styles.refreshBtn} onClick={loadFacultyData} title="Refresh Live Data">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Notifications Popup */}
        {showNotifications && (
          <div style={styles.notifDropdown}>
            <div style={styles.notifHeader}>
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Notifications ({notifications.length})</h4>
              <button style={styles.textBtn} onClick={() => setShowNotifications(false)}><X size={16} /></button>
            </div>
            <div style={styles.notifList}>
              {notifications.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No new alerts.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={styles.notifItem} onClick={() => { navigate(`/faculty/${n.tab}`); setShowNotifications(false); }}>
                    <div style={styles.notifItemTop}>
                      <span style={styles.notifItemTitle}>{n.title}</span>
                      <span style={styles.notifItemTime}>{n.time}</span>
                    </div>
                    <p style={styles.notifItemDesc}>{n.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Tab Content */}
      <main style={styles.content}>
        
        {/* ======================================================== */}
        {/* 1. DASHBOARD OVERVIEW */}
        {/* ======================================================== */}
        {tab === 'dashboard' && (
          <div>
            {/* KPI Cards Grid */}
            <div style={styles.kpiGrid}>
              <div style={styles.kpiCard}>
                <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <div style={styles.kpiLabel}>Assigned Courses</div>
                  <div style={styles.kpiValue}>{stats.totalCourses}</div>
                </div>
              </div>

              <div style={styles.kpiCard}>
                <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={styles.kpiLabel}>Department Students</div>
                  <div style={styles.kpiValue}>{stats.totalStudents}</div>
                </div>
              </div>

              <div style={styles.kpiCard}>
                <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <div style={styles.kpiLabel}>Pending Submissions</div>
                  <div style={styles.kpiValue}>{stats.pendingGrading}</div>
                </div>
              </div>

              <div style={styles.kpiCard}>
                <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                  <LifeBuoy size={24} />
                </div>
                <div>
                  <div style={styles.kpiLabel}>Pending Queries</div>
                  <div style={styles.kpiValue}>{stats.pendingTickets}</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Quick Management Actions</h3>
              <div style={styles.quickActionsGrid}>
                <button style={styles.actionButton} onClick={() => navigate('/faculty/attendance')}>
                  <CheckSquare size={18} />
                  <span>Mark Daily Attendance</span>
                </button>
                <button style={styles.actionButton} onClick={() => setShowAddCourseModal(true)}>
                  <Plus size={18} />
                  <span>Offer New Course</span>
                </button>
                <button style={styles.actionButton} onClick={() => navigate('/faculty/grades')}>
                  <Award size={18} />
                  <span>Input Exam Grades</span>
                </button>
                <button style={styles.actionButton} onClick={() => setShowAddAnnounceModal(true)}>
                  <Bell size={18} />
                  <span>Post Campus Notice</span>
                </button>
                <button style={styles.actionButton} onClick={() => setShowCreateQuizModal(true)}>
                  <HelpCircle size={18} />
                  <span>Create MCQ Quiz</span>
                </button>
                <button style={styles.actionButton} onClick={() => setShowAddMaterialModal(true)}>
                  <Upload size={18} />
                  <span>Upload Study Material</span>
                </button>
              </div>
            </div>

            {/* 2-Column Section: Assigned Classes & Announcements */}
            <div style={styles.twoColumnGrid}>
              {/* Classes Schedule */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Your Teaching Schedule</h3>
                  <button style={styles.outlineBtn} onClick={() => navigate('/faculty/courses')}>
                    <span>View All</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div style={styles.emptyState}>
                    <BookOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No course offerings assigned yet.</p>
                    <button style={{ ...styles.primaryBtn, marginTop: '1rem' }} onClick={() => setShowAddCourseModal(true)}>
                      <Plus size={16} /> Offer Course Now
                    </button>
                  </div>
                ) : (
                  <div style={styles.classList}>
                    {courses.map(c => (
                      <div key={c.id} style={styles.classItem}>
                        <div>
                          <div style={styles.classCode}>{c.course_code} • Sem {c.semester} ({c.credits} Credits)</div>
                          <h4 style={styles.className}>{c.course_name}</h4>
                          <div style={styles.classSchedule}>
                            <Clock size={14} /> {c.schedule} • 📍 {c.classroom}
                          </div>
                        </div>
                        <div style={styles.classActions}>
                          <button style={styles.outlineBtnSm} onClick={() => navigate('/faculty/attendance')}>
                            Attendance
                          </button>
                          <button style={styles.primaryBtnSm} onClick={() => navigate(`/faculty/class/${c.id}`)}>
                            Manage
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Faculty Notices Feed */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Faculty Notices & Announcements</h3>
                  <button style={styles.primaryBtnSm} onClick={() => setShowAddAnnounceModal(true)}>
                    <Plus size={14} /> New Notice
                  </button>
                </div>

                {announcements.length === 0 ? (
                  <div style={styles.emptyState}>
                    <Bell size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0 }}>No active notices at this moment.</p>
                  </div>
                ) : (
                  <div style={styles.noticeList}>
                    {announcements.slice(0, 4).map(a => (
                      <div key={a.id} style={styles.noticeItem}>
                        <div style={styles.noticeHeader}>
                          <span style={styles.noticeBadge}>{a.target_role?.toUpperCase()}</span>
                          <span style={styles.noticeDate}>{new Date(a.created_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <h4 style={styles.noticeTitle}>{a.title}</h4>
                        <p style={styles.noticeContent}>{a.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. MY COURSES MODULE */}
        {/* ======================================================== */}
        {tab === 'courses' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>My Courses & Offerings</h2>
                <p style={styles.sectionSubtitle}>Manage curriculum, schedules, classrooms, syllabus, and study materials.</p>
              </div>
              <button style={styles.primaryBtn} onClick={() => setShowAddCourseModal(true)}>
                <Plus size={18} /> Add Course Offering
              </button>
            </div>

            {courses.length === 0 ? (
              <div style={styles.emptyStateCard}>
                <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3>No courses currently offered</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  You are not assigned to teach any courses for the current semester. Select a course from your department catalog to begin.
                </p>
                <button style={styles.primaryBtn} onClick={() => setShowAddCourseModal(true)}>
                  <Plus size={18} /> Offer Course from Catalog
                </button>
              </div>
            ) : (
              <div style={styles.coursesGrid}>
                {courses.map(c => (
                  <div key={c.id} style={styles.courseCard}>
                    <div style={styles.courseCardTop}>
                      <span style={styles.badgePrimary}>{c.course_code}</span>
                      <span style={styles.badgeSecondary}>Sem {c.semester} • {c.academic_year}</span>
                    </div>

                    <h3 style={styles.courseTitle}>{c.course_name}</h3>

                    <div style={styles.courseDetails}>
                      <div style={styles.courseDetailRow}>
                        <Clock size={16} /> <span>{c.schedule}</span>
                      </div>
                      <div style={styles.courseDetailRow}>
                        <span>📍 Classroom:</span> <strong>{c.classroom}</strong>
                      </div>
                      <div style={styles.courseDetailRow}>
                        <span>⚖️ Credits:</span> <strong>{c.credits} Credits</strong>
                      </div>
                      {c.exam_date && (
                        <div style={styles.courseDetailRow}>
                          <span>📅 Final Exam:</span> <strong>{new Date(c.exam_date).toLocaleDateString()}</strong>
                        </div>
                      )}
                    </div>

                    <div style={styles.courseCardFooter}>
                      <button 
                        style={styles.outlineBtnSm}
                        onClick={() => {
                          setEditingCourse(c);
                          setCourseForm({
                            course_id: c.course_id || '',
                            semester: c.semester?.toString() || '1',
                            academic_year: c.academic_year || '',
                            schedule: c.schedule || '',
                            classroom: c.classroom || '',
                            exam_date: c.exam_date ? c.exam_date.split('T')[0] : ''
                          });
                          setShowEditCourseModal(true);
                        }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      <button 
                        style={styles.dangerBtnSm}
                        onClick={() => {
                          setDeletingCourseId(c.id);
                          setShowDeleteCourseModal(true);
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>

                      <button 
                        style={styles.primaryBtnSm}
                        onClick={() => navigate(`/faculty/class/${c.id}`)}
                      >
                        Manage Students & Marks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. STUDENTS MANAGEMENT */}
        {/* ======================================================== */}
        {tab === 'students' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Enrolled Student Directory</h2>
                <p style={styles.sectionSubtitle}>Search and audit student performance, contact info, and clearance status.</p>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={styles.filterBar}>
              <div style={styles.searchBox}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by student name or roll number..." 
                  value={studentSearch} 
                  onChange={e => setStudentSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            {/* Student Table */}
            <div style={styles.card}>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student Name</th>
                      <th style={styles.th}>Roll Number</th>
                      <th style={styles.th}>Semester</th>
                      <th style={styles.th}>Current CGPA</th>
                      <th style={styles.th}>Contact Phone</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={styles.emptyTable}>No matching students found in your department roster.</td>
                      </tr>
                    ) : (
                      filteredStudents.map(s => (
                        <tr key={s.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.studentNameCell}>
                              <div style={styles.avatarSm}>{s.name.charAt(0)}</div>
                              <div>
                                <div style={{ fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}><span style={styles.rollBadge}>{s.roll_number}</span></td>
                          <td style={styles.td}>Semester {s.semester}</td>
                          <td style={styles.td}>
                            <span style={{ 
                              fontWeight: 700,
                              color: parseFloat(s.current_gpa) >= 3.5 ? '#34d399' : parseFloat(s.current_gpa) >= 2.5 ? '#fbbf24' : '#f87171'
                            }}>
                              {s.current_gpa ? `${parseFloat(s.current_gpa).toFixed(2)} / 4.0` : 'Not graded'}
                            </span>
                          </td>
                          <td style={styles.td}>{s.phone || 'N/A'}</td>
                          <td style={styles.td}>
                            <button 
                              style={styles.outlineBtnSm}
                              onClick={() => setSelectedStudentDetail(s)}
                            >
                              <Eye size={14} /> Profile
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ATTENDANCE MANAGEMENT */}
        {/* ======================================================== */}
        {tab === 'attendance' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Attendance Management</h2>
                <p style={styles.sectionSubtitle}>Take daily session attendance, update past logs, and audit student percentages.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  style={attViewMode === 'mark' ? styles.primaryBtnSm : styles.outlineBtnSm}
                  onClick={() => setAttViewMode('mark')}
                >
                  Mark Session
                </button>
                <button 
                  style={attViewMode === 'history' ? styles.primaryBtnSm : styles.outlineBtnSm}
                  onClick={() => setAttViewMode('history')}
                >
                  View History
                </button>
              </div>
            </div>

            {courses.length === 0 ? (
              <div style={styles.emptyStateCard}>
                <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3>No classes assigned</h3>
                <p style={{ color: 'var(--text-secondary)' }}>You must offer a course before you can record attendance.</p>
              </div>
            ) : (
              <div>
                {/* Control Filters */}
                <div style={styles.attendanceFilterCard}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Course Offering</label>
                    <select 
                      style={styles.select}
                      value={attCourseId}
                      onChange={e => setAttCourseId(e.target.value)}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.course_code} - {c.course_name} (Sem {c.semester})</option>
                      ))}
                    </select>
                  </div>

                  {attViewMode === 'mark' && (
                    <>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Attendance Date</label>
                        <input 
                          type="date" 
                          style={styles.input}
                          value={attDate}
                          onChange={e => setAttDate(e.target.value)}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Lecture Slot</label>
                        <select 
                          style={styles.select}
                          value={attLecture}
                          onChange={e => setAttLecture(e.target.value)}
                        >
                          <option>Lecture 1 (09:00 AM - 10:30 AM)</option>
                          <option>Lecture 2 (11:00 AM - 12:30 PM)</option>
                          <option>Lab Session (02:00 PM - 04:00 PM)</option>
                        </select>
                      </div>

                      <div style={{ alignSelf: 'flex-end' }}>
                        <button style={styles.outlineBtn} onClick={handleMarkAllPresent}>
                          <CheckSquare size={16} /> Mark All Present
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {attViewMode === 'mark' ? (
                  /* Roster List */
                  <div style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.cardTitle}>Student Attendance Roster ({attRoster.length})</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Click each button to switch status. Records sync directly to student portal registers.
                        </p>
                      </div>

                      <button 
                        style={styles.primaryBtn}
                        onClick={handleSaveAttendance}
                        disabled={attSaving}
                      >
                        <Check size={18} /> {attSaving ? 'Saving...' : 'Save & Publish Attendance'}
                      </button>
                    </div>

                    {attLoading ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student roster...</div>
                    ) : attRoster.length === 0 ? (
                      <div style={styles.emptyTable}>No students currently enrolled in this course offering.</div>
                    ) : (
                      <div style={styles.tableResponsive}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Student Name</th>
                              <th style={styles.th}>Roll Number</th>
                              <th style={styles.th}>Current Attendance Rate</th>
                              <th style={styles.th}>Status for {attDate}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attRoster.map(s => {
                              const currentStatus = attStatuses[s.user_id] || 'present';
                              const total = s.total_count || 0;
                              const present = s.present_count || 0;
                              const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '100.0';
                              const isLow = parseFloat(rate) < 75.0;

                              return (
                                <tr key={s.user_id} style={styles.tr}>
                                  <td style={styles.td}>
                                    <strong>{s.name}</strong>
                                  </td>
                                  <td style={styles.td}><span style={styles.rollBadge}>{s.roll_number}</span></td>
                                  <td style={styles.td}>
                                    <span style={{ 
                                      padding: '0.2rem 0.5rem', 
                                      borderRadius: '4px', 
                                      fontWeight: 600,
                                      fontSize: '0.85rem',
                                      backgroundColor: isLow ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                      color: isLow ? '#f87171' : '#34d399'
                                    }}>
                                      {rate}% {isLow && '⚠️ Below 75%'}
                                    </span>
                                  </td>
                                  <td style={styles.td}>
                                    <div style={styles.toggleButtonGroup}>
                                      <button 
                                        style={currentStatus === 'present' ? styles.toggleBtnPresentActive : styles.toggleBtn}
                                        onClick={() => handleToggleAttendance(s.user_id, 'present')}
                                      >
                                        Present
                                      </button>
                                      <button 
                                        style={currentStatus === 'absent' ? styles.toggleBtnAbsentActive : styles.toggleBtn}
                                        onClick={() => handleToggleAttendance(s.user_id, 'absent')}
                                      >
                                        Absent
                                      </button>
                                      <button 
                                        style={currentStatus === 'late' ? styles.toggleBtnLateActive : styles.toggleBtn}
                                        onClick={() => handleToggleAttendance(s.user_id, 'late')}
                                      >
                                        Late
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Attendance History View */
                  <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Recent Recorded Sessions</h3>
                    {attHistory.length === 0 ? (
                      <div style={styles.emptyTable}>No past attendance logs found for this course.</div>
                    ) : (
                      <div style={styles.tableResponsive}>
                        <table style={styles.table}>
                          <thead>
                            <tr>
                              <th style={styles.th}>Date</th>
                              <th style={styles.th}>Student Name</th>
                              <th style={styles.th}>Roll Number</th>
                              <th style={styles.th}>Recorded Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attHistory.slice(0, 30).map((h, i) => (
                              <tr key={i} style={styles.tr}>
                                <td style={styles.td}>{new Date(h.date).toLocaleDateString()}</td>
                                <td style={styles.td}>{h.student_name}</td>
                                <td style={styles.td}><span style={styles.rollBadge}>{h.roll_number}</span></td>
                                <td style={styles.td}>
                                  <span style={{
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: h.status === 'present' ? '#34d399' : h.status === 'late' ? '#fbbf24' : '#f87171'
                                  }}>
                                    {h.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. GRADES & MARKS MANAGEMENT */}
        {/* ======================================================== */}
        {tab === 'grades' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Grades & Marks Processing</h2>
                <p style={styles.sectionSubtitle}>Create assessments, validate marks, and automatically calculate official grade points.</p>
              </div>
              <button style={styles.primaryBtn} onClick={() => setShowAddAssessmentModal(true)}>
                <Plus size={18} /> New Assessment
              </button>
            </div>

            {/* Assessment Selector Card */}
            <div style={styles.attendanceFilterCard}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Course</label>
                <select 
                  style={styles.select}
                  value={gradesCourseId}
                  onChange={e => setGradesCourseId(e.target.value)}
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Assessment Task</label>
                <select 
                  style={styles.select}
                  value={selectedAssessment}
                  onChange={e => setSelectedAssessment(e.target.value)}
                >
                  {assessments.map(a => (
                    <option key={a.id} value={a.id}>{a.title} ({a.type} • Max: {a.maxMarks} pts)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grade Input Grid */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Student Grade Roster</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Type score (0 to Max Marks) and click Save. The student's GPA will recalculate automatically.
                  </p>
                </div>
              </div>

              {attRoster.length === 0 ? (
                <div style={styles.emptyTable}>No students currently enrolled in this class.</div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Student Name</th>
                        <th style={styles.th}>Roll Number</th>
                        <th style={styles.th}>Current Official Grade</th>
                        <th style={styles.th}>Enter Marks (out of 50)</th>
                        <th style={styles.th}>Save Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attRoster.map(s => {
                        const currentInput = marksInput[s.user_id] ?? '';
                        return (
                          <tr key={s.user_id} style={styles.tr}>
                            <td style={styles.td}><strong>{s.name}</strong></td>
                            <td style={styles.td}><span style={styles.rollBadge}>{s.roll_number}</span></td>
                            <td style={styles.td}>
                              <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '4px', 
                                fontWeight: 700,
                                backgroundColor: s.grade ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: s.grade ? '#818cf8' : 'var(--text-muted)'
                              }}>
                                {s.grade || 'Pending'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <input 
                                type="number" 
                                min="0" 
                                max="50" 
                                placeholder="e.g. 45"
                                value={currentInput}
                                onChange={e => setMarksInput({ ...marksInput, [s.user_id]: e.target.value })}
                                style={{ ...styles.input, width: '120px' }}
                              />
                            </td>
                            <td style={styles.td}>
                              <button 
                                style={styles.primaryBtnSm}
                                onClick={() => handleSaveMarks(s.user_id, currentInput || 45, 50)}
                                disabled={savingGrades}
                              >
                                Save Grade
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. QUIZZES MANAGEMENT */}
        {/* ======================================================== */}
        {tab === 'quizzes' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Quiz & Assessment Builder</h2>
                <p style={styles.sectionSubtitle}>Build multiple-choice questions, set time limits, publish to student portal, and view scores.</p>
              </div>
              <button style={styles.primaryBtn} onClick={() => setShowCreateQuizModal(true)}>
                <Plus size={18} /> Create New Quiz
              </button>
            </div>

            <div style={styles.coursesGrid}>
              {quizzes.map(q => (
                <div key={q.id} style={styles.quizCard}>
                  <div style={styles.courseCardTop}>
                    <span style={q.published ? styles.badgeSuccess : styles.badgeSecondary}>
                      {q.published ? 'Published' : 'Draft'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ⏱️ {q.duration} Mins • {q.totalMarks} Total Pts
                    </span>
                  </div>

                  <h3 style={{ ...styles.courseTitle, marginTop: '0.5rem' }}>{q.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {q.questions.length} Questions • Due: {q.dueDate}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Student Submissions ({q.submissions?.length || 0})
                    </div>
                    {q.submissions?.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No student submissions yet.</div>
                    ) : (
                      q.submissions.map((sub, i) => (
                        <div key={i} style={styles.subItem}>
                          <span>{sub.studentName}</span>
                          <strong style={{ color: '#34d399' }}>{sub.score} / {q.totalMarks}</strong>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={styles.courseCardFooter}>
                    <button 
                      style={q.published ? styles.outlineBtnSm : styles.primaryBtnSm}
                      onClick={() => handleTogglePublishQuiz(q.id)}
                    >
                      {q.published ? 'Unpublish' : 'Publish to Students'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 7. ASSIGNMENTS & STUDY MATERIALS */}
        {/* ======================================================== */}
        {tab === 'materials' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Assignments & Study Materials</h2>
                <p style={styles.sectionSubtitle}>Manage homework tasks, grade student submissions, and upload lecture notes.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={styles.outlineBtn} onClick={() => setShowAddMaterialModal(true)}>
                  <Upload size={18} /> Upload Material
                </button>
                <button style={styles.primaryBtn} onClick={() => setShowAddAssignModal(true)}>
                  <Plus size={18} /> New Assignment
                </button>
              </div>
            </div>

            {/* Assignments Section */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Active Homework & Assignments</h3>
              <div style={styles.coursesGrid}>
                {assignments.map(a => (
                  <div key={a.id} style={styles.assignCard}>
                    <div style={styles.courseCardTop}>
                      <span style={styles.badgePrimary}>Max: {a.maxMarks} Marks</span>
                      <span style={{ fontSize: '0.8rem', color: '#f87171' }}>Deadline: {a.deadline}</span>
                    </div>
                    <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>{a.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {a.description}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Submissions ({a.submissions?.length || 0})
                      </div>
                      {a.submissions?.map((sub, idx) => (
                        <div key={idx} style={styles.subItem}>
                          <div>
                            <div>{sub.studentName}</div>
                            <small style={{ color: 'var(--text-muted)' }}>{sub.file}</small>
                          </div>
                          <div>
                            {sub.score !== null ? (
                              <span style={{ color: '#34d399', fontWeight: 700 }}>{sub.score} / {a.maxMarks}</span>
                            ) : (
                              <button 
                                style={styles.primaryBtnSm}
                                onClick={() => {
                                  const score = prompt(`Enter score for ${sub.studentName} (out of ${a.maxMarks}):`, '45');
                                  if (score) {
                                    setAssignments(prev => prev.map(item => {
                                      if (item.id === a.id) {
                                        const subs = item.submissions.map(s => s.studentId === sub.studentId ? { ...s, score: parseFloat(score), status: 'Reviewed' } : s);
                                        return { ...item, submissions: subs };
                                      }
                                      return item;
                                    }));
                                    showToast('Score recorded for student submission.');
                                  }
                                }}
                              >
                                Review & Grade
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Materials Repository */}
            <div style={{ ...styles.card, marginTop: '1.5rem' }}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Course Study Materials & Lecture Notes</h3>
                <button style={styles.primaryBtnSm} onClick={() => setShowAddMaterialModal(true)}>
                  <Upload size={14} /> Add Resource
                </button>
              </div>

              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Material Title</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>File Name & Size</th>
                      <th style={styles.th}>Upload Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(m => (
                      <tr key={m.id} style={styles.tr}>
                        <td style={styles.td}><strong>{m.title}</strong></td>
                        <td style={styles.td}><span style={styles.badgeSecondary}>{m.category}</span></td>
                        <td style={styles.td}>{m.fileName} ({m.size})</td>
                        <td style={styles.td}>{m.uploadedAt}</td>
                        <td style={styles.td}>
                          <button 
                            style={styles.outlineBtnSm}
                            onClick={() => showToast(`Downloading ${m.fileName}...`)}
                          >
                            <Download size={14} /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 8. ANNOUNCEMENTS */}
        {/* ======================================================== */}
        {tab === 'announcements' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Announcements & Notices</h2>
                <p style={styles.sectionSubtitle}>Broadcast official notices to students, faculty, or the entire campus.</p>
              </div>
              <button style={styles.primaryBtn} onClick={() => setShowAddAnnounceModal(true)}>
                <Plus size={18} /> New Announcement
              </button>
            </div>

            <div style={styles.coursesGrid}>
              {announcements.map(a => (
                <div key={a.id} style={styles.announceCard}>
                  <div style={styles.courseCardTop}>
                    <span style={styles.badgePrimary}>{a.target_role?.toUpperCase()}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(a.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ margin: '0.75rem 0', fontSize: '1.1rem' }}>{a.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{a.content}</p>

                  <div style={styles.courseCardFooter}>
                    <button 
                      style={styles.dangerBtnSm}
                      onClick={() => handleDeleteAnnouncement(a.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 9. TIMETABLE MANAGEMENT */}
        {/* ======================================================== */}
        {tab === 'timetable' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Weekly Teaching Schedule</h2>
                <p style={styles.sectionSubtitle}>View lecture timings, classrooms, and automated conflict detection.</p>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.timetableGrid}>
                {timetableDays.map(day => {
                  const dayClasses = courses.filter(c => c.schedule?.toLowerCase().includes(day.toLowerCase().slice(0, 3)));
                  return (
                    <div key={day} style={styles.timetableCol}>
                      <div style={styles.timetableColHeader}>{day}</div>
                      <div style={styles.timetableColBody}>
                        {dayClasses.length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                            No classes
                          </div>
                        ) : (
                          dayClasses.map(dc => (
                            <div key={dc.id} style={styles.timetableSlot}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{dc.course_code}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dc.course_name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#818cf8', marginTop: '0.25rem' }}>📍 {dc.classroom}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 10. ANALYTICS DASHBOARD */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* 10. LOW ATTENDANCE (< 75%) STUDENTS REGISTER */}
        {/* ======================================================== */}
        {tab === 'analytics' && (() => {
          const filteredDefaulters = defaulters.filter(s => {
            const matchesCourse = defaulterCourseFilter === 'all' || s.offering_id?.toString() === defaulterCourseFilter;
            const matchesSearch = !defaulterSearch || 
              s.name?.toLowerCase().includes(defaulterSearch.toLowerCase()) || 
              s.roll_number?.toLowerCase().includes(defaulterSearch.toLowerCase()) ||
              s.course_code?.toLowerCase().includes(defaulterSearch.toLowerCase());
            
            const rate = parseFloat(s.attendance_rate ?? 100);
            const matchesThreshold = defaulterThreshold === 'all' ? true :
                                     defaulterThreshold === '65' ? rate < 65.0 :
                                     rate < 75.0;

            return matchesCourse && matchesSearch && matchesThreshold;
          });

          const totalChecked = defaulters.length;
          const countShortage75 = defaulters.filter(s => parseFloat(s.attendance_rate ?? 100) < 75.0).length;
          const countCritical65 = defaulters.filter(s => parseFloat(s.attendance_rate ?? 100) < 65.0).length;
          const countGood = defaulters.filter(s => parseFloat(s.attendance_rate ?? 100) >= 75.0).length;

          return (
            <div>
              <div style={styles.sectionTop}>
                <div>
                  <h2 style={styles.sectionTitle}>Students with Low Attendance (&lt; 75%)</h2>
                  <p style={styles.sectionSubtitle}>
                    Real-time roster of students below the mandatory 75% examination eligibility threshold.
                  </p>
                </div>
                <button 
                  style={styles.outlineBtn}
                  onClick={() => {
                    const csvRows = [
                      ['Student Name', 'Roll Number', 'Course Code', 'Course Name', 'Attended', 'Total Classes', 'Attendance %', 'Status'],
                      ...filteredDefaulters.map(s => [
                        s.name,
                        s.roll_number,
                        s.course_code,
                        s.course_name,
                        s.present_count,
                        s.total_count,
                        `${s.attendance_rate}%`,
                        s.attendance_rate < 75 ? 'Ineligible for Exams' : 'Eligible'
                      ])
                    ];
                    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'low_attendance_students.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('Exported defaulters list to CSV.');
                  }}
                >
                  <Download size={16} /> Export Defaulters List
                </button>
              </div>

              {/* KPI Summary Cards */}
              <div style={styles.kpiGrid}>
                <div style={styles.kpiCard}>
                  <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiLabel}>Total Students Enrolled</div>
                    <div style={styles.kpiValue}>{totalChecked}</div>
                  </div>
                </div>

                <div style={styles.kpiCard}>
                  <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiLabel}>Below 75% (Shortage)</div>
                    <div style={{ ...styles.kpiValue, color: '#f87171' }}>{countShortage75}</div>
                  </div>
                </div>

                <div style={styles.kpiCard}>
                  <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#ef4444' }}>
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiLabel}>Critical Shortage (&lt; 65%)</div>
                    <div style={{ ...styles.kpiValue, color: '#ef4444' }}>{countCritical65}</div>
                  </div>
                </div>

                <div style={styles.kpiCard}>
                  <div style={{ ...styles.kpiIconBox, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div style={styles.kpiLabel}>Eligible (&ge; 75%)</div>
                    <div style={{ ...styles.kpiValue, color: '#34d399' }}>{countGood}</div>
                  </div>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div style={styles.filterBar}>
                <div style={styles.searchBox}>
                  <Search size={18} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search by student name, roll number, or course..."
                    value={defaulterSearch}
                    onChange={e => setDefaulterSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <select
                  style={styles.select}
                  value={defaulterCourseFilter}
                  onChange={e => setDefaulterCourseFilter(e.target.value)}
                >
                  <option value="all">All Assigned Courses</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.course_code} - {c.course_name}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    style={defaulterThreshold === '75' ? styles.primaryBtnSm : styles.outlineBtnSm}
                    onClick={() => setDefaulterThreshold('75')}
                  >
                    &lt; 75% Only ({countShortage75})
                  </button>
                  <button
                    style={defaulterThreshold === '65' ? styles.dangerBtnSm : styles.outlineBtnSm}
                    onClick={() => setDefaulterThreshold('65')}
                  >
                    &lt; 65% Critical ({countCritical65})
                  </button>
                  <button
                    style={defaulterThreshold === 'all' ? styles.primaryBtnSm : styles.outlineBtnSm}
                    onClick={() => setDefaulterThreshold('all')}
                  >
                    All Enrolled ({totalChecked})
                  </button>
                </div>
              </div>

              {/* Defaulters Table */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    {defaulterThreshold === 'all' 
                      ? 'All Enrolled Students Attendance Register'
                      : `Students with Attendance Below ${defaulterThreshold}% Threshold`}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Showing {filteredDefaulters.length} student record{filteredDefaulters.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {filteredDefaulters.length === 0 ? (
                  <div style={styles.emptyState}>
                    <CheckCircle2 size={48} style={{ color: '#34d399', marginBottom: '0.75rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffffff' }}>No Students Below {defaulterThreshold}%</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      All students in the selected criteria have maintained compliant attendance.
                    </p>
                  </div>
                ) : (
                  <div style={styles.tableResponsive}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Student</th>
                          <th style={styles.th}>Roll Number</th>
                          <th style={styles.th}>Course</th>
                          <th style={styles.th}>Classes Attended</th>
                          <th style={styles.th}>Attendance Rate</th>
                          <th style={styles.th}>Exam Eligibility</th>
                          <th style={styles.th}>Intervention Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDefaulters.map(s => {
                          const rate = parseFloat(s.attendance_rate ?? 100);
                          const isShortage = rate < 75.0;
                          const isCritical = rate < 65.0;

                          const needed = isShortage && s.total_count > 0 
                            ? Math.max(1, Math.ceil((0.75 * s.total_count - s.present_count) / 0.25))
                            : 0;

                          return (
                            <tr key={`${s.user_id}-${s.offering_id || s.course_code}`} style={styles.tr}>
                              <td style={styles.td}>
                                <div style={styles.studentNameCell}>
                                  <div style={{
                                    ...styles.avatarSm,
                                    backgroundColor: isShortage ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: isShortage ? '#f87171' : '#34d399'
                                  }}>
                                    {s.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={styles.td}>
                                <span style={styles.rollBadge}>{s.roll_number}</span>
                              </td>
                              <td style={styles.td}>
                                <div style={{ fontWeight: 600 }}>{s.course_code}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.course_name}</div>
                              </td>
                              <td style={styles.td}>
                                <strong>{s.present_count}</strong> / {s.total_count} sessions
                                {isShortage && (
                                  <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.2rem' }}>
                                    Missed {s.absent_count} classes
                                  </div>
                                )}
                              </td>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.2)' : isShortage ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: isCritical ? '#f87171' : isShortage ? '#fbbf24' : '#34d399',
                                    border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.4)' : isShortage ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                                  }}>
                                    {rate}%
                                  </span>
                                </div>
                                {needed > 0 && (
                                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                    Needs next <strong>{needed}</strong> class{needed > 1 ? 'es' : ''} to reach 75%
                                  </div>
                                )}
                              </td>
                              <td style={styles.td}>
                                {isShortage ? (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    color: '#f87171',
                                    fontWeight: 700,
                                    fontSize: '0.78rem'
                                  }}>
                                    <AlertTriangle size={14} /> Ineligible for Exams
                                  </span>
                                ) : (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    color: '#34d399',
                                    fontWeight: 700,
                                    fontSize: '0.78rem'
                                  }}>
                                    <Check size={14} /> Eligible
                                  </span>
                                )}
                              </td>
                              <td style={styles.td}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    style={styles.dangerBtnSm}
                                    onClick={() => {
                                      showToast(`Formal attendance warning sent to ${s.name} (${s.roll_number}) for ${s.course_code}.`);
                                    }}
                                  >
                                    Send Warning
                                  </button>
                                  {s.phone && (
                                    <a
                                      href={`tel:${s.phone}`}
                                      style={{ ...styles.outlineBtnSm, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                    >
                                      Call
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* 11. EXAM MANAGEMENT */}
        {/* ======================================================== */}
        {tab === 'exams' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Exam & Invigilation Management</h2>
                <p style={styles.sectionSubtitle}>View scheduled semester exams, invigilation duty halls, and grading timelines.</p>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Assigned Course Final Examinations</h3>
              {courses.length === 0 ? (
                <div style={styles.emptyTable}>No exams scheduled yet.</div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Course Code & Name</th>
                        <th style={styles.th}>Exam Date</th>
                        <th style={styles.th}>Classroom Hall</th>
                        <th style={styles.th}>Duration</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c.id} style={styles.tr}>
                          <td style={styles.td}>
                            <strong>{c.course_code}</strong> - {c.course_name}
                          </td>
                          <td style={styles.td}>
                            {c.exam_date ? (
                              <strong style={{ color: '#38bdf8' }}>{new Date(c.exam_date).toLocaleDateString()}</strong>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>TBD</span>
                            )}
                          </td>
                          <td style={styles.td}>{c.classroom}</td>
                          <td style={styles.td}>3 Hours (10:00 AM - 01:00 PM)</td>
                          <td style={styles.td}>
                            <button 
                              style={styles.primaryBtnSm}
                              onClick={() => navigate('/faculty/grades')}
                            >
                              Enter Exam Marks
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Invigilation Schedule */}
            <div style={{ ...styles.card, marginTop: '1.5rem' }}>
              <h3 style={styles.cardTitle}>Invigilation Duties</h3>
              <div style={styles.twoColumnGrid}>
                <div style={styles.classItem}>
                  <div>
                    <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>OCTOBER 15, 2026</div>
                    <h4 style={{ margin: '0.25rem 0' }}>Hall 302 (Main Tech Block)</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Chief Invigilator • Shift A (09:30 AM - 01:30 PM)
                    </div>
                  </div>
                  <span style={styles.badgeSuccess}>Confirmed</span>
                </div>

                <div style={styles.classItem}>
                  <div>
                    <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>OCTOBER 22, 2026</div>
                    <h4 style={{ margin: '0.25rem 0' }}>Seminar Hall B</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Assistant Invigilator • Shift B (01:30 PM - 05:30 PM)
                    </div>
                  </div>
                  <span style={styles.badgePrimary}>Upcoming</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 12. STUDENT QUERIES & SUPPORT */}
        {/* ======================================================== */}
        {tab === 'queries' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Student Academic Queries</h2>
                <p style={styles.sectionSubtitle}>Review student tickets, send official replies, and track resolutions.</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'open', 'in_progress', 'resolved'].map(f => (
                  <button 
                    key={f}
                    style={ticketFilter === f ? styles.primaryBtnSm : styles.outlineBtnSm}
                    onClick={() => setTicketFilter(f)}
                  >
                    {f.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              {filteredTickets.length === 0 ? (
                <div style={styles.emptyTable}>No academic queries matching this status filter.</div>
              ) : (
                <div style={styles.ticketList}>
                  {filteredTickets.map(t => (
                    <div key={t.id} style={styles.ticketCard}>
                      <div style={styles.courseCardTop}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={styles.rollBadge}>{t.roll_number || 'STU'}</span>
                          <strong>{t.student_name || 'Student'}</strong>
                        </div>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: t.status === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: t.status === 'resolved' ? '#34d399' : '#fbbf24'
                        }}>
                          {t.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>{t.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                        {t.description}
                      </p>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                        {activeTicket === t.id ? (
                          <div>
                            <textarea 
                              style={{ ...styles.textarea, marginBottom: '0.5rem' }}
                              placeholder="Type your official faculty reply here..."
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button style={styles.primaryBtnSm} onClick={() => handleSendReply(t.id)}>
                                <Send size={14} /> Send Reply & Resolve
                              </button>
                              <button style={styles.outlineBtnSm} onClick={() => setActiveTicket(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={styles.outlineBtnSm} onClick={() => { setActiveTicket(t.id); setReplyText(''); }}>
                              <MessageSquare size={14} /> Reply to Student
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 13. FACULTY PROFILE & PEERS */}
        {/* ======================================================== */}
        {tab === 'profile' && (
          <div>
            <div style={styles.sectionTop}>
              <div>
                <h2 style={styles.sectionTitle}>Faculty Profile & Department Advisory</h2>
                <p style={styles.sectionSubtitle}>View personal credentials, edit contact details, and inspect department peer directory.</p>
              </div>
              <button style={styles.primaryBtn} onClick={() => setShowEditProfileModal(true)}>
                <Edit3 size={18} /> Edit Profile
              </button>
            </div>

            <div style={styles.twoColumnGrid}>
              {/* Profile Card */}
              <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={styles.avatarLg}>
                    {(user?.faculty_name || user?.name || 'P').charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{user?.faculty_name || user?.name}</h3>
                    <div style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>
                      {user?.designation || 'Associate Professor'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      ID: {user?.employee_id || 'FAC-001'}
                    </div>
                  </div>
                </div>

                <div style={styles.profileDetailsList}>
                  <div style={styles.profileDetailItem}>
                    <span style={styles.profileDetailLabel}>Department:</span>
                    <span>{user?.department_name || 'Engineering Faculty'}</span>
                  </div>
                  <div style={styles.profileDetailItem}>
                    <span style={styles.profileDetailLabel}>Email:</span>
                    <span>{user?.email}</span>
                  </div>
                  <div style={styles.profileDetailItem}>
                    <span style={styles.profileDetailLabel}>Contact Phone:</span>
                    <span>{user?.phone || 'Not set'}</span>
                  </div>
                  <div style={styles.profileDetailItem}>
                    <span style={styles.profileDetailLabel}>Qualifications:</span>
                    <span>{user?.qualification || 'Ph.D.'}</span>
                  </div>
                </div>
              </div>

              {/* Department Advisory & No-Dues Clearance */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Graduation No-Dues Advisory</h3>
                  <span style={styles.badgePrimary}>{nodues.length} Students</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Approve and clear academic dues for graduating students in your department.
                </p>

                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Student</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodues.slice(0, 5).map(nd => (
                        <tr key={nd.id} style={styles.tr}>
                          <td style={styles.td}>
                            <strong>{nd.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{nd.roll_number}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: nd.status === 'cleared' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: nd.status === 'cleared' ? '#34d399' : '#fbbf24'
                            }}>
                              {nd.status?.toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {nd.status !== 'cleared' ? (
                              <button 
                                style={styles.primaryBtnSm}
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`${API_BASE_URL}/api/faculty/nodues/${nd.student_id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                      body: JSON.stringify({
                                        library_dues: 'cleared',
                                        hostel_dues: 'cleared',
                                        sports_dues: 'cleared',
                                        accounts_dues: 'cleared'
                                      })
                                    });
                                    if (!res.ok) throw new Error('Failed to clear dues.');
                                    showToast(`No-Dues cleared for ${nd.name}!`);
                                    loadFacultyData();
                                  } catch (e) { showToast(e.message, 'error'); }
                                }}
                              >
                                Clear Dues
                              </button>
                            ) : (
                              <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>Cleared ✓</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Department Faculty Peers */}
            <div style={{ ...styles.card, marginTop: '1.5rem' }}>
              <h3 style={styles.cardTitle}>Department Faculty Directory</h3>
              <div style={styles.peersGrid}>
                {peers.map(p => (
                  <div key={p.id} style={styles.peerCard}>
                    <div style={styles.avatarSm}>{p.name?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>{p.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* 1. Add Course Offering Modal */}
      {showAddCourseModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Offer New Course</h3>
              <button style={styles.textBtn} onClick={() => setShowAddCourseModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateOffering} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Department Course</label>
                <select 
                  style={styles.select}
                  value={courseForm.course_id}
                  onChange={e => setCourseForm({ ...courseForm, course_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose Course from Catalog --</option>
                  {catalog.map(c => (
                    <option key={c.id} value={c.id}>{c.course_code} - {c.name} ({c.credits} Credits)</option>
                  ))}
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Semester</label>
                  <select 
                    style={styles.select}
                    value={courseForm.semester}
                    onChange={e => setCourseForm({ ...courseForm, semester: e.target.value })}
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Academic Year</label>
                  <input 
                    type="text" 
                    style={styles.input}
                    value={courseForm.academic_year}
                    onChange={e => setCourseForm({ ...courseForm, academic_year: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Class Schedule / Days</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Mon / Wed / Fri 10:00 AM - 11:30 AM"
                  value={courseForm.schedule}
                  onChange={e => setCourseForm({ ...courseForm, schedule: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Classroom Location</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Room 304, Tech Block"
                  value={courseForm.classroom}
                  onChange={e => setCourseForm({ ...courseForm, classroom: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Final Exam Date (Optional)</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={courseForm.exam_date}
                  onChange={e => setCourseForm({ ...courseForm, exam_date: e.target.value })}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.outlineBtn} onClick={() => setShowAddCourseModal(false)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Create Offering</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Course Modal */}
      {showEditCourseModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Course Schedule</h3>
              <button style={styles.textBtn} onClick={() => setShowEditCourseModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateOffering} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Class Schedule</label>
                <input 
                  type="text" 
                  style={styles.input}
                  value={courseForm.schedule}
                  onChange={e => setCourseForm({ ...courseForm, schedule: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Classroom</label>
                <input 
                  type="text" 
                  style={styles.input}
                  value={courseForm.classroom}
                  onChange={e => setCourseForm({ ...courseForm, classroom: e.target.value })}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Exam Date</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={courseForm.exam_date}
                  onChange={e => setCourseForm({ ...courseForm, exam_date: e.target.value })}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.outlineBtn} onClick={() => setShowEditCourseModal(false)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Course Confirmation Modal */}
      {showDeleteCourseModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBoxSm}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#f87171' }}>Delete Course Offering?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Are you sure you want to remove this course offering? This will disconnect enrolled students and past attendance logs.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button style={styles.outlineBtn} onClick={() => setShowDeleteCourseModal(false)}>Cancel</button>
              <button style={styles.dangerBtn} onClick={handleDeleteOffering}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Student Detail Modal */}
      {selectedStudentDetail && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={styles.avatarSm}>{selectedStudentDetail.name.charAt(0)}</div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedStudentDetail.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedStudentDetail.roll_number}</div>
                </div>
              </div>
              <button style={styles.textBtn} onClick={() => setSelectedStudentDetail(null)}><X size={20} /></button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={styles.profileDetailsList}>
                <div style={styles.profileDetailItem}>
                  <span style={styles.profileDetailLabel}>Email:</span>
                  <span>{selectedStudentDetail.email}</span>
                </div>
                <div style={styles.profileDetailItem}>
                  <span style={styles.profileDetailLabel}>Phone:</span>
                  <span>{selectedStudentDetail.phone || 'N/A'}</span>
                </div>
                <div style={styles.profileDetailItem}>
                  <span style={styles.profileDetailLabel}>Semester:</span>
                  <span>Semester {selectedStudentDetail.semester}</span>
                </div>
                <div style={styles.profileDetailItem}>
                  <span style={styles.profileDetailLabel}>Current CGPA:</span>
                  <strong style={{ color: '#34d399' }}>{selectedStudentDetail.current_gpa || '3.50'}</strong>
                </div>
                <div style={styles.profileDetailItem}>
                  <span style={styles.profileDetailLabel}>Global Attendance:</span>
                  <span>88.5% (Eligible for exams)</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button style={styles.primaryBtn} onClick={() => setSelectedStudentDetail(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Assessment Modal */}
      {showAddAssessmentModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create New Assessment</h3>
              <button style={styles.textBtn} onClick={() => setShowAddAssessmentModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAssessment} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Assessment Title</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Midterm 1: ER Models"
                  value={newAssessment.title}
                  onChange={e => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assessment Type</label>
                  <select 
                    style={styles.select}
                    value={newAssessment.type}
                    onChange={e => setNewAssessment({ ...newAssessment, type: e.target.value })}
                  >
                    <option>Midterm</option>
                    <option>Quiz</option>
                    <option>Assignment</option>
                    <option>Lab</option>
                    <option>Final Exam</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Maximum Marks</label>
                  <input 
                    type="number" 
                    style={styles.input}
                    min="1"
                    max="100"
                    value={newAssessment.maxMarks}
                    onChange={e => setNewAssessment({ ...newAssessment, maxMarks: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Assessment Date</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={newAssessment.date}
                  onChange={e => setNewAssessment({ ...newAssessment, date: e.target.value })}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.outlineBtn} onClick={() => setShowAddAssessmentModal(false)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Save Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Quiz Modal */}
      {showCreateQuizModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, maxWidth: '650px' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create MCQ Quiz</h3>
              <button style={styles.textBtn} onClick={() => setShowCreateQuizModal(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Quiz Title</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Chapter 2: Relational Integrity Constraints"
                  value={quizForm.title}
                  onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duration (Minutes)</label>
                  <input 
                    type="number" 
                    style={styles.input}
                    value={quizForm.duration}
                    onChange={e => setQuizForm({ ...quizForm, duration: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Due Date</label>
                  <input 
                    type="date" 
                    style={styles.input}
                    value={quizForm.dueDate}
                    onChange={e => setQuizForm({ ...quizForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <h4 style={{ margin: '1.5rem 0 0.75rem', fontSize: '0.95rem' }}>Quiz Questions ({quizForm.questions.length})</h4>

              {quizForm.questions.map((q, qIndex) => (
                <div key={q.id} style={styles.questionBuilderCard}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Question {qIndex + 1}</label>
                    <input 
                      type="text" 
                      style={styles.input}
                      placeholder="Type question text..."
                      value={q.question}
                      onChange={e => {
                        const updated = [...quizForm.questions];
                        updated[qIndex].question = e.target.value;
                        setQuizForm({ ...quizForm, questions: updated });
                      }}
                    />
                  </div>

                  <div style={styles.optionsGrid}>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input 
                          type="radio" 
                          name={`correct-${q.id}`} 
                          checked={q.correct === oIndex}
                          onChange={() => {
                            const updated = [...quizForm.questions];
                            updated[qIndex].correct = oIndex;
                            setQuizForm({ ...quizForm, questions: updated });
                          }}
                        />
                        <input 
                          type="text" 
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          style={{ ...styles.input, flex: 1 }}
                          value={opt}
                          onChange={e => {
                            const updated = [...quizForm.questions];
                            updated[qIndex].options[oIndex] = e.target.value;
                            setQuizForm({ ...quizForm, questions: updated });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button style={{ ...styles.outlineBtn, width: '100%', marginTop: '0.5rem' }} onClick={handleAddQuestion}>
                <Plus size={16} /> Add Another Question
              </button>

              <div style={{ ...styles.modalActions, marginTop: '1.5rem' }}>
                <button style={styles.outlineBtn} onClick={() => handleSaveQuiz(false)}>Save Draft</button>
                <button style={styles.primaryBtn} onClick={() => handleSaveQuiz(true)}>Publish Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add Assignment Modal */}
      {showAddAssignModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Publish Assignment</h3>
              <button style={styles.textBtn} onClick={() => setShowAddAssignModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAssignment} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Assignment Title</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Project Phase 1: Architecture Diagram"
                  value={assignForm.title}
                  onChange={e => setAssignForm({ ...assignForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description & Guidelines</label>
                <textarea 
                  style={styles.textarea}
                  rows="3"
                  placeholder="Submission instructions..."
                  value={assignForm.description}
                  onChange={e => setAssignForm({ ...assignForm, description: e.target.value })}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Maximum Marks</label>
                  <input 
                    type="number" 
                    style={styles.input}
                    value={assignForm.maxMarks}
                    onChange={e => setAssignForm({ ...assignForm, maxMarks: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Deadline Date</label>
                  <input 
                    type="date" 
                    style={styles.input}
                    value={assignForm.deadline}
                    onChange={e => setAssignForm({ ...assignForm, deadline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.outlineBtn} onClick={() => setShowAddAssignModal(false)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Publish Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Add Study Material Modal */}
      {showAddMaterialModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Upload Study Material</h3>
              <button style={styles.textBtn} onClick={() => setShowAddMaterialModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMaterial} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Material Title</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Chapter 3 Lecture Slides (PPT)"
                  value={materialForm.title}
                  onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select 
                  style={styles.select}
                  value={materialForm.category}
                  onChange={e => setMaterialForm({ ...materialForm, category: e.target.value })}
                >
                  <option>Lecture Notes</option>
                  <option>Slides / Presentation</option>
                  <option>Syllabus</option>
                  <option>Reference Document</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>File Name (e.g. Notes.pdf)</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Unit3_DBMS_Notes.pdf"
                  value={materialForm.fileName}
                  onChange={e => setMaterialForm({ ...materialForm, fileName: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.outlineBtn} onClick={() => setShowAddMaterialModal(false)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Upload Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Create Announcement Modal */}
      {showAddAnnounceModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Post Announcement</h3>
              <button style={styles.textBtn} onClick={() => setShowAddAnnounceModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAnnouncement} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Announcement Title</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g. Midterm Examination Venue Changed"
                  value={announceForm.title}
                  onChange={e => setAnnounceForm({ ...announceForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Audience</label>
                <select 
                  style={styles.select}
                  value={announceForm.target_role}
                  onChange={e => setAnnounceForm({ ...announceForm, target_role: e.target.value })}
                >
                  <option value="all">All Campus (Students & Faculty)</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notice Content</label>
                <textarea 
                  style={styles.textarea}
                  rows="4"
                  placeholder="Detailed announcement text..."
                  value={announceForm.content}
                  onChange={e => setAnnounceForm({ ...announceForm, content: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.outlineBtn} onClick={() => setShowAddAnnounceModal(false)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Broadcast Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Edit Faculty Profile Modal */}
      {showEditProfileModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Faculty Credentials</h3>
              <button style={styles.textBtn} onClick={() => setShowEditProfileModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProfile} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Phone Number</label>
                <input 
                  type="text" 
                  style={styles.input}
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Academic Qualifications</label>
                <input 
                  type="text" 
                  style={styles.input}
                  value={profileQual}
                  onChange={e => setProfileQual(e.target.value)}
                  placeholder="e.g. Ph.D. in Computer Science & Engineering"
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.outlineBtn} onClick={() => setShowEditProfileModal(false)}>Cancel</button>
                <button type="submit" style={styles.primaryBtn}>Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// =========================================================================
// STYLES OBJECT (Preserving dark navy background, glass cards, purple accents)
// =========================================================================
const styles = {
  container: {
    flex: 1,
    width: 'calc(100% - 280px)',
    minWidth: 0,
    marginLeft: '280px',
    padding: '2rem 2.5rem',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#0d1117',
    color: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  welcomeTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 0.25rem 0',
    letterSpacing: '-0.02em',
  },
  welcomeSubtitle: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    margin: 0,
    fontWeight: '500',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  notifBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  notifDropdown: {
    position: 'absolute',
    top: '70px',
    right: 0,
    width: '320px',
    backgroundColor: '#1f2937',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  notifList: {
    maxHeight: '320px',
    overflowY: 'auto',
  },
  notifItem: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  notifItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  notifItemTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f3f4f6',
  },
  notifItemTime: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  notifItemDesc: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  content: {
    minHeight: '80vh',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '1.5rem',
  },
  kpiCard: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  kpiIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: '0.2rem',
  },
  kpiValue: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 0.25rem 0',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.85rem',
    marginTop: '0.75rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    color: '#c7d2fe',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  classList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  classItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  classCode: {
    fontSize: '0.75rem',
    color: '#818cf8',
    fontWeight: '700',
    marginBottom: '0.2rem',
  },
  className: {
    margin: '0 0 0.35rem 0',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#f3f4f6',
  },
  classSchedule: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  classActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  noticeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  noticeItem: {
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  noticeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  noticeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  },
  noticeDate: {
    fontSize: '0.75rem',
    color: '#9ca3af',
  },
  noticeTitle: {
    margin: '0 0 0.35rem 0',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  noticeContent: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#9ca3af',
    lineHeight: '1.4',
  },
  sectionTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 0.25rem 0',
  },
  sectionSubtitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    margin: 0,
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  courseCard: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  courseCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  badgePrimary: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
  },
  badgeSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#9ca3af',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
  },
  courseTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 1rem 0',
  },
  courseDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  courseDetailRow: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  courseCardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.65rem 1rem',
    flex: 1,
    maxWidth: '450px',
  },
  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ffffff',
    outline: 'none',
    width: '100%',
    fontSize: '0.85rem',
  },
  attendanceFilterCard: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1.25rem',
    marginBottom: '1.5rem',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '0.85rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.85rem',
    color: '#f3f4f6',
  },
  studentNameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatarSm: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  avatarLg: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.8rem',
  },
  rollBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontWeight: '600',
    fontSize: '0.8rem',
  },
  toggleButtonGroup: {
    display: 'flex',
    gap: '0.35rem',
  },
  toggleBtn: {
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#9ca3af',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  toggleBtnPresentActive: {
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    backgroundColor: '#10b981',
    border: '1px solid #10b981',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  toggleBtnAbsentActive: {
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    backgroundColor: '#ef4444',
    border: '1px solid #ef4444',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  toggleBtnLateActive: {
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    backgroundColor: '#f59e0b',
    border: '1px solid #f59e0b',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyTable: {
    padding: '2.5rem',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.9rem',
  },
  emptyState: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    color: '#9ca3af',
  },
  emptyStateCard: {
    backgroundColor: '#161b22',
    border: '1px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  primaryBtnSm: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    color: '#f3f4f6',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  outlineBtnSm: {
    backgroundColor: 'transparent',
    color: '#f3f4f6',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  dangerBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dangerBtnSm: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  textBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#9ca3af',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    padding: '0.6rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  select: {
    backgroundColor: '#1f2937',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    padding: '0.6rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  textarea: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    padding: '0.6rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  toast: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    color: '#ffffff',
    padding: '0.85rem 1.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 9999,
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalBox: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '520px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
  },
  modalBoxSm: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '420px',
    padding: '1.75rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  modalForm: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  quizCard: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  assignCard: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  subItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.8rem',
  },
  announceCard: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  ticketCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  timetableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  timetableCol: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  timetableColHeader: {
    padding: '0.75rem',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#c7d2fe',
    fontWeight: '700',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  timetableColBody: {
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minHeight: '200px',
  },
  timetableSlot: {
    padding: '0.75rem',
    backgroundColor: '#1f2937',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
  },
  profileDetailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  profileDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '0.5rem',
  },
  profileDetailLabel: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  peersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  peerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  questionBuilderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginTop: '0.5rem',
  }
};

export default FacultyWorkspace;

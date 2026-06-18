import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, UserPlus, Trash2, X, AlertTriangle, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { downloadStudentTemplate, downloadFacultyTemplate } from '../../utils/excelTemplate';

const ManageUsers = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('student');
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk upload states
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUsers, setBulkUsers] = useState([]);
  const [bulkRole, setBulkRole] = useState('student');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [deptId, setDeptId] = useState('');
  // Student specific
  const [rollNumber, setRollNumber] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('1');
  // Faculty specific
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`http://127.0.0.1:5000/api/admin/users/${activeTab}`, { headers });
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch users error:', err);
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDepartments(data);
      if (data.length > 0) setDeptId(data[0].id.toString());
    } catch (err) {
      console.error('Fetch depts error:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = () => {
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDob('');
    setRollNumber('');
    setEmployeeId('');
    setQualification('');
    setShowModal(true);
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
        const requiredFields = ['name', 'email'];
        if (bulkRole === 'student') requiredFields.push('roll_number');
        else requiredFields.push('employee_id');

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
          newItem.role = bulkRole;
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
      setBulkError('No valid user records to import.');
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

      setBulkSuccess(data.message || 'Users imported successfully!');
      setBulkUsers([]);
      setBulkFile(null);
      fetchUsers();

      setTimeout(() => {
        setShowBulkModal(false);
      }, 1500);
    } catch (err) {
      setBulkError(err.message || 'Error executing bulk registration.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      email,
      password,
      role: activeTab,
      phone,
      date_of_birth: dob,
      department_id: parseInt(deptId)
    };

    if (activeTab === 'student') {
      payload.roll_number = rollNumber;
      payload.enrollment_year = parseInt(enrollmentYear);
      payload.semester = parseInt(semester);
    } else {
      payload.employee_id = employeeId;
      payload.designation = designation;
      payload.qualification = qualification;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user account.');
      }

      setSuccess(`Account for ${name} created successfully!`);
      fetchUsers(); // Refresh grid
      
      // Auto close modal after 1.5s
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the profile of ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.roll_number && user.roll_number.toLowerCase().includes(query)) ||
      (user.employee_id && user.employee_id.toLowerCase().includes(query)) ||
      (user.department_name && user.department_name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="main-content">
      <div className="header-row">
        <div>
          <h1 style={styles.pageTitle} className="title-gradient">User Accounts</h1>
          <p style={styles.pageSubtitle}>Manage and audit campus faculty & students</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowBulkModal(true)} className="btn btn-secondary">
            <Upload size={18} />
            <span>Bulk Import</span>
          </button>
          <button onClick={handleOpenModal} className="btn btn-primary">
            <UserPlus size={18} />
            <span>Register {activeTab === 'student' ? 'Student' : 'Faculty'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('student')}
          style={{ ...styles.tab, ...(activeTab === 'student' ? styles.tabActive : {}) }}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          style={{ ...styles.tab, ...(activeTab === 'faculty' ? styles.tabActive : {}) }}
        >
          Faculty
        </button>
      </div>

      {/* Filter and Table Card */}
      <div className="glass-card" style={styles.listCard}>
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder={`Search by name, email, department, or ${activeTab === 'student' ? 'roll number' : 'employee ID'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={styles.searchInput}
            />
          </div>
        </div>

        {loading ? (
          <div style={styles.tableLoading}>Loading roster...</div>
        ) : (
          <div className="table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>{activeTab === 'student' ? 'Roll No / Sem' : 'Employee ID / Desg'}</th>
                  {activeTab === 'student' && <th>GPA</th>}
                  <th>Contact</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600', color: '#fff' }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge badge-info">{user.department_name}</span>
                    </td>
                    <td>
                      {activeTab === 'student' ? (
                        <span>{user.roll_number} <span style={{ color: 'var(--text-muted)' }}>(Sem {user.semester})</span></span>
                      ) : (
                        <span>{user.employee_id} <span style={{ color: 'var(--text-muted)' }}>({user.designation})</span></span>
                      )}
                    </td>
                    {activeTab === 'student' && (
                      <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>
                        {parseFloat(user.current_gpa || 0).toFixed(2)}
                      </td>
                    )}
                    <td>{user.phone || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="btn btn-danger"
                        style={styles.deleteBtn}
                        title="Delete User Account"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={activeTab === 'student' ? 7 : 6} style={styles.emptyRow}>
                      No matching user records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - User Registration */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={styles.modal}>
            <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
              <X size={20} />
            </button>
            <h2 style={styles.modalTitle}>Register New {activeTab === 'student' ? 'Student' : 'Faculty'}</h2>
            <p style={styles.modalDesc}>Complete details to provision account credentials.</p>

            <form onSubmit={handleCreateUser} style={{ marginTop: '1.5rem' }}>
              {error && (
                <div className="alert alert-danger" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
              {success && <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>{success}</div>}

              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Alice Johnson"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="alice@college.edu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="+91 99999 00000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="input-field"
                    style={{ background: '#131b2e' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="input-field"
                    style={{ background: '#131b2e' }}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                {activeTab === 'student' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Roll Number</label>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="input-field"
                        placeholder="CSE2026001"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Enrollment Year</label>
                      <input
                        type="number"
                        value={enrollmentYear}
                        onChange={(e) => setEnrollmentYear(e.target.value)}
                        className="input-field"
                        placeholder="2024"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Current Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="input-field"
                        style={{ background: '#131b2e' }}
                      >
                        {[1,2,3,4,5,6,7,8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="input-field"
                        placeholder="FAC-CSE-001"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="input-field"
                        style={{ background: '#131b2e' }}
                      >
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Qualification Details</label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="input-field"
                        placeholder="Ph.D. in Computer Science & Engineering"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Bulk User Import */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ ...styles.modal, maxWidth: '650px' }}>
            <button onClick={() => { setShowBulkModal(false); setBulkUsers([]); setBulkFile(null); }} style={styles.closeBtn}>
              <X size={20} />
            </button>
            <h2 style={styles.modalTitle}>Bulk User Import (Excel)</h2>
            <p style={styles.modalDesc}>Download a template, fill in details, and upload the file to register users in bulk.</p>

            <div style={styles.templateDownloads}>
              <button onClick={downloadStudentTemplate} className="btn btn-secondary" style={styles.templateBtn}>
                <FileSpreadsheet size={16} />
                <span>Student Template</span>
              </button>
              <button onClick={downloadFacultyTemplate} className="btn btn-secondary" style={styles.templateBtn}>
                <FileSpreadsheet size={16} />
                <span>Faculty Template</span>
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} style={{ marginTop: '1.5rem' }}>
              {bulkError && (
                <div className="alert alert-danger" style={{ fontSize: '0.8rem', padding: '0.75rem', marginBottom: '1rem' }}>
                  <AlertTriangle size={16} />
                  <span>{bulkError}</span>
                </div>
              )}
              {bulkSuccess && <div className="alert alert-success" style={{ fontSize: '0.8rem', padding: '0.75rem', marginBottom: '1rem' }}>{bulkSuccess}</div>}

              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Import User Type</label>
                  <select
                    value={bulkRole}
                    onChange={(e) => { setBulkRole(e.target.value); setBulkUsers([]); setBulkFile(null); }}
                    className="input-field"
                    style={{ background: '#131b2e' }}
                  >
                    <option value="student">Students</option>
                    <option value="faculty">Faculty Members</option>
                  </select>
                </div>

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
              </div>

              {bulkUsers.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#fff' }}>
                    Previewing {bulkUsers.length} Records
                  </h4>
                  <div style={styles.previewContainer}>
                    <table style={styles.previewTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>{bulkRole === 'student' ? 'Roll Number' : 'Employee ID'}</th>
                          {bulkRole === 'student' && <th>Sem</th>}
                          <th>Dept Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkUsers.slice(0, 5).map((u, index) => (
                          <tr key={index}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{bulkRole === 'student' ? u.roll_number : u.employee_id}</td>
                            {bulkRole === 'student' && <td>{u.semester || 1}</td>}
                            <td>{u.department_code || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bulkUsers.length > 5 && (
                      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                        ... and {bulkUsers.length - 5} more rows
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
                  {bulkSubmitting ? 'Importing...' : `Import ${bulkUsers.length} Accounts`}
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
  filterBar: {
    marginBottom: '1.25rem',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '450px',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    paddingLeft: '2.5rem',
  },
  tableLoading: {
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
  deleteBtn: {
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    maxWidth: '650px',
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

export default ManageUsers;

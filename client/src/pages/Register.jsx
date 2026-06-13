import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserPlus, AlertCircle, GraduationCap } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();

  // Core fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [deptId, setDeptId] = useState('1'); // CSE=1 default

  // Student specific
  const [rollNumber, setRollNumber] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState(new Date().getFullYear().toString());

  // Faculty specific
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('');

  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const payload = {
      name,
      email,
      password,
      role,
      phone,
      date_of_birth: dob,
      department_id: parseInt(deptId)
    };

    if (role === 'student') {
      payload.roll_number = rollNumber;
      payload.enrollment_year = parseInt(enrollmentYear);
      payload.semester = 1;
    } else {
      payload.employee_id = employeeId;
      payload.designation = designation;
      payload.qualification = qualification;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccess('Account registered successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardContainer}>
        <div style={styles.header}>
          <div style={styles.logoBadge}><GraduationCap size={24} /></div>
          <h1 style={styles.title}>College ERP Dashbord</h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={styles.formCard}>
          <h2 style={styles.formTitle}>Create Account</h2>
          <p style={styles.formSubtitle}>Sign up as a Student or Faculty member</p>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <ShieldCheck size={16} />
              <span>{success}</span>
            </div>
          )}

          <div style={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="name@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
                style={{ background: '#131b2e' }}
                disabled={submitting}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Department</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="input-field"
                style={{ background: '#131b2e' }}
                disabled={submitting}
              >
                <option value="1">Computer Science & Engineering (CSE)</option>
                <option value="2">Electrical Engineering (EE)</option>
                <option value="3">Mechanical Engineering (ME)</option>
              </select>
            </div>

            {role === 'student' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    placeholder="CSE2026001"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="input-field"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Enrollment Year</label>
                  <input
                    type="text"
                    value={enrollmentYear}
                    onChange={(e) => setEnrollmentYear(e.target.value)}
                    className="input-field"
                    required
                    disabled={submitting}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    placeholder="FAC-CSE-001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="input-field"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="input-field"
                    style={{ background: '#131b2e' }}
                    disabled={submitting}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Qualification details</label>
                  <input
                    type="text"
                    placeholder="Ph.D. in Computer Science"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="input-field"
                    required
                    disabled={submitting}
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem' }}
            disabled={submitting}
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Registering Account...' : 'Submit Registration'}</span>
          </button>

          <p style={styles.loginRedirect}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#05070c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  cardContainer: {
    width: '100%',
    maxWidth: '540px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '0.15em',
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.25em',
  },
  formCard: {
    padding: '2rem',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  formSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '1.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.85rem',
  },
  loginRedirect: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '1.25rem',
  }
};

export default Register;

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, User, ShieldAlert, GraduationCap, Settings, Server, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { API_BASE_URL, setApiBaseUrl } from '../utils/api';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Server settings modal state
  const [showConfig, setShowConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(API_BASE_URL);
  const [testStatus, setTestStatus] = useState(null); // 'checking', 'success', 'failed'
  const [testMessage, setTestMessage] = useState('');

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'faculty') navigate('/faculty/dashboard');
    else if (role === 'student') navigate('/student/dashboard');
  };

  const handleTestConnection = async (targetUrl = customApiUrl) => {
    setTestStatus('checking');
    setTestMessage('Pinging backend server...');
    const urlToTest = (targetUrl || API_BASE_URL).replace(/\/+$/, '');

    try {
      const res = await fetch(`${urlToTest}/health`, { method: 'GET' });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setTestStatus('success');
        setTestMessage('Successfully connected to Express backend & MySQL database!');
      } else {
        setTestStatus('failed');
        setTestMessage('Server reachable, but returned non-OK status.');
      }
    } catch (err) {
      setTestStatus('failed');
      setTestMessage(`Cannot connect (${err.message}). Ensure backend server or tunnel is running.`);
    }
  };

  const handleSaveApiUrl = (e) => {
    e.preventDefault();
    setApiBaseUrl(customApiUrl);
  };

  const handleResetApiUrl = () => {
    setApiBaseUrl(null);
  };

  const handleFillDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username/email and password.');
      return;
    }

    setError('');
    setSubmitting(true);

    const result = await login(username, password);

    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Authentication failed. Please verify your credentials or server connection.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.circleBg1}></div>
      <div style={styles.circleBg2}></div>
      
      <div style={styles.cardContainer}>
        {/* Navigation link back to showcase page */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <a href="../" style={styles.backLink}>
            <ArrowLeft size={16} /> Project Showcase & Docs
          </a>
          <button 
            type="button" 
            onClick={() => { setShowConfig(true); handleTestConnection(); }} 
            style={styles.configBtn}
            title="Configure Backend API Server URL"
          >
            <Server size={14} /> Server Config
          </button>
        </div>

        <div style={styles.header}>
          <div style={styles.logoBadge}><GraduationCap size={24} /></div>
          <h1 style={styles.title}>College ERP Dashboard</h1>
          <p style={styles.subtitle}>DBSE & DBD (25CS1302E) • TEAM 5</p>
        </div>
 
        <form onSubmit={handleSubmit} className="glass-card" style={styles.formCard}>
          <h2 style={styles.formTitle}>Sign In</h2>
          <p style={styles.formSubtitle}>Access your academic & administrative dashboard</p>

          {error && (
            <div className="alert alert-danger" style={styles.alertBox}>
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Roll No / Employee ID / Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <KeyRound size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={styles.input}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginBottom: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>

          {/* Quick Demo Credentials */}
          <div style={styles.quickCredentialsBox}>
            <span style={styles.quickCredTitle}>Quick Demo Logins:</span>
            <div style={styles.quickCredBadges}>
              <button 
                type="button" 
                style={styles.quickCredBtn} 
                onClick={() => handleFillDemo('admin@college.edu', 'AdminPassword123')}
              >
                Admin
              </button>
              <button 
                type="button" 
                style={styles.quickCredBtn} 
                onClick={() => handleFillDemo('prasadbabu@college.edu', 'Prasadbabu123')}
              >
                Faculty
              </button>
              <button 
                type="button" 
                style={styles.quickCredBtn} 
                onClick={() => handleFillDemo('sunil@college.edu', 'SunilPassword123')}
              >
                Student
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/register" style={{ fontSize: '0.825rem', color: '#60a5fa', textDecoration: 'none' }}>
              Student Registration Portal →
            </Link>
          </div>
        </form>
      </div>

      {/* Backend Server Configuration Modal */}
      {showConfig && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={18} color="#60a5fa" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Backend API & Database Settings</h3>
              </div>
              <button type="button" onClick={() => setShowConfig(false)} style={styles.closeBtn}>×</button>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
              The College ERP frontend connects to the Express Node.js backend to read and store records in MySQL.
              When hosting on GitHub Pages, point this to your cloud backend (e.g. Render/Railway) or HTTPS tunnel (e.g. Cloudflare/ngrok).
            </p>

            <form onSubmit={handleSaveApiUrl}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>
                  Backend Server URL:
                </label>
                <input
                  type="url"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="https://college-erp-backend.onrender.com"
                  style={styles.configInput}
                  required
                />
              </div>

              {testMessage && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: testStatus === 'success' ? 'rgba(16, 185, 129, 0.15)' : testStatus === 'checking' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: testStatus === 'success' ? '#34d399' : testStatus === 'checking' ? '#93c5fd' : '#f87171',
                  border: `1px solid ${testStatus === 'success' ? 'rgba(16, 185, 129, 0.3)' : testStatus === 'checking' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                  {testStatus === 'success' && <CheckCircle2 size={16} />}
                  {testStatus === 'failed' && <XCircle size={16} />}
                  {testStatus === 'checking' && <RefreshCw size={16} className="spin-icon" />}
                  <span>{testMessage}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  style={styles.testBtn}
                >
                  Test Connection
                </button>
                <button
                  type="submit"
                  style={styles.saveBtn}
                >
                  Save & Apply
                </button>
                <button
                  type="button"
                  onClick={handleResetApiUrl}
                  style={styles.resetBtn}
                >
                  Reset Default
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
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#05070c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  circleBg1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
    top: '-10%',
    left: '-10%',
    zIndex: 1,
  },
  circleBg2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
    bottom: '-10%',
    right: '-10%',
    zIndex: 1,
  },
  cardContainer: {
    width: '100%',
    maxWidth: '460px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#94a3b8',
    fontSize: '0.8rem',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  configBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#cbd5e1',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '0.25rem',
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '0.75rem',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#fff',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '0.15em',
    marginTop: '0.35rem',
  },
  formCard: {
    padding: '2rem',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  formSubtitle: {
    fontSize: '0.825rem',
    color: '#94a3b8',
    marginBottom: '1.5rem',
  },
  alertBox: {
    padding: '0.75rem 1rem',
    fontSize: '0.825rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '1rem',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#64748b',
    pointerEvents: 'none',
  },
  input: {
    paddingLeft: '2.75rem',
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  quickCredentialsBox: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  quickCredTitle: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    display: 'block',
    marginBottom: '6px',
  },
  quickCredBadges: {
    display: 'flex',
    gap: '6px',
  },
  quickCredBtn: {
    flex: 1,
    background: 'rgba(59, 130, 246, 0.12)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    color: '#93c5fd',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },
  modalContent: {
    background: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '14px',
    padding: '1.75rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.5rem',
    cursor: 'pointer',
    lineHeight: 1,
  },
  configInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
  },
  testBtn: {
    background: '#334155',
    color: '#e2e8f0',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resetBtn: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  }
};

export default Login;

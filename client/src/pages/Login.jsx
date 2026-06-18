import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, User, ShieldAlert, GraduationCap } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      setError(result.error || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.circleBg1}></div>
      <div style={styles.circleBg2}></div>
      
      <div style={styles.cardContainer}>
        <div style={styles.header}>
          <div style={styles.logoBadge}><GraduationCap size={24} /></div>
          <h1 style={styles.title}>College ERP Dashbord</h1>
        </div>
 
        <form onSubmit={handleSubmit} className="glass-card" style={styles.formCard}>
          <h2 style={styles.formTitle}>Sign In</h2>
          <p style={styles.formSubtitle}>Access your academic dashboard</p>

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

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
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
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Login'}
          </button>
          
          <p style={styles.registerRedirect}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register here</Link>
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
    gap: '1.5rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '1rem',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
    color: '#fff',
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.25em',
    marginTop: '0.25rem',
  },
  formCard: {
    padding: '2.5rem 2rem',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  formSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
  },
  alertBox: {
    padding: '0.75rem 1rem',
    fontSize: '0.825rem',
    borderRadius: 'var(--radius-md)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  input: {
    paddingLeft: '2.75rem',
  },
  registerRedirect: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '1.25rem',
  }
};

export default Login;

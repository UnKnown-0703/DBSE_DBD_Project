import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Users, 
  Layers, 
  BookOpen, 
  LifeBuoy, 
  Megaphone, 
  Wrench,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [infraTickets, setInfraTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Announcement form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch('http://127.0.0.1:5000/api/admin/stats', { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch infra tickets
      const ticketsRes = await fetch('http://127.0.0.1:5000/api/admin/infra-tickets', { headers });
      const ticketsData = await ticketsRes.json();
      setInfraTickets(ticketsData.filter(t => t.status === 'open'));

      // Fetch announcements
      const announceRes = await fetch('http://127.0.0.1:5000/api/admin/announcements', { headers });
      const announceData = await announceRes.json();
      setAnnouncements(announceData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setPostError('');
    setPostSuccess('');

    if (!title || !content) {
      setPostError('Title and description are required.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, target_role: targetRole })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setPostSuccess('Announcement published successfully!');
      setTitle('');
      setContent('');
      setTargetRole('all');
      
      // Refresh announcements list
      fetchDashboardData();
    } catch (err) {
      setPostError(err.message || 'Error posting notice.');
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/infra-tickets/${ticketId}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setInfraTickets(infraTickets.filter(t => t.id !== ticketId));
        fetchDashboardData(); // Refresh stats counters
      }
    } catch (err) {
      console.error('Resolve ticket error:', err);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Admin Workspace...</div>;
  }

  return (
    <div className="main-content">
      <div className="header-row">
        <div>
          <h1 style={styles.pageTitle} className="title-gradient">Admin Workspace</h1>
          <p style={styles.pageSubtitle}>System health and management stats</p>
        </div>
        <div style={styles.dateBadge}>
          <Clock size={16} />
          <span>Academic Year: 2025-2026</span>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="dashboard-grid">
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Total Students</span>
            <Users style={styles.statIconPurple} />
          </div>
          <h2 style={styles.statVal}>{stats?.students}</h2>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Active Faculty</span>
            <Users style={styles.statIconIndigo} />
          </div>
          <h2 style={styles.statVal}>{stats?.faculty}</h2>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Courses Listed</span>
            <BookOpen style={styles.statIconViolet} />
          </div>
          <h2 style={styles.statVal}>{stats?.courses}</h2>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={styles.statLabel}>Departments</span>
            <Layers style={styles.statIconBlue} />
          </div>
          <h2 style={styles.statVal}>{stats?.departments}</h2>
        </div>
      </div>

      <div style={styles.twoColumnGrid}>
        {/* Left Column: Announcement Poster & Active Notices */}
        <div style={styles.column}>
          <div className="glass-card" style={styles.moduleCard}>
            <div style={styles.cardHeader}>
              <Megaphone size={20} style={{ color: 'var(--secondary)' }} />
              <h3>Publish Announcement</h3>
            </div>
            
            <form onSubmit={handlePostAnnouncement} style={{ marginTop: '1.25rem' }}>
              {postError && <div className="alert alert-danger">{postError}</div>}
              {postSuccess && <div className="alert alert-success">{postSuccess}</div>}

              <div className="form-group">
                <label className="form-label">Notice Title</label>
                <input
                  type="text"
                  placeholder="e.g. End Semester Exams Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice Message</label>
                <textarea
                  rows="4"
                  placeholder="Type the announcement details here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="input-field"
                  style={styles.textarea}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input-field"
                  style={{ background: '#131b2e' }}
                >
                  <option value="all">Everyone (All Students & Faculty)</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Sparkles size={16} />
                <span>Publish Notice</span>
              </button>
            </form>
          </div>

          {/* Announcement Feed History */}
          <div className="glass-card" style={{ ...styles.moduleCard, marginTop: '1.5rem' }}>
            <h3 style={styles.subTitle}>Recent Notice History</h3>
            <div style={styles.announcementList}>
              {announcements.map((ann) => (
                <div key={ann.id} style={styles.announceItem}>
                  <div style={styles.announceMeta}>
                    <span className={`badge ${
                      ann.target_role === 'student' ? 'badge-info' : 
                      ann.target_role === 'faculty' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {ann.target_role}
                    </span>
                    <span style={styles.announceDate}>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 style={styles.announceTitle}>{ann.title}</h4>
                  <p style={styles.announceContent}>{ann.content}</p>
                </div>
              ))}
              {announcements.length === 0 && <p style={styles.emptyText}>No notices posted yet.</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Infrastructure Ticket Queue */}
        <div style={styles.column}>
          <div className="glass-card" style={styles.moduleCard}>
            <div style={styles.cardHeader}>
              <Wrench size={20} style={{ color: 'var(--info)' }} />
              <h3>Campus Maintenance Requests</h3>
            </div>
            
            <div style={styles.ticketQueue}>
              {infraTickets.map((ticket) => (
                <div key={ticket.id} style={styles.ticketItem}>
                  <div style={styles.ticketMeta}>
                    <span className="badge badge-danger" style={{ textTransform: 'capitalize' }}>
                      {ticket.location_type}
                    </span>
                    <span style={styles.ticketLoc}>{ticket.location_name}</span>
                  </div>
                  <p style={styles.ticketDesc}>"{ticket.issue_description}"</p>
                  <div style={styles.ticketFooter}>
                    <span style={styles.ticketUser}>Reported by: {ticket.student_name}</span>
                    <button
                      onClick={() => handleResolveTicket(ticket.id)}
                      className="btn btn-secondary"
                      style={styles.resolveBtn}
                    >
                      <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              ))}
              {infraTickets.length === 0 && (
                <div style={styles.emptyTickets}>
                  <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '0.75rem' }} />
                  <p>All facilities functional. No pending complaints.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-glass)',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  statCard: {
    padding: '1.25rem 1.5rem',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  statVal: {
    fontSize: '2rem',
    fontWeight: '700',
  },
  statIconPurple: { color: '#a78bfa' },
  statIconIndigo: { color: '#6366f1' },
  statIconViolet: { color: '#8b5cf6' },
  statIconBlue: { color: '#3b82f6' },
  
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
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
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  textarea: {
    resize: 'vertical',
  },
  subTitle: {
    fontSize: '1.05rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  announcementList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingRight: '0.25rem',
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
    padding: '2rem',
  },
  ticketQueue: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1.25rem',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  ticketItem: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
  },
  ticketMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  ticketLoc: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
  },
  ticketDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
    marginBottom: '0.75rem',
  },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '0.5rem',
  },
  ticketUser: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  resolveBtn: {
    padding: '0.3rem 0.65rem',
    fontSize: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    gap: '0.35rem',
  },
  emptyTickets: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '3rem 1.5rem',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  }
};

export default AdminDashboard;

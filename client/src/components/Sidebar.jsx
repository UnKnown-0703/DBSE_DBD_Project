import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, 
  UserCheck, 
  Calendar, 
  Briefcase, 
  BookOpen, 
  CreditCard, 
  Building2, 
  Ticket, 
  Wrench, 
  Book, 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Bus, 
  LifeBuoy, 
  Clock, 
  LogOut,
  Users,
  Layers,
  Award,
  FileText,
  BarChart3,
  HelpCircle,
  FolderOpen,
  CheckSquare,
  Bell,
  AlertTriangle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation lists based on user role
  const getNavItems = () => {
    switch (user.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
          { name: 'Manage Users', path: '/admin/users', icon: Users },
          { name: 'Manage Courses', path: '/admin/courses', icon: Layers },
        ];
      case 'faculty':
        return [
          { name: 'Dashboard', path: '/faculty/dashboard', icon: Home },
          { name: 'My Courses', path: '/faculty/courses', icon: BookOpen },
          { name: 'Students', path: '/faculty/students', icon: Users },
          { name: 'Attendance', path: '/faculty/attendance', icon: CheckSquare },
          { name: 'Grades & Marks', path: '/faculty/grades', icon: Award },
          { name: 'Quizzes', path: '/faculty/quizzes', icon: HelpCircle },
          { name: 'Assignments & Materials', path: '/faculty/materials', icon: FileText },
          { name: 'Timetable', path: '/faculty/timetable', icon: Clock },
          { name: 'Announcements', path: '/faculty/announcements', icon: Bell },
          { name: 'Low Attendance (< 75%)', path: '/faculty/analytics', icon: AlertTriangle },
          { name: 'Exams', path: '/faculty/exams', icon: Ticket },
          { name: 'Student Queries', path: '/faculty/queries', icon: LifeBuoy },
          { name: 'Profile & Peers', path: '/faculty/profile', icon: UserCheck },
        ];
      case 'student':
        return [
          { name: 'Home', path: '/student/dashboard', icon: Home },
          { name: 'Academic Registration', path: '/student/registration', icon: UserCheck },
          { name: 'Attendance register', path: '/student/attendance', icon: Calendar },
          { name: 'Career Choice', path: '/student/careers', icon: Briefcase },
          { name: 'Courses', path: '/student/courses', icon: BookOpen },
          { name: 'Fee Payments', path: '/student/fees', icon: CreditCard },
          { name: 'Hostel Management', path: '/student/hostels', icon: Building2 },
          { name: 'Hallticket', path: '/student/hallticket', icon: Ticket },
          { name: 'Infrastructure Related', path: '/student/infrastructure', icon: Wrench },
          { name: 'Library', path: '/student/library', icon: Book },
          { name: 'My CGPA', path: '/student/gpa', icon: GraduationCap },
          { name: 'Nodue', path: '/student/nodues', icon: ShieldCheck },
          { name: 'Profile', path: '/student/profile', icon: User },
          { name: 'My Transportation', path: '/student/transport', icon: Bus },
          { name: 'Ticketing Support', path: '/student/support', icon: LifeBuoy },
          { name: 'Time Tables', path: '/student/timetable', icon: Clock },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}><GraduationCap size={20} /></div>
        <div>
          <h2 style={styles.logoText}>College ERP Dashbord</h2>
        </div>
      </div>

      <div style={styles.profileSection}>
        <div style={styles.avatar}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={styles.profileInfo}>
          <h4 style={styles.profileName} title={user.name}>{user.name}</h4>
          <span style={styles.profileRole}>
            {user.role.toUpperCase()} 
            {user.roll_number && ` • ${user.roll_number}`}
            {user.employee_id && ` • ${user.employee_id}`}
          </span>
        </div>
      </div>

      <nav style={styles.nav}>
        <ul style={styles.navList}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {})
                  }}
                >
                  <Icon size={18} style={isActive ? styles.iconActive : styles.icon} />
                  <span style={styles.navText}>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    height: '100vh',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-glass)',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
  },
  logoContainer: {
    padding: '1.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: '#fff',
  },
  logoSubtext: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.1em',
  },
  profileSection: {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  profileInfo: {
    overflow: 'hidden',
  },
  profileName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileRole: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  nav: {
    flex: 1,
    padding: '1rem 0.75rem',
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  navLink: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
  },
  navLinkActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    color: '#fff',
    fontWeight: '600',
  },
  icon: {
    color: 'var(--text-muted)',
    transition: 'var(--transition-smooth)',
  },
  iconActive: {
    color: 'var(--secondary)',
  },
  navText: {
    letterSpacing: '0.01em',
  },
  footer: {
    padding: '1rem 0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition-smooth)',
  },
  logoutButtonHover: {
    backgroundColor: '#ef4444',
    color: '#fff',
  }
};

export default Sidebar;

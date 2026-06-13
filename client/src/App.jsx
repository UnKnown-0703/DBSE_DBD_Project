import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ClassDetail from './pages/faculty/ClassDetail';

// Consolidated Student Workspace
import StudentWorkspace from './pages/student/StudentWorkspace';

// Route Guard for logged-in status
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

// Route wrapper for Layout
const AppLayout = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="app-container">
      {user && <Sidebar />}
      <Routes>
        {/* Core Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Section */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageCourses />
          </ProtectedRoute>
        } />

        {/* Faculty Section */}
        <Route path="/faculty/dashboard" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/faculty/class/:offeringId" element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <ClassDetail />
          </ProtectedRoute>
        } />

        {/* Consolidated Student Section */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="dashboard" />
          </ProtectedRoute>
        } />
        <Route path="/student/registration" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="registration" />
          </ProtectedRoute>
        } />
        <Route path="/student/attendance" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="attendance" />
          </ProtectedRoute>
        } />
        <Route path="/student/careers" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="careers" />
          </ProtectedRoute>
        } />
        <Route path="/student/courses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="courses" />
          </ProtectedRoute>
        } />
        <Route path="/student/fees" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="fees" />
          </ProtectedRoute>
        } />
        <Route path="/student/hostels" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="hostels" />
          </ProtectedRoute>
        } />
        <Route path="/student/hallticket" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="hallticket" />
          </ProtectedRoute>
        } />
        <Route path="/student/infrastructure" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="infrastructure" />
          </ProtectedRoute>
        } />
        <Route path="/student/library" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="library" />
          </ProtectedRoute>
        } />
        <Route path="/student/gpa" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="gpa" />
          </ProtectedRoute>
        } />
        <Route path="/student/nodues" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="nodues" />
          </ProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="profile" />
          </ProtectedRoute>
        } />
        <Route path="/student/transport" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="transport" />
          </ProtectedRoute>
        } />
        <Route path="/student/support" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="support" />
          </ProtectedRoute>
        } />
        <Route path="/student/timetable" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentWorkspace tab="timetable" />
          </ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

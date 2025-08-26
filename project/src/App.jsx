import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CreateEvent from './pages/CreateEvent';
import EditProfile from './pages/EditProfile';

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role === 'student') {
    return <Navigate to="/student-dashboard" />;
  } else {
    return <Navigate to="/coordinator-dashboard" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            
            {/* Dashboard Redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* Protected Routes - Student */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes - Coordinator */}
            <Route 
              path="/coordinator-dashboard" 
              element={
                <ProtectedRoute requiredRole="coordinator">
                  <CoordinatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-event" 
              element={
                <ProtectedRoute requiredRole="coordinator">
                  <CreateEvent />
                </ProtectedRoute>
              } 
            />

            {/* Student Edit Profile */}
            <Route 
              path="/edit-profile" 
              element={
                <ProtectedRoute requiredRole="student">
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
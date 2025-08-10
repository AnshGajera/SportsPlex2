import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoutes';
import Navbar from './components/Layout/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/verifyEmail';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminEquipment from './pages/AdminEquipment';
import AdminClubs from './pages/AdminClubs';
import AdminMatches from './pages/AdminMatches';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminProfile from './pages/AdminProfile';

// User Pages
import UserDashboard from './pages/UserDashboard';
import UserEquipment from './pages/UserEquipment';
import UserClubs from './pages/UserClubs';
import UserMatches from './pages/UserMatches';
import UserAnnouncements from './pages/UserAnnouncements';
import UserProfile from './pages/UserProfile';

// Common/Legacy Pages
import Equipment from './pages/Equipment';
import Clubs from './pages/Clubs';
import Matches from './pages/Matches';
import Announcements from './pages/Announcements';
import ScheduleMatch from './components/Matches/ScheduleMatch';
import StudentHead from './pages/StudentHead';
import StudentHeadRequests from './components/StudentHead/StudentHeadRequests';
import UserManagement from './pages/UserManagement';
import ApproveRequests from './pages/ApproveRequests';
import Profile from './pages/Profile';



import './index.css';
import './App.css';
import RegisterGoogle from './pages/RegisterGoogle'; // or wherever your component is

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes without Navbar */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verifyEmail" element={<VerifyEmail />} />
          <Route path="/registergoogle" element={<RegisterGoogle />} />

          {/* Protected Routes with Navbar */}
          
          {/* Admin Dashboard and Pages */}
          <Route path="/admin/dashboard" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute></>} />
          <Route path="/admin/equipment" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminEquipment /></ProtectedRoute></>} />
          <Route path="/admin/clubs" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminClubs /></ProtectedRoute></>} />
          <Route path="/admin/matches" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminMatches /></ProtectedRoute></>} />
          <Route path="/admin/announcements" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminAnnouncements /></ProtectedRoute></>} />
          <Route path="/admin/analytics" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminAnalytics /></ProtectedRoute></>} />
          <Route path="/admin/user-management" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminUserManagement /></ProtectedRoute></>} />
          <Route path="/admin/profile" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminProfile /></ProtectedRoute></>} />
          
          {/* User Dashboard and Pages */}
          <Route path="/user/dashboard" element={<><Navbar /><ProtectedRoute><UserDashboard /></ProtectedRoute></>} />
          <Route path="/user/equipment" element={<><Navbar /><ProtectedRoute><UserEquipment /></ProtectedRoute></>} />
          <Route path="/user/clubs" element={<><Navbar /><ProtectedRoute><UserClubs /></ProtectedRoute></>} />
          <Route path="/user/matches" element={<><Navbar /><ProtectedRoute><UserMatches /></ProtectedRoute></>} />
          <Route path="/user/announcements" element={<><Navbar /><ProtectedRoute><UserAnnouncements /></ProtectedRoute></>} />
          <Route path="/user/profile" element={<><Navbar /><ProtectedRoute><UserProfile /></ProtectedRoute></>} />
          
          {/* Legacy/Common Routes (keep for backward compatibility) */}
          <Route path="/Home" element={<><Navbar /><ProtectedRoute><UserDashboard /></ProtectedRoute></>} />
          <Route path="/equipment" element={<><Navbar /><ProtectedRoute><Equipment /></ProtectedRoute></>} />
          <Route path="/clubs" element={<><Navbar /><ProtectedRoute><Clubs /></ProtectedRoute></>} />
          <Route path="/matches" element={<><Navbar /><ProtectedRoute><Matches /></ProtectedRoute></>} />
          <Route path="/announcements" element={<><Navbar /><ProtectedRoute><Announcements /></ProtectedRoute></>} />
          <Route path="/admin" element={<><Navbar /><ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute></>} />
          <Route path="/profile" element={<><Navbar /><ProtectedRoute><Profile /></ProtectedRoute></>} />
          
          {/* Other Routes */}
          <Route path="/schedule-match" element={<><Navbar /><ProtectedRoute><ScheduleMatch /></ProtectedRoute></>} />
          <Route path="/student-head" element={<><Navbar /><ProtectedRoute><StudentHead /></ProtectedRoute></>} />
          <Route path="/admin/student-head-requests" element={<><Navbar /><ProtectedRoute adminOnly={true}><StudentHeadRequests /></ProtectedRoute></>} />
          <Route path="/admin/requests" element={<><Navbar /><ProtectedRoute adminOnly={true}><ApproveRequests /></ProtectedRoute></>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

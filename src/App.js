import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoutes';
import Navbar from './components/Layout/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/verifyEmail';

import Home from './pages/Home';
import Equipment from './pages/Equipment';
import Clubs from './pages/Clubs';
import Matches from './pages/Matches';
import Announcements from './pages/Announcements';
import AdminPanel from './pages/AdminPanel';
import ScheduleMatch from './components/Matches/ScheduleMatch';
import StudentHead from './pages/StudentHead';
import StudentHeadRequests from './components/StudentHead/StudentHeadRequests';
import UserManagement from './pages/UserManagement';
import Analytics from './pages/Analytics';
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
          <Route path="/Home" element={<><Navbar /><ProtectedRoute><Home /></ProtectedRoute></>} />
          <Route path="/equipment" element={<><Navbar /><ProtectedRoute><Equipment /></ProtectedRoute></>} />
          <Route path="/clubs" element={<><Navbar /><ProtectedRoute><Clubs /></ProtectedRoute></>} />
          <Route path="/matches" element={<><Navbar /><ProtectedRoute><Matches /></ProtectedRoute></>} />
          <Route path="/announcements" element={<><Navbar /><ProtectedRoute><Announcements /></ProtectedRoute></>} />
          <Route path="/admin" element={<><Navbar /><ProtectedRoute><AdminPanel /></ProtectedRoute></>} />
          <Route path="/schedule-match" element={<><Navbar /><ProtectedRoute><ScheduleMatch /></ProtectedRoute></>} />
          <Route path="/student-head" element={<><Navbar /><ProtectedRoute><StudentHead /></ProtectedRoute></>} />
          <Route path="/admin/student-head-requests" element={<><Navbar /><ProtectedRoute><StudentHeadRequests /></ProtectedRoute></>} />
          <Route path="/admin/user-management" element={<><Navbar /><ProtectedRoute><UserManagement /></ProtectedRoute></>} />
          <Route path="/admin/analytics" element={<><Navbar /><ProtectedRoute><Analytics /></ProtectedRoute></>} />
          <Route path="/admin/requests" element={<><Navbar /><ProtectedRoute><ApproveRequests /></ProtectedRoute></>} />
          <Route path="/profile" element={<><Navbar /><ProtectedRoute><Profile /></ProtectedRoute></>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

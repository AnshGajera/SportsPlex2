import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle forgot password logic here
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand">
              <div className="brand-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#3b82f6"/>
                  <path d="M8 12h16M8 16h16M8 20h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span>SportsPlex</span>
            </div>
            <p className="auth-subtitle">Check your email</p>
          </div>

          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              We've sent a password reset link to {email}
            </p>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand">
            <div className="brand-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#3b82f6"/>
                <path d="M8 12h16M8 16h16M8 20h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>SportsPlex</span>
          </div>
          <p className="auth-subtitle">Access your sports management system</p>
        </div>

        <div className="auth-tabs">
          <button 
            className="auth-tab"
            onClick={() => window.location.href = '/login'}
          >
            Login
          </button>
          <button 
            className="auth-tab"
            onClick={() => window.location.href = '/register'}
          >
            Register
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>
            Forgot your password?
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Send Reset Link
            </button>
            <Link to="/login" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
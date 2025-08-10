import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/config';
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const email = location.state?.email || '';
  const pendingUserData = location.state?.pendingUserData || null;

  // Auto-check verification status periodically
  useEffect(() => {
    let verificationInterval;
    
    const checkVerificationStatus = async (user) => {
      if (!user) return;
      
      setCheckingVerification(true);
      try {
        await user.reload();
        if (user.emailVerified && !isVerified) {
          console.log('User email verified! Creating account...');
          setIsVerified(true);
          setMessage('Email verified successfully! Creating your account...');
          
          // Now create user in database after verification
          if (pendingUserData) {
            console.log('Creating account with pending data:', pendingUserData);
            try {
              const response = await api.post('/auth/register', pendingUserData);
              const userData = response.data;
              
              console.log('Account created successfully:', userData);
              setMessage('Account created successfully! Redirecting to home...');
              
              // Store user data in context and localStorage
              setCurrentUser(userData);
              localStorage.setItem('userInfo', JSON.stringify(userData));
              
              console.log('User data stored, redirecting to /Home...');
              
              setTimeout(() => {
                console.log('Executing navigation to /Home');
                navigate('/Home', { replace: true });
              }, 1500);
            } catch (error) {
              console.error('Failed to create account after verification:', error);
              if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                console.log('User already exists, attempting login...');
                // User already exists in database, try to login
                try {
                  const loginResponse = await api.post('/auth/login', {
                    email: pendingUserData.email,
                    password: pendingUserData.password
                  });
                  const userData = loginResponse.data;
                  
                  console.log('Login successful:', userData);
                  setMessage('Account verified! Logging you in...');
                  setCurrentUser(userData);
                  localStorage.setItem('userInfo', JSON.stringify(userData));
                  
                  setTimeout(() => {
                    console.log('Executing navigation to /Home after login');
                    navigate('/Home', { replace: true });
                  }, 1500);
                } catch (loginError) {
                  console.error('Login failed:', loginError);
                  setMessage('Email verified but failed to access account. Please try logging in manually.');
                  setTimeout(() => {
                    navigate('/login', { replace: true });
                  }, 3000);
                }
              } else {
                setMessage('Email verified but failed to create account. Please contact support.');
              }
            }
          } else {
            console.log('No pending data, user already verified');
            // User was already verified, just redirect to home
            setMessage('Email already verified! Redirecting...');
            setTimeout(() => {
              console.log('Executing navigation to /Home (already verified)');
              navigate('/Home', { replace: true });
            }, 1500);
          }
        } else if (!user.emailVerified) {
          setMessage('Please check your email and click the verification link.');
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      }
      setCheckingVerification(false);
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed in VerifyEmail:', user ? 'User present' : 'No user');
      console.log('Pending user data:', pendingUserData ? 'Present' : 'Not present');
      
      if (user) {
        await checkVerificationStatus(user);
        
        // Set up interval to auto-check every 3 seconds
        verificationInterval = setInterval(() => {
          checkVerificationStatus(user);
        }, 3000);
        
      } else {
        console.log('No authenticated user, redirecting to login');
        navigate('/login', { replace: true });
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
  }, [navigate, isVerified, pendingUserData]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    
    setResendLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      setMessage('Failed to send verification email. Please try again.');
    }
    setResendLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/img2.jpg" className="w-10 h-10" alt="SportsPlex Logo" />
            <h1 className="text-2xl font-bold text-gray-900">SportsPlex</h1>
          </div>

          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            {isVerified ? (
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </h2>

          {/* Email */}
          {email && (
            <p className="text-sm text-gray-600 mb-4">
              Verification email sent to: <span className="font-medium">{email}</span>
            </p>
          )}

          {/* Loading indicator for auto-checking */}
          {checkingVerification && !isVerified && (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-blue-600 text-sm">Checking verification status...</span>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`mb-6 p-3 rounded-lg text-sm ${
              isVerified || message.includes('sent successfully') || message.includes('Creating') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : message.includes('Failed') || message.includes('not yet verified')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message}
            </div>
          )}

          {/* Instructions */}
          {!isVerified && (
            <div className="text-sm text-gray-600 mb-6 text-left">
              <p className="mb-2">To complete your registration:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your email inbox</li>
                <li>Look for an email from SportsPlex</li>
                <li>Click the verification link in the email</li>
                <li>Your account will be created automatically</li>
              </ol>
              <p className="mt-3 text-xs text-blue-600">
                ⚡ Auto-checking every 3 seconds...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isVerified ? (
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full text-blue-600 hover:text-blue-800 font-medium py-2 px-4 transition duration-200"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/Home', { replace: true })}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Continue to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, sendVerificationEmail, resendVerificationEmail, checkEmailVerification } from '../firebase/config';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [initializing, setInitializing] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');

  // Send verification email only once on mount if needed
  useEffect(() => {
    const user = auth.currentUser;
    console.log('Current user in verifyEmail:', user);
    console.log('VerifyEmail component mounted');
    
    // Add a small delay to ensure Firebase auth is fully initialized
    const timer = setTimeout(() => {
      setInitializing(false);
      
      if (user && !user.emailVerified && !emailSent) {
        console.log('Sending initial verification email...');
        sendInitialVerificationEmail(user);
      } else if (!user) {
        console.error('No authenticated user found.');
        navigate('/login');
      } else if (user && user.emailVerified) {
        console.log('User already verified, redirecting to home...');
        navigate('/Home');
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [emailSent, navigate]);

  const sendInitialVerificationEmail = async (user) => {
    setLoading(true);
    setError('');
    
    // Check if user's email is already verified
    await user.reload();
    if (user.emailVerified) {
      console.log('Email already verified!');
      setEmailSent(true);
      setVerificationStatus('Email already verified! Completing registration...');
      // Trigger verification completion
      const interval = setInterval(async () => {
        const result = await checkEmailVerification();
        if (result.success && result.isVerified) {
          clearInterval(interval);
          // Continue with verification process
        }
      }, 1000);
      setLoading(false);
      return;
    }
    
    const result = await sendVerificationEmail(user);
    
    if (result.success) {
      setEmailSent(true);
      console.log('Verification email sent!');
    } else {
      setError(result.error);
      console.error('Email sending failed:', result.error);
      
      // If rate limited, suggest checking existing emails
      if (result.error.includes('Too many')) {
        setError(result.error + ' Please check your email inbox (including spam folder) for any verification emails you may have already received.');
      }
    }
    
    setLoading(false);
  };

  // Poll for verification status
  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await checkEmailVerification();
      
      if (result.success && result.isVerified) {
        console.log('Email verified! Creating user in database...');
        setVerificationStatus('Email verified! Completing registration...');
        setLoading(true);
        
        // Update backend about verification status
        try {
          const response = await fetch('http://localhost:5000/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: result.user.email,
              firebaseUid: result.user.uid,
            }),
          });

          const data = await response.json();
          console.log('Verify email response:', data);

          if (response.ok) {
            console.log('User created successfully in database');
            setError('');
            setVerificationStatus('Registration completed! Redirecting to home...');
            // Store user data and navigate to home page
            localStorage.setItem('userInfo', JSON.stringify(data));
            clearInterval(interval);
            setTimeout(() => navigate('/Home'), 2000);
          } else {
            console.error('Failed to create user in database:', data.message);
            setError(data.message || 'Failed to complete registration');
            setVerificationStatus('');
            // Still navigate to login if there's an error
            setTimeout(() => {
              clearInterval(interval);
              navigate('/login');
            }, 3000);
          }
        } catch (error) {
          console.error('Error updating verification status:', error);
          setError('Failed to complete registration. Please try logging in.');
          setVerificationStatus('');
          // Navigate to login after showing error
          setTimeout(() => {
            clearInterval(interval);
            navigate('/login');
          }, 3000);
        } finally {
          setLoading(false);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const resendVerification = async () => {
    if (resendCooldown > 0) {
      setError(`Please wait ${resendCooldown} seconds before resending.`);
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await resendVerificationEmail();
    
    if (result.success) {
      setEmailSent(true);
      setResendCooldown(300); // 5 minute cooldown to prevent rate limiting
      
      // Start cooldown timer
      const cooldownInterval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setError(''); // Clear any previous errors
    } else {
      // Check if it's a rate limiting error
      if (result.error.includes('too-many-requests') || result.error.includes('Too many email requests')) {
        setResendCooldown(600); // 10 minute cooldown for rate limiting
        
        // Start cooldown timer
        const cooldownInterval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(cooldownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {initializing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initializing...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Please Verify Your Email</h1>
              <p className="mt-2 text-sm text-gray-600">
                Check your inbox or spam folder: 
                <span className="font-medium text-blue-600 block">
                  {auth.currentUser?.email}
                </span>
              </p>
              
              {error && error.includes('Too many') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Rate Limit Reached
                      </h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        <p>
                          Please check your email inbox (including spam folder) for any verification emails you may have already received. 
                          You can also click "Check Verification Status" if you've already clicked the link in your email.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
          {verificationStatus && (
            <div className="p-4 border border-blue-300 rounded-md bg-blue-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">{verificationStatus}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-300 rounded-md bg-red-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {emailSent && !error && (
            <div className="p-4 border border-green-300 rounded-md bg-green-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Verification email sent! Please check your inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Click the verification link in your email to continue. The page will automatically refresh once verified.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span>Checking verification status...</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={resendVerification}
              disabled={resendCooldown > 0 || loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${resendCooldown > 0 || loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } transition-colors duration-200`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                resendCooldown >= 60 
                  ? `Resend in ${Math.floor(resendCooldown / 60)}m ${resendCooldown % 60}s`
                  : `Resend in ${resendCooldown}s`
              ) : (
                'Resend Email'
              )}
            </button>

            <button
              onClick={async () => {
                setVerificationStatus('Checking verification status...');
                const result = await checkEmailVerification();
                if (result.success && result.isVerified) {
                  console.log('Email verified manually!');
                  // The polling effect will handle the rest
                } else {
                  setVerificationStatus('Email not yet verified. Please check your email and click the verification link.');
                  setTimeout(() => setVerificationStatus(''), 3000);
                }
              }}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Check Verification Status
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to login
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          You'll be redirected once verified. Didn't receive the email? Check your spam folder.
        </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

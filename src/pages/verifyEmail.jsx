
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Correct import
import { auth } from '../firebase/config'; // adjust the path if the file is in config.js
import { sendEmailVerification } from 'firebase/auth';
 // adjust path if needed

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  // Send verification email only once on mount if needed
  useEffect(() => {
    const user = auth.currentUser;
    console.log('Current user in verifyEmail:', user);
    if (user && !user.emailVerified && !emailSent) {
      sendEmailVerification(user)
        .then(() => {
          setEmailSent(true);
          console.log('Verification email sent!');
        })
        .catch((err) => {
          console.error('Email sending failed', err);
        });
    } else if (!user) {
      console.error('No authenticated user found.');
    }
    // eslint-disable-next-line
  }, [emailSent]);

  // Poll for verification status
  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          // Update backend about verification status
          try {
            await fetch('/api/auth/verify-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                firebaseUid: user.uid,
              }),
            });
            clearInterval(interval);
            navigate('/Home');
          } catch (error) {
            console.error('Error updating verification status:', error);
          }
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const resendVerification = () => {
    const user = auth.currentUser;
    if (user) {
      sendEmailVerification(user)
        .then(() => alert('Verification email resent!'))
        .catch((err) => alert('Failed to resend. Try again later.'));
    }
  };

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">Please Verify Your Email</h1>
      <p className="mt-2">Check your inbox or spam folder: {auth.currentUser?.email}</p>
      <button
        onClick={resendVerification}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Resend Email
      </button>
      <p className="mt-2 text-sm text-gray-500">You’ll be redirected once verified...</p>
    </div>
  );
};

export default VerifyEmail;

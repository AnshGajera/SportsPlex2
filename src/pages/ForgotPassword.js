import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Add your password reset logic here
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans" style={{ height: '100vh' }}>
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8" style={{ transform: 'scale(0.75)' }}>
          <div className="flex flex-col items-center mb-8">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-4">
              <img src="/img2.jpg" className="w-12 h-12" alt="SportsPlex Logo" />
              <h1 className="text-3xl font-bold text-gray-900">SportsPlex</h1>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Email Sent!</h2>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                We've sent a password reset link to <br />
                <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-500 text-sm leading-relaxed">
              Didn't receive the email? Check your spam folder or
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
              try again
            </button>

            <div className="pt-4">
              <Link 
                to="/login" 
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans" style={{ height: '100vh' }}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8" style={{ transform: 'scale(0.75)' }}>
        <div className="flex flex-col items-center mb-8">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-4">
            <img src="/img2.jpg" className="w-12 h-12" alt="SportsPlex Logo" />
            <h1 className="text-3xl font-bold text-gray-900">SportsPlex</h1>
          </div>
          
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Forgot your password?</h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border text-sm bg-red-50 text-red-800 border-red-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">Error</p>
                <p className="mt-1 text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-base">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors text-base"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !email}
            className="w-full mt-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-base"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-800 font-medium text-base flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
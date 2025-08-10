
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Make sure this path is correct
import api from '../services/api'; // Import your API service
import { useNavigate } from 'react-router-dom'; // For redirection
import { auth } from '../firebase/config';

// --- Data for Dropdowns ---
const colleges = ['CSPIT', 'PDPIAS', 'RPCP', 'CMPICA', 'DEPSTAR', 'MTIN'];
const branchesByDept = {
    CMPICA: ['BCA', 'MCA', 'B.Sc. (IT)', 'Ph.D. (Computer Applications)'],
    PDPIAS: ['B.Sc. (Hons.) Microbiology', 'B.Sc. (Hons.) Biochemistry', 'Ph.D. (PDPIAS)'],
    RPCP: ['B.Pharm', 'M.Pharm', 'Ph.D. (Pharmacy)'],
    CSPIT: ['B.Tech AIML', 'B.Tech Civil Engineering', 'B.Tech CSE', 'B.Tech IT', 'B.Tech CE', 'B.Tech EE', 'B.Tech EC', 'B.Tech ME', 'M.Tech', 'Ph.D. (Engineering)'],
    DEPSTAR: ['B.Tech CSE', 'B.Tech IT', 'B.Tech CE'],
    MTIN: ['B.Sc. Nursing', 'Post Basic B.Sc. Nursing', 'M.Sc. Nursing', 'Ph.D. (Nursing)']
};

// --- Zod Schemas ---
const registerSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  middleName: z.string().min(1, 'Middle Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string()
    .email('Invalid email address')
    .regex(/^[a-zA-Z0-9._%+-]+@charusat\.edu\.in$/, 'Must be a valid Charusat email ID'),
  phoneNumber: z.string().length(10, 'Phone number must be exactly 10 digits'),
  rollNo: z.string().min(1, 'Roll number is required'),
  college: z.enum(colleges, { errorMap: () => ({ message: "Please select a college" }) }),
  department: z.string().min(1, "Please select a department"),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  gender: z.enum(['male', 'female'], { 
    errorMap: () => ({ message: 'Please select a gender' })
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});


// --- Main Component ---
const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { googleSignIn, setCurrentUser } = useAuth(); // Assuming setCurrentUser is provided by context
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(activeTab === 'login' ? loginSchema : registerSchema),
    defaultValues: {
      college: "",
      department: ""
    }
  });

  const selectedCollege = watch('college');

  useEffect(() => {
    setValue('department', '');
  }, [selectedCollege, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    try {
      if (activeTab === 'login') {
        // --- Handle Login API Call ---
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        // First authenticate with Firebase
        await signInWithEmailAndPassword(auth, data.email, data.password);
        
        // Then get user data from our backend
        const response = await api.post('/auth/login', data);
        setMessage('Login successful! Redirecting...');
        // Log the response data to verify user information
        console.log('Login response data:', response.data);
        // Update context and local storage
        setCurrentUser(response.data);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        // Redirect based on role
        if (response.data.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/Home', { replace: true });
        }
      } else {
        // --- Handle Register API Call ---
        setMessage('Creating your account...');

        // Create user in Firebase Auth and send verification email FIRST
        try {
          const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          await sendEmailVerification(userCredential.user);
          
          setMessage('Registration successful! Please verify your email to complete registration.');
          
          // Redirect to verifyEmail with pending user data (don't create in database yet)
          navigate('/verifyEmail', { 
            state: { 
              email: data.email,
              pendingUserData: data  // Pass the registration data to be used after verification
            } 
          });
          
        } catch (firebaseError) {
          let errorMessage = 'Registration failed. Please try again.';
          
          if (firebaseError.code === 'auth/email-already-in-use') {
            errorMessage = 'An account with this email already exists. Please login instead.';
          } else if (firebaseError.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak. Please use a stronger password.';
          } else if (firebaseError.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address. Please check and try again.';
          }
          
          setMessage(errorMessage);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Handle Firebase authentication errors
      if (error.code) {
        switch (error.code) {
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please check your password and try again.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address. Please check your email or register for a new account.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format. Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed login attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          default:
            errorMessage = 'Authentication failed. Please check your credentials and try again.';
        }
      }
      // Handle backend API errors
      else if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message;
        
        switch (status) {
          case 401:
            errorMessage = backendMessage || 'Invalid email or password. Please check your credentials.';
            break;
          case 403:
            errorMessage = backendMessage || 'Access denied. Please check your permissions.';
            break;
          case 404:
            errorMessage = 'Account not found. Please check your email address.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = backendMessage || 'Login failed. Please try again.';
        }
      }
      // Handle network or other errors
      else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      setMessage(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage('');
    reset();
  }


 const handleGoogleLogin = async () => {
  try {
    const userData = await googleSignIn();

    // User clicked "cancel" or closed popup
    if (!userData) {
      setMessage('Google Sign-In was cancelled.');
      navigate('/login', { replace: true });
      return;
    }

    const requiredFields = [
      'firstName', 'middleName', 'lastName',
      'email', 'firebaseUid', 'role',
      'rollNo', 'phoneNumber', 'college', 'department'
    ];

    const isIncomplete = requiredFields.some(field => {
      const value = userData[field];
      return !value || value === 'N/A';
    });

    // Save user in context and localStorage
    setCurrentUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));

    if (isIncomplete) {
      console.log('Incomplete profile, redirecting to registration page');
      console.log('Redirecting to registergoogle with user ID:', userData._id);
      navigate('/registergoogle', { replace: true, state: { userId: userData._id } });
    } else {
      console.log('Profile complete, redirecting to Home');
      setMessage('Google Sign-In successful!');
      navigate('/Home', { replace: true });
    }
  } catch (error) {
    // Firebase error (e.g., user closed popup)
    console.error('Google Sign-In error:', error);
    setMessage('Google Sign-In was cancelled or failed.');
    navigate('/login', { replace: true });
  }
};

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans" style={{ height: '100vh' }}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8" style={{ transform: 'scale(0.75)' }}>
        <div className="flex flex-col items-center mb-6">

          {/* New container for the logo (image + text) */}
          <div className="flex items-center gap-4">
            <img src="/img2.jpg" className="w-12 h-12" alt="SportsPlex Logo" />
            <h1 className="text-3xl font-bold text-gray-900">SportsPlex</h1>
          </div>
          
          <p className="text-gray-600 mt-2">Access your sports management system</p>

        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2 text-center font-medium transition rounded-lg ${activeTab === 'login' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2 text-center font-medium transition rounded-lg ${activeTab === 'register' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            Register
          </button>
        </div>



        {message && (
          <div className={`mb-4 p-4 rounded-lg border text-sm ${
            message.includes('successful') 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {message.includes('successful') ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium">
                  {message.includes('successful') ? 'Success' : 'Error'}
                </p>
                <p className="mt-1 text-sm opacity-90">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {activeTab === 'login' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  {...register('email')} 
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                  }`}
                  placeholder="Enter your email address" 
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                <div className="relative">
                  <input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    {...register('password')} 
                    className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                        : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                    }`}
                    placeholder="Enter your password" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Forgot your password?
                </a>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input id="firstName" type="text" {...register('firstName')} placeholder="John" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input id="middleName" type="text" {...register('middleName')} placeholder="Miller" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  {errors.middleName && <p className="text-red-600 text-xs mt-1">{errors.middleName.message}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input id="lastName" type="text" {...register('lastName')} placeholder="Doe" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">College Email ID</label>
                  <input id="email" type="email" {...register('email')} placeholder="23aiml019@charusat.edu.in" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><span className="text-gray-500 sm:text-sm">+91</span></div>
                    <input
                      id="phoneNumber"
                      type="tel"
                      maxLength={10}
                      {...register('phoneNumber', {
                        onChange: (e) => {
                          // Only allow digits and max 10 characters
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          e.target.value = value;
                        }
                      })}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pl-10"
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-600 text-xs mt-1">{errors.phoneNumber.message}</p>}
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <select id="college" {...register('college')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Select College</option>
                    {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.college && <p className="text-red-600 text-xs mt-1">{errors.college.message}</p>}
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select id="department" {...register('department')} disabled={!selectedCollege} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100">
                    <option value="">Select Department</option>
                    {selectedCollege && branchesByDept[selectedCollege]?.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-red-600 text-xs mt-1">{errors.department.message}</p>}
                </div>
              </div>
               <div>
                  <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
                  <input id="rollNo" type="text" {...register('rollNo')} placeholder="Enter your roll no" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  {errors.rollNo && <p className="text-red-600 text-xs mt-1">{errors.rollNo.message}</p>}
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Create password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} placeholder="Confirm password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-6">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center cursor-pointer"><input type="radio" {...register('gender')} value="male" className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/><span className="ml-2 text-gray-700">Male</span></label>
                    <label className="inline-flex items-center cursor-pointer"><input type="radio" {...register('gender')} value="female" className="form-radio h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"/><span className="ml-2 text-gray-700">Female</span></label>
                  </div>
                </div>
                {errors.gender && <p className="text-red-600 text-xs mt-1">{errors.gender.message}</p>}
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-60 flex items-center justify-center">
            {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            {loading ? 'Please wait...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center text-sm font-medium text-blue-600 hover:underline focus:outline-none"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 mr-2" />
            Log in with Google
          </button>
        </div>
        
        <div className="text-center mt-6">
          <a href="/forgot-password" /* Changed to a more realistic link */ className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

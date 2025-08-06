
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Make sure this path is correct
import api from '../services/api'; // Import your API service
import { useNavigate } from 'react-router-dom'; // For redirection
import { auth, sendVerificationEmail } from '../firebase/config';

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
        
        // First, store registration data in backend temporarily (not in database yet)
        const response = await api.post('/auth/register', data);
        
        if (response.data.emailSent) {
          // Create user in Firebase Auth and send verification email
          try {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            
            // Send verification email using our custom function
            const result = await sendVerificationEmail(userCredential.user);
            
            if (result.success) {
              setMessage('Registration successful! Please check your email and verify to complete registration.');
              // Navigate to verification page
              navigate('/verify-email', { replace: true });
            } else {
              setMessage('Registration successful but email verification failed: ' + result.error);
              // Still navigate to verification page
              navigate('/verify-email', { replace: true });
            }
            
          } catch (firebaseError) {
            if (firebaseError.code === 'auth/email-already-in-use') {
              setMessage('Email already exists. Please try logging in instead.');
            } else {
              setMessage('Firebase registration error: ' + (firebaseError.message || 'Unknown error'));
            }
            setLoading(false);
            return;
          }
        } else {
          setMessage(response.data.message || 'Registration failed');
        }
      }
    } catch (error) {
      let errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      
      // Handle Firebase specific errors
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      }
      
      setMessage(errorMessage);
      console.error('Submission failed:', error);
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
          <div className={`mb-4 p-3 rounded-md text-center text-sm ${message.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {activeTab === 'login' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                <input id="email" type="email" {...register('email')} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Enter your email" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
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

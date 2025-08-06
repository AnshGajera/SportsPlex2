// const User = require('../models/User'); // Corrected path to your user model
// // const jwt = 'jsonwebtoken';
// const jwt = require('jsonwebtoken');

// /**
//  * Generates a JSON Web Token for a given user ID and profile status.
//  * @param {string} id - The user's MongoDB document ID.
//  * @param {boolean} profileComplete - Indicates if the user has filled out all required details.
//  * @returns {string} - The generated JWT.
//  */
// const JWT_SECRET = 'myverysecretkey';
// const JWT_EXPIRES_IN = '30d';
// const ADMIN_SECRET_CODE = 'myadminsecret';

// const generateToken = (id, profileComplete) => {
//   return jwt.sign({ id, profileComplete }, JWT_SECRET, {
//     expiresIn: JWT_EXPIRES_IN,
//   });
// };

// /**
//  * @desc    Register a new user manually
//  * @route   POST /api/auth/register
//  * @access  Public
//  */
// const registerUser = async (req, res) => {
//   const { 
//     firstName, middleName, lastName, email, password,
//     rollNo, college, department, gender, phoneNumber 
//   } = req.body;

//   try {
//     const userExists = await User.findOne({ email: email.toLowerCase() });
//     if (userExists) {
//       return res.status(400).json({ message: 'User with this email already exists' });
//     }

//     const user = await User.create({
//       firstName,
//       middleName,
//       lastName,
//       email: email.toLowerCase(),
//       password,
//       rollNo,
//       college,
//       department,
//       gender,
//       phoneNumber,
//       isVerified: true, // Or implement an email verification flow
//     });

//     if (user) {
//       res.status(201).json({
//         _id: user._id,
//         firstName: user.firstName,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, true), // Manual registration means profile is complete
//         profileComplete: true,
//       });
//     } else {
//       res.status(400).json({ message: 'Invalid user data' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error during registration' });
//   }
// };

// /**
//  * @desc    Authenticate a user (student or admin) via email/password
//  * @route   POST /api/auth/login
//  * @access  Public
//  */
// const loginUser = async (req, res) => {
//   const { email, password, adminCode } = req.body;

//   try {
//     const user = await User.findOne({ email: email.toLowerCase() });

//     if (user && user.password && (await user.matchPassword(password))) {
      
//       // Admin login logic
//       // Change is here: Check if adminCode exists, instead of using 'loginType'
//       if (adminCode) { 
//         if (user.role !== 'admin') {
//           return res.status(403).json({ message: 'Access denied. Not an admin.' });
//         }
//         if (adminCode !== ADMIN_SECRET_CODE) {
//           return res.status(401).json({ message: 'Invalid admin code' });
//         }
//       }

//       const profileComplete = user.college !== 'N/A';
//       res.json({
//         _id: user._id,
//         firstName: user.firstName,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, profileComplete),
//         profileComplete: profileComplete,
//       });
//     } else {
//       res.status(401).json({ message: 'Invalid email or password' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error during login' });
//   }
// };
// /**
//  * @desc    Handle user login/registration via Google Sign-In
//  * @route   POST /api/auth/google
//  * @access  Public
//  */
// const handleGoogleSignIn = async (req, res) => {
//   const { email, firstName, lastName, firebaseUid } = req.body;

//   try {
//     let user = await User.findOne({ firebaseUid });

//     if (user) {
//       // --- User exists, log them in ---
//       const profileComplete = user.college !== 'N/A';
//       res.json({
//         _id: user._id,
//         firstName: user.firstName,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id, profileComplete),
//         profileComplete: profileComplete
//       });
//     } else {
//       // --- New user, create a placeholder profile ---
//       user = await User.create({
//         firstName,
//         lastName,
//         email: email.toLowerCase(),
//         firebaseUid,
//         middleName: 'N/A',
//         rollNo: 'N/A',
//         college: 'N/A',
//         department: 'N/A',
//         gender: 'male', 
//         phoneNumber: '0000000000',
//         isVerified: true 
//       });

//       if (user) {
//         res.status(201).json({
//           _id: user._id,
//           firstName: user.firstName,
//           email: user.email,
//           role: user.role,
//           token: generateToken(user._id, false),
//           profileComplete: false
//         });
//       } else {
//         res.status(400).json({ message: 'Could not create user from Google sign-in' });
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error during Google sign-in' });
//   }
// };

// module.exports = { 
//   registerUser, 
//   loginUser,
//   handleGoogleSignIn 
// };


const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'myverysecretkey';  // ✅ Hardcoded secret key
const JWT_EXPIRES_IN = '30d';
const ADMIN_SECRET_CODE = 'myadminsecret';

// Temporary storage for unverified users (in production, use Redis or database)
const pendingUsers = new Map();

const generateToken = (id, profileComplete) => {
  return jwt.sign({ id, profileComplete }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const registerUser = async (req, res) => {
  const { firstName, middleName, lastName, email, password, rollNo, college, department, gender, phoneNumber } = req.body;

  console.log('registerUser called with email:', email);

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    const rollnoExists = await User.findOne({ rollNo: rollNo.toLowerCase() });
    const phoneExists = await User.findOne({ phoneNumber: phoneNumber });
    
    if (phoneExists) {
      return res.status(400).json({message : 'User with this Phone Number already exists'});
    }
    if (rollnoExists) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Store user data temporarily instead of creating in database
    const userData = {
      firstName,
      middleName,
      lastName,
      email: email.toLowerCase(),
      password,
      rollNo: rollNo.toLowerCase(),
      college,
      department,
      gender,
      phoneNumber,
      timestamp: Date.now()
    };

    // Store in temporary storage (use email as key)
    pendingUsers.set(email.toLowerCase(), userData);
    console.log('Stored pending user for:', email.toLowerCase());
    console.log('Total pending users:', pendingUsers.size);

    // Clean up old pending users (older than 1 hour)
    for (const [key, value] of pendingUsers.entries()) {
      if (Date.now() - value.timestamp > 3600000) { // 1 hour
        pendingUsers.delete(key);
      }
    }

    res.status(201).json({
      message: 'Registration data saved. Please verify your email to complete registration.',
      emailSent: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// New endpoint to handle email verification
const verifyEmail = async (req, res) => {
  const { email, firebaseUid } = req.body;
  console.log('verifyEmail called with:', { email, firebaseUid });
  console.log('Current pendingUsers:', Array.from(pendingUsers.keys()));

  try {
    // Get pending user data
    const userData = pendingUsers.get(email.toLowerCase());
    console.log('Found userData for', email.toLowerCase(), ':', userData ? 'Yes' : 'No');
    
    if (!userData) {
      console.log('No pending user data found');
      return res.status(400).json({ message: 'No pending registration found for this email' });
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists, removing from pending');
      pendingUsers.delete(email.toLowerCase());
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating user with data:', {
      email: userData.email,
      firstName: userData.firstName,
      firebaseUid
    });

    // Create user in database now that email is verified
    const user = await User.create({
      firstName: userData.firstName,
      middleName: userData.middleName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      rollNo: userData.rollNo,
      college: userData.college,
      department: userData.department,
      gender: userData.gender,
      phoneNumber: userData.phoneNumber,
      firebaseUid: firebaseUid, // Add Firebase UID
      isVerified: true,
    });

    // Remove from pending users
    pendingUsers.delete(email.toLowerCase());
    console.log('User created successfully:', user._id);

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, true),
        profileComplete: true,
        message: 'Email verified and registration completed successfully'
      });
    } else {
      res.status(400).json({ message: 'Failed to create user' });
    }

  } catch (error) {
    console.error('Error in verifyEmail:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

const loginUser = async (req, res) => {
  const { email, password, adminCode } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && user.password && await user.matchPassword(password)) {
      if (adminCode) {
        if (user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied. Not an admin.' });
        }
        if (adminCode !== ADMIN_SECRET_CODE) {
          return res.status(401).json({ message: 'Invalid admin code' });
        }
      }

      const profileComplete = user.college !== 'N/A';
      res.json({
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, profileComplete),
        profileComplete: profileComplete,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const handleGoogleSignIn = async (req, res) => {
  const { email, firstName, lastName, firebaseUid } = req.body;

  try {
    let user = await User.findOne({ firebaseUid });

    if (user) {
      const profileComplete = user.college !== 'N/A';
      res.json({
        _id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, profileComplete),
        profileComplete: profileComplete
      });
    } else {
      user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        firebaseUid,
        middleName: 'N/A',
        rollNo: 'N/A',
        college: 'N/A',
        department: 'N/A',
        gender: 'male',
        phoneNumber: '0000000000',
        isVerified: true
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, false),
          profileComplete: false
        });
      } else {
        res.status(400).json({ message: 'Could not create user from Google sign-in' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during Google sign-in' });
  }
};

module.exports = { registerUser, loginUser, handleGoogleSignIn, verifyEmail };

// const express = require('express');
// const router = express.Router();
// const User = require('../models/user');

// // Google Sign-In Route
// router.post('/google-signin', async (req, res) => {
//   const { firebaseUid, email, firstName, middleName, lastName, role, rollNo } = req.body;

//   if (!firebaseUid || !email || !firstName || !lastName || !role) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     let user = await User.findOne({ firebaseUid });

//     if (!user) {
//       user = new User({
//         firebaseUid,
//         email,
//         firstName,
//         middleName,
//         lastName,
//         role,
//         rollNo: (role === 'student' || role === 'student_head') ? rollNo : undefined
//       });
//       await user.save();
//     }

//     res.status(200).json({ message: 'User signed in successfully', user });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server Error' });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
// const express = require("express");
const { protect } = require("../middleware/authMiddleware");


const { 
  registerUser, 
  loginUser,
  handleGoogleSignIn
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user with email/password
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user (user or admin) with email/password
router.post('/login', loginUser);

// @route   POST /api/auth/google
// @desc    Authenticate or register a user via Google Sign-In
router.post('/google', handleGoogleSignIn);
// router.get("/Home", protect, dashboardHandler);

module.exports = router;

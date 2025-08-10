const jwt = require("jsonwebtoken");
const User = require('../models/user');
const JWT_SECRET = 'myverysecretkey';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Authorization header:', authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('ERROR: No valid auth header');
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];
  console.log('Token extracted:', token ? 'Yes' : 'No');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT Token decoded successfully:', decoded);
    console.log('User ID from token:', decoded.id);
    
    // Fetch complete user information from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('ERROR: User not found in database');
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    
    console.log('User fetched from database:', {
      id: user._id,
      email: user.email,
      role: user.role
    });
    console.log('=== END AUTH MIDDLEWARE ===');
    
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };

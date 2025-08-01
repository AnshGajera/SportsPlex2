const jwt = require("jsonwebtoken");
const JWT_SECRET = 'myverysecretkey';

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('JWT Token decoded:', decoded);
    console.log('User ID from token:', decoded.id);
    console.log('=== END AUTH MIDDLEWARE ===');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };

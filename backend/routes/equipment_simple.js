const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  console.log('🧪 Simple test route hit!');
  res.json({ message: 'Equipment routes are working!' });
});

// Simple request route
router.post('/request', (req, res) => {
  console.log('📝 Simple request route hit!');
  res.json({ message: 'Request route working!' });
});

module.exports = router;

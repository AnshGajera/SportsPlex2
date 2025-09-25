// Simple HTTP test without axios
const http = require('http');

const testEndpoint = (path) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });
    
    req.on('error', (error) => {
      resolve({ error: error.message });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: 'timeout' });
    });
  });
};

const test = async () => {
  console.log('Testing endpoints...');
  
  // Test root
  const root = await testEndpoint('/');
  console.log('Root endpoint:', root.status, root.error || 'OK');
  
  // Test announcements
  const announcements = await testEndpoint('/api/announcements');
  console.log('Announcements endpoint:', announcements.status, announcements.error || 'OK');
  
  // Test analytics
  const analytics = await testEndpoint('/api/announcements/analytics');
  console.log('Analytics endpoint:', analytics.status, analytics.error || 'OK');
};

test();
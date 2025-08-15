const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const clubRoutes = require('./routes/clubs');
const matchRoutes = require('./routes/matches');
const studentHeadRequestRoutes = require('./routes/studentHeadRequests');

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/student-head-requests', studentHeadRequestRoutes);

const uri = 'mongodb+srv://yashcoltd:pixmamg2576@charusatcomplex.qcqgdez.mongodb.net/?retryWrites=true&w=majority&appName=charusatComplex';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => {
  res.send('✅ Backend Server is Running');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

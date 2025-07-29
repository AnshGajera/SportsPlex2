const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const authRoutes = require('./routes/auth');
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes)
app.use('/api/auth', require('./routes/auth'));
const uri = 'mongodb+srv://yashcoltd:pixmamg2576@charusatcomplex.qcqgdez.mongodb.net/?retryWrites=true&w=majority&appName=charusatComplex';

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => {
  res.send('✅ Backend Server is Running');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

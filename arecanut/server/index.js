require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scans');

const app = express();

// Allow requests from your Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // set this in Render env vars
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',  authRoutes);
app.use('/api/scans', scanRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'Server running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

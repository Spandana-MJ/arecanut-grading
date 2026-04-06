const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Please provide username and password' });

  if (username.length < 3)
    return res.status(400).json({ error: 'Username must be at least 3 characters' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already taken' });

    const user = await User.create({ username, password });

    res.status(201).json({
      message: 'Signup successful',
      token: generateToken(user._id),
      username: user.username,
      userId: user._id,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Please provide username and password' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

    res.json({
      message: 'Login successful',
      token: generateToken(user._id),
      username: user.username,
      userId: user._id,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/me  — get current logged in user
router.get('/me', protect, (req, res) => {
  res.json({ id: req.user._id, username: req.user.username });
});

module.exports = router;

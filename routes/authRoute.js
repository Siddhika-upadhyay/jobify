
const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/signup', (req, res) => {
  res.render('signup');
});


router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await User.create({ name, email, password });
    res.redirect('/login');
  } catch (error) {
    res.send('Signup failed. Email might already be used.');
  }
});


router.get('/login', (req, res) => {
  res.render('login');
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.redirect('/');
  } else {
    res.send('Invalid credentials.');
  }
});

module.exports = router;

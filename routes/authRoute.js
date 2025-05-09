const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");

const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/login', (req, res) => {
  res.render('login');
});

const User = require('../models/User');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Basic validation can be added here

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists');
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    // Optionally, set session user here
    req.session.user = newUser;

    res.redirect('/');
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }

    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Job Listings Page
router.get("/", async (req, res) => {
  const jobs = await Job.find();
  res.render("index", { jobs });
});

// Apply Route
router.post("/apply/:jobId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ redirect: "/signup" });
  }

  const { jobId } = req.params;
  const applicantEmail = req.session.user.email;

  try {
    // Save the application to MongoDB
    await Application.create({
      jobId,
      applicantEmail,
    });

    return res.status(200).json({ message: "Application submitted" });
  } catch (err) {
    console.error("Error saving application:", err);
    return res.status(500).json({ message: "Failed to submit application" });
  }
});

module.exports = router;

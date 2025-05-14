const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");

const router = express.Router();

// ======================= Signup and Login =======================

router.get('/signup', (req, res) => {
  const redirectUrl = req.query.redirect || '/';
  res.render('signup', { redirectUrl });
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, redirectUrl } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User with this email already exists');
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    req.session.user = newUser;
    res.redirect(redirectUrl || '/');
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

// ======================= Job Listings Page =======================

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.render("index", { jobs });
  } catch (error) {
    res.status(500).send("Error fetching jobs");
  }
});

// ======================= Apply for Job =======================

router.post("/apply/:jobId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ redirect: "/signup" });
  }

  const { jobId } = req.params;
  const applicantEmail = req.session.user.email;

  try {
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

// ======================= Search Route =======================

router.get("/search", async (req, res) => {
  const query = req.query.keyword; 

  try {
    const jobs = await Job.find({
      title: { $regex: query, $options: 'i' },
    });

    res.render("searchResults", { jobs, query });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Search failed");
  }
});


router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});

module.exports = router;

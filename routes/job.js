const express = require("express");
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require("../models/Application");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const jobs = await Job.find();
  res.render("index", { jobs });
});

router.get('/myJobs', isAuthenticated, async (req, res) => {
  try {
    const userEmail = req.session.user.email;
    const jobs = await Job.find({ postedBy: userEmail });
    res.render('myJobs', { jobs });
  } catch (error) {
    res.status(500).send('Failed to load your jobs');
  }
});

router.get('/jobs/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }
    if (job.postedBy !== req.session.user.email) {
      return res.status(403).send('Unauthorized');
    }
    res.render('editJob', { job });
  } catch (error) {
    res.status(500).send('Failed to load job for editing');
  }
});

router.post('/jobs/:id', isAuthenticated, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }
    if (job.postedBy !== req.session.user.email) {
      return res.status(403).send('Unauthorized');
    }
    const updatedData = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      salary: req.body.salary,
      description: req.body.description
    };
    await Job.findByIdAndUpdate(req.params.id, updatedData);
    res.redirect('/myJobs');
  } catch (error) {
    res.status(500).send('Failed to update job');
  }
});

router.delete('/jobs/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }
    if (job.postedBy !== req.session.user.email) {
      return res.status(403).send('Unauthorized');
    }
    await Job.findByIdAndDelete(req.params.id);
    res.redirect('/myJobs');
  } catch (error) {
    res.status(500).send('Failed to delete job');
  }
});

router.post('/jobs/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).send('Job not found');
    }
    if (job.postedBy !== req.session.user.email) {
      return res.status(403).send('Unauthorized');
    }
    await Job.findByIdAndDelete(req.params.id);
    res.redirect('/myJobs');
  } catch (error) {
    res.status(500).send('Failed to delete job');
  }
});

router.post('/jobs', isAuthenticated, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.session.user.email
    };
    await Job.create(jobData);
    res.redirect('/myJobs');
  } catch (error) {
    res.status(500).send('Failed to create job');
  }
});

router.get("/jobs", async (req, res) => {
  const jobs = await Job.find();
  res.render("jobListings", { jobs });
});

router.get('/jobs/new', (req, res) => {
  res.render('newJob');
});

router.post("/apply/:jobId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ redirect: '/signup' });
  }

  const { jobId } = req.params;
  const applicantEmail = req.session.user.email;

  try {
    await Application.create({ jobId, applicantEmail });
    res.status(200).send("Application submitted");
  } catch (error) {
    res.status(500).send("Failed to submit application");
  }
});

router.post("/jobs/:id/bookmark", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user._id;
    const jobId = req.params.id;

    const user = await User.findById(userId);

    // Avoid duplicate bookmarks
    if (!user.bookmarks.includes(jobId)) {
      user.bookmarks.push(jobId);
      await user.save();
    }

    res.redirect("/jobs"); // or req.get('referer') to go back to current page
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).send("Failed to bookmark job");
  }
});

router.get("/bookmarks", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate("bookmarks");
    res.render("bookmarks", { jobs: user.bookmarks });
  } catch (error) {
    res.status(500).send("Failed to load bookmarks");
  }
});


module.exports = router;

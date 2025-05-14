const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");

const router = express.Router();

router.get("/", async (req, res) => {
  const jobs = await Job.find();
  res.render("index", { jobs });
});

router.get("/jobs", async (req, res) => {
  const jobs = await Job.find();
  res.render("jobListings", { jobs });
});

router.get('/jobs/new', (req, res) => {
  res.render('newJob');
});

router.post('/jobs', async (req, res) => {
  try {
    const { title, company, location, salary, description } = req.body;
    await Job.create({ title, company, location, salary, description });
    res.redirect('/jobs');
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    console.log("Search query:", searchQuery);
    if (!searchQuery) {
      // If no query provided, redirect to jobs listing or show all jobs
      const jobs = await Job.find();
      console.log("Jobs found (no query):", jobs.length);
      return res.render("jobListings", { jobs });
    }
    // Case-insensitive search on title and description fields
    const jobs = await Job.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } }
      ]
    });
    console.log("Jobs found (with query):", jobs.length);
    res.render("jobListings", { jobs });
  } catch (error) {
    console.error("Error in /search route:", error);
    res.status(500).send("Internal Server Error");
  }
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

module.exports = router;

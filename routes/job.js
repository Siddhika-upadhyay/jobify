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

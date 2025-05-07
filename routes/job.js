// File: routes/jobRouter.js
const express = require("express");
const Job = require("../models/Job");

const router = express.Router();


router.get("/", async (req, res) => {
  const jobs = await Job.find();
  res.render("index", { jobs });
});


router.get("/jobs/new", (req, res) => {
  res.render("newJob");
});


router.post("/jobs", async (req, res) => {
  await Job.create(req.body);
  res.redirect("/");
});


router.get("/jobs/:id/edit", async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.render("editJob", { job });
});


router.post("/jobs/:id", async (req, res) => {
  await Job.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/");
});

router.post("/jobs/:id/delete", async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

router.get("/search", async (req, res) => {
  const keyword = req.query.keyword;
  const jobs = await Job.find({ title: new RegExp(keyword, "i") });
  res.render("index", { jobs });
});


module.exports = router;

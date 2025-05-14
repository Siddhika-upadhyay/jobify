
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const hbs = require("hbs");
const bodyParser = require("body-parser");

const authRoute = require("./routes/authRoute");
const jobRouter = require("./routes/job");

const app = express();
mongoose.connect("mongodb://127.0.0.1:27017/jobify", {});

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views/partials"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use("/", authRoute);
app.use("/", jobRouter);

app.listen(3000, () => {
  console.log("Jobify server running at http://localhost:3000");
});
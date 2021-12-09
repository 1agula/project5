require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
// const session = require("cookie-session");
const profileRoute = require("./routes/profile-route");
const authRoute = require("./routes/auth-route");
require("./config/passport");

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to mongodb atlas.");
  })
  .catch((err) => {
    console.log("connection failed.");
    console.log(err);
  });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/*", (req, res) => {
  res.status(404).send("404 Page not found.");
});

//Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something is broken. We will fix it soon.");
});

app.listen(8080, () => {
  console.log("server is running on port 8080.");
});

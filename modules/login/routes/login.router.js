var express = require("express");
var router = express.Router();
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const passport = require("passport");
const User = require("../../../models/user");
const bcrypt = require("bcrypt");

/* GET login page. */
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  res.render("../views/login", { join: req.query.join });
});

router.get("/auth/azureadoauth2", passport.authenticate("azure_ad_oauth2"));

router.get(
  "/auth/azureadoauth2/callback",
  passport.authenticate("azure_ad_oauth2", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

/* GET login page. */
router.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  res.render("../views/register", {  });
});

/* POST login action */
router.post("/", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

/* POST register action */
router.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  // Validation (consider adding more comprehensive checks)
  if (!email || !password) {
    res.redirect("/register");
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      // Handle existing user (for instance, flash a message about the user already existing)
      res.redirect("/register");
      return;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      id: email,
      firstname,
      lastname,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Log the user in after registration
    req.login(newUser, (err) => {
      if (err) {
        console.error(err);
        res.redirect("/login/register");
        return;
      }
      res.redirect("/");
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.redirect("/register");
  }
});


module.exports = router;

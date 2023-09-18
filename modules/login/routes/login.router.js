var express = require("express");
var router = express.Router();
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const passport = require("passport");
const User = require("../../../models/user");

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


module.exports = router;

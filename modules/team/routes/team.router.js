const express = require("express");
const router = express.Router();
let isAuthenticated = require("../../../lib/auth").isAuthenticated;

const User = require("../../../models/user");


router.get("/:teamId", isAuthenticated, (req, res) => {
  const teamId = req.params.teamId;
  if (req.isAuthenticated()) {
    User.findById(req.user._id)
      .populate("team")
      .populate("badges")
      .populate("completed")
      .populate("collected")
      .then((user) => {
        User.find({ team: teamId })
          .sort({ level: -1, experience: -1 })
          .then((users) => {
            console.log(user);
            res.render("../views/team", {
              title: "Express",
              user: user,
              users: users,
            });
          });
      });
  } else {
    res.redirect("/auth/azureadoauth2");
  }
});

module.exports = router;

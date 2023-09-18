const express = require("express");
const router = express.Router();
var isAuthenticated = require("../../../lib/auth").isAuthenticated;
const mongoose = require("mongoose");
const moment = require("moment");

const User = require("../../../models/user");

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.userObj;


    res.render("../views/profile", {
      title: "Dashboard",
      user: user,
      url: req.originalUrl,
      
    });
  } catch (error) {
    console.error("An error occurred while retrieving user data:", error);
    res.status(500).send("Internal Server Error");
  }
});



module.exports = router;

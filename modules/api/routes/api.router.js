const express = require("express");
let isAuthenticated = require("../../../lib/auth").isAuthenticated;
const disconnect = require("../../../lib/auth").disconnect;
const passport = require("passport");
const User = require("../../../models/user");

module.exports = function(io) {
  const router = express.Router();

//console.log(io)
  // Socket.io event handling
  io.on('connection', (socket) => {
    // ... any socket event handlers specific to this module

    socket.on('someEvent', (data) => {
      // handle the 'someEvent' here
    });

    // ... any other socket events

  });

  /* GET game page. */
  router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send("ok");
    } else {
        res.redirect("/login");
    }
  });

  return router;
};

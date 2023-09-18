var express = require("express");
var router = express.Router();
let isAuthenticated = require("../../../lib/auth").isAuthenticated;

const { generateLiveMessage } = require("../../../lib/openai");

const User = require("../../../models/user");

/* GET home page. */
router.get("/:messageType", isAuthenticated, async (req, res) => {
    User.findById(req.user._id)
    .populate("team")
    .populate({
      path: 'team',
      populate: {
        path: 'ship',
        model: 'Ship'
      }
    })
    .populate("badges")
    .populate("completed")
    .populate("collected")
    .then(async (user) => {
        const welcomeMessage = await generateLiveMessage(req.params.messageType, user);
        res.send(welcomeMessage);
    });
});


module.exports = router;

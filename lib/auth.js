const passport = require("passport");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const GoogleOAuth2Strategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user");

passport.use(
  new AzureAdOAuth2Strategy(
    {
      clientID: process.env.AZUREAD_CLIENT_ID,
      clientSecret: process.env.AZUREAD_CLIENT_SECRET,
      callbackURL:
        process.env.PLATFORM_PROJECT === undefined
          ? `${process.env.SERVER_PROTOCOL}://${process.env.SERVER_DOMAIN}:${process.env.SERVER_PORT}/${process.env.AZUREAD_CALLBACK_URL}`
          : `${process.env.SERVER_PROTOCOL}://${process.env.SERVER_DOMAIN}/${process.env.AZUREAD_CALLBACK_URL}`,
      resource: process.env.AZUREAD_RESOURCE,
      tenant: process.env.AZUREAD_TENANT,
    },
    function (accessToken, refresh_token, params, profile, done) {
      // currently we can't find a way to exchange access token by user info (see userProfile implementation), so
      // you will need a jwt-package like https://github.com/auth0/node-jsonwebtoken to decode id_token and get waad profile
      var waadProfile = jwt.decode(params.id_token);

      User.findOrCreate(waadProfile.upn, waadProfile, function (err, user) {
        done(err, user);
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.user._id)
      .populate({
        path: "team",
        populate: {
          path: "company",
          model: "Company",
        },
      })
      .then((user) => {
        if (!user) {
          res.redirect("/login");
        } else {
          req.userObj = user;
          next();
        }
      });
  } else {
    res.redirect("/login");
  }
}

function disconnect(req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      }
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.cookie("connect.sid", "", { expires: new Date(1), path: "/" });
      res.redirect("/login");
    });
  });
}


module.exports = { passport, isAuthenticated, disconnect };

const passport = require("passport");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const GoogleOAuth2Strategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require('passport-local').Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");

passport.use(new LocalStrategy(
  { usernameField: 'email' },  // par défaut, c'est "username" donc si vous utilisez "email" comme champ, spécifiez-le
  async (email, password, done) => {
    // Ici, trouvez l'utilisateur en fonction de l'e-mail
    const user = await User.findUserByEmail(email);

    if (!user) {
      return done(null, false, { message: 'Aucun utilisateur trouvé avec cet e-mail.' });
    }

    if (!await bcrypt.compare(password, user.password)) {
      return done(null, false, { message: 'Mot de passe incorrect.' });
    }

    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.user._id)
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

// Everything related to authentication and registration is dealt with in this file

const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../models");

const isLoggedIn = require("../middleware/isLoggedIn");
const path = require("path");
const bcrypt = require("bcrypt");

const usersController = require("../controllers/users");

module.exports = (app, passport) => {
  // Authenticate as NentoR in every resource when in development mode
  // app.use((req, res, next) => {
  // 	req.body.username = 'username';
  // 	req.body.password = 'password';

  // 	next();
  // }, passport.authenticate('local', {}));
  // // //

  app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
      req.flash("warning", "You are already logged in");
      res.redirect("/");
    } else {
      res.render("login");
    }
  });

  app.get("/logout", isLoggedIn, (req, res) => {
    req.logout();
    req.flash("success", "You have been successfully logged out");
    res.redirect("/");
  });

  app.post("/login", authenticate(app, passport));

  app.get(
    "/register",
    (req, res, next) => {
      if (req.isAuthenticated()) {
        req.flash("warning", "You are already logged in");
        res.redirect("/");
      } else {
        next();
      }
    },
    (req, res) => {
      res.render("register");
    }
  );

  app.post(
    "/register",
    async (req, res, next) => {
      const {
        username,
        password,
        confirm_password: confirmPassword,
        email,
      } = req.body;

      if (password !== confirmPassword) {
        req.flash("warning", "Passwords do not match!");
        return res.redirect("/register");
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        req.flash("warning", "Invalid Email Format!");
        return res.redirect("/register");
      }

      try {
        const user = await User.register({ username, password, email });

        return next();
      } catch (err) {
        req.flash("warning", err.message);
        return res.redirect("/register");
      }
    },
    authenticate(app, passport)
  );

  app.get("/verify/:key", async (req, res, next) => {
    const key = req.params.key;

    const user = await User.findOne({
      where: {
        key,
        active: false,
      },
    });

    if (user) {
      if (req.isAuthenticated()) {
        req.logout();
      }
      await user.verify();
      req.login(user, () => {
        req.flash("success", "You successfully verified your account");
        res.redirect("/");
      });
    } else {
      req.flash("error", "This key has already been used or is invalid");
      return res.redirect("/");
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { username } });

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findByPk(id);

    done(null, user);
  });
};

function authenticate(app, passport) {
  return (req, res, next) => {
    passport.authenticate("local", {}, (err, user, info) => {
      if (err) {
        req.flash("error", "Incorrect username or password");
        return res.redirect("/login");
      }

      if (user.active == false) {
        req.flash(
          "info",
          "Your account is awaiting email confirmation. Please check your email"
        );
        res.redirect("/login");
      } else {
        req.login(user, () => {
          req.flash("success", "You have been successfully logged in");
          res.redirect("/");
        });
      }
    })(req, res, next);
  };
}

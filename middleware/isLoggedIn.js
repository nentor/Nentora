module.exports = isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash(
      "danger",
      "You cannot access this resource if you have not first logged in"
    );
    return res.redirect("/login");
  }
};

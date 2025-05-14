function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    // Redirect to login or signup page if not authenticated
    return res.redirect('/login');
  }
}

module.exports = { isAuthenticated };

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else res.redirect('/unauth', 303);
};

module.exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) next();
  else res.redirect('/', 303);
};

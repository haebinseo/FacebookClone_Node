const passport = require('passport');
const { createUser } = require('./createData');

const login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect(303, '/unauth');
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect(303, '/');
    });
  })(req, res, next);
};

const join = async (req, res, next) => {
  try {
    const {
      email,
      family_name: familyName,
      first_name: firstName,
      password,
      gender,
      year,
      month,
      day,
    } = req.body;
    const birth = new Date(year, parseInt(month[0], 10) - 1, day); // month - String ex) 4월
    const argument = {
      email,
      name: familyName + firstName,
      password,
      gender,
      birth,
    };

    if (!(await createUser(argument))) {
      req.flash('joinError', '이미 가입된 이메일입니다.');
    }

    res.redirect(303, '/unauth');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect(303, '/unauth');
};

module.exports = { login, join, logout };

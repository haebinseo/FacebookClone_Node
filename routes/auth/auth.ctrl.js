const passport = require('passport');
const bcrypt = require('bcrypt');
const { User } = require('../../models');

const login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect('/unauth', 303);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/', 303);
    });
  })(req, res, next);
};

const join = async (req, res, next) => {
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
  const birth = new Date(year, parseInt(month[0], 10) - 1, day);
  console.log('birth', year, month, day);
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      req.flash('joinError', '이미 가입된 이메일입니다.');
      return res.redirect('/unauth', 303);
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      name: familyName + firstName,
      password: hash,
      gender,
      birth,
    });
    return res.redirect('/', 303);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/', 303);
};

module.exports = { login, join, logout };

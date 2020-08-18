const { Post, User } = require('../models');

const main = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'name'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'Facebook',
      posts,
      user: req.user,
      // loginError: req.flash('loginError'),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const unauth = (req, res) => {
  res.render('login', {
    title: 'Facebook - 로그인 또는 가입',
    loginError: req.flash('loginError'),
    joinError: req.flash('joinError'),
  });
};

module.exports = { main, unauth };

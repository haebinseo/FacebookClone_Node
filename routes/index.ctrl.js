const { Post, User, Sequelize } = require('../models');

const main = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'name', 'profileImg'],
      },
      order: [['createdAt', 'DESC']],
    });
    let comments = [];
    if (posts) {
      comments = await Promise.all(
        posts.map((post) => {
          return post.getComments({
            include: { model: User },
            order: [[Sequelize.literal('bundleCreatedAt', 'createdAt'), 'ASC']],
          });
        }),
      );
    }
    res.render('main', {
      title: 'Facebook',
      user: req.user,
      posts,
      comments,
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

const { Post, User, Sequelize } = require('../models');

const main = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'profileImg'],
        },
        {
          model: User,
          attributes: ['id', 'name'],
          as: 'UserWhoLikePosts',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    const userWhoLikePosts = {}; // [0: user.id, 1: user.name]
    let comments = [];
    const userWhoLikeComments = {};
    if (posts) {
      posts.forEach((post) => {
        userWhoLikePosts[post.id] = [
          post.UserWhoLikePosts.map((user) => user.id),
          post.UserWhoLikePosts.map((user) => user.name),
        ];
      });

      comments = await Promise.all(
        posts.map((post) => {
          return post.getComments({
            include: [
              {
                model: User,
                attributes: ['id', 'name', 'profileImg'],
              },
              {
                model: User,
                attributes: ['id', 'name'],
                as: 'UserWhoLikeComments',
              },
            ],
            order: [[Sequelize.literal('bundleCreatedAt, createdAt'), 'ASC']],
          });
        }),
      );

      comments.forEach((commentsInAPost) => {
        commentsInAPost.forEach((comment) => {
          userWhoLikeComments[comment.id] = [
            comment.UserWhoLikeComments.map((user) => user.id),
            comment.UserWhoLikeComments.map((user) => user.name),
          ];
        });
      });
    }
    // console.log('posts[0].UserWhoLikePosts', posts[0].UserWhoLikePosts);
    // console.log('posts[0].UserWhoLikePosts[0].LikePost', posts[0].UserWhoLikePosts[0].LikePost);

    res.render('main', {
      title: 'Facebook',
      user: req.user,
      posts,
      comments,
      userWhoLikePosts,
      userWhoLikeComments,
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

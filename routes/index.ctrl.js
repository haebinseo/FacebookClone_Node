const { Post, User, Sequelize, Friend } = require('../models');

const main = async (req, res, next) => {
  try {
    // friends
    const followingsObj = {};
    const followingsArr = await Friend.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId', 'accepted', 'roomId'],
    });
    followingsArr.forEach(function (following) {
      followingsObj[following.followingId] = [following.accepted, following.roomId];
    });

    const followersObj = {};
    const followersArr = await Friend.findAll({
      where: { followingId: req.user.id },
      attributes: ['followerId', 'accepted', 'roomId'],
    });
    followersArr.forEach(function (follower) {
      followersObj[follower.followerId] = [follower.accepted, follower.roomId];
    });

    // posts
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
    // console.log('user', req.user);
    // console.log('user.Followings', req.user.Followings[0]);
    // console.log('user.Followers', req.user.Followers[0]);
    // console.log('posts[0].UserWhoLikePosts', posts[0].UserWhoLikePosts);
    // console.log('posts[0].UserWhoLikePosts[0].LikePost', posts[0].UserWhoLikePosts[0].LikePost);

    res.render('main', {
      title: 'Facebook',
      user: req.user,
      followings: followingsObj,
      followers: followersObj,
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

const { Post } = require('../models');

const main = async (req, res) => {
  const posts = await Post.findAll({});
  res.render('main', { req.user, posts });
};

module.exports = main;

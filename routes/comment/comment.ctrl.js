const { Comment } = require('../../models');

const comment = async (req, res, next) => {
  try {
    const commentForm = {
      content: req.body.content,
      depth: req.body.depth,
      userId: req.user.id,
      postId: req.body.pid,
    };
    if (req.body.bundleCreatedAt) commentForm.bundleCreatedAt = req.body.bundleCreatedAt;
    await Comment.create(commentForm);
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

module.exports = { comment };

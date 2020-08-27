const { User } = require('../../models');

const addLike = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });

    // ex) /comment/1 or post/1
    if (req.url.includes('post')) user.addPostLiked(parseInt(req.params.pid, 10));
    else user.addCommentLiked(parseInt(req.params.cid, 10));

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const removeLike = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });

    if (req.url.includes('post')) user.removePostLiked(parseInt(req.params.pid, 10));
    else user.removeCommentLiked(parseInt(req.params.cid, 10));

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addLike, removeLike };

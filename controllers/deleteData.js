const { User, Friend, Message, Sequelize, Post, Comment } = require('../db/models');

const deleteFriend = async ({ userId, targetUID }) => {
  const friend = await Friend.findOne({
    where: { followerId: userId, followingId: targetUID },
  });
  if (!friend) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }
  // delete room, friend, message records
  const room = await friend.getRoom();
  const messages = await room.getMessages();
  const messageIds = messages.map((m) => m.id);
  await Message.destroy({ where: { id: { [Sequelize.Op.in]: messageIds } } });
  await room.destroy();
  await friend.destroy();
  await Friend.destroy({
    where: { followerId: targetUID, followingId: userId },
  });
};

const deleteLike = async ({ userId, target, targetId }) => {
  const isPostLike = target === 'post';
  const user = await User.findOne({
    where: { id: userId },
    include: [
      isPostLike
        ? { model: Post, attributes: ['id'], as: 'PostLikeds' }
        : { model: Comment, attributes: ['id'], as: 'CommentLikeds' },
    ],
  });
  const likeTargetIds = isPostLike
    ? user.PostLikeds.map((p) => p.id)
    : user.CommentLikeds.map((c) => c.id);
  if (!likeTargetIds.includes(targetId)) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  if (isPostLike) await user.removePostLiked(targetId);
  else await user.removeCommentLiked(targetId);
};

module.exports = { deleteFriend, deleteLike };

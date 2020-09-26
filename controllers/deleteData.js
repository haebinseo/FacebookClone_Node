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

const deleteComment = async ({ userId, commentId }) => {
  const comment = await Comment.findOne({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    const err = new Error(comment ? 'Forbidden' : 'Not Found');
    err.status = comment ? 403 : 404;
    throw err;
  }

  await comment.destroy();
};

const deleteMessage = async ({ userId, msgId }) => {
  let message = await Message.findOne({ where: { id: msgId } });
  if (!message || message.userId !== userId) {
    const err = new Error(message ? 'Forbidden' : 'Not Found');
    err.status = message ? 403 : 404;
    throw err;
  }

  message.content = '메시지 보내기를 취소했습니다';
  message = await message.save();
  await message.destroy();
  return message;
};

module.exports = { deleteFriend, deleteLike, deleteComment, deleteMessage };

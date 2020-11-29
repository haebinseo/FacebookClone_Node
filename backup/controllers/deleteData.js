const { User, Friend, Message, Post, Comment, Photo, Alarm, Room } = require('../db/models');

const deleteFriend = async ({ userId, targetUserId }) => {
  const friend = await Friend.findOne({
    where: { followerId: targetUserId, followingId: userId },
  });
  if (!friend) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }
  if (!friend.accepted) return; // decline friend request

  // delete room, friend, message records
  await Promise.all([
    Message.destroy({ where: { roomId: friend.roomId } }),
    Room.destroy({ where: { id: friend.roomId } }),
    friend.destroy(),
    Friend.destroy({ where: { followerId: userId, followingId: targetUserId } }),
  ]);
};

const deleteLike = async ({ userId, target, targetId }) => {
  const isPostLike = target === 'post';
  const user = await User.findOne({
    where: { id: userId },
    include: [
      isPostLike
        ? { model: Post, attributes: ['id'], as: 'PostsLiked' }
        : { model: Comment, attributes: ['id'], as: 'CommentsLiked' },
    ],
  });
  const likeTargetIds = isPostLike
    ? user.PostsLiked.map((p) => p.id)
    : user.CommentsLiked.map((c) => c.id);
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

const deletePhoto = async ({ userId, photoId }) => {
  const photo = await Photo.findOne({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) {
    const err = new Error(photo ? 'Forbidden' : 'Not Found');
    err.status = photo ? 403 : 404;
    throw err;
  }

  await photo.destroy();
};

const deleteAlarm = async ({ senderId, receiverId, type }) => {
  const alarm = await Alarm.findOne({ where: { senderId, receiverId, type } });
  if (!alarm) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  await alarm.destroy();
};

module.exports = {
  deleteFriend,
  deleteLike,
  deleteComment,
  deleteMessage,
  deletePhoto,
  deleteAlarm,
};

const { Message, Comment, User, Photo, Alarm, Sequelize } = require('../db/models');

const updateComment = async ({ userId, commentId, content }) => {
  const comment = await Comment.findOne({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    const err = new Error(comment ? 'Forbidden' : 'Not Found');
    err.status = comment ? 403 : 404;
    throw err;
  }

  comment.content = content;
  return comment.save();
};

const updateMessage = async ({ userId, msgId, content }) => {
  const message = await Message.findOne({ where: { id: msgId } });
  if (!message || message.userId !== userId) {
    const err = new Error(message ? 'Forbidden' : 'Not Found');
    err.status = message ? 403 : 404;
    throw err;
  }

  message.content = content;
  return message.save();
};

const updateProfilePhoto = async ({ userId, photoId }) => {
  const user = await User.findOne({ where: { id: userId } });
  const photo = await Photo.findOne({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) {
    const err = new Error(photo ? 'Forbidden' : 'Not Found');
    err.status = photo ? 403 : 404;
    throw err;
  }

  user.profilePhoto = photo.url;
  await user.save();
};

const updateAlarms = async ({ receiverId, alarmIds }) => {
  const alarms = await Alarm.findAll({
    where: {
      id: { [Sequelize.Op.in]: alarmIds },
      receiverId,
    },
  });
  if (!alarms.length) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  await Promise.all(
    alarms.map(async (alarm) => {
      alarm.isRead = true;
      return alarm.save();
    }),
  );
};

module.exports = { updateComment, updateMessage, updateProfilePhoto, updateAlarms };

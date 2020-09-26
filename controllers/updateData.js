const { Message, Comment } = require('../db/models');

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

module.exports = { updateComment, updateMessage };

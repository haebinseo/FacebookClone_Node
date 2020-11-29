const { userDAO, postDAO, messsageDAO, photoDAO } = require('../models');

async function createMessage(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      roomId: req.params.roomId,
      content: req.body.content,
    };
    const msg = await messsageDAO.createMessage(args);
    res.sendStatus(201);

    const friendId = await messsageDAO.fetchFriendIdInRoom(args);
    const sender = { profilePhoto: req.user.profilePhoto, name: req.user.name };
    const io = req.app.get('io');
    io.of('/user').to(args.userId).to(friendId).emit('msgPosted', { msg, sender });
    io.of('/chat').to(args.roomId).emit('msgPosted', msg);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function updateMessage(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      roomId: req.params.roomId,
      messageId: req.params.messageId,
      content: req.body.content,
    };
    const updatedMsg = await messsageDAO.updateMessage(args);
    res.sendStatus(204);

    const friendId = await messsageDAO.fetchFriendIdInRoom(args);
    const io = req.app.get('io');
    io.of('/user').to(args.userId).to(friendId).emit('msgUpdated', updatedMsg);
    io.of('/chat').to(args.roomId).emit('msgUpdated', updatedMsg);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function deleteMessage(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      roomId: req.params.roomId,
      messageId: req.params.messageId,
    };
    const deletedMsg = await messsageDAO.deleteMessage(args);
    res.sendStatus(204);

    const friendId = await messsageDAO.fetchFriendIdInRoom(args);
    const io = req.app.get('io');
    io.of('/user').to(args.userId).to(friendId).emit('msgDeleted', deletedMsg);
    io.of('/chat').to(args.roomId).emit('msgDeleted', deletedMsg);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

module.exports = {
  createMessage,
  updateMessage,
  deleteMessage,
};

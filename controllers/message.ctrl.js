const { messageDAO } = require('../models');

async function createMessage(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      roomId: parseInt(req.params.roomId, 10),
      content: req.body.content,
    };
    args.friendId = await messageDAO.getFriendIdInRoom(args);
    const msg = (await messageDAO.createMessage(args)).toJSON();
    res.sendStatus(201);

    const sender = { profilePhoto: req.user.profilePhoto, name: req.user.name };
    const io = req.app.get('io');
    io.of('/user').to(args.userId).to(args.friendId).emit('msgPosted', { msg, sender });
    io.of('/chat').to(args.roomId).emit('msgPosted', msg);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

// async function updateMessage(req, res, next) {
//   try {
//     const args = {
//       userId: req.user.id,
//       roomId: parseInt(req.params.roomId, 10),
//       messageId: parseInt(req.params.messageId, 10),
//       content: req.body.content,
//     };
//     const updatedMsg = (await messageDAO.updateMessage(args)).toJSON();
//     res.sendStatus(204);

//     const friendId = await messageDAO.getFriendIdInRoom(args);
//     const io = req.app.get('io');
//     io.of('/user').to(args.userId).to(friendId).emit('msgUpdated', updatedMsg);
//     io.of('/chat').to(args.roomId).emit('msgUpdated', updatedMsg);
//   } catch (error) {
//     // console.error(error);
//     next(error);
//   }
// }

async function deleteMessage(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      roomId: parseInt(req.params.roomId, 10),
      messageId: parseInt(req.params.messageId, 10),
    };
    const deletedMsg = (await messageDAO.deleteMessage(args)).toJSON();
    res.sendStatus(204);

    const friendId = await messageDAO.getFriendIdInRoom(args);
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
  // updateMessage,
  deleteMessage,
};

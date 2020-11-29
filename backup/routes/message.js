const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const { fetchFriendIdInRoom, fetchUserProfile } = require('../controllers/fetchData');
const { createMessage } = require('../controllers/createData');
const { updateMessage } = require('../controllers/updateData');
const { deleteMessage } = require('../controllers/deleteData');

router.post('/room/:rid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      roomId: req.params.rid,
      content: req.body.content,
    };
    const newMsg = await createMessage(argument);

    const friendId = await fetchFriendIdInRoom(argument);
    const addressee = await fetchUserProfile(friendId);
    const io = req.app.get('io');
    io.of('/user').to(argument.userId).emit('msgPosted', { msg: newMsg, addressee });
    io.of('/user').to(friendId).emit('msgPosted', { msg: newMsg, addressee });
    io.of('/chat').to(argument.roomId).emit('msgPosted', newMsg);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.patch('/:mid/room/:rid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      roomId: req.params.rid,
      msgId: req.params.mid,
      content: req.body.content,
    };
    const targetMsg = await updateMessage(argument);

    const friendId = await fetchFriendIdInRoom(argument);
    const io = req.app.get('io');
    io.of('/user').to(argument.userId).to(friendId).emit('msgUpdated', targetMsg);
    io.of('/chat').to(argument.roomId).emit('msgUpdated', targetMsg);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.delete('/:mid/room/:rid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      roomId: req.params.rid,
      msgId: req.params.mid,
    };
    const targetMsg = await deleteMessage(argument);

    const friendId = await fetchFriendIdInRoom(argument);
    const io = req.app.get('io');
    io.of('/user').to(argument.userId).to(friendId).emit('msgDeleted', targetMsg);
    io.of('/chat').to(argument.roomId).emit('msgDeleted', targetMsg);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const { fetchFriendInRoom } = require('../controllers/fetchData');
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

    const friendId = await fetchFriendInRoom(argument);
    const io = req.app.get('io');
    io.of('/user').to(argument.userId).to(friendId).emit('message', newMsg);
    io.of('/chat').to(argument.roomId).emit('message', newMsg);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.post('/update/:mid/room/:rid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      roomId: req.params.rid,
      msgId: req.params.mid,
      content: req.body.content,
    };
    const targetMsg = await updateMessage(argument);

    const friendId = await fetchFriendInRoom(argument);
    const io = req.app.get('io');
    io.of('/user').to(argument.userId).to(friendId).emit('updateMsg', targetMsg);
    io.of('/chat').to(argument.roomId).emit('updateMsg', targetMsg);
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

    const friendId = await fetchFriendInRoom(argument);
    const io = req.app.get('io');
    io.of('/user').to(argument.userId).to(friendId).emit('deleteMsg', targetMsg);
    io.of('/chat').to(argument.roomId).emit('deleteMsg', targetMsg);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

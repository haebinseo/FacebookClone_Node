const router = require('express').Router();
const { createFriend, createMessage, createAlarm } = require('../controllers/createData');
const { deleteFriend, deleteAlarm } = require('../controllers/deleteData');
const { isLoggedIn } = require('./middleware');

router.post('/:uid', isLoggedIn, async (req, res, next) => {
  try {
    let argument = { userId: req.user.id, targetUserId: parseInt(req.params.uid, 10) };
    const friend = await createFriend(argument);
    res.sendStatus(200);

    // create alarm
    argument.type = !friend.roomId ? 'confirmFriend' : 'friendConfirmed';
    const alarm = await createAlarm(argument);
    const io = req.app.get('io');
    io.of('user').to(argument.targetUserId).emit(argument.type, alarm);

    console.log('roomId', friend.roomId);
    if (!friend.roomId) return; // add friend

    // confirm friend
    // create and emit a joining system message
    const content = '이제 Messenger에서 친구와 메시지를 주고받을 수 있습니다.';
    const message = await createMessage({ roomId: friend.roomId, content });
    req.app.get('io').of('/user').to(argument.userId).emit('message', message);
    req.app.get('io').of('/user').to(argument.targetUserId).emit('message', message);

    // delete alarm 'confirmFriend'
    argument = {
      senderId: argument.targetUserId,
      receiverId: argument.userId,
      type: 'confirmFriend',
    };
    await deleteAlarm(argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.delete('/:uid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = { userId: req.user.id, targetUserId: parseInt(req.params.uid, 10) };
    await deleteFriend(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

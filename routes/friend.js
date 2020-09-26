const router = require('express').Router();
const {
  createOneWayFriend,
  createTwoWayFriend,
  createMessage,
} = require('../controllers/createData');
const { deleteFriend } = require('../controllers/deleteData');
const { isLoggedIn } = require('./middleware');

router.post('/add/:uid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = { userId: req.user.id, targetUID: parseInt(req.params.uid, 10) };
    await createOneWayFriend(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.post('/accept/:uid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = { userId: req.user.id, targetUID: parseInt(req.params.uid, 10) };
    const roomId = await createTwoWayFriend(argument);
    res.sendStatus(200);

    // create and emit a joining system message
    const content = '이제 Messenger에서 친구와 메시지를 주고받을 수 있습니다.';
    const message = await createMessage({ roomId, content });
    req.app.get('io').of('/user').to(argument.userId).emit('message', message);
    req.app.get('io').of('/user').to(argument.targetUID).emit('message', message);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.delete('/remove/:uid', isLoggedIn, async (req, res, next) => {
  try {
    const argument = { userId: req.user.id, targetUID: parseInt(req.params.uid, 10) };
    await deleteFriend(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

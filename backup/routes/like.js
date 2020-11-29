const router = require('express').Router();
const { fetchUserIDFromPostID } = require('../controllers/fetchData');
const { createLike, createAlarm } = require('../controllers/createData');
const { deleteLike } = require('../controllers/deleteData');

router.post('/post/:pid', async (req, res, next) => {
  try {
    let argument = {
      userId: req.user.id,
      target: 'post',
      targetId: parseInt(req.params.pid, 10),
    };
    await createLike(argument);
    res.sendStatus(200);

    // create alarm
    const targetUserId = await fetchUserIDFromPostID(argument.targetId);
    if (argument.userId === targetUserId) return; // user's post

    argument = {
      userId: req.user.id,
      targetUserId,
      type: 'like',
    };
    const alarm = await createAlarm(argument);
    const io = req.app.get('io');
    io.of('user').to(argument.targetUserId).emit('likePosted', alarm);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.post('/comment/:cid', async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      target: 'comment',
      targetId: parseInt(req.params.cid, 10),
    };
    await createLike(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.delete('/post/:pid', async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      target: 'post',
      targetId: parseInt(req.params.pid, 10),
    };
    await deleteLike(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.delete('/comment/:cid', async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      target: 'comment',
      targetId: parseInt(req.params.cid, 10),
    };
    await deleteLike(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

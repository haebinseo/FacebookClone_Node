const router = require('express').Router();
const { createLike } = require('../controllers/createData');
const { deleteLike } = require('../controllers/deleteData');

router.post('/post/:pid', async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      target: 'post',
      targetId: parseInt(req.params.pid, 10),
    };
    await createLike(argument);
    res.sendStatus(200);
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

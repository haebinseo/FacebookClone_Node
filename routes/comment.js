const router = require('express').Router();
const { createComment } = require('../controllers/createData');
const { updateComment } = require('../controllers/updateData');
const { deleteComment } = require('../controllers/deleteData');

router.post('/', async (req, res, next) => {
  try {
    const argument = {
      content: req.body.content,
      depth: req.body.depth,
      userId: req.user.id,
      postId: req.body.pid,
      bundleCreatedAt: req.body.bundleCreatedAt || null,
    };
    await createComment(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.post('/update/:cid', async (req, res, next) => {
  try {
    const argument = {
      content: req.body.content,
      userId: req.user.id,
      commentId: req.params.cid,
    };
    await updateComment(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.delete('/:cid', async (req, res, next) => {
  try {
    const argument = {
      userId: req.user.id,
      commentId: req.params.cid,
    };
    await deleteComment(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

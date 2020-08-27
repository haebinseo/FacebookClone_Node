const router = require('express').Router();
const ctrl = require('./like.ctrl');

router.post('/post/:pid', ctrl.addLike);
router.post('/comment/:cid', ctrl.addLike);
router.delete('/post/:pid', ctrl.removeLike);
router.delete('/comment/:cid', ctrl.removeLike);

module.exports = router;

const router = require('express').Router();
const ctrl = require('./friend.ctrl');
const { isLoggedIn } = require('../middleware');

router.post('/:uid/add', isLoggedIn, ctrl.addFriend);
router.post('/:uid/accept', isLoggedIn, ctrl.acceptFriend);
router.delete('/:uid', isLoggedIn, ctrl.unfriend);

module.exports = router;

const router = require('express').Router();
const ctrl = require('./friend.ctrl');
const { isLoggedIn } = require('../middleware');

router.post('/:uid/add', isLoggedIn, ctrl.addFriend);
router.post('/:uid/accept', isLoggedIn, ctrl.acceptFriend);

module.exports = router;

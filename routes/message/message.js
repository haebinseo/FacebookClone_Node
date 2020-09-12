const router = require('express').Router();
const { isLoggedIn } = require('../middleware');
const ctrl = require('./message.ctrl');

router.post('/:rid', isLoggedIn, ctrl.postMessage);
router.delete('/:rid/:mid', isLoggedIn, ctrl.deleteMessage);

module.exports = router;

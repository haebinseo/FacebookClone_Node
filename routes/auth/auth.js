const router = require('express').Router();
const ctrl = require('./auth.ctrl');
const { isLoggedIn, isNotLoggedIn } = require('../middleware');

router.post('/login', isNotLoggedIn, ctrl.login);
router.post('/join', isNotLoggedIn, ctrl.join);
router.get('/logout', isLoggedIn, ctrl.logout);

module.exports = router;

const router = require('express').Router();
const ctrl = require('./index.ctrl');
const { isLoggedIn, isNotLoggedIn } = require('./middleware');

router.get('/', isLoggedIn, ctrl.main);
router.get('/unauth', isNotLoggedIn, ctrl.unauth);

module.exports = router;

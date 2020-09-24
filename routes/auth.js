const router = require('express').Router();
const { login, join, logout } = require('../controllers/authentication');
const { isLoggedIn, isNotLoggedIn } = require('./middleware');

router.post('/login', isNotLoggedIn, login);
router.post('/join', isNotLoggedIn, join);
router.get('/logout', isLoggedIn, logout);

module.exports = router;

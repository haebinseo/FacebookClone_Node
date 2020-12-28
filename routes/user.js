const router = require('express').Router();
const {
  login,
  join,
  logout,
  isFriend,
  createFriend,
  deleteFriend,
  getUserPhotos,
  updateUserProfileInfo,
  updateAlarms,
  deleteAlarms,
} = require('../controllers/user.ctrl');
const { isLoggedIn, isNotLoggedIn } = require('./middleware');

router.post('/login', isNotLoggedIn, login);
router.post('/join', isNotLoggedIn, join);
router.get('/logout', isLoggedIn, logout);

router.get('/friend/:userId', isLoggedIn, isFriend);
router.post('/friend/:userId', isLoggedIn, createFriend);
router.delete('/friend/:userId', isLoggedIn, deleteFriend);

router.get('/photo', isLoggedIn, getUserPhotos);

router.patch('/info', isLoggedIn, updateUserProfileInfo);

router.patch('/alarms', isLoggedIn, updateAlarms);
router.delete('/alarms', isLoggedIn, deleteAlarms);

module.exports = router;

const router = require('express').Router();
const { isLoggedIn, isNotLoggedIn } = require('./middleware');
const {
  showHomePage,
  showLoginPage,
  showPhotoDetail,
  showMessenger,
  showMessengerWithRoomId,
  showProfile,
  showProfileFriend,
  showProfilePhoto,
} = require('../controllers/index.ctrl');

router.get('/', isLoggedIn, showHomePage);
router.get('/login', isNotLoggedIn, showLoginPage);

router.get('/photo/:photoId', isLoggedIn, showPhotoDetail);

router.get('/messenger', isLoggedIn, showMessenger);
router.get('/messenger/:roomId', isLoggedIn, showMessengerWithRoomId);

router.get('/profile/:userId', isLoggedIn, showProfile);
router.get('/profile/:userId/friend', isLoggedIn, showProfileFriend);
router.get('/profile/:userId/photo', isLoggedIn, showProfilePhoto);

module.exports = router;

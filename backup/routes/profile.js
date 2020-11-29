const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const {
  fetchUserProfile,
  fetchPostsWithUser,
  fetchFriends,
  fetchPhotosWithUser,
  fetchAlarms,
} = require('../controllers/fetchData');
const { updateProfilePhoto } = require('../controllers/updateData');
const {
  renderProfile,
  renderProfileFriend,
  renderProfilePhoto,
} = require('../controllers/render');

router.get('/:uid', isLoggedIn, async (req, res, next) => {
  try {
    const alarms = await fetchAlarms(req.user.id);
    const targetUser = await fetchUserProfile(req.params.uid);
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await fetchFriends(req.user.id);
    const { posts, likes } = await fetchPostsWithUser(req.params.uid);

    const argument = { targetUser, followings, followers, friends, posts, likes, alarms };
    renderProfile(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get('/:uid/friend', isLoggedIn, async (req, res, next) => {
  try {
    const alarms = await fetchAlarms(req.user.id);
    const targetUser = await fetchUserProfile(req.params.uid);
    const {
      followingsObj: myFollowings,
      followersObj: myFollowers,
      myFriends,
    } = await fetchFriends(req.user.id);
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await fetchFriends(targetUser.id);
    // except the current user from friends list
    const idxCurrUser = friends.findIndex((f) => f.id === req.user.id);
    if (idxCurrUser >= 0) friends.splice(idxCurrUser, 1);

    const argument = {
      targetUser,
      followings,
      followers,
      friends,
      myFollowings,
      myFollowers,
      myFriends,
      alarms,
    };
    renderProfileFriend(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get('/:uid/photo', isLoggedIn, async (req, res, next) => {
  try {
    const alarms = await fetchAlarms(req.user.id);
    const targetUser = await fetchUserProfile(req.params.uid);
    const photos = await fetchPhotosWithUser(targetUser.id);

    const argument = { targetUser, photos, alarms };
    renderProfilePhoto(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.patch('/:uid/profilePhoto/:pid', isLoggedIn, async (req, res, next) => {
  try {
    const { uid, pid } = req.params;
    const targetUserId = parseInt(uid, 10);
    const photoId = parseInt(pid, 10);
    if (targetUserId !== req.user.id) {
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    }

    const argument = { userId: req.user.id, photoId };
    await updateProfilePhoto(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

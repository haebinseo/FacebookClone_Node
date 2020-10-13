const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const {
  fetchUserProfile,
  fetchPostsWithUser,
  fetchFriends,
  fetchUserPhotos,
} = require('../controllers/fetchData');
const {
  renderProfile,
  renderProfileFriend,
  renderProfilePhoto,
} = require('../controllers/render');

router.get('/:uid', isLoggedIn, async (req, res, next) => {
  try {
    const targetUser = await fetchUserProfile(req.params.uid);
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await fetchFriends(req.user.id);
    const { posts, likes } = await fetchPostsWithUser(req.params.uid);

    const argument = { targetUser, followings, followers, friends, posts, likes };
    renderProfile(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get('/:uid/friend', isLoggedIn, async (req, res, next) => {
  try {
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
    if (idxCurrUser > 0) friends.splice(idxCurrUser, 1);

    const argument = {
      targetUser,
      followings,
      followers,
      friends,
      myFollowings,
      myFollowers,
      myFriends,
    };
    renderProfileFriend(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get('/:uid/photo', isLoggedIn, async (req, res, next) => {
  try {
    const targetUser = await fetchUserProfile(req.params.uid);
    const photos = await fetchUserPhotos(targetUser.id);

    const argument = { targetUser, photos };
    renderProfilePhoto(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

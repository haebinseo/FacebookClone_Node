const router = require('express').Router();

const { isLoggedIn, multer } = require('./middleware');
const { fetchFriends, fetchPostsWithTag } = require('../controllers/fetchData');
const { createPost } = require('../controllers/createData');
const { renderMain } = require('../controllers/render');

router.post('/', isLoggedIn, multer.none(), async (req, res, next) => {
  try {
    const argument = {
      content: req.body.content,
      photoIds: req.body.photoIds.split(','),
      userId: req.user.id,
    };
    await createPost(argument);
    res.redirect(303, '/');
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get('/hashtag', isLoggedIn, async (req, res, next) => {
  try {
    const { hashtag } = req.query;
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await fetchFriends(req.user.id);
    const { posts, likes } = await fetchPostsWithTag(hashtag);
    const argument = {
      title: `${hashtag} | Facebook`,
      followings,
      followers,
      friends,
      posts,
      likes,
    };
    renderMain(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;

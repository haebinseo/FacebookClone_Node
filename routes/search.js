const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const { getTagAutocomplete, showPostsWithTag } = require('../controllers/search.ctrl');

router.get('/hashtag', isLoggedIn, getTagAutocomplete);
router.get('/post/hashtag', isLoggedIn, showPostsWithTag);

module.exports = router;

const render = require('./render');
const { postDAO, userDAO } = require('../models');

async function getTagAutocomplete(req, res, next) {
  try {
    const { hashtag } = req.query;
    const candidates = hashtag ? await postDAO.getHashtagCandidates(hashtag) : [];
    res.json(candidates);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function showPostsWithTag(req, res, next) {
  try {
    const { hashtag } = req.query;
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await userDAO.getFriends(req.user.id);
    const { posts, likes } = await postDAO.getPostsWithTag(hashtag);
    const alarms = await userDAO.getAlarms(req.user.id);
    const args = {
      title: `${hashtag} | Facebook`,
      followings,
      followers,
      friends,
      posts,
      likes,
      alarms,
    };
    render.main(req, res, args);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

module.exports = {
  getTagAutocomplete,
  showPostsWithTag,
};

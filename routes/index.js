const router = require('express').Router();
const { isLoggedIn, isNotLoggedIn } = require('./middleware');
const {
  fetchFriends,
  fetchPosts,
  fetchMessages,
  fetchRooms,
} = require('../controllers/fetchData');
const { renderMain, renderLogin, renderMessenger } = require('../controllers/render');

/*
 * urls
 *    /
 *    /unauth
 *    /messenger
 *    /messenger/:rid
 */

router.get('/', isLoggedIn, async (req, res, next) => {
  /*
   * followings, followers - Object (key: userId, value: follower/ee object)
   * posts, likes - Array
   */
  try {
    const { followingsObj: followings, followersObj: followers } = await fetchFriends(
      req.user.id,
    );
    const { posts, likes } = await fetchPosts();

    const argument = { followings, followers, posts, likes };
    renderMain(req, res, argument);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/unauth', isNotLoggedIn, renderLogin);

router.get('/messenger', isLoggedIn, async (req, res, next) => {
  /*
   * rooms - Array
   */
  try {
    const { rooms } = await fetchRooms(req.user.id);
    if (!rooms.length) renderMessenger(req, res);

    // find the chat room with the latest message
    const idxOfTheLatest = rooms.reduce((imax, r, i, rs) => {
      return r.messages[0].createdAt > rs[imax].messages[0].createdAt ? i : imax;
    }, 0);

    res.redirect(`/messenger/${rooms[idxOfTheLatest].id}`);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/messenger/:rid', isLoggedIn, async (req, res, next) => {
  /*
   * friends, rooms, messages - Array
   * currentRoom - Object
   * currentRoomIdx - Number
   */
  try {
    const targetRID = parseInt(req.params.rid, 10);
    const { friends, rooms } = await fetchRooms(req.user.id);
    const messages = await fetchMessages(targetRID);

    // sort chat rooms by the latest message
    rooms.sort((r1, r2) => {
      const { createdAt: createdAt1 } = r1.messages[0];
      const { createdAt: createdAt2 } = r2.messages[0];

      if (createdAt1 > createdAt2) return -1;
      if (createdAt1 < createdAt2) return 1;
      return 0;
    });

    // assign friend user info. in room objects
    const friendsObj = {};
    friends.forEach((f) => {
      friendsObj[f.friend.roomId] = f;
    });
    rooms.forEach((r) => {
      r.user = friendsObj[r.id];
    });

    // find the index of currentRoom
    let currentRoom;
    let currentRoomIdx;
    for (let i = 0; i < rooms.length; i += 1) {
      if (rooms[i].id === targetRID) {
        currentRoom = rooms[i];
        currentRoomIdx = i;
        break;
      }
    }

    console.log('currentRoom.user', currentRoom.user);

    const argument = { rooms, currentRoom, currentRoomIdx, messages };
    renderMessenger(req, res, argument);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;

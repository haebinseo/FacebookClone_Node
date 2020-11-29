const router = require('express').Router();
const { isLoggedIn, isNotLoggedIn } = require('./middleware');
// const {
//   fetchFriends,
//   fetchPosts,
//   fetchMessages,
//   fetchRooms,
//   fetchAlarms,
// } = require('../controllers/fetchData');
// const { renderMain, renderLogin, renderMessenger } = require('../controllers/render');
const { getHome, getMessenger, getMessengerWithRoomId } = require('../controllers/index.ctrl');

router.get('/', isLoggedIn, getHome);
router.get('/messenger', isLoggedIn, getMessenger);
router.get('/messenger/:roomId', isLoggedIn, getMessengerWithRoomId);

// router.get('/', isLoggedIn, async (req, res, next) => {
//   /*
//    * followings, followers - Object (key: userId, value: follower/ee object)
//    * posts, likes - Array
//    */
//   try {
//     const { followingsObj: followings, followersObj: followers, friends } = await fetchFriends(
//       req.user.id,
//     );
//     const { posts, likes } = await fetchPosts();
//     const alarms = await fetchAlarms(req.user.id);
//     console.log('alarms', alarms);

//     const argument = { followings, followers, friends, posts, likes, alarms };
//     renderMain(req, res, argument);
//   } catch (error) {
//     // console.error(error);
//     next(error);
//   }
// });

// router.get('/unauth', isNotLoggedIn, renderLogin);

// router.get('/messenger', isLoggedIn, async (req, res, next) => {
//   /*
//    * rooms - Array
//    */
//   try {
//     const alarms = await fetchAlarms(req.user.id);
//     const { rooms } = await fetchRooms(req.user.id);
//     const roomsWithMsg = rooms.filter((r) => r.messages.length); // rooms that have one or more messages.
//     if (!roomsWithMsg.length) {
//       const argument = {
//         roomsWithMsg,
//         currentRoom: null,
//         currentRoomIdx: null,
//         messages: null,
//         alarms,
//       };
//       renderMessenger(req, res, argument);
//     }

//     // find the chat room with the latest message
//     const idxOfTheLatest = roomsWithMsg.reduce((imax, r, i, rs) => {
//       return r.messages[0].createdAt > rs[imax].messages[0].createdAt ? i : imax;
//     }, 0);

//     res.redirect(`/messenger/${roomsWithMsg[idxOfTheLatest].id}`);
//   } catch (error) {
//     // console.error(error);
//     next(error);
//   }
// });

// router.get('/messenger/:rid', isLoggedIn, async (req, res, next) => {
//   /*
//    * friends, rooms, messages - Array
//    * currentRoom - Object
//    * currentRoomIdx - Number
//    */
//   try {
//     const alarms = await fetchAlarms(req.user.id);
//     const targetRID = parseInt(req.params.rid, 10);
//     const { friends, rooms } = await fetchRooms(req.user.id);
//     const roomsWithMsg = rooms.filter((r) => r.messages.length); // rooms that have one or more messages.
//     const messages = await fetchMessages(targetRID);

//     // sort chat rooms by the latest message
//     roomsWithMsg.sort((r1, r2) => {
//       const { createdAt: createdAt1 } = r1.messages[0];
//       const { createdAt: createdAt2 } = r2.messages[0];

//       if (createdAt1 > createdAt2) return -1;
//       if (createdAt1 < createdAt2) return 1;
//       return 0;
//     });

//     // assign friend user info. in room objects
//     const friendsObj = {};
//     friends.forEach((f) => {
//       friendsObj[f.friend.roomId] = f;
//     });
//     roomsWithMsg.forEach((r) => {
//       r.user = friendsObj[r.id];
//       r.dataValues.user = friendsObj[r.id];
//     });

//     // find the index of currentRoom
//     let currentRoom;
//     let currentRoomIdx;
//     for (let i = 0; i < roomsWithMsg.length; i += 1) {
//       if (roomsWithMsg[i].id === targetRID) {
//         currentRoom = roomsWithMsg[i];
//         currentRoomIdx = i;
//         break;
//       }
//     }

//     // console.log('currentRoom.user', currentRoom.user);
//     console.log('currentRoom', currentRoom);

//     const argument = {
//       rooms: roomsWithMsg,
//       currentRoom,
//       currentRoomIdx,
//       messages,
//       alarms,
//     };
//     renderMessenger(req, res, argument);
//   } catch (error) {
//     // console.error(error);
//     next(error);
//   }
// });

module.exports = router;

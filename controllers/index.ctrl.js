const render = require('./render');
const { userDAO, postDAO, messageDAO, photoDAO } = require('../models');

async function showHomePage(req, res, next) {
  /*
   * followings, followers - Object (key: userId, value: follower/ee object)
   * posts, likes - Array
   */
  try {
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await userDAO.getFriends(req.user.id);
    const { posts, likes } = await postDAO.getPosts();
    const alarms = await userDAO.getAlarms(req.user.id);
    const unreadMessageCount = await messageDAO.getUnreadMessageCount(req.user.id);
    // console.log('alarms', alarms);

    const argument = { followings, followers, friends, posts, likes, alarms, unreadMessageCount };
    render.main(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

function showLoginPage(req, res) {
  render.login(req, res);
}

async function showPhotoDetail(req, res, next) {
  try {
    const photoId = parseInt(req.params.photoId, 10);
    const photo = await photoDAO.getPhoto(photoId);
    const {
      posts: [post],
      likes,
    } = await postDAO.getPosts([photo.postId]);
    const photoIdx = post.photos.findIndex((p) => p.id === photo.id);

    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await userDAO.getFriends(req.user.id);
    const alarms = await userDAO.getAlarms(req.user.id);
    const unreadMessageCount = await messageDAO.getUnreadMessageCount(req.user.id);

    const args = {
      followings,
      followers,
      friends,
      photo: photo.toJSON(),
      photoIdx,
      post: post.toJSON(),
      likes,
      alarms,
      unreadMessageCount,
    };
    render.photoDetail(req, res, args);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function showMessenger(req, res, next) {
  /*
   * rooms - Array
   */
  try {
    const alarms = await userDAO.getAlarms(req.user.id);
    const { rooms } = await messageDAO.getRooms(req.user.id);
    const roomsWithMsg = rooms.filter((r) => r.messages.length); // rooms that have one or more messages.
    if (!roomsWithMsg.length) {
      const argument = {
        roomsWithMsg,
        currentRoom: null,
        currentRoomIdx: null,
        messages: null,
        alarms,
      };
      render.messenger(req, res, argument);
    }

    // find the chat room with the latest message
    const idxOfTheLatest = roomsWithMsg.reduce((imax, r, i, rs) => {
      return r.messages[0].createdAt > rs[imax].messages[0].createdAt ? i : imax;
    }, 0);

    res.redirect(`/messenger/${roomsWithMsg[idxOfTheLatest].id}`);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function showMessengerWithRoomId(req, res, next) {
  /*
   * friends, rooms, messages - Array
   * currentRoom - Object
   * currentRoomIdx - Number
   */
  try {
    const alarms = await userDAO.getAlarms(req.user.id);
    const roomId = parseInt(req.params.roomId, 10);
    const { friends, rooms } = await messageDAO.getRooms(req.user.id);
    const roomsWithMsg = rooms.filter((r) => r.messages.length); // rooms that have one or more messages.
    const messages = (await messageDAO.getMessages(roomId)).map((m) => m.toJSON());

    // sort chat rooms by the latest message
    roomsWithMsg.sort((r1, r2) => {
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
    roomsWithMsg.forEach((r) => {
      r.user = friendsObj[r.id];
      r.dataValues.user = friendsObj[r.id];
    });

    // find the index of currentRoom
    let currentRoom;
    let currentRoomIdx;
    for (let i = 0; i < roomsWithMsg.length; i += 1) {
      if (roomsWithMsg[i].id === roomId) {
        currentRoom = roomsWithMsg[i];
        currentRoomIdx = i;
        break;
      }
    }

    // console.log('currentRoom.user', currentRoom.user);
    // console.log('currentRoom', currentRoom);

    const argument = {
      rooms: roomsWithMsg,
      currentRoom,
      currentRoomIdx,
      messages,
      alarms,
    };
    render.messenger(req, res, argument);

    // update the read status of messages
    const unreadMessageIds = messages.filter((msg) => !msg.isRead).map((msg) => msg.id);
    console.log('unreadMessageIds: ', unreadMessageIds);
    await messageDAO.updateMessageReadStatus(unreadMessageIds);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function showProfile(req, res, next) {
  try {
    const alarms = await userDAO.getAlarms(req.user.id);
    const unreadMessageCount = await messageDAO.getUnreadMessageCount(req.user.id);
    const targetUser = await userDAO.getUser(req.params.userId);
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await userDAO.getFriends(req.user.id);
    const { posts, likes } = await postDAO.getPostsWithUser(req.params.userId);
    const args = { userId: targetUser.id, limit: 9 };
    const photos = await photoDAO.getPhotosWithUser(args);

    const argument = {
      targetUser,
      followings,
      followers,
      friends,
      posts,
      likes,
      alarms,
      unreadMessageCount,
      photos,
    };
    render.profile.timeline(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function showProfileFriend(req, res, next) {
  try {
    const alarms = await userDAO.getAlarms(req.user.id);
    const unreadMessageCount = await messageDAO.getUnreadMessageCount(req.user.id);
    const targetUser = await userDAO.getUser(req.params.userId);
    const {
      followingsObj: myFollowings,
      followersObj: myFollowers,
      myFriends,
    } = await userDAO.getFriends(req.user.id);
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await userDAO.getFriends(targetUser.id);
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
      unreadMessageCount,
    };
    render.profile.friend(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function showProfilePhoto(req, res, next) {
  try {
    const alarms = await userDAO.getAlarms(req.user.id);
    const unreadMessageCount = await messageDAO.getUnreadMessageCount(req.user.id);
    const targetUser = await userDAO.getUser(req.params.userId);
    let args = { userId: targetUser.id };
    const photos = await photoDAO.getPhotosWithUser(args);

    args = { targetUser, photos, alarms, unreadMessageCount };
    render.profile.photo(req, res, args);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

module.exports = {
  showHomePage,
  showLoginPage,
  showPhotoDetail,
  showMessenger,
  showMessengerWithRoomId,
  showProfile,
  showProfileFriend,
  showProfilePhoto,
};

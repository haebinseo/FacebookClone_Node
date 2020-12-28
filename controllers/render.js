const alarmContent = {
  like: '님이 좋아요을 눌렀습니다.',
  comment: '님이 댓글을 달았습니다.',
  confirmFriend: '님이 친구 요청을 보냈습니다.',
  friendConfirmed: '님이 친구 요청을 수락했습니다.',
};

const render = {
  main(req, res, args) {
    const {
      title,
      user,
      followings,
      followers,
      friends,
      posts,
      likes,
      alarms,
      unreadMessageCount,
    } = args;
    res.render('main', {
      title: title || 'Facebook',
      user: user || req.user,
      followings,
      followers,
      friends,
      posts,
      likes,
      alarms,
      alarmContent,
      unreadMessageCount,
    });
  },

  login(req, res, args = { title: null }) {
    const { title } = args;
    res.render('login', {
      title: title || 'Facebook - 로그인 또는 가입',
      loginError: req.flash('loginError'),
      joinError: req.flash('joinError'),
    });
  },

  photoDetail(req, res, args) {
    const {
      title,
      user,
      followings,
      followers,
      friends,
      photo,
      photoIdx,
      post,
      likes,
      alarms,
      unreadMessageCount,
    } = args;
    res.render('photoDetail', {
      title: title || 'Facebook',
      user: user || req.user,
      followings,
      followers,
      friends,
      photo,
      photoIdx,
      post,
      likes,
      alarms,
      alarmContent,
      unreadMessageCount,
    });
  },

  messenger(req, res, args) {
    const { title, user, rooms, currentRoom, currentRoomIdx, messages, alarms } = args;
    res.render('messenger', {
      title: title || 'Messenger | Facebook',
      user: user || req.user,
      rooms,
      currentRoom,
      currentRoomIdx,
      messages,
      alarms,
      alarmContent,
    });
  },

  profile: {
    timeline(req, res, args) {
      const {
        title,
        user,
        targetUser,
        followings,
        followers,
        friends,
        posts,
        likes,
        alarms,
        unreadMessageCount,
        photos,
      } = args;
      res.render('pTimeline', {
        title: title || `${targetUser.name} | Facebook`,
        user: user || req.user,
        targetUser,
        followings,
        followers,
        friends,
        posts,
        likes,
        selected: 'timeline',
        alarms,
        alarmContent,
        unreadMessageCount,
        photos,
      });
    },

    friend(req, res, args) {
      const {
        title,
        user,
        targetUser,
        followings,
        followers,
        friends,
        myFollowings,
        myFollowers,
        myFriends,
        alarms,
        unreadMessageCount,
      } = args;
      res.render('pFriend', {
        title: title || `${targetUser.name} | Facebook`,
        user: user || req.user,
        targetUser,
        followings,
        followers,
        friends,
        myFollowings,
        myFollowers,
        myFriends,
        selected: 'friend',
        alarms,
        alarmContent,
        unreadMessageCount,
      });
    },

    photo(req, res, args) {
      const { title, user, targetUser, photos, alarms, unreadMessageCount } = args;
      res.render('pPhoto', {
        title: title || `${targetUser.name} | Facebook`,
        user: user || req.user,
        targetUser,
        photos,
        selected: 'photo',
        alarms,
        alarmContent,
        unreadMessageCount,
      });
    },
  },
};

// const renderMain = (
//   req,
//   res,
//   { title, user, followings, followers, friends, posts, likes, alarms },
// ) => {
//   res.render('main', {
//     title: title || 'Facebook',
//     user: user || req.user,
//     followings,
//     followers,
//     friends,
//     posts,
//     likes,
//     alarms,
//     alarmContent,
//   });
// };

// const renderLogin = (req, res, { title } = {}) => {
//   res.render('login', {
//     title: title || 'Facebook - 로그인 또는 가입',
//     loginError: req.flash('loginError'),
//     joinError: req.flash('joinError'),
//   });
// };

// const renderMessenger = (
//   req,
//   res,
//   { title, user, rooms, currentRoom, currentRoomIdx, messages, alarms },
// ) => {
//   res.render('messenger', {
//     title: title || 'Messenger | Facebook',
//     user: user || req.user,
//     rooms,
//     currentRoom,
//     currentRoomIdx,
//     messages,
//     alarms,
//     alarmContent,
//   });
// };

// const renderProfile = (
//   req,
//   res,
//   { title, user, targetUser, followings, followers, friends, posts, likes, alarms },
// ) => {
//   res.render('pTimeline', {
//     title: title || `${targetUser.name} | Facebook`,
//     user: user || req.user,
//     targetUser,
//     followings,
//     followers,
//     friends,
//     posts,
//     likes,
//     selected: 'timeline',
//     alarms,
//     alarmContent,
//   });
// };

// const renderProfileFriend = (
//   req,
//   res,
//   {
//     title,
//     user,
//     targetUser,
//     followings,
//     followers,
//     friends,
//     myFollowings,
//     myFollowers,
//     myFriends,
//     alarms,
//   },
// ) => {
//   res.render('pFriend', {
//     title: title || `${targetUser.name} | Facebook`,
//     user: user || req.user,
//     targetUser,
//     followings,
//     followers,
//     friends,
//     myFollowings,
//     myFollowers,
//     myFriends,
//     selected: 'friend',
//     alarms,
//     alarmContent,
//   });
// };

// const renderProfilePhoto = (
//   req,
//   res,
//   { user = req.user, targetUser, title = `${targetUser.name} | Facebook`, photos, alarms },
// ) => {
//   res.render('pPhoto', {
//     title,
//     user,
//     targetUser,
//     photos,
//     selected: 'photo',
//     alarms,
//     alarmContent,
//   });
// };

// module.exports = {
//   renderMain,
//   renderLogin,
//   renderMessenger,
//   renderProfile,
//   renderProfileFriend,
//   renderProfilePhoto,
// };

module.exports = render;

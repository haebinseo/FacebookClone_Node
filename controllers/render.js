const renderMain = (
  req,
  res,
  { title = 'Facebook', user = req.user, followings, followers, friends, posts, likes },
) => {
  res.render('main', {
    title,
    user,
    followings,
    followers,
    friends,
    posts,
    likes,
  });
};

const renderLogin = (req, res, { title } = { title: 'Facebook - 로그인 또는 가입' }) => {
  res.render('login', {
    title,
    loginError: req.flash('loginError'),
    joinError: req.flash('joinError'),
  });
};

const renderMessenger = (
  req,
  res,
  {
    title = 'Messenger | Facebook',
    user = req.user,
    rooms,
    currentRoom,
    currentRoomIdx,
    messages,
  },
) => {
  res.render('messenger', {
    title,
    user,
    rooms,
    currentRoom,
    currentRoomIdx,
    messages,
  });
};

const renderProfile = (
  req,
  res,
  {
    user = req.user,
    targetUser,
    title = `${targetUser.name} | Facebook`,
    followings,
    followers,
    friends,
    posts,
    likes,
  },
) => {
  res.render('pTimeline', {
    title,
    user,
    targetUser,
    followings,
    followers,
    friends,
    posts,
    likes,
    selected: 'timeline',
  });
};

const renderProfileFriend = (
  req,
  res,
  {
    user = req.user,
    targetUser,
    title = `${targetUser.name} | Facebook`,
    followings,
    followers,
    friends,
    myFollowings,
    myFollowers,
    myFriends,
  },
) => {
  res.render('pFriend', {
    title,
    user,
    targetUser,
    followings,
    followers,
    friends,
    myFollowings,
    myFollowers,
    myFriends,
    selected: 'friend',
  });
};

module.exports = {
  renderMain,
  renderLogin,
  renderMessenger,
  renderProfile,
  renderProfileFriend,
};

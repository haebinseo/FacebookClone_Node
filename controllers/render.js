const renderMain = (
  req,
  res,
  {
    title = 'Facebook',
    user,
    followings,
    followers,
    posts,
    comments,
    userWhoLikePosts,
    userWhoLikeComments,
  },
) => {
  res.render('main', {
    title,
    user,
    followings,
    followers,
    posts,
    comments,
    userWhoLikePosts,
    userWhoLikeComments,
  });
};

const renderLogin = (req, res, { title = 'Facebook - 로그인 또는 가입' }) => {
  res.render('login', {
    title,
    loginError: req.flash('loginError'),
    joinError: req.flash('joinError'),
  });
};

const renderMessenger = (
  req,
  res,
  { title = 'Messenger | Facebook', user, rooms, currentRoom, currentRoomIdx, messages },
) => {
  res.render('main', {
    title,
    user,
    rooms,
    currentRoom,
    currentRoomIdx,
    messages,
  });
};

module.exports = { renderMain, renderLogin, renderMessenger };

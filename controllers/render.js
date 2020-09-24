const renderMain = (
  req,
  res,
  { title = 'Facebook', user = req.user, followings, followers, posts, likes },
) => {
  res.render('main', {
    title,
    user,
    followings,
    followers,
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

module.exports = { renderMain, renderLogin, renderMessenger };

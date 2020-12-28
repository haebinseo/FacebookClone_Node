const passport = require('passport');
const { userDAO, photoDAO } = require('../models');
const messageDao = require('../models/message.dao');

/* ==============================  AUTHENTICATION  ============================== */
function login(req, res, next) {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      // console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect(303, '/');
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        // console.error(loginError);
        return next(loginError);
      }
      return res.redirect(303, '/');
    });
  })(req, res, next);
}

async function join(req, res, next) {
  try {
    const {
      email,
      family_name: familyName,
      first_name: firstName,
      password,
      gender,
      year,
      month,
      day,
    } = req.body;
    const birth = new Date(year, parseInt(month[0], 10) - 1, day); // month - String ex) 4월

    const args = { email, name: familyName + firstName, password, gender, birth };
    if (!(await userDAO.createUser(args))) {
      req.flash('joinError', '이미 가입된 이메일입니다.');
    }

    res.redirect(303, '/');
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

function logout(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
}

/* =================================  FRIEND  ================================= */
async function isFriend(req, res, next) {
  try {
    const args = { userId: req.user.id, targetUserId: parseInt(req.params.userId, 10) };
    // -1: self, 0: stranger, 1: friend, 2: following, 3: followed
    const friendOption = args.userId === args.targetUserId ? -1 : await userDAO.isFriend(args);
    res.json({ friendOption });
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function createFriend(req, res, next) {
  try {
    let args = { userId: req.user.id, targetUserId: parseInt(req.params.userId, 10) };
    const friend = await userDAO.createFriend(args);
    res.sendStatus(201);

    // create alarm
    args.type = !friend.roomId ? 'confirmFriend' : 'friendConfirmed';
    const { id: alarmId } = (await userDAO.createAlarm(args)).toJSON();
    const alarm = (await userDAO.getAlarm(alarmId)).toJSON();
    const io = req.app.get('io');
    io.of('user').to(args.targetUserId).emit(args.type, alarm);

    // console.log('roomId', friend.roomId);
    if (!friend.roomId) return; // case: add friend

    // case: confirm friend
    // create and emit a joining system message
    const content = '이제 Messenger에서 친구와 메시지를 주고받을 수 있습니다.';
    const message = await messageDao.createMessage({ roomId: friend.roomId, content });
    req.app.get('io').of('/user').to(args.userId).emit('msgPosted', message);
    req.app.get('io').of('/user').to(args.targetUserId).emit('msgPosted', message);

    // delete alarm 'confirmFriend'
    args = {
      senderId: args.targetUserId,
      receiverId: args.userId,
      type: 'confirmFriend',
    };
    await userDAO.deleteAlarmConfirmingFriend(args);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function deleteFriend(req, res, next) {
  try {
    const args = { userId: req.user.id, targetUserId: parseInt(req.params.userId, 10) };
    await userDAO.deleteFriend(args);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

/* =================================  PHOTO  ================================== */
async function getUserPhotos(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      offset: parseInt(req.query.offset, 10),
      limit: parseInt(req.query.limit, 10),
    };
    const photos = await photoDAO.getPhotosWithUser(args);
    res.json(photos);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

/* ==============================  PROFILE INFO  ============================== */
async function updateUserProfileInfo(req, res, next) {
  try {
    const { photoURL, name, gender } = req.body;
    const args = { userId: req.user.id, photoURL, name, gender };

    await userDAO.updateUserProfile(args);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

/* =================================  ALARM  ================================== */
async function updateAlarms(req, res, next) {
  try {
    const { unreadAlarmIds } = req.body;
    // console.log('unreadAlarmIds', unreadAlarmIds);
    const args = { receiverId: req.user.id, alarmIds: unreadAlarmIds };
    await userDAO.updateAlarms(args);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

async function deleteAlarms(req, res, next) {
  try {
    const { alarmIds } = req.body;
    // console.log('unreadAlarmIds', alarmIds);
    const args = { receiverId: req.user.id, alarmIds };
    await userDAO.deleteAlarms(args);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  join,
  logout,
  isFriend,
  createFriend,
  deleteFriend,
  getUserPhotos,
  updateUserProfileInfo,
  updateAlarms,
  deleteAlarms,
};

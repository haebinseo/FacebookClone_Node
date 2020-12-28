const bcrypt = require('bcrypt');
const { User, Sequelize, Friend, Room, Alarm, Photo, Message } = require('../db/models');

/* ===================================  READ  =================================== */
const getFriends = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profilePhoto'],
        as: 'Followings',
        through: {
          attributes: ['followingId', 'accepted', 'roomId'],
        },
      },
    ],
  });
  const friends = user.Followings.filter((f) => f.friend.accepted);

  const followingsObj = {};
  user.Followings.forEach((f) => {
    followingsObj[f.friend.followingId] = {
      accepted: f.friend.accepted,
      roomId: f.friend.roomId,
    };
  });

  const followers = await Friend.findAll({
    where: { followingId: userId },
    attributes: ['followerId', 'accepted', 'roomId'],
  });
  const followersObj = {};
  followers.forEach((f) => {
    followersObj[f.followerId] = { accepted: f.accepted, roomId: f.roomId };
  });

  return { followingsObj, followersObj, friends };
};

const getUser = async (targetUserId) => {
  const targetUser = await User.findOne({
    where: { id: targetUserId },
    attributes: ['id', 'email', 'name', 'gender', 'birth', 'profilePhoto'],
  });
  if (!targetUser) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  return targetUser;
};

const isFriend = async ({ userId, targetUserId }) => {
  const following = await Friend.findOne({
    where: { followerId: userId, followingId: targetUserId },
  });
  const followed = await Friend.findOne({
    where: { followerId: targetUserId, followingId: userId },
  });

  // 0: stranger, 1: friend, 2: following, 3: followed
  if (following) return followed ? 1 : 2;
  return followed ? 3 : 0;
};

const getAlarms = async (userId) => {
  const eightWeeksFromNow = new Date();
  eightWeeksFromNow.setMonth(eightWeeksFromNow.getMonth() - 2);
  return Alarm.findAll({
    where: {
      receiverId: userId,
      createdAt: {
        [Sequelize.Op.gte]: eightWeeksFromNow,
      },
    },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        as: 'Sender',
        attributes: ['id', 'name', 'profilePhoto'],
      },
    ],
  });
};

const getAlarm = async (alarmId) => {
  return Alarm.findOne({
    where: { id: alarmId },
    include: [
      {
        model: User,
        as: 'Sender',
        attributes: ['id', 'name', 'profilePhoto'],
      },
    ],
  });
};

/* ===================================  CREATE  =================================== */

const createUser = async ({ email, name, password, gender, birth }) => {
  const exUser = await User.findOne({ where: { email } });
  if (exUser) return false;

  const hash = await bcrypt.hash(password, 12);
  await User.create({
    email,
    name,
    password: hash,
    gender,
    birth,
  });
  return true;
};

const createFriend = async ({ userId, targetUserId }) => {
  // check whether it is a request to add or confirm friend
  const targetUser = await User.findOne({
    where: { id: targetUserId },
    include: [
      {
        model: User,
        as: 'Followings',
        where: { id: userId },
        required: false,
        through: {},
      },
    ],
  });
  if (!targetUser) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }
  const friendOppoDir = targetUser.Followings[0] && targetUser.Followings[0].friend;

  const [friend, created] = await Friend.findOrCreate({
    where: { followerId: userId, followingId: targetUserId },
    defaults: { accepted: !!friendOppoDir },
  }); // friendOppoDir ? confirm friend : add friend

  if (!created) {
    // a friend association already exists!
    const err = new Error('Conflict');
    err.status = 409;
    throw err;
  }
  if (!friendOppoDir) return friend; // case: add friend

  // case: confirm friend
  const room = await Room.create();
  await friendOppoDir.setRoom(room);
  await friend.setRoom(room);

  friendOppoDir.accepted = true;
  await friendOppoDir.save();

  return friend.reload();
};

const createAlarm = async ({ userId, targetUserId, type }) => {
  return Alarm.create({ type, senderId: userId, receiverId: targetUserId });
};

/* ===================================  UPDATE  =================================== */

const updateUserProfile = async ({ userId, photoURL, name, gender }) => {
  const user = await User.findOne({ where: { id: userId } });
  // const photo = !photoURL ? null : await Photo.findOne({ where: { id: photoURL } });
  // if (photoURL && (!photo || photo.userId !== userId)) {
  //   const err = new Error(photo ? 'Forbidden' : 'Not Found');
  //   err.status = photo ? 403 : 404;
  //   throw err;
  // }

  // if (photoURL) user.profilePhoto = photo.url;
  if (photoURL) user.profilePhoto = photoURL;
  if (name) user.name = name;
  if (gender) user.gender = gender;
  await user.save();
};

const updateAlarms = async ({ receiverId, alarmIds }) => {
  const alarms = await Alarm.findAll({
    where: {
      id: { [Sequelize.Op.in]: alarmIds },
      receiverId,
    },
  });
  if (alarms.length !== alarmIds.length) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  await Promise.all(
    alarms.map(async (alarm) => {
      alarm.isRead = true;
      return alarm.save();
    }),
  );
};

/* ===================================  DELETE  =================================== */

const deleteFriend = async ({ userId, targetUserId }) => {
  const targetUser = await User.findOne({
    where: { id: targetUserId },
    include: [
      {
        model: User,
        as: 'Followers',
        where: { id: userId },
        required: false,
        through: {},
      },
      {
        model: User,
        as: 'Followings',
        where: { id: userId },
        required: false,
        through: {},
      },
    ],
  });
  if (!targetUser) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  const numFriend = targetUser.Followers.length + targetUser.Followings.length;
  if (!numFriend) {
    const err = new Error('Conflict');
    err.status = 409;
    throw err;
  }

  const { friend } = targetUser.Followers[0] || targetUser.Followings[0];
  if (numFriend < 2) {
    // the friend requested removed successfully
    await friend.destroy();
    await Alarm.destroy({
      where:
        friend.followerId === userId
          ? { senderId: userId, receiverId: targetUserId, type: 'confirmFriend' }
          : { senderId: targetUserId, receiverId: userId, type: 'confirmFriend' },
    });
    return;
  }

  // delete room, friend, message records
  await Promise.all([
    Message.destroy({ where: { roomId: friend.roomId } }),
    Room.destroy({ where: { id: friend.roomId } }),
    targetUser.Followers[0].friend.destroy(),
    targetUser.Followings[0].friend.destroy(),
  ]);
};

const deleteAlarmConfirmingFriend = async ({ senderId, receiverId, type }) => {
  const alarm = await Alarm.findOne({ where: { senderId, receiverId, type } });
  if (!alarm) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  await alarm.destroy();
};

const deleteAlarms = async ({ receiverId, alarmIds }) => {
  const alarms = await Alarm.findAll({
    where: {
      id: { [Sequelize.Op.in]: alarmIds },
      receiverId,
    },
  });
  if (alarms.length !== alarmIds.length) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  await Promise.all(alarms.map(async (alarm) => alarm.destroy()));
};

module.exports = {
  getFriends,
  getUser,
  isFriend,
  getAlarms,
  getAlarm,
  createUser,
  createFriend,
  createAlarm,
  updateUserProfile,
  updateAlarms,
  deleteFriend,
  deleteAlarmConfirmingFriend,
  deleteAlarms,
};

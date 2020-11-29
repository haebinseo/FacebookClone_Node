const bcrypt = require('bcrypt');
const { User, Sequelize, Friend, Room, Alarm, Photo, Message } = require('../db/models');

/* ===================================  READ  =================================== */
const fetchFriends = async (userId) => {
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

const fetchUser = async (targetUserId) => {
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

const fetchAlarms = async (userId) => {
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
  let friendOppoDir = await Friend.findOne({
    where: { followerId: targetUserId, followingId: userId },
  });

  const [friend, created] = !friendOppoDir
    ? await Friend.findOrCreate({
        where: { followerId: userId, followingId: targetUserId },
      }) // add friend
    : await Friend.findOrCreate({
        where: { followerId: userId, followingId: targetUserId },
        defaults: { accepted: true },
      }); // confirm friend

  if (!created) {
    // a friend association already exists!
    const err = new Error('Conflict');
    err.status = 409;
    throw err;
  }
  if (!friendOppoDir) return friend;

  friendOppoDir.accepted = true;
  friendOppoDir = await friendOppoDir.save();

  const room = await Room.create({});
  await room.addFriends([friendOppoDir, friend]);

  return friend.reload();
};

const createAlarm = async ({ userId, targetUserId, type }) => {
  return Alarm.create({ type, senderId: userId, receiverId: targetUserId });
};

/* ===================================  UPDATE  =================================== */
const updateUserProfile = async ({ userId, photoId, name, gender }) => {
  const user = await User.findOne({ where: { id: userId } });
  const photo = !photoId ? null : await Photo.findOne({ where: { id: photoId } });
  if (photoId && (!photo || photo.userId !== userId)) {
    const err = new Error(photo ? 'Forbidden' : 'Not Found');
    err.status = photo ? 403 : 404;
    throw err;
  }

  if (photoId) user.profilePhoto = photo.url;
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
  if (!alarms.length) {
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
  const friend = await Friend.findOne({
    where: { followerId: targetUserId, followingId: userId },
  });
  if (!friend) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }
  if (!friend.accepted) return; // decline friend request

  // delete room, friend, message records
  await Promise.all([
    Message.destroy({ where: { roomId: friend.roomId } }),
    Room.destroy({ where: { id: friend.roomId } }),
    friend.destroy(),
    Friend.destroy({ where: { followerId: userId, followingId: targetUserId } }),
  ]);
};

const deleteAlarm = async ({ senderId, receiverId, type }) => {
  const alarm = await Alarm.findOne({ where: { senderId, receiverId, type } });
  if (!alarm) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  await alarm.destroy();
};

module.exports = {
  fetchFriends,
  fetchUser,
  fetchAlarms,
  createUser,
  createFriend,
  createAlarm,
  updateUserProfile,
  updateAlarms,
  deleteFriend,
  deleteAlarm,
};

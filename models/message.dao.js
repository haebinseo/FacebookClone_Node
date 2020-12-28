const { User, Sequelize, Friend, Room, Message } = require('../db/models');

/* ===================================  READ  =================================== */

const getRooms = async (userId) => {
  // get friends
  let rooms = [];
  const user = await User.findOne({ where: { id: userId } });
  const friends = await user.getFollowings({
    attributes: ['id', 'email', 'name', 'gender', 'birth', 'profilePhoto'],
    through: {
      where: { accepted: true },
      attributes: ['createdAt', 'roomId'],
    },
  });
  if (!friends.length) return { friends, rooms };

  // get chatting rooms with the latest message
  const roomIds = friends.map((f) => f.friend.roomId);
  rooms = await Room.findAll({
    where: { id: { [Sequelize.Op.in]: roomIds } },
    include: [
      {
        model: Message,
        order: [['createdAt', 'DESC']],
        limit: 1,
      },
    ],
  });

  return { friends, rooms };
};

const getFriendIdInRoom = async ({ userId, roomId }) => {
  const room = await Room.findOne({
    where: { id: roomId },
    include: [
      {
        model: Friend,
        where: { followerId: userId },
        required: false,
      },
    ],
  });
  if (!room) {
    // the room doesn't exist
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  } else if (!room.friends.length) {
    // user is not in the room
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  return room.friends[0].followingId;
};

const getMessages = async (roomId) => {
  return Message.findAll({
    where: { roomId },
    paranoid: false,
    order: [['createdAt', 'ASC']],
  });
};

const getUnreadMessageCount = async (userId) => {
  return Message.count({ where: { receiverId: userId, isRead: false } });
};

/* ===================================  CREATE  =================================== */

const createMessage = async ({ userId = null, friendId = null, roomId, content }) => {
  const room = await Room.findOne({
    where: { id: roomId },
    include: [
      {
        model: Friend,
      },
    ],
  });
  if (!room) {
    // room doesn't exist
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  } else if (userId && !room.friends.map((f) => f.followingId).includes(userId)) {
    // it is not a system message && the user isn't in the room.
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  return Message.create({ senderId: userId, receiverId: friendId, roomId, content });
};

/* ===================================  UPDATE  =================================== */

// const updateMessage = async ({ userId, messageId, roomId, content }) => {
//   const message = await Message.findOne({ where: { id: messageId, roomId } });
//   if (!message || message.senderId !== userId) {
//     const err = new Error(message ? 'Forbidden' : 'Not Found');
//     err.status = message ? 403 : 404;
//     throw err;
//   }

//   message.content = content;
//   return message.save();
// };

const updateMessageReadStatus = async (messagesIds) => {
  await Message.update({ isRead: true }, { where: { id: messagesIds } });
};

/* ===================================  DELETE  =================================== */

const deleteMessage = async ({ userId, roomId, messageId }) => {
  let message = await Message.findOne({ where: { id: messageId, roomId } });
  if (!message || message.senderId !== userId) {
    const err = new Error(message ? 'Forbidden' : 'Not Found');
    err.status = message ? 403 : 404;
    throw err;
  }

  message.content = '메시지 보내기를 취소했습니다';
  message = await message.save();
  await message.destroy();
  return message; // 과연 이 데이터가 유지될 것인가..?
};

module.exports = {
  getRooms,
  getFriendIdInRoom,
  getMessages,
  getUnreadMessageCount,
  createMessage,
  // updateMessage,
  updateMessageReadStatus,
  deleteMessage,
};

const { User, Sequelize, Friend, Room, Message } = require('../db/models');

/* ===================================  READ  =================================== */
const fetchRooms = async (userId) => {
  // fetch friends
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

  // fetch chatting rooms with the latest message
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

const fetchFriendIdInRoom = async ({ userId, roomId }) => {
  const room = await Room.findOne({
    where: { id: roomId },
    include: [
      {
        model: Friend,
      },
    ],
  });
  const friendInRoom = room.friends.map((f) => f.followingId).filter((uid) => uid !== userId);
  if (friendInRoom.length > 1) {
    // user is not in the room
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  return friendInRoom[0];
};

const fetchMessages = async (roomId) => {
  const messages = await Message.findAll({
    where: { roomId },
    paranoid: false,
    order: [['createdAt', 'ASC']],
  });

  const msgsUnread = messages.filter((msg) => !msg.isRead);
  await Promise.all(
    msgsUnread.map((msg) => {
      msg.isRead = true;
      return msg.save();
    }),
  );

  return messages;
};

/* ===================================  CREATE  =================================== */
const createMessage = async ({ userId = null, roomId, content }) => {
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

  return Message.create({ userId, roomId, content });
};

/* ===================================  UPDATE  =================================== */
const updateMessage = async ({ userId, msgId, content }) => {
  const message = await Message.findOne({ where: { id: msgId } });
  if (!message || message.userId !== userId) {
    const err = new Error(message ? 'Forbidden' : 'Not Found');
    err.status = message ? 403 : 404;
    throw err;
  }

  message.content = content;
  return message.save();
};

/* ===================================  DELETE  =================================== */
const deleteMessage = async ({ userId, msgId }) => {
  let message = await Message.findOne({ where: { id: msgId } });
  if (!message || message.userId !== userId) {
    const err = new Error(message ? 'Forbidden' : 'Not Found');
    err.status = message ? 403 : 404;
    throw err;
  }

  message.content = '메시지 보내기를 취소했습니다';
  message = await message.save();
  await message.destroy();
  return message;
};

module.exports = {
  fetchRooms,
  fetchFriendIdInRoom,
  fetchMessages,
  createMessage,
  updateMessage,
  deleteMessage,
};

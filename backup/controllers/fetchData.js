const {
  Post,
  User,
  Sequelize,
  Friend,
  Comment,
  Room,
  Message,
  Hashtag,
  Photo,
  Alarm,
} = require('../db/models');

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

const fetchPosts = async (ids = []) => {
  const findOption = {
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profilePhoto'],
      },
      {
        model: Photo,
        attributes: ['id', 'url'],
      },
      {
        model: User,
        attributes: ['id', 'name'],
        as: 'UsersWhoLikePost',
      },
      {
        model: Comment,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'profilePhoto'],
          },
          {
            model: User,
            attributes: ['id', 'name'],
            as: 'UsersWhoLikeComment',
          },
        ],
        order: [[Sequelize.literal('bundleCreatedAt, createdAt'), 'ASC']],
      },
    ],
    order: [['createdAt', 'DESC']],
  };
  if (ids.length) findOption.where = { id: { [Sequelize.Op.in]: ids } };

  const posts = await Post.findAll(findOption);
  const likes = { posts: {}, comments: {} };

  posts.forEach((post) => {
    // UsersWhoLikePost
    likes.posts[post.id] = { id: [], name: [] };
    post.UsersWhoLikePost.forEach((user) => {
      likes.posts[post.id].id.push(user.id);
      likes.posts[post.id].name.push(user.name);
    });

    // UsersWhoLikeComment
    // console.log('post', post);
    post.comments.forEach((comment) => {
      likes.comments[comment.id] = { id: [], name: [] };
      comment.UsersWhoLikeComment.forEach((user) => {
        likes.comments[comment.id].id.push(user.id);
        likes.comments[comment.id].name.push(user.name);
      });
    });
  });

  return { posts, likes };
};

const fetchPostsWithTag = async (tag) => {
  const hashtag = await Hashtag.findOne({
    where: { title: tag },
    include: [
      {
        model: Post,
        attributes: ['id'],
      },
    ],
  });
  const posts = [];
  const likes = { posts: {}, comments: {} };
  if (!hashtag) return { posts, likes };

  const postIds = hashtag.posts.map((p) => p.id);
  return fetchPosts(postIds);
};

const fetchPostsWithUser = async (targetUserId) => {
  const user = await User.findOne({
    where: { id: targetUserId },
    include: [
      {
        model: Post,
        attributes: ['id'],
      },
    ],
  });
  const posts = [];
  const likes = { posts: {}, comments: {} };
  if (!user.posts.length) return { posts, likes };

  const postIds = user.posts.map((p) => p.id);
  return fetchPosts(postIds);
};

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

const fetchUserProfile = async (targetUserId) => {
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

const fetchPhotosWithUser = async (targetUserId) => {
  return Photo.findAll({
    where: { userId: targetUserId },
    order: [['createdAt', 'DESC']],
  });
};

const fetchUserIDFromPostID = async (postId) => {
  const post = await Post.findOne({ where: { id: postId } });
  return post.userId;
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

module.exports = {
  fetchFriends,
  fetchPosts,
  fetchPostsWithTag,
  fetchPostsWithUser,
  fetchRooms,
  fetchMessages,
  fetchFriendIdInRoom,
  fetchUserProfile,
  fetchPhotosWithUser,
  fetchUserIDFromPostID,
  fetchAlarms,
};

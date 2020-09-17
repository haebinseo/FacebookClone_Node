const { Post, User, Sequelize, Friend, Comment, Room, Message } = require('../models');

const fetchFriends = async (userId) => {
  const followingsObj = {};
  const followingsArr = await Friend.findAll({
    where: { followerId: userId },
    attributes: ['followingId', 'accepted', 'roomId'],
  });
  followingsArr.forEach((following) => {
    followingsObj[following.followingId] = [following.accepted, following.roomId];
  });

  const followersObj = {};
  const followersArr = await Friend.findAll({
    where: { followingId: userId },
    attributes: ['followerId', 'accepted', 'roomId'],
  });
  followersArr.forEach((follower) => {
    followersObj[follower.followerId] = [follower.accepted, follower.roomId];
  });

  return { followingsObj, followersObj };
};

const fetchPosts = async () => {
  const posts = await Post.findAll({
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profileImg'],
      },
      {
        model: User,
        attributes: ['id', 'name'],
        as: 'UserWhoLikePosts',
      },
      {
        model: Comment,
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'profileImg'],
          },
          {
            model: User,
            attributes: ['id', 'name'],
            as: 'UserWhoLikeComments',
          },
        ],
        order: [[Sequelize.literal('bundleCreatedAt, createdAt'), 'ASC']],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  const likes = { posts: {}, comments: {} };

  posts.forEach((post) => {
    // UserWhoLikePosts
    likes.posts[post.id] = { id: [], name: [] };
    post.UserWhoLikePosts.forEach((user) => {
      likes.posts[post.id].id.push(user.id);
      likes.posts[post.id].name.push(user.name);
    });

    // UserWhoLikeComments
    post.comments.forEach((comment) => {
      likes.comments[comment.id] = { id: [], name: [] };
      comment.UserWhoLikePosts.forEach((user) => {
        likes.comments[comment.id].id.push(user.id);
        likes.comments[comment.id].name.push(user.name);
      });
    });
  });

  return { posts, likes };
};

const fetchRooms = async (userId) => {
  // fetch friends
  const friends = await Friend.findAll({ where: { followerId: userId, accepted: true } });
  const roomIds = friends.map((f) => f.roomId);

  // fetch chatting rooms with the latest message
  const rooms = await Room.findAll({
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

module.exports = { fetchFriends, fetchPosts, fetchRooms, fetchMessages };

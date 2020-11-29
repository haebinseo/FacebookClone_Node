const bcrypt = require('bcrypt');
const {
  User,
  Post,
  Hashtag,
  Friend,
  Room,
  Message,
  Comment,
  Photo,
  Alarm,
} = require('../db/models');

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

const createHashtags = (hashtags) => {
  return Promise.all(
    hashtags.map((tag) =>
      Hashtag.findOrCreate({
        where: { title: tag.slice(1).toLowerCase() },
      }),
    ),
  );
};

const createPost = async ({ content, photoIds = [], userId }) => {
  const newPost = await Post.create({ content, userId });
  // associate post with photos
  if (photoIds.length) await newPost.addPhotos(photoIds);
  // associate post with hashtags
  const hashtags = content.match(/#[^\s#]*/g);
  if (hashtags) {
    const result = await createHashtags(hashtags);
    await newPost.addHashtags(result.map((r) => r[0]));
  }
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

const createLike = async ({ userId, target, targetId }) => {
  const targetObj =
    target === 'post'
      ? await Post.findOne({ where: { id: targetId } })
      : await Comment.findOne({ where: { id: targetId } });
  if (!targetObj) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  if (target === 'post') await targetObj.addUserWhoLikePost(userId);
  else await targetObj.addUserWhoLikeComment(userId);
};

const createComment = async ({ content, depth, userId, postId, bundleCreatedAt }) => {
  const post = await Post.findOne({ where: { id: postId } });
  if (!post) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  return Comment.create(
    bundleCreatedAt
      ? { content, depth, userId, postId, bundleCreatedAt }
      : { content, depth, userId, postId },
  );
};

const createPhotos = async (photos) => {
  return Photo.bulkCreate(photos);
};

const createAlarm = async ({ userId, targetUserId, type }) => {
  return Alarm.create({ type, senderId: userId, receiverId: targetUserId });
};

module.exports = {
  createUser,
  createPost,
  createFriend,
  createMessage,
  createLike,
  createComment,
  createPhotos,
  createAlarm,
};

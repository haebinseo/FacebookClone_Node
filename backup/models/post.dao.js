const { Post, User, Sequelize, Comment, Hashtag, Photo } = require('../db/models');

/* ===================================  READ  =================================== */
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

const fetchAuthor = async (postId) => {
  const post = await Post.findOne({
    where: { id: postId },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profilePhoto'],
      },
    ],
  });
  return post.userId;
};

/* ===================================  CREATE  =================================== */
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

/* ===================================  UPDATE  =================================== */
const updateComment = async ({ userId, commentId, content }) => {
  const comment = await Comment.findOne({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    const err = new Error(comment ? 'Forbidden' : 'Not Found');
    err.status = comment ? 403 : 404;
    throw err;
  }

  comment.content = content;
  return comment.save();
};

/* ===================================  DELETE  =================================== */
const deleteLike = async ({ userId, target, targetId }) => {
  const isPostLike = target === 'post';
  const user = await User.findOne({
    where: { id: userId },
    include: [
      isPostLike
        ? { model: Post, attributes: ['id'], as: 'PostsLiked' }
        : { model: Comment, attributes: ['id'], as: 'CommentsLiked' },
    ],
  });
  const likeTargetIds = isPostLike
    ? user.PostsLiked.map((p) => p.id)
    : user.CommentsLiked.map((c) => c.id);
  if (!likeTargetIds.includes(targetId)) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  if (isPostLike) await user.removePostLiked(targetId);
  else await user.removeCommentLiked(targetId);
};

const deleteComment = async ({ userId, commentId }) => {
  const comment = await Comment.findOne({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    const err = new Error(comment ? 'Forbidden' : 'Not Found');
    err.status = comment ? 403 : 404;
    throw err;
  }

  await comment.destroy();
};

module.exports = {
  fetchPosts,
  fetchPostsWithTag,
  fetchPostsWithUser,
  fetchAuthor,
  createPost,
  createComment,
  createLike,
  updateComment,
  deleteComment,
  deleteLike,
};

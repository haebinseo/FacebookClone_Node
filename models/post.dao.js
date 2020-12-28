const photoDAO = require('./photo.dao');
const { Post, User, Sequelize, Comment, Hashtag, Photo } = require('../db/models');

/* ===================================  READ  =================================== */
const getPosts = async (ids = []) => {
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
        // order: [[Sequelize.literal('bundleCreatedAt, createdAt'), 'ASC']],
      },
    ],
    order: [
      ['createdAt', 'DESC'],
      [Comment, 'bundleCreatedAt', 'ASC'],
      [Comment, 'createdAt', 'ASC'],
      [Photo, 'createdAt', 'ASC'],
    ],
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

const getPostsWithTag = async (tag) => {
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
  return getPosts(postIds);
};

const getPostsWithUser = async (targetUserId) => {
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
  return getPosts(postIds);
};

const getAuthorId = async ({ target, targetId }) => {
  const targetObj = target === 'post' ? Post : Comment;
  const result = await targetObj.findOne({
    where: { id: targetId },
    // include: [
    //   {
    //     model: User,
    //     attributes: ['id', 'name', 'profilePhoto'],
    //   },
    // ],
  });
  return result.userId;
};

const getHashtagCandidates = async (hashtag) => {
  const hashtags = await Hashtag.findAll({
    where: { title: { [Sequelize.Op.like]: `%${hashtag}%` } },
    order: [['title', 'ASC']],
  });
  return hashtags.map((h) => h.title);
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

const createComment = async ({ content, userId, postId, replyingId }) => {
  const post = await Post.findOne({ where: { id: postId } });
  const commentReplied = replyingId ? await Comment.findOne({ where: { id: replyingId } }) : null;
  if (!post || (replyingId && !commentReplied)) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  return Comment.create(
    replyingId
      ? {
          content,
          depth: 1,
          userId,
          postId,
          replyingId,
          bundleCreatedAt: commentReplied.bundleCreatedAt,
        }
      : { content, userId, postId },
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
const updatePost = async ({ content, photoIds, userId, postId }) => {
  const post = await Post.findOne({ where: { id: postId } });
  if (!post || post.userId !== userId) {
    const err = new Error(post ? 'Forbidden' : 'Not Found');
    err.status = post ? 403 : 404;
    throw err;
  }

  post.content = content;
  const hashtags = content.match(/#[^\s#]*/g);
  if (hashtags) {
    const result = await createHashtags(hashtags);
    await post.addHashtags(result.map((r) => r[0]));
  }
  await post.setPhotos(photoIds);
  await post.save();
};

const updateComment = async ({ userId, commentId, content }) => {
  const comment = await Comment.findOne({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    const err = new Error(comment ? 'Forbidden' : 'Not Found');
    err.status = comment ? 403 : 404;
    throw err;
  }

  comment.content = content;
  await comment.save();
};

/* ===================================  DELETE  =================================== */
const deletePost = async ({ userId, postId }) => {
  const post = await Post.findOne({
    where: { id: postId },
    include: [
      {
        model: Photo,
      },
    ],
  });
  if (!post || post.userId !== userId) {
    const err = new Error(post ? 'Forbidden' : 'Not Found');
    err.status = post ? 403 : 404;
    throw err;
  }

  if (post.photos.length) {
    const photoIds = post.photos.map((photo) => photo.id);
    await photoDAO.deletePhotos({ userId, photoIds }); // 게시글에 포함된 사진 삭제
  }
  await post.destroy();
};

const deleteLike = async ({ userId, target, targetId }) => {
  const isPostLike = target === 'post';
  const user = await User.findOne({
    where: { id: userId },
    include: [
      {
        model: isPostLike ? Post : Comment,
        as: isPostLike ? 'PostsLiked' : 'CommentsLiked',
        where: { id: targetId },
        required: true,
      },
    ],
  });
  if (!user) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

  if (isPostLike) await user.removePostLiked(targetId);
  else await user.removeCommentLiked(targetId);
};

const deleteComment = async ({ userId, commentId }) => {
  const comment = await Comment.findOne({
    where: { id: commentId },
    include: [
      {
        model: Comment,
        as: 'Repliers',
      },
    ],
  });
  if (!comment || comment.userId !== userId) {
    const err = new Error(comment ? 'Forbidden' : 'Not Found');
    err.status = comment ? 403 : 404;
    throw err;
  }

  if (comment.Repliers.length) {
    const err = new Error('Conflict');
    err.status = 409;
    throw err;
  }

  await comment.destroy();
};

module.exports = {
  getPosts,
  getPostsWithTag,
  getPostsWithUser,
  getAuthorId,
  getHashtagCandidates,
  createPost,
  createComment,
  createLike,
  updatePost,
  updateComment,
  deletePost,
  deleteComment,
  deleteLike,
};

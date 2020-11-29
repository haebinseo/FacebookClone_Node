const { postDAO, userDAO } = require('../models');

async function createPost(req, res, next) {
  try {
    const args = {
      content: req.body.content,
      photoIds: req.body.photoIds ? req.body.photoIds.split(',') : undefined,
      userId: req.user.id,
    };
    await postDAO.createPost(args);
    res.sendStatus(201);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function updatePost(req, res, next) {
  try {
    const args = {
      content: req.body.content,
      photoIds: req.body.photoIds ? req.body.photoIds.split(',') : undefined,
      userId: req.user.id,
      postId: req.params.postId,
    };
    await postDAO.updatePost(args);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      postId: req.params.postId,
    };
    await postDAO.deletePost(args);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function createComment(req, res, next) {
  try {
    let args = {
      content: req.body.content,
      userId: req.user.id,
      postId: req.params.postId,
      replyingId: req.params.commentId,
    };
    await postDAO.createComment(args);
    res.sendStatus(201);

    // create alarm
    const targetUserId = await postDAO.fetchAuthorId(args.postId);
    if (args.userId === targetUserId || args.depth > 0) return; // 대댓글 시 처리 작성 필요

    args = {
      userId: req.user.id,
      targetUserId,
      type: 'comment',
    };
    const alarm = await userDAO.createAlarm(args);
    const io = req.app.get('io');
    io.of('user').to(args.targetUserId).emit('commentPosted', alarm);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function updateComment(req, res, next) {
  try {
    const args = {
      content: req.body.content,
      userId: req.user.id,
      commentId: req.params.commentId,
    };
    await postDAO.updateComment(args);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function deleteComment(req, res, next) {
  try {
    const args = {
      userId: req.user.id,
      commentId: req.params.commentId,
    };
    await postDAO.deleteComment(args);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function createLike(req, res, next) {
  try {
    let args = {
      userId: req.user.id,
      target: req.params.commentId ? 'comment' : 'post',
      targetId: parseInt(req.params.commentId || req.params.postId, 10),
    };
    await postDAO.createLike(args);
    res.sendStatus(201);

    // create alarm
    const targetUserId = await postDAO.fetchAuthorId(args);
    if (args.userId === targetUserId) return; // user's post or comment

    args = {
      userId: req.user.id,
      targetUserId,
      type: 'like',
    };
    const alarm = await userDAO.createAlarm(args);
    req.app.get('io').of('user').to(args.targetUserId).emit('likePosted', alarm);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function deleteLike(req, res, next) {
  try {
    const argument = {
      userId: req.user.id,
      target: req.params.commentId ? 'comment' : 'post',
      targetId: parseInt(req.params.commentId || req.params.postId, 10),
    };
    await postDAO.deleteLike(argument);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

module.exports = {
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
  createLike,
  deleteLike,
};

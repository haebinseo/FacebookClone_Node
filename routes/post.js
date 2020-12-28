const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const {
  getPost,
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
  createLike,
  deleteLike,
} = require('../controllers/post.ctrl');

router.get('/:postId', isLoggedIn, getPost);
router.post('/', isLoggedIn, createPost);
router.patch('/:postId', isLoggedIn, updatePost);
router.delete('/:postId', isLoggedIn, deletePost);

router.post('/:postId/comment', isLoggedIn, createComment);
router.post('/:postId/comment/:commentId', isLoggedIn, createComment);
router.patch('/:postId/comment/:commentId', isLoggedIn, updateComment);
router.delete('/:postId/comment/:commentId', isLoggedIn, deleteComment);

router.post('/:postId/like', isLoggedIn, createLike);
router.post('/:postId/comment/:commentId/like', isLoggedIn, createLike);
router.delete('/:postId/like', isLoggedIn, deleteLike);
router.delete('/:postId/comment/:commentId/like', isLoggedIn, deleteLike);

module.exports = router;

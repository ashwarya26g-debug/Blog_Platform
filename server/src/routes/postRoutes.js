const express = require('express');
const {
  listPosts,
  getPost,
  myPosts,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { addComment } = require('../controllers/commentController');
const { toggleLike } = require('../controllers/likeController');
const { requireAuth, attachUserIfPresent } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/posts', listPosts);
router.get('/posts/:slug', attachUserIfPresent, getPost);

// Authenticated
router.get('/me/posts', requireAuth, myPosts);
router.post('/posts', requireAuth, createPost);
router.put('/posts/:id', requireAuth, updatePost);
router.delete('/posts/:id', requireAuth, deletePost);

router.post('/posts/:postId/comments', requireAuth, addComment);
router.post('/posts/:postId/likes', requireAuth, toggleLike);

module.exports = router;

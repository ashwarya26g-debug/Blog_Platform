const { Post, Like } = require('../models');

// POST /api/posts/:postId/likes  (auth required) — toggles the like
async function toggleLike(req, res) {
  const post = await Post.findByPk(req.params.postId);
  if (!post || !post.published) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const existing = await Like.findOne({
    where: { postId: post.id, userId: req.user.id },
  });

  if (existing) {
    await existing.destroy();
  } else {
    await Like.create({ postId: post.id, userId: req.user.id });
  }

  const likeCount = await Like.count({ where: { postId: post.id } });
  return res.json({ data: { liked: !existing, likeCount } });
}

module.exports = { toggleLike };

const { Post, Comment, User } = require('../models');

// POST /api/posts/:postId/comments  (auth required)
async function addComment(req, res) {
  const { body } = req.body;
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Comment body is required.' });
  }

  const post = await Post.findByPk(req.params.postId);
  if (!post || !post.published) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const comment = await Comment.create({
    body: body.trim(),
    postId: post.id,
    authorId: req.user.id,
  });

  const withAuthor = await Comment.findByPk(comment.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
  });

  return res.status(201).json({ data: withAuthor });
}

// DELETE /api/comments/:id  (auth required — must be the comment author)
async function deleteComment(req, res) {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found.' });
  if (comment.authorId !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own comments.' });
  }
  await comment.destroy();
  return res.status(204).send();
}

module.exports = { addComment, deleteComment };

const { Op } = require('sequelize');
const { Post, User, Comment, Like, sequelize } = require('../models');

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function uniqueSlug(title) {
  const base = slugify(title) || 'post';
  let slug = base;
  let counter = 1;
  // Loop until we find a slug that isn't taken yet.
  while (await Post.findOne({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

// GET /api/posts  (public — only published posts, paginated)
async function listPosts(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();

  const where = { published: true };
  if (search) {
    where.title = { [Op.iLike]: `%${search}%` };
  }

  const { rows, count } = await Post.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
    attributes: {
      include: [
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM likes WHERE likes."postId" = "Post".id)'
          ),
          'likeCount',
        ],
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM comments WHERE comments."postId" = "Post".id)'
          ),
          'commentCount',
        ],
      ],
    },
  });

  return res.json({
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

// GET /api/posts/:slug  (public)
async function getPost(req, res) {
  const post = await Post.findOne({
    where: { slug: req.params.slug },
    include: [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      {
        model: Comment,
        as: 'comments',
        include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
        order: [['createdAt', 'ASC']],
      },
    ],
  });

  if (!post || (!post.published && post.authorId !== req.user?.id)) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const likeCount = await Like.count({ where: { postId: post.id } });
  const likedByMe = req.user
    ? Boolean(await Like.findOne({ where: { postId: post.id, userId: req.user.id } }))
    : false;

  return res.json({ data: { ...post.toJSON(), likeCount, likedByMe } });
}

// GET /api/me/posts  (auth required — includes drafts)
async function myPosts(req, res) {
  const posts = await Post.findAll({
    where: { authorId: req.user.id },
    order: [['createdAt', 'DESC']],
  });
  return res.json({ data: posts });
}

// POST /api/posts  (auth required)
async function createPost(req, res) {
  const { title, content, excerpt, published = true } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required.' });
  }

  const slug = await uniqueSlug(title);
  const post = await Post.create({
    title,
    content,
    excerpt: excerpt || content.slice(0, 200),
    slug,
    published,
    authorId: req.user.id,
  });

  return res.status(201).json({ data: post });
}

// PUT /api/posts/:id  (auth required — must be the author)
async function updatePost(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.authorId !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own posts.' });
  }

  const { title, content, excerpt, published } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (published !== undefined) post.published = published;
  await post.save();

  return res.json({ data: post });
}

// DELETE /api/posts/:id  (auth required — must be the author)
async function deletePost(req, res) {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (post.authorId !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own posts.' });
  }
  await post.destroy();
  return res.status(204).send();
}

module.exports = { listPosts, getPost, myPosts, createPost, updatePost, deletePost };

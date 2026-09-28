const sequelize = require('../config/db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');

// User <-> Post (author)
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Post <-> Comment
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// User <-> Comment (author)
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Post <-> Like, User <-> Like (many-to-many via Like as join table with unique constraint)
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Uniqueness of one like per user per post is enforced by the composite
// index defined on the Like model (see Like.js), not here.

module.exports = { sequelize, User, Post, Comment, Like };

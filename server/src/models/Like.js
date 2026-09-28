const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Like extends Model {}

Like.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['postId', 'userId'],
        name: 'unique_like_per_user_per_post',
      },
    ],
  }
);

module.exports = Like;

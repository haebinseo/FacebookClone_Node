const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Friend = require('./friend')(sequelize, Sequelize);
db.Photo = require('./photo')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Room = require('./room')(sequelize, Sequelize);
db.Message = require('./message')(sequelize, Sequelize);
db.Alarm = require('./alarm')(sequelize, Sequelize);

// User - Post
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);
// User - Photo
db.User.hasMany(db.Photo);
db.Photo.belongsTo(db.User);
// Post - Photo
db.Post.hasMany(db.Photo);
db.Photo.belongsTo(db.Post);
// Post - Hashtag
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
// Friend (User - User)
db.User.belongsToMany(db.User, {
  as: 'Followers',
  through: db.Friend,
  foreignKey: 'followingId',
});
db.User.belongsToMany(db.User, {
  as: 'Followings',
  through: db.Friend,
  foreignKey: 'followerId',
});
// Like (User - Post)
db.User.belongsToMany(db.Post, {
  as: { singular: 'PostLiked', plural: 'PostsLiked' },
  through: 'LikePost',
});
db.Post.belongsToMany(db.User, {
  as: { singular: 'UserWhoLikePost', plural: 'UsersWhoLikePost' },
  through: 'LikePost',
});
// Like (User - Comment)
db.User.belongsToMany(db.Comment, {
  as: { singular: 'CommentLiked', plural: 'CommentsLiked' },
  through: 'LikeComment',
});
db.Comment.belongsToMany(db.User, {
  as: { singular: 'UserWhoLikeComment', plural: 'UsersWhoLikeComment' },
  through: 'LikeComment',
});
// comments
db.User.hasMany(db.Comment);
db.Post.hasMany(db.Comment);
db.Comment.belongsTo(db.User);
db.Comment.belongsTo(db.Post);
// Room - friend
db.Room.hasMany(db.Friend);
db.Friend.belongsTo(db.Room);
// Messages - User
db.User.hasMany(db.Message);
db.Message.belongsTo(db.User);
// Messages - Room
db.Room.hasMany(db.Message);
db.Message.belongsTo(db.Room);
// Messages - Photo
db.Message.hasMany(db.Photo);
db.Photo.belongsTo(db.Message);
// Alarm - User
db.User.hasOne(db.Alarm, { as: 'Senders', foreignKey: 'senderId' });
db.User.hasOne(db.Alarm, { as: 'Receivers', foreignKey: 'receiverId' });
db.Alarm.belongsTo(db.User, { as: 'Sender', foreignKey: 'senderId' });
db.Alarm.belongsTo(db.User, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = db;

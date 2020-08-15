const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Friend = require('./friend')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Room = require('./room')(sequelize, Sequelize);
db.Message = require('./message')(sequelize, Sequelize);

// User - Post
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);
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
db.User.belongsToMany(db.Post, { through: 'Like' });
db.Post.belongsToMany(db.User, { through: 'Like' });
// comments
db.User.hasMany(db.Comment);
db.Post.hasMany(db.Comment);
db.Comment.belongsTo(db.User);
db.Comment.belongsTo(db.Post);
// room - freiend
db.Room.hasMany(db.Friend);
db.Friend.belongsTo(db.Room);
// messages
db.Room.hasMany(db.Message);
db.User.hasMany(db.Message);
db.Message.belongsTo(db.Room);
db.Message.belongsTo(db.User);

module.exports = db;

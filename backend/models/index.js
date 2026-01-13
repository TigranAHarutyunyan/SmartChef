const { sequelize } = require('../config/database');
const User = require('./User');
const Chat = require('./Chat');
const Message = require('./Message');
const Event = require('./Event');
const Favorite = require('./Favorite');

User.hasMany(Chat, {
  foreignKey: 'userId',
  as: 'chats',
  onDelete: 'CASCADE'
});

Chat.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Chat.hasMany(Message, {
  foreignKey: 'chatId',
  as: 'messages',
  onDelete: 'CASCADE'
});

Message.belongsTo(Chat, {
  foreignKey: 'chatId',
  as: 'chat'
});

Message.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Message, {
  foreignKey: 'userId',
  as: 'messages',
  onDelete: 'CASCADE'
});

User.hasMany(Event, {
  foreignKey: 'userId',
  as: 'events',
  onDelete: 'CASCADE'
});

Chat.hasOne(Event, {
  foreignKey: 'chatId',
  as: 'event',
  onDelete: 'CASCADE'
});

Event.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Event.belongsTo(Chat, {
  foreignKey: 'chatId',
  as: 'chat'
});

User.hasMany(Favorite, {
  foreignKey: 'userId',
  as: 'favorites',
  onDelete: 'CASCADE'
});

Favorite.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Chat,
  Message,
  Event,
  Favorite
};
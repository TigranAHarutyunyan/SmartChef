const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'chat_id',
    references: {
      model: 'chats',
      key: 'id'
    }
  },
  occasion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dietaryRestrictions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'dietary_restrictions'
  },
  budget: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['chat_id'] }
  ]
});

module.exports = Event;
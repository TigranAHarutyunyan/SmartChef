const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('user', 'bot'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recipes: {
    type: DataTypes.JSONB,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('recipes');
      if (!rawValue) return [];
      if (Array.isArray(rawValue)) return rawValue;
      try {
        return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
      } catch (error) {
        console.error('Error parsing recipes JSON:', error);
        return [];
      }
    }
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      fields: ['chat_id']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    afterCreate: async (message) => {
      const Chat = require('./Chat');
      await Chat.update(
        { updatedAt: new Date() },
        { where: { id: message.chatId } }
      );
    }
  }
});

module.exports = Message;
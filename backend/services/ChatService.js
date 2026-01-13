const { Chat, Message, User } = require('../models');
const { sequelize } = require('../config/database');

class ChatService {
  static async create(userId, title) {
    return await Chat.create({ userId, title });
  }

  static async findByUserId(userId) {
    const chats = await Chat.findAll({
      where: { userId },
      include: [
        {
          model: Message,
          as: 'messages',
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'title',
        ['created_at', 'createdAt'],
        ['updated_at', 'updatedAt'],
        [sequelize.fn('COUNT', sequelize.col('messages.id')), 'messageCount'],
        [sequelize.fn('MAX', sequelize.col('messages.created_at')), 'lastMessageTime']
      ],
      group: ['Chat.id', 'Chat.title', 'Chat.created_at', 'Chat.updated_at'],
      order: [['updated_at', 'DESC']]
    });
    return chats;
  }

  static async findById(id) {
    const chat = await Chat.findByPk(parseInt(id, 10), {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      attributes: [
        'id',
        'title',
        ['created_at', 'createdAt'],
        ['updated_at', 'updatedAt'],
        'userId'
      ]
    });
    return chat;
  }

  static async updateTitle(chatId, title) {
    const [updatedRowsCount, [updatedChat]] = await Chat.update(
      { title },
      { 
        where: { id: chatId },
        returning: true
      }
    );
    return updatedChat;
  }

  static async updateTimestamp(chatId) {
    await Chat.update(
      { updatedAt: new Date() },
      { where: { id: chatId } }
    );
  }

  static async delete(chatId) {
    await Chat.destroy({ where: { id: chatId } });
  }

  static async findWithMessages(chatId) {
    return await Chat.findByPk(chatId, {
      include: [
        {
          model: Message,
          as: 'messages',
          order: [['created_at', 'ASC']]
        }
      ]
    });
  }
}

module.exports = ChatService;
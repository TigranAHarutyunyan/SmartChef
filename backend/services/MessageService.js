const { Message, Chat, User } = require('../models');
const { Op } = require('sequelize');

class MessageService {
  static async create(messageData) {
    return await Message.create(messageData);
  }

  static async findByChatId(chatId) {
    return await Message.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['created_at', 'ASC']]
    });
  }

  static async getLatestUserMessage(chatId) {
    return await Message.findOne({
      where: { 
        chatId,
        type: 'user'
      },
      order: [['created_at', 'DESC']]
    });
  }

  static async deleteMessagesByChatId(chatId) {
    await Message.destroy({ where: { chatId } });
  }

  static async findWithPagination(chatId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    return await Message.findAndCountAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
  }

  static async getMessageStats(chatId) {
    const { sequelize } = require('../config/database');
    const stats = await Message.findAll({
      where: { chatId },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });
    
    return stats.reduce((acc, stat) => {
      acc[stat.type] = parseInt(stat.get('count'));
      return acc;
    }, {});
  }
}

module.exports = MessageService;
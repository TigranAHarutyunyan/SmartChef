const User = require('../models/User');

class UserService {
  static async create(userData) {
    const user = await User.create(userData);
    return user;
  }

  static async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  static async findByGoogleId(googleId) {
    return await User.findOne({ where: { googleId } });
  }

  static async findById(id) {
    return await User.findByPk(id);
  }

  static async findAll() {
    return await User.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  static async updateGoogleId(userId, googleId) {
    await User.update(
      { googleId },
      { where: { id: userId } }
    );
  }

  static async updateProfile(userId, updateData) {
    const [updatedRowsCount] = await User.update(updateData, {
      where: { id: userId }
    });
    
    if (updatedRowsCount === 0) {
      throw new Error('User not found or no changes made');
    }

    return await this.findById(userId);
  }

  static async isEmailTaken(email, excludeUserId = null) {
    const whereCondition = { email };
    
    if (excludeUserId) {
      whereCondition.id = { [require('sequelize').Op.ne]: excludeUserId };
    }

    const user = await User.findOne({ where: whereCondition });
    return !!user;
  }
}

module.exports = UserService;
const Favorite = require('../models/Favorite');

const create = async (userId, recipe) => {
  return await Favorite.create({ userId, recipe });
};

const findByUserId = async (userId) => {
  return await Favorite.findAll({ where: { userId } });
};

const deleteById = async (id, userId) => {
  return await Favorite.destroy({ where: { id, userId } });
};

module.exports = {
  create,
  findByUserId,
  deleteById
};
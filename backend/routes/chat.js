const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const { messageValidation } = require('../validators/chatValidator');

const router = express.Router();

router.post('/message', authMiddleware, messageValidation, chatController.processMessage);
router.get('/history', authMiddleware, chatController.getConversationHistory);
router.get('/:chatId/messages', authMiddleware, chatController.getChatMessages);
router.delete('/:chatId', authMiddleware, chatController.deleteChat);

router.post('/favorite', authMiddleware, chatController.addFavorite);
router.get('/favorites', authMiddleware, chatController.getFavorites);
router.delete('/favorite/:id', authMiddleware, chatController.removeFavorite);

module.exports = router;
const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');
const { messageValidation } = require('../validators/chatValidator');

const router = express.Router();

const asyncHandler =
    (fn) =>
    (req, res, next) =>
        Promise.resolve(fn(req, res, next)).catch(next);

router.post(
    '/message',
    authMiddleware,
    messageValidation,
    asyncHandler(chatController.processMessage)
);
router.get('/history', authMiddleware, asyncHandler(chatController.getConversationHistory));
router.get('/:chatId/messages', authMiddleware, asyncHandler(chatController.getChatMessages));
router.delete('/:chatId', authMiddleware, asyncHandler(chatController.deleteChat));

router.post('/favorite', authMiddleware, asyncHandler(chatController.addFavorite));
router.get('/favorites', authMiddleware, asyncHandler(chatController.getFavorites));
router.delete('/favorite/:id', authMiddleware, asyncHandler(chatController.removeFavorite));

module.exports = router;

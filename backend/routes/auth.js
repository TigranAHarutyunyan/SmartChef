const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { registerValidation, loginValidation, updateProfileValidation } = require('../validators/authValidator');

const HOST = process.env.HOST;

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.get('/users', authController.getUsers);
router.post('/verify', authMiddleware, authController.verify);

router.put('/profile', authMiddleware, updateProfileValidation, authController.updateProfile);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${HOST}/welcome` }),
  authController.handleGoogleCallback
);

module.exports = router;
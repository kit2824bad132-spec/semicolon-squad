const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;

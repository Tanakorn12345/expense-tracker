const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/upgrade', authMiddleware, authController.upgrade);
router.put('/profile-pic', authMiddleware, authController.updateProfilePic);
router.put('/notification-settings', authMiddleware, authController.updateNotificationSettings);

module.exports = router;

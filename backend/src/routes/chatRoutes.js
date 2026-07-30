const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get admin info (for user to know who they are chatting with)
router.get('/admin-info', chatController.getAdminInfo);

// Get chat history with a specific user
router.get('/:otherUserId', chatController.getChatHistory);

// Get all users who have chats (Admin only)
router.get('/admin/users', adminMiddleware, chatController.getUsersWithChats);

// Mark messages as read
router.post('/read', chatController.markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.post('/:id/read', notificationController.markAsRead);

module.exports = router;

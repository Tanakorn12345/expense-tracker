const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const notificationController = {
  // Get all notifications for the logged-in user
  async getNotifications(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  },

  // Mark a notification as read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      
      const notification = await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true }
      });

      res.json({ message: 'Marked as read', notification });
    } catch (error) {
      next(error);
    }
  },
  
  // Mark all notifications as read
  async markAllAsRead(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true }
      });

      res.json({ message: 'All marked as read' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController;

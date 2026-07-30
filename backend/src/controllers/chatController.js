const prisma = require('../db/prisma');

const chatController = {
  // Get chat history between current user and admin (or admin and a specific user)
  getChatHistory: async (req, res, next) => {
    try {
      const { otherUserId } = req.params;
      const currentUserId = req.user.id;

      // Ensure that if the current user is NOT an admin, they can only chat with the admin
      // Here we assume the admin's email is in env and we can get their ID
      let targetUserId = parseInt(otherUserId);

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: currentUserId }
          ]
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, profilePic: true } }
        }
      });

      res.json(messages);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      res.status(500).json({ error: 'Failed to fetch chat history' });
    }
  },

  // Send a message via REST API
  sendMessage: async (req, res, next) => {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;

      if (!receiverId || !content) {
        return res.status(400).json({ error: 'Missing receiverId or content' });
      }

      const message = await prisma.message.create({
        data: {
          senderId: parseInt(senderId),
          receiverId: parseInt(receiverId),
          content
        },
        include: {
          sender: { select: { id: true, name: true, profilePic: true } }
        }
      });

      res.status(201).json(message);
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Get list of all users and their latest message (for Admin Dashboard)
  getUsersWithChats: async (req, res, next) => {
    try {
      const adminId = req.user.id; // assume req.user is admin
      
      const users = await prisma.user.findMany({
        where: { id: { not: adminId } },
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
          isOnline: true,
          lastSeen: true,
          sentMessages: {
            where: { receiverId: adminId },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          receivedMessages: {
            where: { senderId: adminId },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      // Format the data to give the "latest" message
      const formattedUsers = users.map(user => {
        let lastMessage = null;
        let lastMessageAt = null;

        const sent = user.sentMessages[0];
        const received = user.receivedMessages[0];

        if (sent && !received) { lastMessage = sent; }
        else if (received && !sent) { lastMessage = received; }
        else if (sent && received) {
          lastMessage = sent.createdAt > received.createdAt ? sent : received;
        }

        if (lastMessage) {
          lastMessageAt = lastMessage.createdAt;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageAt,
          unreadCount: 0 // Placeholder for unread count logic
        };
      });

      // Sort by newest message
      formattedUsers.sort((a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      });

      res.json(formattedUsers);
    } catch (err) {
      console.error('Error fetching users with chats:', err);
      res.status(500).json({ error: 'Failed to fetch users with chats' });
    }
  },

  // Get Admin ID (so users know who to send messages to)
  getAdminInfo: async (req, res, next) => {
    try {
      let admin = await prisma.user.findUnique({
        where: { email: process.env.ADMIN_EMAIL },
        select: { id: true, name: true, profilePic: true, isOnline: true, lastSeen: true }
      });
      if (!admin) {
        // Auto-create admin if it doesn't exist
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('password123', 10);
        admin = await prisma.user.create({
          data: {
            email: process.env.ADMIN_EMAIL,
            name: 'Admin',
            password: hashedPassword,
            isPro: true
          },
          select: { id: true, name: true, profilePic: true, isOnline: true, lastSeen: true }
        });
      }
      res.json(admin);
    } catch (err) {
      console.error('Error fetching/creating admin info:', err);
      res.status(500).json({ error: 'Failed to fetch admin info' });
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      const { senderId } = req.body;
      const receiverId = req.user.id;

      await prisma.message.updateMany({
        where: {
          senderId: parseInt(senderId),
          receiverId: receiverId,
          isRead: false
        },
        data: { isRead: true }
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  }
};

module.exports = chatController;

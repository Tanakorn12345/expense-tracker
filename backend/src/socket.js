const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'] : '*',
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins their own room based on their User ID to receive messages
    socket.on('join', async (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
      
      // Update online status
      try {
        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { isOnline: true, lastSeen: new Date() }
        });
        // Notify admin that user is online
        io.emit('user_status_change', { userId, isOnline: true, lastSeen: new Date() });
      } catch (err) {
        console.error('Error updating user online status:', err);
      }
      
      // Store userId in socket session
      socket.userId = userId;
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, content } = data;
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

        // Send to receiver
        io.to(`user_${receiverId}`).emit('receive_message', message);
        // Also send back to sender so they can update their UI if they are logged in on multiple devices
        io.to(`user_${senderId}`).emit('receive_message', message);
        
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      if (socket.userId) {
        try {
          await prisma.user.update({
            where: { id: parseInt(socket.userId) },
            data: { isOnline: false, lastSeen: new Date() }
          });
          io.emit('user_status_change', { userId: socket.userId, isOnline: false, lastSeen: new Date() });
        } catch (err) {
          console.error('Error updating user offline status:', err);
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIO };

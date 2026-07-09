const prisma = require('../db/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword
        }
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro, profilePic: user.profilePic, hasSetPrefs: user.hasSetPrefs, notifyEmail: user.notifyEmail } });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Email or password is wrong' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email or password is wrong' });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro, profilePic: user.profilePic, hasSetPrefs: user.hasSetPrefs, notifyEmail: user.notifyEmail } });
    } catch (error) {
      next(error);
    }
  },

  async upgrade(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { isPro: true }
      });

      res.json({ message: 'Upgraded to Pro successfully', user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro, profilePic: user.profilePic } });
    } catch (error) {
      next(error);
    }
  },

  async updateProfilePic(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { profilePic } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { profilePic }
      });

      res.json({ user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, isPro: updatedUser.isPro, profilePic: updatedUser.profilePic, hasSetPrefs: updatedUser.hasSetPrefs, notifyEmail: updatedUser.notifyEmail } });
    } catch (error) {
      next(error);
    }
  },

  async updateNotificationSettings(req, res, next) {
    try {
      const { notifyEmail } = req.body;
      const userId = req.user.id;
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          notifyEmail,
          hasSetPrefs: true
        }
      });
      
      res.json({ message: 'Settings updated', user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro, profilePic: user.profilePic, hasSetPrefs: user.hasSetPrefs, notifyEmail: user.notifyEmail } });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ message: 'ไม่สามารถใช้อีเมลนี้ได้ เนื่องจากผู้ใช้ท่านอื่นใช้แล้ว' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, email }
      });

      res.json({ user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, isPro: updatedUser.isPro, profilePic: updatedUser.profilePic, hasSetPrefs: updatedUser.hasSetPrefs, notifyEmail: updatedUser.notifyEmail } });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;

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
      res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro, profilePic: user.profilePic, hasSetPrefs: user.hasSetPrefs, notifyEmail: user.notifyEmail, notifyLine: user.notifyLine, lineNotifyToken: user.lineNotifyToken } });
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
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro, profilePic: user.profilePic, hasSetPrefs: user.hasSetPrefs, notifyEmail: user.notifyEmail, notifyLine: user.notifyLine, lineNotifyToken: user.lineNotifyToken } });
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

      res.json({ user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, isPro: updatedUser.isPro, profilePic: updatedUser.profilePic, hasSetPrefs: updatedUser.hasSetPrefs, notifyEmail: updatedUser.notifyEmail, notifyLine: updatedUser.notifyLine, lineNotifyToken: updatedUser.lineNotifyToken } });
    } catch (error) {
      next(error);
    }
  },

  async updateNotificationSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const { notifyEmail, notifyLine, lineNotifyToken } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          notifyEmail: notifyEmail !== undefined ? notifyEmail : true,
          notifyLine: notifyLine !== undefined ? notifyLine : false,
          lineNotifyToken: lineNotifyToken !== undefined ? lineNotifyToken : null,
          hasSetPrefs: true
        }
      });
      
      res.json({ user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, isPro: updatedUser.isPro, profilePic: updatedUser.profilePic, hasSetPrefs: updatedUser.hasSetPrefs, notifyEmail: updatedUser.notifyEmail, notifyLine: updatedUser.notifyLine, lineNotifyToken: updatedUser.lineNotifyToken } });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;

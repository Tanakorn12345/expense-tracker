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
      res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro } });
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
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro } });
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

      res.json({ message: 'Upgraded to Pro successfully', user: { id: user.id, email: user.email, name: user.name, isPro: user.isPro } });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
